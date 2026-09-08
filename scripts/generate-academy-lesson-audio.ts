#!/usr/bin/env tsx
/**
 * Zero-Cost Streaming TTS bake — PEDAGOJI.md mediaReleaseSeal.
 * Canlı izleme generateSpeech çağırmaz; bu operatör hattı WAV dondurur.
 *
 * Gemini TTS varsayılan KAPALI. API çağrısı yalnız --confirm-gemini-spend ile.
 * İstekler 3–5 sn noktalama dilimidir; 42 sn’lik dev blok YASAK.
 * Dilimler arasına 0.3–0.5 sn taze nefes sessizliği konur (dikiş/crossfade değil).
 * SOLA / tempoStretch / %93 hız bükme YASAK — Gemini ham temposu korunur.
 * İstekler arası 4000ms. --force mevcut WAV üzerine ana TTS modelini yeniden sentezler.
 *
 *   npm run generate:academy-audio -- --dry-run
 *   npm run generate:academy-audio -- --dry-run --slug=01_office_ai
 *   npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-3
 *
 * WAV süresi değişince bake `lib/academy/lesson-audio-timings/{key}.json` yazar;
 * oynatıcı currentTime ile nefes dilimi saniyesini 1:1 kilitler. `ACADEMY_SEALED_AUDIO_DURATION_SEC`
 * yedek tablodur. `cacheV` tarayıcı immutable cache’ini kırar.
 * Çıkış: +8 dB gain + 48 kHz resample (Chrome 24 kHz 1:47 takılması).
 */
import "./load-academy-bake-env";

