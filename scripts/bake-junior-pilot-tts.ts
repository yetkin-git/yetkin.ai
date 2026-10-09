#!/usr/bin/env tsx
/**
 * Junior Aşama 2 — çekirdek ders TTS fırını.
 * Girdi: mühürlü listenText (lib/junior/content/<branch>/*.ts).
 * Model: academyBakeVoiceModelId() — ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS.
 * Ses: branş öğretmeni (lib/junior/voice.ts). Tempo: JUNIOR_BAKE_ATEMPO.
 * Bütçe: ders başına 1 API isteği. `--course=jr_06_mat` → 25; `--course=jr_06_fen|jr_06_turkce|jr_06_sosyal|jr_06_ing_main` → 20.
 * Çıkış: public/media/junior/audio/{lessonKey}.mp3
 *
 *   npx tsx scripts/bake-junior-pilot-tts.ts --dry-run
 *   npx tsx scripts/bake-junior-pilot-tts.ts --dry-run --course=jr_06_ing_main
 *   npx tsx scripts/bake-junior-pilot-tts.ts --confirm-gemini-spend --course=jr_06_ing_main
 *   npx tsx scripts/bake-junior-pilot-tts.ts --confirm-gemini-spend --key=jr_06_ing_main-1
 */
import "./load-academy-bake-env";

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { JUNIOR_FEN_LESSONS } from "@/lib/junior/content/fen";
import { JUNIOR_FEN_1 } from "@/lib/junior/content/fen/1";
import { JUNIOR_ING_LESSONS } from "@/lib/junior/content/ing";
import { JUNIOR_ING_MAIN_1 } from "@/lib/junior/content/ing/1";
import { JUNIOR_MAT_LESSONS } from "@/lib/junior/content/mat";
import { JUNIOR_MAT_1 } from "@/lib/junior/content/mat/1";
import { JUNIOR_SOSYAL_LESSONS } from "@/lib/junior/content/sosyal";
import { JUNIOR_SOSYAL_1 } from "@/lib/junior/content/sosyal/1";
import { JUNIOR_TURKCE_LESSONS } from "@/lib/junior/content/turkce";
import { JUNIOR_TURKCE_1 } from "@/lib/junior/content/turkce/1";
import {
  JUNIOR_NARRATION_MAX_MS,
  JUNIOR_NARRATION_MIN_MS,
} from "@/lib/junior/player-clock";
import type { JuniorLessonScript } from "@/lib/junior/types";
import {
  JUNIOR_BAKE_ATEMPO,
  JUNIOR_TTS_MODEL_ID,
  juniorLessonAudioPublicPath,
  juniorTeacherForLesson,
  juniorTeacherSelfIntro,
} from "@/lib/junior/voice";
import { ACADEMY_MEDIA_RELEASE_LANGUAGE } from "@/lib/academy/media-release-seal";
import { ACADEMY_MATCH_WHISTLE_MAX, assertAcademyMatchWhistleBudget } from "@/lib/academy/production-standard";
import { ACADEMY_TTS_RPM_GAP_MS, injectAcademyTtsBreathPauses } from "@/lib/academy/tts-breath-chunks";
import { masterAcademySpeechWav } from "@/lib/academy/tts-loudnorm";
import { assertAcademySpeechQuality } from "@/lib/academy/tts-quality-gate";
import {
  ACADEMY_TTS_STUDIO_ACOUSTIC_DIRECTIVE,
  ACADEMY_TTS_PACE_NOTE,
} from "@/lib/academy/tts-studio-prompt";
import {
  academyBakeVoiceModelId,
  assertAcademySealedMediaModel,
} from "@/lib/kernel/ai/model-roles";
import {
  collectGeminiInlineAudioParts,
  mergeGeminiInlineAudioToWav,
  pcmWavDurationSec,
} from "@/lib/kernel/ai/pcm-wav";
import { canonicalizeGeminiTtsLanguageCode, canonicalizeGeminiTtsVoiceName } from "@/lib/kernel/ai/tts-voices";
import { transcodeAcademyWavToMp3 } from "./transcode-academy-lesson-audio";

const PILOT_LESSONS = [
  JUNIOR_MAT_1,
  JUNIOR_FEN_1,
  JUNIOR_TURKCE_1,
  JUNIOR_SOSYAL_1,
  JUNIOR_ING_MAIN_1,
] as const satisfies readonly JuniorLessonScript[];

