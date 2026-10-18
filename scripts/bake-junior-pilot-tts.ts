#!/usr/bin/env tsx
/**
 * Junior çekirdek ders TTS fırını — branş katalog sesi.
 * Girdi: mühürlü listenText. Konuşulan metin birebir transkripttir; yönetmen paragrafı okunmaz.
 * Model: academyBakeVoiceModelId() — ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS.
 * Ses: juniorTeacherForLesson().voice. Matematik ve fen kasedi Fenrir. Kore, Puck ve Charon bu kasete gitmez.
 * `voicePrompt` lib/junior/voice-design.ts içinde durur. Voices API bu komutu güvenlik duvarında keser; senteze gitmez.
 * Tempo: JUNIOR_BAKE_ATEMPO. Süre bandı junior-player-clock (5–12 dk).
 * Bütçe: ders başına 1 konuşma isteği. Katalog sesi için voice_ kaydı açılmaz.
 * `--course` yazılı ama fırınlanmamış dersleri kurs kurs yazar; fırınlı dersler havuzda yoktur. `--matrix` kuru yazar; tek maçta harcamaz.
 * `--force` ve `--overwrite` aynı kapıdır. Yalnız `--course=jr_06_mat` ile yayındaki matematik kasetinin üzerine yazar. Ses branş kataloğundan gelir (Fenrir). Diğer kurslar ve `--matrix` bu kapıyı açmaz.
 * Çıkış: public/media/junior/audio/{lessonKey}.mp3
 *
 *   npm run bake:junior-speech
 *   npx tsx scripts/bake-junior-pilot-tts.ts --dry-run --course=jr_06_mat
 *   npx tsx scripts/bake-junior-pilot-tts.ts --dry-run --course=jr_06_mat --force
 *   npx tsx scripts/bake-junior-pilot-tts.ts --confirm-gemini-spend --course=jr_06_mat --force
 *   npx tsx scripts/bake-junior-pilot-tts.ts --confirm-gemini-spend --course=jr_06_mat --key=jr_06_mat-1
 * `jr_06_mat-5` numune yolu kapalıdır. `--key=jr_06_mat-5` 300–330 sn bandına ve senaryo metnine yazmaz.
 * Pilot fırın yalnız şu kapıyla açılır; tempo JUNIOR_BAKE_ATEMPO (0.94), saat timeline JSON'dur.
 * PCM hizalama ham WAV üzerinde yapılır; atempo sonrası `lockTimelineToExactAudioMs` final MP3'e kilitler:
 *   npx tsx scripts/bake-junior-pilot-tts.ts --dry-run --lesson=jr_06_mat-5 --force
 *   npx tsx scripts/bake-junior-pilot-tts.ts --confirm-gemini-spend --lesson=jr_06_mat-5 --force
 */
import "./load-academy-bake-env";

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { juniorBakeCandidateLessons, juniorSealedCourseLessons } from "@/lib/junior/content-source";
import { JUNIOR_FEN_1 } from "@/lib/junior/content/fen/1";
import { JUNIOR_ING_MAIN_1 } from "@/lib/junior/content/ing/1";
import { JUNIOR_MAT_5 } from "@/lib/junior/content/mat/5";
import { JUNIOR_SOSYAL_1 } from "@/lib/junior/content/sosyal/1";
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
  juniorLessonHasBakedAudio,
  juniorTeacherForLesson,
  juniorTeacherSelfIntro,
} from "@/lib/junior/voice";
import {
  juniorVoiceDesignPromptHash,
  juniorVoiceDesignTranscript,
} from "@/lib/junior/voice-design";
import {
  collectGeminiInlineAudioParts,
  mergeGeminiInlineAudioToWav,
} from "@/lib/kernel/ai/pcm-wav";
import { canonicalizeGeminiTtsVoiceName } from "@/lib/kernel/ai/tts-voices";
import { ACADEMY_MATCH_WHISTLE_MAX, assertAcademyMatchWhistleBudget } from "@/lib/academy/production-standard";
import { ACADEMY_TTS_RPM_GAP_MS } from "@/lib/academy/tts-breath-chunks";
import { masterAcademySpeechWav } from "@/lib/academy/tts-loudnorm";
import { assertAcademySpeechQuality } from "@/lib/academy/tts-quality-gate";
import { academyBakeVoiceModelId, assertAcademySealedMediaModel } from "@/lib/kernel/ai/model-roles";
import { pcmWavDurationSec } from "@/lib/kernel/ai/pcm-wav";
import {
  MAT_5_AUTHORED_CUES,
  MAT_5_DRAFT_TIMELINE,
  parseMarkedCueText,
} from "@/lib/junior/pilot-engine/mat-5.choreography";
import {
  alignSingleWavToMat5Cues,
  lockTimelineToExactAudioMs,
} from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import { transcodeAcademyWavToMp3 } from "./transcode-academy-lesson-audio";