import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { Client } from "pg";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";
import { academyDialogueReadingDurationSec } from "@/lib/academy/dialogue-timeline";
import {
  ACADEMY_MEDIA_PRODUCTION_QUEUE,
  ACADEMY_MEDIA_SEALED_SKU_SLUGS,
  isAcademyLessonAudioInProduction,
  isAcademyLessonAudioSealed,
} from "@/lib/academy/pilot-sku";
import {
  ACADEMY_MEDIA_RELEASE_BUCKET,
  ACADEMY_MEDIA_RELEASE_LANGUAGE,
  ACADEMY_MEDIA_RELEASE_MAX_BYTES,
  ACADEMY_TTS_PARAGRAPH_PAUSE_SEC,
  academyLessonAudioDiskPath,
  academyMediaReleaseJobForLesson,
  type AcademyMediaReleaseJob,
  type AcademySealedSkuSlug,
} from "@/lib/academy/media-release-seal";
import { getDefaultModelId, VOICE_TTS_FALLBACK_MODEL_ID } from "@/lib/kernel/ai/model-roles";
import {
  boostPcmWavGain,
  collectGeminiInlineAudioParts,
  concatPcmWavBuffers,
  concatPcmWavBuffersSeamless,
  createSilentPcmWav,
  mergeGeminiInlineAudioToWav,
  pcmWavDurationSec,
  PCM_WAV_GAIN_DB,
  PCM_WAV_PLAYBACK_SAMPLE_RATE,
  resamplePcmWav,
} from "@/lib/kernel/ai/pcm-wav";
import { canonicalizeGeminiTtsLanguageCode, canonicalizeGeminiTtsVoiceName } from "@/lib/kernel/ai/tts-voices";
import { academyLessonCueParagraphPlan } from "@/lib/academy/lesson-cues";
import type { AcademySealedAudioPiece, AcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { normalizeRuntimeDatabaseUrl } from "@/lib/kernel/postgres-url";
import { splitAcademyTtsBreathChunks } from "@/lib/academy/tts-breath-chunks";
import {
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptParagraphs,
} from "@/lib/academy/spoken-scripts";

const SPEECH_TIMEOUT_MS = 180_000;
/** İstekler arası zorunlu bekleme. */
const TURN_PAUSE_MS = 4_000;
const RATE_LIMIT_RETRY_MS = 20_000;
const RATE_LIMIT_RETRY_CAP_MS = 120_000;
const RATE_LIMIT_RETRY_MAX = 2;
const NETWORK_RETRY_CAP = 4;

const MIN_WAV_BYTES = 2_048;
const MIN_GEMINI_KEY_CHARS = 8;
const SPEECH_ATTEMPTS = 12;
const MIN_SPEECH_CHUNK_RETRY_CHARS = 80;

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

function allowedBakeModels(): readonly string[] {
  return [getDefaultModelId("VOICE_TTS"), VOICE_TTS_FALLBACK_MODEL_ID];
}

function parseArgs(argv: readonly string[]): {
  dryRun: boolean;
  force: boolean;
  seal: boolean;
  confirmGeminiSpend: boolean;
  noDb: boolean;
  slug: AcademySealedSkuSlug | null;
  key: string | null;
  model: string | null;
} {
  let slug: AcademySealedSkuSlug | null = null;
  const slugArg = argv.find((part) => part.startsWith("--slug="))?.slice("--slug=".length)?.trim();
  if (slugArg) {
    if (!(ACADEMY_MEDIA_SEALED_SKU_SLUGS as readonly string[]).includes(slugArg)) {
      throw new Error(`TTS mührü yok: ${slugArg}`);
    }
    slug = slugArg as AcademySealedSkuSlug;
  }
  const rawKey = argv.find((part) => part.startsWith("--key="))?.slice("--key=".length)?.trim() || null;
  const keyAliases: Record<string, string> = {
    "prompt-muhendisligi-ve-yapisandirilmis-cikti": "ai-agent-temel-2",
    "arac-kullanimi-tool-calling-mantigi": "ai-agent-temel-3",
    "hafiza-mimarisi-context-window-vector-storage": "ai-agent-temel-4",
    "karar-verme-donguleri-react-deseni": "ai-agent-temel-5",
    "mini-proje-hava-durumu-ve-not-alma-araclarini-kullanan-basit-bir-python-ai-agent": "ai-agent-temel-6",
  };
  const key = rawKey ? (keyAliases[rawKey] ?? rawKey) : null;
  const seal = argv.includes("--seal");
  const confirmGeminiSpend = argv.includes("--confirm-gemini-spend");
  const dryRun = argv.includes("--dry-run") || (!seal && !confirmGeminiSpend);
  const rawModel = argv.find((part) => part.startsWith("--model="))?.slice("--model=".length)?.trim() || null;
  if (rawModel && !allowedBakeModels().includes(rawModel)) {
    throw new Error(`TTS model izinli değil: ${rawModel} (izinli: ${allowedBakeModels().join(", ")})`);
  }
  return {
    dryRun,
    force: argv.includes("--force"),
    seal,
    confirmGeminiSpend,
    noDb: argv.includes("--no-db"),
    slug,
    key,
    model: rawModel,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function sanitizeGeminiApiKey(raw: string | undefined | null): string | null {
  if (raw == null) {
    return null;
  }
  let value = raw.replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
  const quote = value[0];
  if (
    (quote === '"' || quote === "'" || quote === "`") &&
    value.length >= 2 &&
    value.endsWith(quote)
  ) {
    value = value.slice(1, -1).replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
  }
  return value.length > MIN_GEMINI_KEY_CHARS ? value : null;
}

function isDailyModelQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /generate_requests_per_model_per_day|requests_per_day|per_day.*quota|quota.*per_day/i.test(
    message,
  );
}

function isRateLimitError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const record = error as { status?: unknown; code?: unknown };
    if (record.status === 429 || record.code === 429) {
      return true;
    }
  }
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /RESOURCE_EXHAUSTED|\b429\b|quota/i.test(message);
}

function isTransientNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  return /fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up|UND_ERR|ConnectTimeout|network/i.test(
    `${message} ${cause}`,
  );
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

async function requestSpeechWav(input: {
  client: GoogleGenAI;
  model: string;
  text: string;
  voiceName: string;
  languageCode?: string;
}): Promise<Buffer> {
  const response = (await input.client.models.generateContent({
    model: input.model,
    contents: [{ role: "user", parts: [{ text: input.text }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        ...(input.languageCode ? { languageCode: input.languageCode } : {}),
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: input.voiceName },
        },
      },
    },
  })) as GeminiSpeechResponse;
  return wavFromSpeechResponse(response);
}