const COURSE_LESSONS: Record<string, readonly JuniorLessonScript[]> = {
  jr_06_mat: JUNIOR_MAT_LESSONS,
  jr_06_fen: JUNIOR_FEN_LESSONS,
  jr_06_turkce: JUNIOR_TURKCE_LESSONS,
  jr_06_sosyal: JUNIOR_SOSYAL_LESSONS,
  jr_06_ing_main: JUNIOR_ING_LESSONS,
};

const OUT_DIR = join(process.cwd(), "public", "media", "junior", "audio");
const WAV_DIR = join(process.cwd(), "media-bake", "junior", "audio");
const RECEIPT_DIR = join(process.cwd(), "media-bake", "junior", "dry-run-receipts");
const DSP_REV = `wsola-atempo-${JUNIOR_BAKE_ATEMPO}-loudnorm-r128-v1`;
const MIN_WAV_BYTES = 2_048;
const MIN_MP3_BYTES = 8_000;
const SPEECH_TIMEOUT_MS = 180_000;
const RATE_LIMIT_RETRY_MS = 20_000;
const RATE_LIMIT_RETRY_CAP_MS = 180_000;
const RATE_LIMIT_RETRY_MAX = 8;
const NETWORK_RETRY_CAP = 4;
const SPEECH_ATTEMPTS = 12;

let matchWhistlesUsed = 0;

type SpeechPart = {
  inlineData?: { data?: string; mimeType?: string | null };
  inline_data?: { data?: string; mimeType?: string | null; mime_type?: string | null };
};

type SpeechResponse = {
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<SpeechPart | null> } | null;
  } | null>;
  parts?: Array<SpeechPart | null>;
  promptFeedback?: { blockReason?: string };
};

type LessonPlan = {
  lessonKey: string;
  title: string;
  teacherName: string;
  voice: string;
  tone: string;
  wordCount: number;
  charCount: number;
  listenText: string;
  textHash: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function takeMatchWhistle(): void {
  if (matchWhistlesUsed >= ACADEMY_MATCH_WHISTLE_MAX) {
    throw new Error(
      `1 Maç = MAX 100 Düdük. ${matchWhistlesUsed} istek kullanıldı, tavan ${ACADEMY_MATCH_WHISTLE_MAX}. Yeni API çağrısı yok.`,
    );
  }
  matchWhistlesUsed += 1;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? "");
}

function parseRetryDelaySec(error: unknown): number | null {
  const message = errorMessage(error);
  const jsonDelay = message.match(/"retryDelay"\s*:\s*"(\d+)s"/u);
  if (jsonDelay) {
    const sec = Number(jsonDelay[1]);
    return Number.isFinite(sec) && sec > 0 ? sec : null;
  }
  const seconds = message.match(/Please retry in (?:(\d+)m)?(\d+(?:\.\d+)?)s/i);
  if (seconds) {
    const sec = Number(seconds[1] ?? 0) * 60 + Number(seconds[2]);
    return Number.isFinite(sec) && sec > 0 ? sec : null;
  }
  return null;
}

function isDailyQuota(error: unknown): boolean {
  const message = errorMessage(error);
  return /generate_requests_per_model_per_day|requests_per_day|per_day.*quota|quota.*per_day/i.test(message);
}

function isPrepayDepleted(error: unknown): boolean {
  return /prepayment credits are depleted/i.test(errorMessage(error));
}

function isRateLimit(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const record = error as { status?: unknown; code?: unknown };
    if (record.status === 429 || record.code === 429) {
      return true;
    }
  }
  return /RESOURCE_EXHAUSTED|\b429\b|quota/i.test(errorMessage(error));
}

function isNetwork(error: unknown): boolean {
  const message = errorMessage(error);
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  return /fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up|UND_ERR|ConnectTimeout|network/i.test(
    `${message} ${cause}`,
  );
}

function wordCount(text: string): number {
  return text.split(/\s+/u).filter(Boolean).length;
}

function buildJuniorStudioContents(input: {
  transcript: string;
  teacherName: string;
  tone: string;
}): string {
  const spoken = input.transcript.trim();
  return [
    "# AUDIO PROFILE: Yetkin Junior stüdyo",
    ACADEMY_TTS_STUDIO_ACOUSTIC_DIRECTIVE,
    "",
    "## THE SCENE: Dry close-mic booth",
    "Clean acoustic environment. No reverb. Close-mic. Crisp presence.",
    "",
    "### DIRECTOR'S NOTES",
    `Style: ${ACADEMY_TTS_STUDIO_ACOUSTIC_DIRECTIVE}`,
    ACADEMY_TTS_PACE_NOTE,
    `Teacher: ${input.teacherName}. Tone: ${input.tone}. Speak to an 11-year-old learner in warm Turkish classroom voice.`,
    "Speak only the transcript verbatim. Do not read the profile, the scene, or these notes.",
    "",
    "#### TRANSCRIPT",
    spoken,
  ].join("\n");
}