/** Pilot ders. Eski `--key=jr_06_mat-5` numune bandı bu anahtara yazamaz. */
const SAMPLE_REBAKE_KEY = "jr_06_mat-5";
const MAT5_SAMPLE_PATH_CLOSED =
  "jr_06_mat-5 numune yolu kapatıldı. --key=jr_06_mat-5 senaryo metnini 300–330 sn bandına yazmaz. Pilot fırın yalnız --lesson=jr_06_mat-5 --force ile açılır.";
const PILOT_V2_TIMELINE_PATH = join(
  process.cwd(),
  "packages",
  "junior-content",
  "timelines",
  "jr_06_mat-5.timeline.json",
);
const require = createRequire(import.meta.url);

const PILOT_LESSONS = [
  JUNIOR_MAT_5,
  JUNIOR_FEN_1,
  JUNIOR_TURKCE_1,
  JUNIOR_SOSYAL_1,
  JUNIOR_ING_MAIN_1,
] as const satisfies readonly JuniorLessonScript[];

/** Fırın havuzu: yazılmış ama sesi fırınlanmamış dersler. Yayındaki (manifestteki) dersler havuza girmez. */
const COURSE_LESSONS: Record<string, readonly JuniorLessonScript[]> = {
  jr_06_mat: juniorBakeCandidateLessons("jr_06_mat"),
  jr_06_fen: juniorBakeCandidateLessons("jr_06_fen"),
  jr_06_turkce: juniorBakeCandidateLessons("jr_06_turkce"),
  jr_06_sosyal: juniorBakeCandidateLessons("jr_06_sosyal"),
  jr_06_ing_main: juniorBakeCandidateLessons("jr_06_ing_main"),
};

const OUT_DIR = join(process.cwd(), "public", "media", "junior", "audio");
const WAV_DIR = join(process.cwd(), "media-bake", "junior", "audio");
const RECEIPT_DIR = join(process.cwd(), "media-bake", "junior", "dry-run-receipts");
const DSP_REV = `wsola-atempo-${JUNIOR_BAKE_ATEMPO}-loudnorm-r128-catalog-v1`;
const CATALOG_LANGUAGE = "tr-TR";
const MIN_WAV_BYTES = 2_048;
const MIN_MP3_BYTES = 8_000;
const SPEECH_TIMEOUT_MS = 180_000;
const RATE_LIMIT_RETRY_MS = 20_000;
const RATE_LIMIT_RETRY_CAP_MS = 180_000;
const RATE_LIMIT_RETRY_MAX = 8;
const NETWORK_RETRY_CAP = 4;
const SPEECH_ATTEMPTS = 12;

let matchWhistlesUsed = 0;

