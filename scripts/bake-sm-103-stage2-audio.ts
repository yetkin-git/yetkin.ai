#!/usr/bin/env tsx
/**
 * SM-103 Aşama 2 bütünsel ses fırını.
 * Girdi: lib/academy/curricula/sm-103/section_N.ts spokenScript.
 * Model: academyBakeVoiceModelId() — gemini-3.8-flash-tts.
 * Ses: Aoede (Selin). Tempo: ffmpeg WSOLA atempo=0.92.
 * Çıkış: public/media/academy/audio/sm-103/section_N.mp3
 *
 * Küresel fırın katsayısı 0.93 kalır. Bu script yalnız SM-103 parçasına 0.92 verir.
 * Varsayılan kapı ders 1’dir (onaylı pilot kaset). Ders 2–6 `--section=` ile açılır.
 * API yalnız --confirm-gemini-spend ve güncel --dry-run fişiyle açılır.
 * Mühürlü kaset ders başına 10–12 nefes isteğidir; tek HTTP çağrısı konuşmayı keser.
 *
 *   npx tsx scripts/bake-sm-103-stage2-audio.ts --dry-run
 *   npx tsx scripts/bake-sm-103-stage2-audio.ts --confirm-gemini-spend
 *   npx tsx scripts/bake-sm-103-stage2-audio.ts --dry-run --section=2,3,4,5,6
 *   npx tsx scripts/bake-sm-103-stage2-audio.ts --confirm-gemini-spend --section=2,3,4,5,6
 */
import "./load-academy-bake-env";

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { SM103_SECTION_MAP } from "@/lib/academy/curricula/sm-103/sections";
import { academyDialogueReadingDurationSec } from "@/lib/academy/dialogue-timeline";
import { academyCourseMasterVoice } from "@/lib/academy/instructors";
import { cleanAcademySpokenTextForTts } from "@/lib/academy/lesson-body";
import { ACADEMY_MEDIA_RELEASE_LANGUAGE, ACADEMY_TTS_PARAGRAPH_PAUSE_SEC } from "@/lib/academy/media-release-seal";
import { ACADEMY_MATCH_WHISTLE_MAX, assertAcademyMatchWhistleBudget } from "@/lib/academy/production-standard";
import { expandAcademyTtsSkipPreventer } from "@/lib/academy/spoken-scripts";
import {
  ACADEMY_TTS_LESSON_REQUEST_MAX,
  ACADEMY_TTS_LESSON_REQUEST_MIN,
  ACADEMY_TTS_RPM_GAP_MS,
  academyLessonRequestTargetForCourse,
  assertAcademyTtsLessonRequestBudget,
  injectAcademyTtsBreathPauses,
  packAcademyTtsLessonRequests,
} from "@/lib/academy/tts-breath-chunks";
import { masterAcademySpeechWav } from "@/lib/academy/tts-loudnorm";
import { assertAcademySpeechQuality } from "@/lib/academy/tts-quality-gate";
import {
  academyTtsPieceCachePaths,
  academyTtsPieceFingerprint,
  academyTtsRawPieceCachePaths,
  academyTtsRawPieceFingerprint,
} from "@/lib/academy/tts-piece-cache";
import {
  academyTtsStudioFingerprintMaterial,
  buildAcademyTtsStudioContents,
} from "@/lib/academy/tts-studio-prompt";
import { countAcademyMarkdownWords } from "@/lib/academy/word-count";
import {
  academyBakeVoiceModelId,
  assertAcademySealedMediaModel,
} from "@/lib/kernel/ai/model-roles";
import {
  concatPcmWavBuffers,
  concatPcmWavBuffersSeamless,
  createSilentPcmWav,
  collectGeminiInlineAudioParts,
  mergeGeminiInlineAudioToWav,
  pcmWavDurationSec,
  PCM_WAV_PLAYBACK_SAMPLE_RATE,
} from "@/lib/kernel/ai/pcm-wav";
import { canonicalizeGeminiTtsLanguageCode, canonicalizeGeminiTtsVoiceName } from "@/lib/kernel/ai/tts-voices";
import { transcodeAcademyWavToMp3 } from "./transcode-academy-lesson-audio";

