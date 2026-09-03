#!/usr/bin/env tsx
/**
 * Zero-Cost Streaming TTS bake — PEDAGOJI.md mediaReleaseSeal.
 * Canlı izleme generateSpeech çağırmaz; bu operatör hattı WAV dondurur.
 *
 * Gemini TTS varsayılan KAPALI. API çağrısı yalnız --confirm-gemini-spend ile.
 * İstekler perde (ana paragraf) sınırında; 300 karakterlik mikro dilim/dikiş YASAK.
 * SOLA / tempoStretch / %93 hız bükme YASAK — Gemini ham temposu korunur.
 * İstekler arası 4000ms. --force mevcut WAV üzerine ana TTS modelini yeniden sentezler.
 *
 *   npm run generate:academy-audio -- --dry-run
 *   npm run generate:academy-audio -- --key=ai-agent-temel-1 --confirm-gemini-spend
 *   npm run generate:academy-audio -- --slug=ai-agent-temel --confirm-gemini-spend
 *
 * WAV süresi değişince `ACADEMY_SEALED_AUDIO_DURATION_SEC` (lib/academy/lesson-audio.ts)
 * oynatma listesi dakikasıyla senkronlanmalıdır. Aynı bake `ACADEMY_SEALED_AUDIO_CACHE_V`
 * damgasını yükseltir; tarayıcı eski WAV'ı immutable cache'ten çalmaz.
 * Çıkış: +8 dB gain + 48 kHz resample (Chrome 24 kHz 1:47 takılması).
 */
import "./load-academy-bake-env";

import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, statSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { Client } from "pg";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";
import { ACADEMY_DIALOGUE_TURN_GAP_SEC, academyDialogueReadingDurationSec } from "@/lib/academy/dialogue-timeline";
import { ACADEMY_MEDIA_SEALED_SKU_SLUGS, isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import {
  ACADEMY_MEDIA_RELEASE_BUCKET,
  ACADEMY_MEDIA_RELEASE_LANGUAGE,
  ACADEMY_MEDIA_RELEASE_MAX_BYTES,
  academyLessonAudioDiskPath,
  academyMediaReleaseJobForLesson,
  type AcademyMediaReleaseJob,
  type AcademySealedSkuSlug,
} from "@/lib/academy/media-release-seal";
import { getDefaultModelId } from "@/lib/kernel/ai/model-roles";
import {
  boostPcmWavGain,
  collectGeminiInlineAudioParts,
  concatPcmWavBuffers,
  createSilentPcmWav,
  mergeGeminiInlineAudioToWav,
  pcmWavDurationSec,
  PCM_WAV_GAIN_DB,
  PCM_WAV_PLAYBACK_SAMPLE_RATE,
  resamplePcmWav,
} from "@/lib/kernel/ai/pcm-wav";
import { canonicalizeGeminiTtsLanguageCode, canonicalizeGeminiTtsVoiceName } from "@/lib/kernel/ai/tts-voices";
import { normalizeRuntimeDatabaseUrl } from "@/lib/kernel/postgres-url";

/** Gemini ~4 dk tavanının altında; perde bu süreyi aşarsa cümle sınırından paketlenir. */
const SENTENCE_CHUNK_BUDGET_SEC = 200;
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

function parseArgs(argv: readonly string[]): {
  dryRun: boolean;
  force: boolean;
  confirmGeminiSpend: boolean;
  noDb: boolean;
  slug: AcademySealedSkuSlug | null;
  key: string | null;
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
  return {
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
    confirmGeminiSpend: argv.includes("--confirm-gemini-spend"),
    noDb: argv.includes("--no-db"),
    slug,
    key,
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
      // `--key=` kota sonrası ilk mühür için mühür tablosunda olmayan dersi de alır.
      if (!keyFilter && !isAcademyLessonAudioSealed(slug, lesson.key)) {
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
      return concatPcmWavBuffers([left, right]);
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
    return concatPcmWavBuffers([left, right]);
  }
}

function splitAtSentenceBudget(text: string, budgetSec: number): string[] {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return [];
  }
  if (academyDialogueReadingDurationSec(trimmed, "egitmen") <= budgetSec) {
    return [trimmed];
  }
  const sentences = trimmed.split(/(?<=[.!?…])\s+/u).filter((part) => part.trim().length > 0);
  if (sentences.length === 0) {
    return [trimmed];
  }
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const piece = sentence.trim();
    if (!piece) {
      continue;
    }
    const next = current ? `${current} ${piece}` : piece;
    if (current && academyDialogueReadingDurationSec(next, "egitmen") > budgetSec) {
      chunks.push(current);
      current = piece;
    } else {
      current = next;
    }
  }
  if (current) {
    chunks.push(current);
  }
  return chunks.filter((chunk) => chunk.length > 0);
}