function planLesson(lesson: JuniorLessonScript): LessonPlan {
  const teacher = juniorTeacherForLesson(lesson.key);
  const listenText = lesson.listenText.trim();
  if (listenText.length < 200) {
    throw new Error(`${lesson.key} listenText çok kısa. Fırın açılmaz.`);
  }
  const intro = juniorTeacherSelfIntro(lesson.key);
  if (!listenText.includes(intro)) {
    throw new Error(`${lesson.key} listenText öğretmen tanıtımı taşımıyor: «${intro}»`);
  }
  return {
    lessonKey: lesson.key,
    title: lesson.title,
    teacherName: teacher.name,
    voice: teacher.voice,
    tone: teacher.tone,
    wordCount: wordCount(listenText),
    charCount: listenText.length,
    listenText,
    textHash: createHash("sha256").update(listenText, "utf8").digest("hex"),
  };
}

function selectedLessons(argv: readonly string[]): JuniorLessonScript[] {
  const course = argv.find((part) => part.startsWith("--course="))?.slice("--course=".length)?.trim();
  const pool = course
    ? (() => {
        const lessons = COURSE_LESSONS[course];
        if (!lessons) {
          const known = Object.keys(COURSE_LESSONS).join(", ");
          throw new Error(`--course= bilinmeyen kurs. Bilinen: ${known}. Gelen: ${course}`);
        }
        return [...lessons];
      })()
    : [...PILOT_LESSONS];
  const raw = argv.find((part) => part.startsWith("--key="))?.slice("--key=".length)?.trim();
  if (!raw) {
    return pool;
  }
  const keys = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const picked = pool.filter((lesson) => keys.includes(lesson.key));
  if (picked.length !== keys.length) {
    const known = pool.map((lesson) => lesson.key).join(", ");
    throw new Error(`--key= havuzdaki anahtarları bekler: ${known}. Gelen: ${raw}`);
  }
  return picked;
}

function receiptPath(lessonKey: string): string {
  return join(RECEIPT_DIR, `${lessonKey}.json`);
}

function mp3PathFor(lessonKey: string): string {
  return join(OUT_DIR, `${lessonKey}.mp3`);
}

function wavPathFor(lessonKey: string): string {
  return join(WAV_DIR, `${lessonKey}.wav`);
}

function writeReceipt(plan: LessonPlan, model: string): void {
  const path = receiptPath(plan.lessonKey);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `${JSON.stringify({
      v: 1,
      lessonKey: plan.lessonKey,
      model,
      voice: plan.voice,
      teacher: plan.teacherName,
      tempo: JUNIOR_BAKE_ATEMPO,
      requests: 1,
      textHash: plan.textHash,
      wordCount: plan.wordCount,
      charCount: plan.charCount,
      dspRev: DSP_REV,
      publicPath: juniorLessonAudioPublicPath(plan.lessonKey),
    })}\n`,
  );
}

function assertReceipt(plan: LessonPlan, model: string): void {
  const path = receiptPath(plan.lessonKey);
  if (!existsSync(path)) {
    throw new Error(`${plan.lessonKey} dry-run fişi yok. Önce --dry-run. API çağrısı yok.`);
  }
  const raw = JSON.parse(readFileSync(path, "utf8")) as {
    v?: number;
    model?: string;
    voice?: string;
    tempo?: number;
    textHash?: string;
    requests?: number;
  };
  if (
    raw.v !== 1 ||
    raw.model !== model ||
    raw.voice !== plan.voice ||
    raw.tempo !== JUNIOR_BAKE_ATEMPO ||
    raw.textHash !== plan.textHash ||
    raw.requests !== 1
  ) {
    throw new Error(`${plan.lessonKey} dry-run fişi güncel metinle uyuşmuyor. Önce --dry-run.`);
  }
}

function wavFromSpeech(response: SpeechResponse): Buffer {
  const blockReason = response.promptFeedback?.blockReason;
  if (blockReason) {
    throw new Error(`Boş ses yanıtı. blockReason=${blockReason}`);
  }
  const candidateParts = response.candidates?.[0]?.content?.parts ?? [];
  const topParts = response.parts ?? [];
  const audioParts = collectGeminiInlineAudioParts([...candidateParts, ...topParts]);
  if (audioParts.length === 0) {
    const finishReason = response.candidates?.[0]?.finishReason;
    throw new Error(finishReason ? `Boş ses yanıtı. finishReason=${finishReason}` : "Boş ses yanıtı.");
  }
  return mergeGeminiInlineAudioToWav(audioParts);
}