const SM103_SLUG = "03_social_media_ai";
const SM103_VOICE = "Aoede";
const SM103_ATEMPO = 0.92;
const SM103_DSP_REV = "wsola-atempo-0.92-loudnorm-r128-v1";
const COURSE_CACHE = "sm-103";
const OUT_DIR = join(process.cwd(), "public", "media", "academy", "audio", "sm-103");
const WAV_DIR = join(process.cwd(), "media-bake", "academy", "audio", "sm-103");
const RECEIPT_DIR = join(process.cwd(), "media-bake", "academy", "dry-run-receipts", "sm-103");
const MIN_WAV_BYTES = 2_048;
const MIN_SPEECH_CHUNK_RETRY_CHARS = 80;
const SPEECH_TIMEOUT_MS = 180_000;
const RATE_LIMIT_RETRY_MS = 20_000;
const RATE_LIMIT_RETRY_CAP_MS = 180_000;
const RATE_LIMIT_RETRY_MAX = 8;
const NETWORK_RETRY_CAP = 4;
const SPEECH_ATTEMPTS = 12;
/** 600 kelime ≈ 5 dakika. Ölçülen tempo bu bandın altına düşerse ders yazılmaz. */
const SEC_PER_600_WORDS_MIN = 5 * 60;

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
  sectionNumber: number;
  lessonKey: string;
  title: string;
  wordCount: number;
  spokenWordCount: number;
  requests: readonly string[];
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

