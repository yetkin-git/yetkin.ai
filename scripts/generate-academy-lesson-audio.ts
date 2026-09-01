#!/usr/bin/env tsx
/**
 * Zero-Cost Streaming TTS bake — PEDAGOJI.md mediaReleaseSeal.
 * Canlı izleme generateSpeech çağırmaz; bu operatör hattı WAV dondurur.
 *
 * Google AI Studio Tier 1 RPM 10: TTS istekleri sırayla atılır; her sesten
 * sonra 6,5 sn beklenir (dakikada 9). 429 gelirse 10 sn bekleyip aynı tur tekrarlanır.
 *
 *   npm run generate:academy-audio
 *   npm run generate:academy-audio -- --dry-run
 *   npm run generate:academy-audio -- --slug=python-temel
 *   npm run generate:academy-audio -- --force
 */
import "./load-academy-bake-env";

import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, statSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { Client } from "pg";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";
import { ACADEMY_DIALOGUE_TURN_GAP_SEC } from "@/lib/academy/dialogue-timeline";
import { ACADEMY_MEDIA_SEALED_SKU_SLUGS, isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import {
  ACADEMY_MEDIA_RELEASE_BUCKET,
  ACADEMY_MEDIA_RELEASE_LANGUAGE,
  ACADEMY_MEDIA_RELEASE_MAX_BYTES,
  academyLessonAudioDiskPath,
  academyMediaReleaseJobForLesson,
  splitAcademySpeechChunks,
  type AcademyMediaReleaseJob,
  type AcademySealedSkuSlug,
} from "@/lib/academy/media-release-seal";
import { getDefaultModelId, VOICE_TTS_FALLBACK_MODEL_ID } from "@/lib/kernel/ai/model-roles";
import {
  collectGeminiInlineAudioParts,
  concatPcmWavBuffers,
  createSilentPcmWav,
  mergeGeminiInlineAudioToWav,
  tempoStretchPcmWav,
} from "@/lib/kernel/ai/pcm-wav";
import { canonicalizeGeminiTtsLanguageCode, canonicalizeGeminiTtsVoiceName } from "@/lib/kernel/ai/tts-voices";
import { normalizeRuntimeDatabaseUrl } from "@/lib/kernel/postgres-url";

const SPEECH_TIMEOUT_MS = 120_000;
/** Google AI Studio Tier 1 RPM 10 — 8 sn ara ile dakikada ~7 istek; preview DSQ 429 için pay bırakır. */
const TURN_PAUSE_MS = 8_000;
const RATE_LIMIT_RETRY_MS = 20_000;
const RATE_LIMIT_RETRY_CAP_MS = 120_000;

/** Preview 3.1 DSQ dolunca 2.5'e yapış; her turda 3.1'i yeniden deneme. */
let preferredTtsModel: string | null = null;
const MIN_WAV_BYTES = 2_048;
const MIN_GEMINI_KEY_CHARS = 8;
const SPEECH_ATTEMPTS = 12;

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

function parseArgs(argv: readonly string[]): {
  dryRun: boolean;
  force: boolean;
  noDb: boolean;
  slug: AcademySealedSkuSlug | null;
} {
  let slug: AcademySealedSkuSlug | null = null;
  const slugArg = argv.find((part) => part.startsWith("--slug="))?.slice("--slug=".length)?.trim();
  if (slugArg) {
    if (!(ACADEMY_MEDIA_SEALED_SKU_SLUGS as readonly string[]).includes(slugArg)) {
      throw new Error(`TTS mührü yok: ${slugArg}`);
    }
    slug = slugArg as AcademySealedSkuSlug;
  }
  return {
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
    noDb: argv.includes("--no-db"),
    slug,
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

function collectJobs(model: string, slugFilter: AcademySealedSkuSlug | null): AcademyMediaReleaseJob[] {
  const slugs = slugFilter ? [slugFilter] : [...ACADEMY_MEDIA_SEALED_SKU_SLUGS];
  const jobs: AcademyMediaReleaseJob[] = [];
  for (const slug of slugs) {
    const lessons = CURRICULUM_DRAFTS_BY_SLUG[slug];
    if (!lessons || lessons.length === 0) {
      throw new Error(`Müfredat yok: ${slug}`);
    }
    for (const lesson of lessons) {
      if (!isAcademyLessonAudioSealed(slug, lesson.key)) {
        continue;
      }
      const job = academyMediaReleaseJobForLesson(slug, lesson, model);
      if (job.turns.length === 0) {
        throw new Error(`DialogueTurn[] boş: ${slug}/${lesson.key}`);
      }
      jobs.push(job);
    }
  }
  return jobs;
}

async function synthesizeChunk(input: {
  client: GoogleGenAI;
  text: string;
  voiceName: string;
  model: string;
}): Promise<Buffer> {
  const voiceName = canonicalizeGeminiTtsVoiceName(input.voiceName);
  const languageCode = canonicalizeGeminiTtsLanguageCode(ACADEMY_MEDIA_RELEASE_LANGUAGE);
  let model = preferredTtsModel ?? input.model;
  let attempt = 0;
  let rateLimitStreak = 0;
  for (;;) {
    try {
      const wav = await requestSpeechWav({
        client: input.client,
        model,
        text: input.text,
        voiceName,
        languageCode,
      });
      preferredTtsModel = model;
      return wav;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/NOT_FOUND|model .+ not found|does not exist/i.test(message) && model !== VOICE_TTS_FALLBACK_MODEL_ID) {
        model = VOICE_TTS_FALLBACK_MODEL_ID;
        preferredTtsModel = model;
        process.stdout.write(`  model yedek: ${model}\n`);
        continue;
      }
      if (isRateLimitError(error)) {
        if (model !== VOICE_TTS_FALLBACK_MODEL_ID) {
          model = VOICE_TTS_FALLBACK_MODEL_ID;
          preferredTtsModel = model;
          process.stdout.write(`  429; model yedek: ${model}\n`);
          continue;
        }
        rateLimitStreak += 1;
        const waitMs = Math.min(
          RATE_LIMIT_RETRY_CAP_MS,
          RATE_LIMIT_RETRY_MS * 2 ** Math.min(rateLimitStreak - 1, 3),
        );
        process.stdout.write(`  429; ${Math.round(waitMs / 1000)}s sonra aynı tur tekrar\n`);
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

async function bakeLessonWav(
  client: GoogleGenAI,
  job: AcademyMediaReleaseJob,
  model: string,
): Promise<Buffer> {
  const parts: Buffer[] = [];
  for (let turnIndex = 0; turnIndex < job.turns.length; turnIndex += 1) {
    const turn = job.turns[turnIndex]!;
    const chunks = splitAcademySpeechChunks(turn.spokenText);
    const turnWavs: Buffer[] = [];
    for (const chunk of chunks) {
      const wav = await synthesizeChunk({
        client,
        text: chunk,
        voiceName: turn.voice,
        model,
      });
      turnWavs.push(tempoStretchPcmWav(wav, turn.speechRate));
      await sleep(TURN_PAUSE_MS);
    }
    if (turnWavs.length === 0) {
      throw new Error(`Boş tur: ${job.lessonKey} #${turnIndex}`);
    }
    parts.push(concatPcmWavBuffers(turnWavs));
    if (turnIndex < job.turns.length - 1) {
      parts.push(createSilentPcmWav(Math.round(ACADEMY_DIALOGUE_TURN_GAP_SEC * 1000)));
    }
    process.stdout.write(
      `    tur ${turnIndex + 1}/${job.turns.length} ${turn.canonicalCharacterName} ${turn.voice} @${Math.round(turn.speechRate * 100)}%\n`,
    );
  }
  return concatPcmWavBuffers(parts);
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
  const model = getDefaultModelId("VOICE_TTS");
  const jobs = collectJobs(model, args.slug);
  const turnCount = jobs.reduce((sum, job) => sum + job.turns.length, 0);
  process.stdout.write(
    `academy-audio bake — ${jobs.length} ders, ${turnCount} tur, model=${model}${args.dryRun ? " (dry-run)" : ""}\n`,
  );
  if (args.dryRun) {
    for (const job of jobs) {
      process.stdout.write(
        `  ${job.courseSlug}/${job.lessonKey}  ${job.turns.length} tur  seal=${job.mediaReleaseSeal.slice(0, 12)}  → ${job.publicPath}\n`,
      );
    }
    return;
  }
  const apiKey = sanitizeGeminiApiKey(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY yok — bake durdu.");
  }
  const gemini = createBakeClient(apiKey);
  let baked = 0;
  let skipped = 0;
  let sealed = 0;
  const failures: string[] = [];
  for (let index = 0; index < jobs.length; index += 1) {
    const job = jobs[index]!;
    const diskPath = academyLessonAudioDiskPath(job.courseSlug, job.lessonKey);
    process.stdout.write(`[${index + 1}/${jobs.length}] ${job.courseSlug}/${job.lessonKey} — ${job.title}\n`);
    let wav: Buffer | null = null;
    const existing = !args.force && existsSync(diskPath) && statSync(diskPath).size >= MIN_WAV_BYTES;
    if (existing) {
      process.stdout.write("  WAV var; TTS atlandı.\n");
      skipped += 1;
      wav = readFileSync(diskPath);
    } else {
      try {
        wav = await bakeLessonWav(gemini, job, model);
        if (wav.byteLength < MIN_WAV_BYTES) {
          throw new Error(`WAV çok küçük: ${wav.byteLength}`);
        }
        mkdirSync(dirname(diskPath), { recursive: true });
        writeFileSync(diskPath, wav);
        baked += 1;
        process.stdout.write(`  donduruldu ${wav.byteLength} byte → ${diskPath}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${job.courseSlug}/${job.lessonKey}: ${message}`);
        process.stdout.write(`  HATA: ${message}\n`);
        continue;
      }
    }
    if (!wav || args.noDb) {
      continue;
    }
    if (wav.byteLength > ACADEMY_MEDIA_RELEASE_MAX_BYTES) {
      process.stdout.write(`  DB atlandı — WAV tavanı aşıldı (${wav.byteLength}).\n`);
      continue;
    }
    try {
      await stampMediaReleaseSeal(job, wav, model);
      sealed += 1;
      process.stdout.write(`  mediaReleaseSeal ${job.mediaReleaseSeal.slice(0, 16)}…\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stdout.write(`  DB mührü yazılamadı: ${message}\n`);
    }
  }
  process.stdout.write(
    `academy-audio bake bitti — yeni=${baked} atlanan=${skipped} mühür=${sealed} hata=${failures.length}\n`,
  );
  if (failures.length > 0) {
    for (const row of failures) {
      process.stderr.write(`  ${row}\n`);
    }
    process.exitCode = 1;
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`academy-audio bake FAIL — ${message}\n`);
  process.exit(1);
});