function collectJobs(
  model: string,
  slugFilter: AcademySealedSkuSlug | null,
  keyFilter: string | null,
  includeProductionQueue: boolean,
): AcademyMediaReleaseJob[] {
  const slugs = slugFilter ? [slugFilter] : [...ACADEMY_MEDIA_SEALED_SKU_SLUGS];
  const jobs: AcademyMediaReleaseJob[] = [];
  for (const slug of slugs) {
    const lessons = CURRICULUM_DRAFTS_BY_SLUG[slug];
    if (!lessons || lessons.length === 0) {
      throw new Error(`Müfredat yok: ${slug}`);
    }
    for (const lesson of lessons) {
      if (keyFilter && lesson.key !== keyFilter) {
        continue;
      }
      const sealed = isAcademyLessonAudioSealed(slug, lesson.key);
      const queued = isAcademyLessonAudioInProduction(slug, lesson.key);
      if (!keyFilter && !sealed && !(includeProductionQueue && queued)) {
        continue;
      }
      const job = academyMediaReleaseJobForLesson(slug, lesson, model);
      if (job.turns.length === 0) {
        throw new Error(`DialogueTurn[] boş: ${slug}/${lesson.key}`);
      }
      jobs.push(job);
    }
  }
  if (keyFilter && jobs.length === 0) {
    throw new Error(`TTS işi yok: ${keyFilter}`);
  }
  return jobs;
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

async function synthesizeChunk(input: {
  client: GoogleGenAI;
  text: string;
  voiceName: string;
  model: string;
}): Promise<Buffer> {
  const voiceName = canonicalizeGeminiTtsVoiceName(input.voiceName);
  const languageCode = canonicalizeGeminiTtsLanguageCode(ACADEMY_MEDIA_RELEASE_LANGUAGE);
  const model = input.model;
  let attempt = 0;
  let rateLimitStreak = 0;
  let networkStreak = 0;
  for (;;) {
    try {
      const wav = await requestSpeechWav({
        client: input.client,
        model,
        text: input.text,
        voiceName,
        languageCode,
      });
      return wav;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isDailyModelQuotaError(error)) {
        throw error;
      }
      if (isRateLimitError(error)) {
        rateLimitStreak += 1;
        if (rateLimitStreak > RATE_LIMIT_RETRY_MAX) {
          throw error;
        }
        const waitMs = Math.min(
          RATE_LIMIT_RETRY_CAP_MS,
          RATE_LIMIT_RETRY_MS * 2 ** Math.min(rateLimitStreak - 1, 3),
        );
        process.stdout.write(`  429; ${Math.round(waitMs / 1000)}s sonra aynı tur tekrar\n`);
        await sleep(waitMs);
        continue;
      }
      if (isTransientNetworkError(error)) {
        networkStreak += 1;
        if (networkStreak >= NETWORK_RETRY_CAP && input.text.length >= MIN_SPEECH_CHUNK_RETRY_CHARS * 2) {
          throw error;
        }
        const waitMs = Math.min(
          RATE_LIMIT_RETRY_CAP_MS,
          RATE_LIMIT_RETRY_MS * 2 ** Math.min(networkStreak - 1, 3),
        );
        process.stdout.write(`  ağ; ${Math.round(waitMs / 1000)}s sonra aynı tur tekrar\n`);
        await sleep(waitMs);
        continue;
      }
      attempt += 1;
      if (attempt < SPEECH_ATTEMPTS) {
        const waitMs = Math.min(30_000, 1_000 * 2 ** Math.min(attempt, 5));
        process.stdout.write(
          `  TTS hata (${message.slice(0, 160)}); ${waitMs}ms sonra ${attempt + 1}/${SPEECH_ATTEMPTS}\n`,
        );
        await sleep(waitMs);
        continue;
      }
      throw error;
    }
  }
}

async function synthesizeChunkFull(input: {
  client: GoogleGenAI;
  text: string;
  voiceName: string;
  model: string;
}): Promise<Buffer> {
  const wav = await synthesizeChunk(input);
  const expected = academyDialogueReadingDurationSec(input.text, "egitmen");
  const actual = pcmWavDurationSec(wav);
  if (input.text.length > MIN_SPEECH_CHUNK_RETRY_CHARS * 2 && expected > 2.5 && actual < expected * 0.55) {
    const halves = splitSpeechChunkInHalf(input.text);
    if (halves) {
      process.stdout.write(
        `  dilim kısık (${actual.toFixed(1)}s < ${expected.toFixed(1)}s); ikiye bölündü\n`,
      );
      const left = await synthesizeChunkFull({ ...input, text: halves[0] });
      const right = await synthesizeChunkFull({ ...input, text: halves[1] });
      return concatPcmWavBuffersSeamless([left, right]);
    }
  }
  return wav;
}