function spokenParagraphs(markdown: string): string[] {
  const stripped = markdown
    .replace(/<!--[\s\S]*?-->/gu, "\n\n")
    .replace(/^#{1,6}\s+.*$/gmu, "")
    .replace(/\*\*([^*]+)\*\*/gu, "$1")
    .replace(/\*([^*]+)\*/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1");
  return stripped
    .split(/\n\n+/u)
    .map((part) =>
      cleanAcademySpokenTextForTts(expandAcademyTtsSkipPreventer(part.replace(/[^\S\n]+/gu, " ").trim())),
    )
    .filter((part) => part.length > 0);
}

function planLesson(sectionNumber: number): LessonPlan {
  const section = SM103_SECTION_MAP[sectionNumber - 1];
  if (!section) {
    throw new Error(`SM-103 ders yok: ${sectionNumber}`);
  }
  const paragraphs = spokenParagraphs(section.contentMarkdown);
  const target = academyLessonRequestTargetForCourse(SM103_SECTION_MAP.length);
  const packed = packAcademyTtsLessonRequests(paragraphs, target);
  const speechSec = paragraphs.reduce((sum, paragraph) => sum + countAcademyMarkdownWords(paragraph), 0);
  assertAcademyTtsLessonRequestBudget(packed.length, false, speechSec > 0 ? Number.POSITIVE_INFINITY : 0);
  if (packed.length < ACADEMY_TTS_LESSON_REQUEST_MIN || packed.length > ACADEMY_TTS_LESSON_REQUEST_MAX) {
    throw new Error(
      `SM-103 ders ${sectionNumber} istek bandı ${ACADEMY_TTS_LESSON_REQUEST_MIN}–${ACADEMY_TTS_LESSON_REQUEST_MAX}; gelen ${packed.length}.`,
    );
  }
  const requests = packed.map((request) => request.text);
  const spoken = requests.join(" ");
  const lessonKey = section.lessonKey;
  if (!lessonKey) {
    throw new Error(`SM-103 ders ${sectionNumber} lessonKey yok. Fırın açılmaz.`);
  }
  return {
    sectionNumber,
    lessonKey,
    title: section.title,
    wordCount: section.estimatedWordCount,
    spokenWordCount: countAcademyMarkdownWords(spoken),
    requests,
    textHash: createHash("sha256").update(requests.join("\n"), "utf8").digest("hex"),
  };
}

function selectedSections(argv: readonly string[]): number[] {
  const raw = argv.find((part) => part.startsWith("--section="))?.slice("--section=".length)?.trim();
  if (!raw) {
    return [1];
  }
  const numbers = raw.split(",").map((part) => Number.parseInt(part.trim(), 10));
  if (numbers.some((number) => !Number.isInteger(number) || number < 1 || number > 6)) {
    throw new Error(`--section= 1..6 bekler. Gelen: ${raw}`);
  }
  return numbers;
}

function receiptPath(sectionNumber: number): string {
  return join(RECEIPT_DIR, `section_${sectionNumber}.json`);
}

function writeReceipt(plan: LessonPlan, model: string, voice: string): void {
  const path = receiptPath(plan.sectionNumber);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `${JSON.stringify({
      v: 1,
      sectionNumber: plan.sectionNumber,
      lessonKey: plan.lessonKey,
      model,
      voice,
      tempo: SM103_ATEMPO,
      requests: plan.requests.length,
      textHash: plan.textHash,
    })}\n`,
  );
}

function assertReceipt(plan: LessonPlan, model: string, voice: string): void {
  const path = receiptPath(plan.sectionNumber);
  if (!existsSync(path)) {
    throw new Error(`SM-103 ders ${plan.sectionNumber} dry-run fişi yok. Önce --dry-run. API çağrısı yok.`);
  }
  const raw = JSON.parse(readFileSync(path, "utf8")) as {
    v?: number;
    model?: string;
    voice?: string;
    tempo?: number;
    textHash?: string;
  };
  if (
    raw.v !== 1 ||
    raw.model !== model ||
    raw.voice !== voice ||
    raw.tempo !== SM103_ATEMPO ||
    raw.textHash !== plan.textHash
  ) {
    throw new Error(`SM-103 ders ${plan.sectionNumber} dry-run fişi güncel metinle uyuşmuyor. Önce --dry-run.`);
  }
}

function splitSpeechChunkInHalf(text: string): [string, string] | null {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (trimmed.length < MIN_SPEECH_CHUNK_RETRY_CHARS * 2) {
    return null;
  }
  const mid = Math.floor(trimmed.length / 2);
  const windowStart = Math.max(0, mid - 80);
  const window = trimmed.slice(windowStart, Math.min(trimmed.length, mid + 80));
  const rel = window.search(/[.!?…]\s+/u);
  const cut = rel >= 0 ? windowStart + rel + 1 : mid;
  const left = trimmed.slice(0, cut).trim();
  const right = trimmed.slice(cut).trim();
  if (left.length < MIN_SPEECH_CHUNK_RETRY_CHARS || right.length < MIN_SPEECH_CHUNK_RETRY_CHARS) {
    return null;
  }
  return [left, right];
}

function pieceLooksTruncated(text: string, durationSec: number): boolean {
  const expected = academyDialogueReadingDurationSec(text, "egitmen");
  return text.length > MIN_SPEECH_CHUNK_RETRY_CHARS * 2 && expected > 2.5 && durationSec < expected * 0.55;
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
}): Promise<Buffer> {
  const voiceName = canonicalizeGeminiTtsVoiceName(input.voiceName);
  const languageCode = canonicalizeGeminiTtsLanguageCode(ACADEMY_MEDIA_RELEASE_LANGUAGE);
  const response = (await input.client.models.generateContent({
    model: input.model,
    contents: [{ role: "user", parts: [{ text: buildAcademyTtsStudioContents(input.text) }] }],
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
        throw new Error(
          `${input.model} kotası doldu. Alt modele düşülmez. ${errorMessage(error)}`,
        );
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
        process.stdout.write(`  429; ${Math.round(waitMs / 1000)}s sonra aynı parça\n`);
        await sleep(waitMs);
        continue;
      }
      if (isNetwork(error)) {
        networkStreak += 1;
        if (networkStreak >= NETWORK_RETRY_CAP) {
          throw error;
        }
        const waitMs = Math.min(RATE_LIMIT_RETRY_CAP_MS, RATE_LIMIT_RETRY_MS * 2 ** Math.min(networkStreak - 1, 3));
        process.stdout.write(`  ağ; ${Math.round(waitMs / 1000)}s sonra aynı parça\n`);
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

async function synthesizeRepaired(input: {
  client: GoogleGenAI;
  model: string;
  voiceName: string;
  text: string;
}): Promise<Buffer> {
  const spokenText = injectAcademyTtsBreathPauses(input.text);
  const wav = await synthesize({ ...input, text: spokenText });
  if (!pieceLooksTruncated(input.text, pcmWavDurationSec(wav))) {
    return wav;
  }
  const halves = splitSpeechChunkInHalf(input.text);
  if (!halves) {
    throw new Error(`Parça kısık ve bölünemiyor: ${pcmWavDurationSec(wav).toFixed(1)}s.`);
  }
  process.stdout.write(
    `      kısık ${pcmWavDurationSec(wav).toFixed(1)}s; ikiye bölündü\n`,
  );
  const left = await synthesizeRepaired({ ...input, text: halves[0] });
  await sleep(ACADEMY_TTS_RPM_GAP_MS);
  const right = await synthesizeRepaired({ ...input, text: halves[1] });
  return concatPcmWavBuffersSeamless([left, right]);
}

async function loadOrSynthesizePiece(input: {
  client: GoogleGenAI;
  model: string;
  voiceName: string;
  lessonKey: string;
  index: number;
  text: string;
}): Promise<{ wav: Buffer; fromCache: boolean }> {
  const spokenText = injectAcademyTtsBreathPauses(input.text);
  const acoustic = academyTtsStudioFingerprintMaterial(spokenText);
  const rawFingerprint = academyTtsRawPieceFingerprint({
    model: input.model,
    voice: input.voiceName,
    text: spokenText,
    acoustic,
  });
  const fingerprint = academyTtsPieceFingerprint({
    model: input.model,
    voice: input.voiceName,
    speechRate: SM103_ATEMPO,
    text: spokenText,
    acoustic,
    dspRev: SM103_DSP_REV,
  });
  const rawPaths = academyTtsRawPieceCachePaths({
    courseSlug: COURSE_CACHE,
    lessonKey: input.lessonKey,
    index: input.index,
    fingerprint: rawFingerprint,
  });
  const paths = academyTtsPieceCachePaths({
    courseSlug: COURSE_CACHE,
    lessonKey: input.lessonKey,
    index: input.index,
    fingerprint,
  });
  const expected = academyDialogueReadingDurationSec(input.text, "egitmen");
  if (existsSync(paths.wav) && statSync(paths.wav).size >= MIN_WAV_BYTES) {
    const cached = readFileSync(paths.wav);
    const cachedSec = pcmWavDurationSec(cached);
    if (cachedSec > 0 && !pieceLooksTruncated(input.text, cachedSec)) {
      process.stdout.write(`      önbellek ${input.index + 1} API yok ${cachedSec.toFixed(1)}s\n`);
      return { wav: cached, fromCache: true };
    }
    rmSync(paths.wav, { force: true });
    process.stdout.write(`      önbellek ${input.index + 1} kısık ${cachedSec.toFixed(1)}s, beklenen ${expected.toFixed(1)}s; atıldı\n`);
  }
  let spokenWav: Buffer | null = null;
  let fromRaw = false;
  if (existsSync(rawPaths.wav) && statSync(rawPaths.wav).size >= MIN_WAV_BYTES) {
    const raw = readFileSync(rawPaths.wav);
    const rawSec = pcmWavDurationSec(raw);
    if (!pieceLooksTruncated(input.text, rawSec)) {
      spokenWav = raw;
      fromRaw = true;
      process.stdout.write(`      ham önbellek ${input.index + 1} API yok ${rawSec.toFixed(1)}s\n`);
    } else {
      rmSync(rawPaths.wav, { force: true });
      process.stdout.write(`      ham önbellek ${input.index + 1} kısık ${rawSec.toFixed(1)}s; atıldı\n`);
    }
  }
  if (!spokenWav) {
    spokenWav = await synthesizeRepaired({
      client: input.client,
      model: input.model,
      voiceName: input.voiceName,
      text: input.text,
    });
    mkdirSync(rawPaths.dir, { recursive: true });
    writeFileSync(rawPaths.wav, spokenWav);
    process.stdout.write(`      ham Gemini yazıldı ${input.index + 1} ${pcmWavDurationSec(spokenWav).toFixed(1)}s\n`);
  }
  let chunkWav = masterAcademySpeechWav(spokenWav, { atempo: true, tempo: SM103_ATEMPO });
  try {
    const quality = assertAcademySpeechQuality(chunkWav);
    mkdirSync(paths.dir, { recursive: true });
    writeFileSync(paths.wav, chunkWav);
    process.stdout.write(
      `      parça ${input.index + 1} ${pcmWavDurationSec(chunkWav).toFixed(1)}s  300 Hz–1 kHz %${(quality.bandShare * 100).toFixed(1)} LUFS ${quality.integratedLufs.toFixed(1)}\n`,
    );
    return { wav: chunkWav, fromCache: fromRaw };
  } catch (error) {
    rmSync(rawPaths.wav, { force: true });
    rmSync(paths.wav, { force: true });
    process.stdout.write(`      kalite tekrar ${input.index + 1}: ${errorMessage(error)}\n`);
    spokenWav = await synthesizeRepaired({
      client: input.client,
      model: input.model,
      voiceName: input.voiceName,
      text: input.text,
    });
    mkdirSync(rawPaths.dir, { recursive: true });
    writeFileSync(rawPaths.wav, spokenWav);
    chunkWav = masterAcademySpeechWav(spokenWav, { atempo: true, tempo: SM103_ATEMPO });
    const quality = assertAcademySpeechQuality(chunkWav);
    mkdirSync(paths.dir, { recursive: true });
    writeFileSync(paths.wav, chunkWav);
    process.stdout.write(
      `      parça ${input.index + 1} ${pcmWavDurationSec(chunkWav).toFixed(1)}s  300 Hz–1 kHz %${(quality.bandShare * 100).toFixed(1)} LUFS ${quality.integratedLufs.toFixed(1)}\n`,
    );
    return { wav: chunkWav, fromCache: false };
  }
}

function mp3PathFor(sectionNumber: number): string {
  return join(OUT_DIR, `section_${sectionNumber}.mp3`);
}

async function bakeLesson(client: GoogleGenAI, model: string, voice: string, plan: LessonPlan): Promise<void> {
  const parts: Buffer[] = [];
  process.stdout.write(
    `  ders ${plan.sectionNumber} ${plan.requests.length} istek  atempo=${SM103_ATEMPO}  ${plan.spokenWordCount} kelime\n`,
  );
  for (let index = 0; index < plan.requests.length; index += 1) {
    if (index > 0) {
      parts.push(createSilentPcmWav(Math.round(ACADEMY_TTS_PARAGRAPH_PAUSE_SEC * 1000), PCM_WAV_PLAYBACK_SAMPLE_RATE));
    }
    const piece = await loadOrSynthesizePiece({
      client,
      model,
      voiceName: voice,
      lessonKey: `section_${plan.sectionNumber}`,
      index,
      text: plan.requests[index]!,
    });
    parts.push(piece.wav);
    if (index < plan.requests.length - 1 && !piece.fromCache) {
      await sleep(ACADEMY_TTS_RPM_GAP_MS);
    }
  }
  const merged = concatPcmWavBuffers(parts);
  const wav = masterAcademySpeechWav(merged, { atempo: false });
  const quality = assertAcademySpeechQuality(wav);
  const durationSec = pcmWavDurationSec(wav);
  const secPer600 = (durationSec / plan.spokenWordCount) * 600;
  if (!(durationSec >= SEC_PER_600_WORDS_MIN) || !(secPer600 >= SEC_PER_600_WORDS_MIN)) {
    throw new Error(
      `SM-103 ders ${plan.sectionNumber} süre bandı dışında: ${durationSec.toFixed(1)}s, 600 kelime karşılığı ${secPer600.toFixed(1)}s. Taban ${SEC_PER_600_WORDS_MIN}s. Dosya yazılmadı.`,
    );
  }
  const wavPath = join(WAV_DIR, `section_${plan.sectionNumber}.wav`);
  const mp3Path = mp3PathFor(plan.sectionNumber);
  mkdirSync(dirname(wavPath), { recursive: true });
  writeFileSync(wavPath, wav);
  transcodeAcademyWavToMp3(wavPath, mp3Path);
  const mp3Bytes = statSync(mp3Path).size;
  process.stdout.write(
    `  yazıldı ${formatClock(durationSec)} (${durationSec.toFixed(1)}s) 600-kelime temposu ${formatClock(secPer600)}  ${mp3Bytes} bayt  LUFS ${quality.integratedLufs.toFixed(1)} → ${mp3Path}\n`,
  );
}

function formatClock(sec: number): string {
  const total = Math.round(sec);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
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
  if (model !== "gemini-3.8-flash-tts") {
    throw new Error(`SM-103 ses modeli gemini-3.8-flash-tts olmalı. Gelen ${model}.`);
  }
  const voice = academyCourseMasterVoice(SM103_SLUG);
  if (voice !== SM103_VOICE) {
    throw new Error(`SM-103 ses mührü Aoede. Gelen ${voice}. API çağrısı yok.`);
  }
  const voiceName = canonicalizeGeminiTtsVoiceName(voice);
  const sections = selectedSections(argv);
  const plans = sections.map((sectionNumber) => planLesson(sectionNumber));
  const requestTotal = plans.reduce((sum, plan) => sum + plan.requests.length, 0);
  assertAcademyMatchWhistleBudget(requestTotal);
  process.stdout.write(
    `SM-103 Aşama 2 — ${plans.length} ders, ${requestTotal} istek, model=${model}, ses=${voiceName}, tempo=${SM103_ATEMPO}${dryRun ? " (dry-run)" : ""}\n`,
  );
  for (const plan of plans) {
    process.stdout.write(
      `  section_${plan.sectionNumber}  müfredat ${plan.wordCount} kelime  konuşulan ${plan.spokenWordCount} kelime  ${plan.requests.length} istek  ${plan.lessonKey}  ${plan.title}\n`,
    );
    if (dryRun) {
      plan.requests.forEach((text, index) => {
        const words = countAcademyMarkdownWords(text);
        const expected = academyDialogueReadingDurationSec(text, "egitmen");
        process.stdout.write(`    istek ${index + 1}  ${words} kelime  okuma ${expected.toFixed(1)}s\n`);
      });
    }
    if (dryRun) {
      writeReceipt(plan, model, voiceName);
    }
  }
  if (dryRun) {
    process.stdout.write("Dry-run bitti. API yok. Fırın için --confirm-gemini-spend.\n");
    return;
  }
  for (const plan of plans) {
    assertReceipt(plan, model, voiceName);
  }
  const apiKey = sanitizeKey(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY yok.");
  }
  const client = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: SPEECH_TIMEOUT_MS, retryOptions: { attempts: 1, httpStatusCodes: [] as number[] } },
  });
  for (const plan of plans) {
    await bakeLesson(client, model, voiceName, plan);
  }
  process.stdout.write(`1 Maç = MAX 100 Düdük: kullanılan ${matchWhistlesUsed} istek, tavan ${ACADEMY_MATCH_WHISTLE_MAX}.\n`);
  for (const plan of plans) {
    const path = mp3PathFor(plan.sectionNumber);
    if (!existsSync(path) || statSync(path).size < MIN_WAV_BYTES) {
      throw new Error(`MP3 diske inmedi: ${path}`);
    }
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(`SM-103 ses fırını FAIL — ${errorMessage(error)}\n`);
  process.exit(1);
});