async function bakeLessonWav(
  client: GoogleGenAI,
  job: AcademyMediaReleaseJob,
  model: string,
): Promise<Buffer> {
  const parts: Buffer[] = [];
  for (let turnIndex = 0; turnIndex < job.turns.length; turnIndex += 1) {
    const turn = job.turns[turnIndex]!;
    const pieces = splitAtSentenceBudget(turn.spokenText, SENTENCE_CHUNK_BUDGET_SEC);
    if (pieces.length === 0) {
      throw new Error(`Boş tur: ${job.lessonKey} #${turnIndex}`);
    }
    process.stdout.write(
      `    perde ${turnIndex + 1}/${job.turns.length} ${turn.canonicalCharacterName} ${turn.voice} ${turn.spokenText.length} karakter ${pieces.length} parça +${PCM_WAV_GAIN_DB} dB / ${PCM_WAV_PLAYBACK_SAMPLE_RATE / 1000} kHz\n`,
    );
    const turnWavs: Buffer[] = [];
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex += 1) {
      const piece = pieces[pieceIndex]!;
      process.stdout.write(
        `      cümle ${pieceIndex + 1}/${pieces.length} ${piece.length} karakter ${academyDialogueReadingDurationSec(piece, "egitmen").toFixed(0)}s\n`,
      );
      turnWavs.push(
        await synthesizeSeamlessScript({
          client,
          text: piece,
          voiceName: turn.voice,
          model,
        }),
      );
      if (pieceIndex < pieces.length - 1) {
        await sleep(TURN_PAUSE_MS);
      }
    }
    parts.push(concatPcmWavBuffers(turnWavs));
    if (turnIndex < job.turns.length - 1) {
      parts.push(createSilentPcmWav(Math.round(ACADEMY_DIALOGUE_TURN_GAP_SEC * 1000)));
      await sleep(TURN_PAUSE_MS);
    }
  }
  const merged = concatPcmWavBuffers(parts);
  return resamplePcmWav(boostPcmWavGain(merged, PCM_WAV_GAIN_DB), PCM_WAV_PLAYBACK_SAMPLE_RATE);
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
  const jobs = collectJobs(model, args.slug, args.key);
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
      process.stdout.write(
        `  ${job.courseSlug}/${job.lessonKey}  ${job.turns.length} tur  seal=${job.mediaReleaseSeal.slice(0, 12)}  → ${job.publicPath}\n`,
      );
    }
    return;
  }
  if (!args.confirmGeminiSpend) {
    process.stderr.write(
      "academy-audio bake KAPALI — Gemini TTS isteği atılmadı. Manuel onay: --confirm-gemini-spend\n",
    );
    process.exit(1);
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
    const existing = !forceBake && existsSync(diskPath) && statSync(diskPath).size >= MIN_WAV_BYTES;
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
        process.stdout.write(`  donduruldu ${wav.byteLength} byte ${pcmWavDurationSec(wav).toFixed(1)}s → ${diskPath}\n`);
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