async function synthesizeSeamlessScript(input: {
  client: GoogleGenAI;
  text: string;
  voiceName: string;
  model: string;
}): Promise<Buffer> {
  try {
    return await synthesizeChunkFull(input);
  } catch (error) {
    const halves = splitSpeechChunkInHalf(input.text);
    if (!halves) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    process.stdout.write(`  tek parça bölündü (${message.slice(0, 120)})\n`);
    const left = await synthesizeSeamlessScript({ ...input, text: halves[0] });
    await sleep(TURN_PAUSE_MS);
    const right = await synthesizeSeamlessScript({ ...input, text: halves[1] });
    return concatPcmWavBuffersSeamless([left, right]);
  }
}

function assertSpokenScriptMatchesCues(lessonKey: string): void {
  const fromCues = loadAcademySpokenScriptParagraphs(lessonKey);
  const fromMd = loadAcademySpokenScriptMarkdownParagraphs(lessonKey);
  if (fromMd.length === 0) {
    return;
  }
  if (fromCues.length !== fromMd.length) {
    throw new Error(
      `Konuşma metni ≠ cue: ${lessonKey} markdown=${fromMd.length} cue=${fromCues.length}`,
    );
  }
  for (let index = 0; index < fromCues.length; index += 1) {
    if (fromCues[index] !== fromMd[index]) {
      throw new Error(`Konuşma metni ≠ cue paragraf ${index + 1}: ${lessonKey}`);
    }
  }
}

function round3Sec(value: number): number {
  return Math.round(value * 1000) / 1000;
}

type BreathBakeChunk = {
  turnIndex: number;
  chunkIndex: number;
  text: string;
  voiceName: string;
  cueId: string;
  cueParagraphIndex: number;
};

function collectBreathChunks(job: AcademyMediaReleaseJob): BreathBakeChunk[] {
  const plan = academyLessonCueParagraphPlan(job.lessonKey);
  if (plan.length !== job.turns.length) {
    throw new Error(
      `Perde planı eşleşmedi: ${job.lessonKey} cueParagraf=${plan.length} tur=${job.turns.length}`,
    );
  }
  const chunks: BreathBakeChunk[] = [];
  for (let turnIndex = 0; turnIndex < job.turns.length; turnIndex += 1) {
    const turn = job.turns[turnIndex]!;
    const planned = plan[turnIndex]!;
    const piecesInTurn = splitAcademyTtsBreathChunks(turn.spokenText);
    if (piecesInTurn.length === 0) {
      throw new Error(`Boş tur: ${job.lessonKey} #${turnIndex}`);
    }
    for (let chunkIndex = 0; chunkIndex < piecesInTurn.length; chunkIndex += 1) {
      chunks.push({
        turnIndex,
        chunkIndex,
        text: piecesInTurn[chunkIndex]!,
        voiceName: turn.voice,
        cueId: planned.cueId,
        cueParagraphIndex: planned.cueParagraphIndex,
      });
    }
  }
  return chunks;
}

async function bakeLessonWav(
  client: GoogleGenAI,
  job: AcademyMediaReleaseJob,
  model: string,
): Promise<{ wav: Buffer; pieces: AcademySealedAudioPiece[]; pauseSec: number }> {
  assertSpokenScriptMatchesCues(job.lessonKey);
  const breathChunks = collectBreathChunks(job);
  const breathMs = Math.round(
    Math.min(500, Math.max(300, ACADEMY_TTS_PARAGRAPH_PAUSE_SEC * 1000)),
  );
  const pauseSec = breathMs / 1000;
  const parts: Buffer[] = [];
  const pieces: AcademySealedAudioPiece[] = [];
  let cursorSec = 0;
  process.stdout.write(
    `    ${breathChunks.length} nefes dilimi +${PCM_WAV_GAIN_DB} dB / ${PCM_WAV_PLAYBACK_SAMPLE_RATE / 1000} kHz  pause=${Math.round(breathMs)}ms\n`,
  );
  for (let index = 0; index < breathChunks.length; index += 1) {
    const chunk = breathChunks[index]!;
    process.stdout.write(
      `      ${index + 1}/${breathChunks.length} cue=${chunk.cueId} p${chunk.cueParagraphIndex}.${chunk.chunkIndex} ${chunk.text.length} karakter ${academyDialogueReadingDurationSec(chunk.text, "egitmen").toFixed(1)}s\n`,
    );
    const chunkWav = await synthesizeSeamlessScript({
      client,
      text: chunk.text,
      voiceName: chunk.voiceName,
      model,
    });
    const chunkSec = pcmWavDurationSec(chunkWav);
    if (!(chunkSec > 0)) {
      throw new Error(`Dilimin süresi ölçülemedi: ${job.lessonKey} #${index}`);
    }
    pieces.push({
      index,
      cueId: chunk.cueId,
      cueParagraphIndex: chunk.cueParagraphIndex,
      chunkIndex: chunk.chunkIndex,
      start: round3Sec(cursorSec),
      end: round3Sec(cursorSec + chunkSec),
      text: chunk.text,
    });
    parts.push(chunkWav);
    cursorSec += chunkSec;
    if (index < breathChunks.length - 1) {
      parts.push(createSilentPcmWav(breathMs));
      cursorSec += pauseSec;
      await sleep(TURN_PAUSE_MS);
    }
  }
  const merged = concatPcmWavBuffers(parts);
  const wav = resamplePcmWav(boostPcmWavGain(merged, PCM_WAV_GAIN_DB), PCM_WAV_PLAYBACK_SAMPLE_RATE);
  return { wav, pieces, pauseSec };
}