type LessonPlan = {
  lessonKey: string;
  title: string;
  teacherName: string;
  catalogVoice: string;
  wordCount: number;
  charCount: number;
  listenText: string;
  textHash: string;
  voicePromptHash: string;
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

function isSafetyOrInvalid(error: unknown): boolean {
  return /blocked by safety|INVALID_ARGUMENT|\b400\b/i.test(errorMessage(error));
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

function planLesson(lesson: JuniorLessonScript, isPilotV2 = false): LessonPlan {
  const teacher = juniorTeacherForLesson(lesson.key);
  const pilotCuesText =
    isPilotV2 && lesson.key === SAMPLE_REBAKE_KEY
      ? MAT_5_AUTHORED_CUES.map((c) => parseMarkedCueText(c.markedText).cleanText).join(" ")
      : null;
  const listenText = (pilotCuesText ?? lesson.listenText).trim();
  if (listenText.length < 200) {
    throw new Error(`${lesson.key} listenText çok kısa. Fırın açılmaz.`);
  }
  const intro = juniorTeacherSelfIntro(lesson.key);
  if (!isPilotV2 && !listenText.includes(intro)) {
    throw new Error(`${lesson.key} listenText öğretmen tanıtımı taşımıyor: «${intro}»`);
  }
  const transcript = juniorVoiceDesignTranscript(listenText);
  if (transcript.includes("# AUDIO PROFILE") || transcript.includes("DIRECTOR'S NOTES")) {
    throw new Error(`${lesson.key} transkript yönetmen katmanı taşıyor. Ses tasarımı yalnız ders metnini okur.`);
  }
  return {
    lessonKey: lesson.key,
    title: lesson.title,
    teacherName: teacher.name,
    catalogVoice: teacher.voice,
    wordCount: wordCount(listenText),
    charCount: listenText.length,
    listenText,
    textHash: createHash("sha256").update(listenText, "utf8").digest("hex"),
    voicePromptHash: juniorVoiceDesignPromptHash(),
  };
}

function lessonArg(argv: readonly string[]): string | undefined {
  return argv.find((part) => part.startsWith("--lesson="))?.slice("--lesson=".length)?.trim();
}

function isPilotV2LessonRebake(argv: readonly string[]): boolean {
  const lesson = lessonArg(argv);
  return lesson === SAMPLE_REBAKE_KEY && (argv.includes("--force") || argv.includes("--overwrite"));
}

function requestedKeys(argv: readonly string[]): string[] {
  const raw =
    argv.find((part) => part.startsWith("--key="))?.slice("--key=".length)?.trim() ??
    lessonArg(argv);
  if (!raw) {
    return [];
  }
  return raw.split(",").map((part) => part.trim()).filter(Boolean);
}

function courseArg(argv: readonly string[]): string | undefined {
  return argv.find((part) => part.startsWith("--course="))?.slice("--course=".length)?.trim();
}

function lessonNumber(lessonKey: string): number {
  const value = Number(lessonKey.slice(lessonKey.lastIndexOf("-") + 1));
  return Number.isInteger(value) ? value : 0;
}

/**
 * Yayındaki matematik kasetinin üzerine yazma.
 * `--force` ve `--overwrite` aynı kapıdır. Yalnız `--course=jr_06_mat`.
 */
function isMathForceOverwrite(argv: readonly string[]): boolean {
  if (isPilotV2LessonRebake(argv)) {
    return false;
  }
  const force = argv.includes("--force") || argv.includes("--overwrite");
  if (!force) {
    return false;
  }
  if (argv.includes("--matrix")) {
    throw new Error("--force / --overwrite ile --matrix birlikte kullanılmaz.");
  }
  if (courseArg(argv) !== "jr_06_mat") {
    throw new Error("--force / --overwrite yalnız matematik kursunda açılır: --course=jr_06_mat.");
  }
  return true;
}

/** Yazılmış matematik senaryosu. Fırınlı koruma bu havuzu elemez; kapı `--force` ile açılır. */
function mathAuthoredLessons(): JuniorLessonScript[] {
  const byKey = new Map<string, JuniorLessonScript>();
  for (const lesson of [...juniorSealedCourseLessons("jr_06_mat"), ...juniorBakeCandidateLessons("jr_06_mat")]) {
    byKey.set(lesson.key, lesson);
  }
  return [...byKey.values()].sort((left, right) => lessonNumber(left.key) - lessonNumber(right.key));
}

/**
 * Eski 300–330 sn numune kapısı. `jr_06_mat-5` artık pilot motordadır; bu kapı hiç açılmaz.
 */
function isSampleRebake(_argv: readonly string[]): boolean {
  return false;
}

function assertMat5SamplePathClosed(argv: readonly string[]): void {
  if (isPilotV2LessonRebake(argv)) {
    return;
  }
  if (requestedKeys(argv).includes(SAMPLE_REBAKE_KEY)) {
    throw new Error(MAT5_SAMPLE_PATH_CLOSED);
  }
}

function pickKeys(
  pool: readonly JuniorLessonScript[],
  argv: readonly string[],
  allowBaked = false,
): JuniorLessonScript[] {
  const raw =
    argv.find((part) => part.startsWith("--key="))?.slice("--key=".length)?.trim() ??
    lessonArg(argv);
  if (!raw) {
    return [...pool];
  }
  const keys = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const sample = isSampleRebake(argv);
  const pilot = isPilotV2LessonRebake(argv);
  const baked = keys.filter(
    (key) => juniorLessonHasBakedAudio(key) && !(sample && key === SAMPLE_REBAKE_KEY) && !(pilot && key === SAMPLE_REBAKE_KEY),
  );
  if (baked.length > 0 && !allowBaked) {
    throw new Error(`${baked.join(", ")} zaten fırınlı (manifestte). Bu betik yayındaki sesi yeniden üretmez.`);
  }
  const picked = pool.filter((lesson) => keys.includes(lesson.key));
  if (picked.length !== keys.length) {
    const known = pool.map((lesson) => lesson.key).join(", ");
    throw new Error(`--key= havuzdaki anahtarları bekler: ${known}. Gelen: ${raw}`);
  }
  return picked;
}

function lessonBatches(argv: readonly string[]): JuniorLessonScript[][] {
  const matrix = argv.includes("--matrix");
  const course = courseArg(argv);
  const forceMath = isMathForceOverwrite(argv);
  if (matrix && course) {
    throw new Error("--matrix ile --course= birlikte kullanılmaz.");
  }
  if (matrix) {
    const all = Object.values(COURSE_LESSONS).flat();
    const picked = new Set(pickKeys(all, argv).map((lesson) => lesson.key));
    return Object.values(COURSE_LESSONS)
      .map((lessons) => lessons.filter((lesson) => picked.has(lesson.key)))
      .filter((batch) => batch.length > 0);
  }
  if (!course) {
    const pilot = isPilotV2LessonRebake(argv);
    const pool = PILOT_LESSONS.filter(
      (lesson) => (pilot && lesson.key === SAMPLE_REBAKE_KEY) || !juniorLessonHasBakedAudio(lesson.key),
    );
    return [pickKeys(pool, argv)];
  }
  const authored = forceMath ? mathAuthoredLessons() : COURSE_LESSONS[course];
  const lessons = authored?.filter((lesson) => lesson.key !== SAMPLE_REBAKE_KEY);
  if (!lessons) {
    const known = Object.keys(COURSE_LESSONS).join(", ");
    throw new Error(`--course= bilinmeyen kurs. Bilinen: ${known}. Gelen: ${course}`);
  }
  return [pickKeys(lessons, argv, forceMath)];
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

function writeReceipt(plan: LessonPlan, model: string, tempo = JUNIOR_BAKE_ATEMPO): void {
  const path = receiptPath(plan.lessonKey);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `${JSON.stringify({
      v: 3,
      lessonKey: plan.lessonKey,
      model,
      voiceMode: "catalog",
      catalogVoice: plan.catalogVoice,
      voicePromptSent: false,
      voicePromptHash: plan.voicePromptHash,
      teacher: plan.teacherName,
      languageCode: CATALOG_LANGUAGE,
      tempo,
      requests: 1,
      textHash: plan.textHash,
      wordCount: plan.wordCount,
      charCount: plan.charCount,
      dspRev: DSP_REV,
      transcriptMode: "verbatim",
      publicPath: juniorLessonAudioPublicPath(plan.lessonKey),
    })}\n`,
  );
}

function assertReceipt(plan: LessonPlan, model: string, tempo = JUNIOR_BAKE_ATEMPO): void {
  const path = receiptPath(plan.lessonKey);
  if (!existsSync(path)) {
    throw new Error(`${plan.lessonKey} dry-run fişi yok. Önce --dry-run. API çağrısı yok.`);
  }
  const raw = JSON.parse(readFileSync(path, "utf8")) as {
    v?: number;
    model?: string;
    voiceMode?: string;
    catalogVoice?: string;
    voicePromptSent?: boolean;
    voicePromptHash?: string;
    languageCode?: string;
    tempo?: number;
    textHash?: string;
    requests?: number;
    transcriptMode?: string;
  };
  if (
    raw.v !== 3 ||
    raw.model !== model ||
    raw.voiceMode !== "catalog" ||
    raw.catalogVoice !== plan.catalogVoice ||
    raw.voicePromptSent !== false ||
    raw.voicePromptHash !== plan.voicePromptHash ||
    raw.languageCode !== CATALOG_LANGUAGE ||
    raw.tempo !== tempo ||
    raw.textHash !== plan.textHash ||
    raw.requests !== 1 ||
    raw.transcriptMode !== "verbatim"
  ) {
    throw new Error(`${plan.lessonKey} dry-run fişi güncel katalog sesi ve metinle uyuşmuyor. Önce --dry-run.`);
  }
}

type GeminiSpeechPart = {
  inlineData?: { data?: string; mimeType?: string | null };
  inline_data?: { data?: string; mimeType?: string | null; mime_type?: string | null };
};

type GeminiSpeechResponse = {
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<GeminiSpeechPart | null> } | null;
  } | null>;
  parts?: Array<GeminiSpeechPart | null>;
  promptFeedback?: { blockReason?: string };
};

function createBakeClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: SPEECH_TIMEOUT_MS,
      retryOptions: {
        attempts: 1,
        httpStatusCodes: [] as number[],
      },
    },
  });
}

function wavFromSpeechResponse(response: GeminiSpeechResponse): Buffer {
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
}): Promise<Buffer> {
  const voiceName = canonicalizeGeminiTtsVoiceName(input.voiceName);
  const speechConfig = {
    languageCode: CATALOG_LANGUAGE,
    voiceConfig: {
      prebuiltVoiceConfig: { voiceName },
    },
  };
  const response = (await input.client.models.generateContent({
    model: input.model,
    contents: [{ role: "user", parts: [{ text: juniorVoiceDesignTranscript(input.text) }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig,
      httpOptions: { timeout: SPEECH_TIMEOUT_MS },
    },
  })) as GeminiSpeechResponse;
  const wav = wavFromSpeechResponse(response);
  if (wav.length < MIN_WAV_BYTES) {
    throw new Error("Katalog sesi boş ses döndü.");
  }
  return wav;
}

async function synthesize(input: {
  client: GoogleGenAI;
  model: string;
  text: string;
  voiceName: string;
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
      if (isSafetyOrInvalid(error)) {
        throw new Error(`Katalog sesi isteği kabul edilmedi. Aynı çağrı tekrarlanmaz. ${errorMessage(error)}`);
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

function probeMediaDurationSec(path: string): number {
  const ffmpegPath = require("ffmpeg-static") as string | null;
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static ikili yok; süre okunamadı.");
  }
  const result = spawnSync(ffmpegPath, ["-hide_banner", "-i", path], { encoding: "utf8" });
  const text = `${result.stderr ?? ""}\n${result.stdout ?? ""}`;
  const match = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/u);
  if (!match) {
    throw new Error(`Süre okunamadı: ${path}`);
  }
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function formatClock(sec: number): string {
  const total = Math.round(sec);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Kalite kapısı tek istek. Geçilemezse aynı ders yeniden sentezlenmez. */
const QUALITY_RETRY_MAX = 1;

async function bakePilotV2Lesson(client: GoogleGenAI, model: string, plan: LessonPlan): Promise<void> {
  const voiceName = canonicalizeGeminiTtsVoiceName(plan.catalogVoice);
  process.stdout.write(
    `  [JuniorCinemaEngine v2 Pilot] ${plan.lessonKey}  ${plan.teacherName}/${voiceName}  atempo=${JUNIOR_BAKE_ATEMPO}  12 sekans PCM hizalama  ${plan.wordCount} kelime\n`,
  );
  const rawWav = await synthesize({
    client,
    model,
    text: plan.listenText,
    voiceName,
  });

  // 1) Akustik vadi araması + pedagojik es (createSilentPcmWav) enjeksiyonu + kesin PCM sample sayımı
  //    Hizalama ham (doğal) tempoda yapılır; WSOLA oranı tüm dosyaya eşit uygulanır.
  const aligned = alignSingleWavToMat5Cues(rawWav, MAT_5_AUTHORED_CUES);

  // 2) %94 tempo (JUNIOR_BAKE_ATEMPO) + EBU R128 loudnorm ve 48 kHz mastering
  const mastered = masterAcademySpeechWav(aligned.combinedWav, {
    atempo: true,
    tempo: JUNIOR_BAKE_ATEMPO,
  });
  const quality = assertAcademySpeechQuality(mastered);

  const wavPath = wavPathFor(plan.lessonKey);
  const mp3Path = mp3PathFor(plan.lessonKey);
  mkdirSync(dirname(wavPath), { recursive: true });
  writeFileSync(wavPath, mastered);
  transcodeAcademyWavToMp3(wavPath, mp3Path);

  const mp3Bytes = statSync(mp3Path).size;
  if (mp3Bytes < MIN_MP3_BYTES) {
    throw new Error(`${plan.lessonKey} MP3 çok küçük: ${mp3Bytes} bayt.`);
  }
  const mp3Sec = probeMediaDurationSec(mp3Path);
  const exactAudioMs = Math.round(mp3Sec * 1000);

  // 3) Timeline JSON'u gerçek MP3 milisaniyesine kilitle (atempo sonrası süre kayması dahil)
  const tempoLocked = {
    ...aligned.timeline,
    teacher: { ...aligned.timeline.teacher, atempo: JUNIOR_BAKE_ATEMPO },
  };
  const finalTimeline = lockTimelineToExactAudioMs(tempoLocked, exactAudioMs);
  mkdirSync(dirname(PILOT_V2_TIMELINE_PATH), { recursive: true });
  writeFileSync(PILOT_V2_TIMELINE_PATH, `${JSON.stringify(finalTimeline, null, 2)}\n`, "utf8");

  for (const cue of finalTimeline.cues) {
    process.stdout.write(
      `    • ${cue.id.padEnd(6)} [${String(cue.startMs).padStart(6)}ms -> ${String(cue.endMs).padStart(6)}ms] (${((cue.endMs - cue.startMs) / 1000).toFixed(2)}s, es=${cue.pauseAfterMs}ms, keyframes=${cue.keyframes.length})\n`,
    );
  }
  process.stdout.write(
    `  yazıldı ${formatClock(mp3Sec)} (${mp3Sec.toFixed(2)}s / ${exactAudioMs}ms)  atempo=${JUNIOR_BAKE_ATEMPO}  ${mp3Bytes} bayt  LUFS ${quality.integratedLufs.toFixed(1)} → ${mp3Path}\n`,
  );
  process.stdout.write(`  timeline mühürlendi → ${PILOT_V2_TIMELINE_PATH}\n`);
}

async function bakeLesson(client: GoogleGenAI, model: string, plan: LessonPlan): Promise<void> {
  if (plan.lessonKey === SAMPLE_REBAKE_KEY) {
    throw new Error(MAT5_SAMPLE_PATH_CLOSED);
  }
  const voiceName = canonicalizeGeminiTtsVoiceName(plan.catalogVoice);
  process.stdout.write(
    `  ${plan.lessonKey}  ${plan.teacherName}/${voiceName}  katalog sesi  voicePrompt gönderilmez  1 istek  atempo=${JUNIOR_BAKE_ATEMPO}  ${plan.wordCount} kelime\n`,
  );
  const minSec = JUNIOR_NARRATION_MIN_MS / 1000;
  const maxSec = JUNIOR_NARRATION_MAX_MS / 1000;
  let mastered: Buffer | null = null;
  let quality: ReturnType<typeof assertAcademySpeechQuality> | null = null;
  let durationSec = 0;
  let paceNote = `atempo=${JUNIOR_BAKE_ATEMPO}`;
  for (let qualityAttempt = 1; qualityAttempt <= QUALITY_RETRY_MAX; qualityAttempt += 1) {
    const rawWav = await synthesize({
      client,
      model,
      text: plan.listenText,
      voiceName,
    });
    let candidate = masterAcademySpeechWav(rawWav, { atempo: true, tempo: JUNIOR_BAKE_ATEMPO });
    durationSec = pcmWavDurationSec(candidate);
    paceNote = `atempo=${JUNIOR_BAKE_ATEMPO}`;
    const completeFloorSec = plan.wordCount * 0.4;
    if (durationSec > maxSec || durationSec < completeFloorSec) {
      throw new Error(
        `${plan.lessonKey} süre bandı dışında: ${durationSec.toFixed(1)}s. Bant ${completeFloorSec.toFixed(0)}–${maxSec}s. Dosya yazılmadı.`,
      );
    }
    if (durationSec < minSec) {
      process.stdout.write(
        `  katalog temposu oyuncu saatinin altında: ${durationSec.toFixed(1)}s < ${minSec}s. Metin tam. Dosya yazılır.\n`,
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
  const mp3Sec = probeMediaDurationSec(mp3Path);
  process.stdout.write(
    `  yazıldı ${formatClock(mp3Sec)} (${mp3Sec.toFixed(2)}s)  ${paceNote}  ${mp3Bytes} bayt  LUFS ${quality.integratedLufs.toFixed(1)} → ${mp3Path}\n`,
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
  assertMat5SamplePathClosed(argv);
  const dryRun = argv.includes("--dry-run") || !argv.includes("--confirm-gemini-spend");
  const model = academyBakeVoiceModelId();
  assertAcademySealedMediaModel("VOICE_TTS", model);
  if (model !== JUNIOR_TTS_MODEL_ID) {
    throw new Error(`Junior ses modeli mühür kimliğinden koptu. Gelen ${model}.`);
  }
  const matrix = argv.includes("--matrix");
  if (matrix && !dryRun) {
    throw new Error(
      "Mühürlü derslerin tamamı tek maça alınmaz. Kurs kurs çalıştır: --course=jr_06_mat ve kardeşleri.",
    );
  }
  const pilotV2 = isPilotV2LessonRebake(argv);
  const forceMath = isMathForceOverwrite(argv);
  const batches = lessonBatches(argv);
  const plans = batches.flat().map((lesson) => planLesson(lesson, pilotV2));
  if (plans.length === 0) {
    throw new Error("Seçilen kapsamda fırınlanacak ders yok: tümü yayında ya da kapsam boş.");
  }
  const sample = isSampleRebake(argv);
  const alreadyBaked = plans.filter(
    (plan) => juniorLessonHasBakedAudio(plan.lessonKey) && !(sample && plan.lessonKey === SAMPLE_REBAKE_KEY),
  );
  if (alreadyBaked.length > 0 && !forceMath && !pilotV2) {
    throw new Error(`Fırınlı dersler yeniden fırınlanmaz: ${alreadyBaked.map((plan) => plan.lessonKey).join(", ")}.`);
  }
  if (forceMath) {
    const foreign = plans.filter((plan) => plan.catalogVoice !== "Fenrir");
    if (foreign.length > 0) {
      throw new Error(
        `Matematik üzerine yazma Fenrir dışında ses kabul etmez: ${foreign.map((plan) => `${plan.lessonKey}/${plan.catalogVoice}`).join(", ")}.`,
      );
    }
    process.stdout.write(
      `Matematik üzerine yazma açık. ${plans.length} ders Fenrir ile yeniden yazılacak. Yayında olan: ${alreadyBaked.length}.\n`,
    );
  }
  for (const batch of batches) {
    assertAcademyMatchWhistleBudget(batch.length);
  }
  process.stdout.write(
    `Junior katalog sesi fırını — ${plans.length} ders, model=${model}, tempo=${JUNIOR_BAKE_ATEMPO}${pilotV2 ? " (v2 pilot)" : ""}, voicePrompt gönderilmez${dryRun ? " (dry-run)" : ""}\n`,
  );
  for (const plan of plans) {
    process.stdout.write(
      `  ${plan.lessonKey}  ${plan.teacherName}/${plan.catalogVoice}  katalog sesi  ${plan.wordCount} kelime  ${plan.charCount} karakter  ${plan.title}\n`,
    );
    if (dryRun || pilotV2) {
      writeReceipt(plan, model, JUNIOR_BAKE_ATEMPO);
    }
    if (dryRun && pilotV2 && !existsSync(PILOT_V2_TIMELINE_PATH)) {
      mkdirSync(dirname(PILOT_V2_TIMELINE_PATH), { recursive: true });
      writeFileSync(PILOT_V2_TIMELINE_PATH, `${JSON.stringify(MAT_5_DRAFT_TIMELINE, null, 2)}\n`, "utf8");
    }
  }
  if (dryRun) {
    process.stdout.write("Dry-run bitti. API yok. Fırın için --confirm-gemini-spend ve tek kurs.\n");
    return;
  }
  for (const plan of plans) {
    assertReceipt(plan, model, JUNIOR_BAKE_ATEMPO);
  }
  const apiKey = sanitizeKey(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY yok.");
  }
  const client = createBakeClient(apiKey);
  for (let index = 0; index < plans.length; index += 1) {
    const plan = plans[index]!;
    if (pilotV2 && plan.lessonKey === SAMPLE_REBAKE_KEY) {
      await bakePilotV2Lesson(client, model, plan);
    } else {
      await bakeLesson(client, model, plan);
    }
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