async function requestSpeechWav(input: {
  client: GoogleGenAI;
  model: string;
  text: string;
  voiceName: string;
  teacherName: string;
  tone: string;
}): Promise<Buffer> {
  const voiceName = canonicalizeGeminiTtsVoiceName(input.voiceName);
  const languageCode = canonicalizeGeminiTtsLanguageCode(ACADEMY_MEDIA_RELEASE_LANGUAGE);
  const response = (await input.client.models.generateContent({
    model: input.model,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: buildJuniorStudioContents({
              transcript: input.text,
              teacherName: input.teacherName,
              tone: input.tone,
            }),
          },
        ],
      },
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        languageCode,
        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
      },
    },
  })) as SpeechResponse;
  return wavFromSpeech(response);
}

async function synthesize(input: {
  client: GoogleGenAI;
  model: string;
  text: string;
  voiceName: string;
  teacherName: string;
  tone: string;
}): Promise<Buffer> {
  let attempt = 0;
  let rateLimitStreak = 0;
  let networkStreak = 0;
  for (;;) {
    try {
      takeMatchWhistle();
      return await requestSpeechWav(input);
    } catch (error) {
      if (errorMessage(error).includes("1 Maç = MAX 100 Düdük")) {
        throw error;
      }
      if (isPrepayDepleted(error)) {
        throw new Error(`Gemini ön ödeme kredisi bitti. Düdük tekrarlanmaz. ${errorMessage(error)}`);
      }
      if (isDailyQuota(error)) {
        throw new Error(`${input.model} kotası doldu. Alt modele düşülmez. ${errorMessage(error)}`);
      }
      if (isRateLimit(error)) {
        rateLimitStreak += 1;
        if (rateLimitStreak > RATE_LIMIT_RETRY_MAX) {
          throw error;
        }
        const retryDelaySec = parseRetryDelaySec(error);
        const waitMs = Math.min(
          RATE_LIMIT_RETRY_CAP_MS,
          retryDelaySec != null
            ? Math.max(1_000, Math.ceil(retryDelaySec * 1000) + 1_000)
            : RATE_LIMIT_RETRY_MS * 2 ** Math.min(rateLimitStreak - 1, 3),
        );
        process.stdout.write(`  429; ${Math.round(waitMs / 1000)}s sonra aynı ders\n`);
        await sleep(waitMs);
        continue;
      }
      if (isNetwork(error)) {
        networkStreak += 1;
        if (networkStreak >= NETWORK_RETRY_CAP) {
          throw error;
        }
        const waitMs = Math.min(RATE_LIMIT_RETRY_CAP_MS, RATE_LIMIT_RETRY_MS * 2 ** Math.min(networkStreak - 1, 3));
        process.stdout.write(`  ağ; ${Math.round(waitMs / 1000)}s sonra aynı ders\n`);
        await sleep(waitMs);
        continue;
      }
      attempt += 1;
      if (attempt < SPEECH_ATTEMPTS) {
        const waitMs = Math.min(30_000, 1_000 * 2 ** Math.min(attempt, 5));
        process.stdout.write(`  TTS hata (${errorMessage(error).slice(0, 160)}); ${waitMs}ms sonra\n`);
        await sleep(waitMs);
        continue;
      }
      throw error;
    }
  }
}