/** Bake parça saatlerini dondurur — oynatıcı currentTime ile nefes dilimini 1:1 kilitler. */
function writeSealedAudioTimings(input: {
  job: AcademyMediaReleaseJob;
  wav: Buffer;
  pieces: readonly AcademySealedAudioPiece[];
  pauseSec: number;
}): string {
  const durationSec = pcmWavDurationSec(input.wav);
  if (!(durationSec > 0)) {
    throw new Error(`WAV süresi ölçülemedi: ${input.job.lessonKey}`);
  }
  const lastEnd = input.pieces.at(-1)?.end ?? 0;
  if (Math.abs(lastEnd - durationSec) > 0.75) {
    throw new Error(
      `Perde toplamı WAV süresine oturmadı: ${input.job.lessonKey} sonPerde=${lastEnd}s wav=${durationSec.toFixed(3)}s`,
    );
  }
  const timings: AcademySealedAudioTimings = {
    lessonKey: input.job.lessonKey,
    pauseSec: input.pauseSec,
    durationSec: round3Sec(durationSec),
    cacheV: Math.max(1, Math.round(durationSec * 1000)),
    pieces: input.pieces,
  };
  const relativePath = join("lib", "academy", "lesson-audio-timings", `${input.job.lessonKey}.json`);
  const diskPath = join(process.cwd(), relativePath);
  mkdirSync(dirname(diskPath), { recursive: true });
  writeFileSync(diskPath, `${JSON.stringify(timings, null, 2)}\n`);
  return relativePath;
}