function formatClock(sec: number): string {
  const total = Math.round(sec);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const QUALITY_RETRY_MAX = 3;

async function bakeLesson(client: GoogleGenAI, model: string, plan: LessonPlan): Promise<void> {
  const voiceName = canonicalizeGeminiTtsVoiceName(plan.voice);
  process.stdout.write(
    `  ${plan.lessonKey}  ${plan.teacherName}/${voiceName}  1 istek  atempo=${JUNIOR_BAKE_ATEMPO}  ${plan.wordCount} kelime\n`,
  );
  const spokenText = injectAcademyTtsBreathPauses(plan.listenText);
  const minSec = JUNIOR_NARRATION_MIN_MS / 1000;
  const maxSec = JUNIOR_NARRATION_MAX_MS / 1000;
  let mastered: Buffer | null = null;
  let quality: ReturnType<typeof assertAcademySpeechQuality> | null = null;
  let durationSec = 0;
  for (let qualityAttempt = 1; qualityAttempt <= QUALITY_RETRY_MAX; qualityAttempt += 1) {
    const rawWav = await synthesize({
      client,
      model,
      text: spokenText,
      voiceName,
      teacherName: plan.teacherName,
      tone: plan.tone,
    });
    const candidate = masterAcademySpeechWav(rawWav, { atempo: true, tempo: JUNIOR_BAKE_ATEMPO });
    durationSec = pcmWavDurationSec(candidate);
    if (durationSec < minSec || durationSec > maxSec) {
      throw new Error(
        `${plan.lessonKey} süre bandı dışında: ${durationSec.toFixed(1)}s. Bant ${minSec}–${maxSec}s. Dosya yazılmadı.`,
      );
    }
    try {
      quality = assertAcademySpeechQuality(candidate);
      mastered = candidate;
      break;
    } catch (error) {
      if (qualityAttempt >= QUALITY_RETRY_MAX) {
        throw error;
      }
      process.stdout.write(
        `  kalite tekrar ${plan.lessonKey} (${qualityAttempt}/${QUALITY_RETRY_MAX}): ${errorMessage(error)}\n`,
      );
      await sleep(ACADEMY_TTS_RPM_GAP_MS);
    }
  }
  if (!mastered || !quality) {
    throw new Error(`${plan.lessonKey} kalite kapısı geçilemedi.`);
  }
  const wavPath = wavPathFor(plan.lessonKey);
  const mp3Path = mp3PathFor(plan.lessonKey);
  mkdirSync(dirname(wavPath), { recursive: true });
  writeFileSync(wavPath, mastered);
  transcodeAcademyWavToMp3(wavPath, mp3Path);
  const mp3Bytes = statSync(mp3Path).size;
  if (mp3Bytes < MIN_MP3_BYTES) {
    throw new Error(`${plan.lessonKey} MP3 çok küçük: ${mp3Bytes} bayt.`);
  }
  process.stdout.write(
    `  yazıldı ${formatClock(durationSec)} (${durationSec.toFixed(1)}s)  ${mp3Bytes} bayt  LUFS ${quality.integratedLufs.toFixed(1)} → ${mp3Path}\n`,
  );
}

function sanitizeKey(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }
  const value = raw.replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
  return value.length > 8 ? value : null;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run") || !argv.includes("--confirm-gemini-spend");
  const model = academyBakeVoiceModelId();
  assertAcademySealedMediaModel("VOICE_TTS", model);
  if (model !== JUNIOR_TTS_MODEL_ID) {
    throw new Error(`Junior ses modeli mühür kimliğinden koptu. Gelen ${model}.`);
  }
  const lessons = selectedLessons(argv);
  const plans = lessons.map((lesson) => planLesson(lesson));
  assertAcademyMatchWhistleBudget(plans.length);
  process.stdout.write(
    `Junior TTS fırın — ${plans.length} ders, ${plans.length} istek, model=${model}, tempo=${JUNIOR_BAKE_ATEMPO}${dryRun ? " (dry-run)" : ""}\n`,
  );
  for (const plan of plans) {
    process.stdout.write(
      `  ${plan.lessonKey}  ${plan.teacherName}/${plan.voice}  ${plan.wordCount} kelime  ${plan.charCount} karakter  ${plan.title}\n`,
    );
    if (dryRun) {
      writeReceipt(plan, model);
    }
  }
  if (dryRun) {
    process.stdout.write("Dry-run bitti. API yok. Fırın için --confirm-gemini-spend.\n");
    return;
  }
  for (const plan of plans) {
    assertReceipt(plan, model);
  }
  const apiKey = sanitizeKey(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY yok.");
  }
  const client = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: SPEECH_TIMEOUT_MS, retryOptions: { attempts: 1, httpStatusCodes: [] as number[] } },
  });
  for (let index = 0; index < plans.length; index += 1) {
    const plan = plans[index]!;
    await bakeLesson(client, model, plan);
    if (index < plans.length - 1) {
      await sleep(ACADEMY_TTS_RPM_GAP_MS);
    }
  }
  process.stdout.write(
    `1 Maç = MAX 100 Düdük: kullanılan ${matchWhistlesUsed} istek, tavan ${ACADEMY_MATCH_WHISTLE_MAX}.\n`,
  );
  for (const plan of plans) {
    const path = mp3PathFor(plan.lessonKey);
    if (!existsSync(path) || statSync(path).size < MIN_WAV_BYTES) {
      throw new Error(`MP3 diske inmedi: ${path}`);
    }
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(`Junior TTS pilot FAIL — ${errorMessage(error)}\n`);
  process.exit(1);
});