async function stampMediaReleaseSeal(job: AcademyMediaReleaseJob, wav: Buffer, model: string): Promise<void> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL tanımlı değil.");
  }
  const client = new Client({ connectionString: normalizeRuntimeDatabaseUrl(url) });
  await client.connect();
  try {
    await client.query(
      `INSERT INTO academy_audio_cache (
         id, cache_key, course_slug, lesson_key, bucket, object_path, public_url,
         mime_type, byte_size, model, media_release_seal, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW(), NOW())
       ON CONFLICT (cache_key) DO UPDATE SET
         bucket = EXCLUDED.bucket,
         object_path = EXCLUDED.object_path,
         public_url = EXCLUDED.public_url,
         mime_type = EXCLUDED.mime_type,
         byte_size = EXCLUDED.byte_size,
         model = EXCLUDED.model,
         media_release_seal = EXCLUDED.media_release_seal,
         updated_at = NOW()`,
      [
        randomUUID(),
        job.cacheKey,
        job.courseSlug,
        job.lessonKey,
        ACADEMY_MEDIA_RELEASE_BUCKET,
        job.objectPath,
        job.publicPath,
        "audio/wav",
        wav.byteLength,
        model,
        job.mediaReleaseSeal,
      ],
    );
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  let model = args.model ?? getDefaultModelId("VOICE_TTS");
  const jobs = collectJobs(model, args.slug, args.key, args.dryRun);
  const turnCount = jobs.reduce((sum, job) => sum + job.turns.length, 0);
  const forceBake = args.force;
  if (forceBake) {
    process.stdout.write("--force — mevcut WAV üzerine ana TTS modeli yeniden sentezlenir.\n");
  }
  process.stdout.write(
    `academy-audio bake — ${jobs.length} ders, ${turnCount} tur, model=${model}${args.dryRun ? " (dry-run)" : ""}\n`,
  );
  if (args.dryRun) {
    for (const job of jobs) {
      assertSpokenScriptMatchesCues(job.lessonKey);
      const breathChunks = collectBreathChunks(job);
      const queued =
        isAcademyLessonAudioInProduction(job.courseSlug, job.lessonKey) &&
        !isAcademyLessonAudioSealed(job.courseSlug, job.lessonKey);
      process.stdout.write(
        `  ${job.courseSlug}/${job.lessonKey}  ${job.turns.length} paragraf  ${breathChunks.length} nefes  ${job.turns[0]?.voice ?? "?"}  ${queued ? "KUYRUK" : "MÜHÜR"}  seal=${job.mediaReleaseSeal.slice(0, 12)}  → ${job.publicPath}\n`,
      );
    }
    const queueKeys = Object.values(ACADEMY_MEDIA_PRODUCTION_QUEUE).flat();
    process.stdout.write(
      `Keşif bitti. Prodüksiyon kuyruğu (WAV yok, karaoke kapalı): ${queueKeys.join(", ")}\nCanlı bake (tek ders): --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-3\n`,
    );
    return;
  }
  if (!args.seal || !args.confirmGeminiSpend) {
    process.stderr.write(
      "academy-audio bake için --seal ve --confirm-gemini-spend gerekir (Pedagoji E.4).\n",
    );
    process.exit(1);
  }
  const apiKey = sanitizeGeminiApiKey(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY yok.");
  }
  const client = createBakeClient(apiKey);
  for (const job of jobs) {
    const diskPath = academyLessonAudioDiskPath(job.courseSlug, job.lessonKey);
    if (existsSync(diskPath) && !forceBake) {
      const bytes = statSync(diskPath).size;
      process.stdout.write(`  atlandı (WAV var, ${bytes} bayt): ${diskPath}\n`);
      continue;
    }
    let activeModel = model;
    let activeJob = job;
    let baked: { wav: Buffer; pieces: AcademySealedAudioPiece[]; pauseSec: number };
    try {
      baked = await bakeLessonWav(client, activeJob, activeModel);
    } catch (error) {
      if (!isDailyModelQuotaError(error) || activeModel === VOICE_TTS_FALLBACK_MODEL_ID) {
        throw error;
      }
      const lesson = CURRICULUM_DRAFTS_BY_SLUG[activeJob.courseSlug]?.find(
        (row) => row.key === activeJob.lessonKey,
      );
      if (!lesson) {
        throw error;
      }
      activeModel = VOICE_TTS_FALLBACK_MODEL_ID;
      process.stdout.write(`  günlük kota; yedek TTS: ${activeModel}\n`);
      activeJob = academyMediaReleaseJobForLesson(activeJob.courseSlug, lesson, activeModel);
      baked = await bakeLessonWav(client, activeJob, activeModel);
    }
    const wav = baked.wav;
    if (wav.byteLength < MIN_WAV_BYTES) {
      throw new Error(`WAV çok küçük: ${activeJob.lessonKey} (${wav.byteLength} bayt)`);
    }
    if (wav.byteLength > ACADEMY_MEDIA_RELEASE_MAX_BYTES) {
      throw new Error(`WAV tavan aşıldı: ${activeJob.lessonKey} (${wav.byteLength} bayt)`);
    }
    mkdirSync(dirname(diskPath), { recursive: true });
    writeFileSync(diskPath, wav);
    process.stdout.write(
      `  yazıldı ${pcmWavDurationSec(wav).toFixed(1)}s ${wav.byteLength} bayt → ${diskPath}\n`,
    );
    const timingsPath = writeSealedAudioTimings({
      job: activeJob,
      wav,
      pieces: baked.pieces,
      pauseSec: baked.pauseSec,
    });
    process.stdout.write(
      `  timings ${baked.pieces.length} nefes dilimi 1:1 kilit → ${timingsPath}\n`,
    );
    if (!args.noDb) {
      await stampMediaReleaseSeal(activeJob, wav, activeModel);
    }
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`academy-audio bake FAIL — ${message}\n`);
  process.exit(1);
});
