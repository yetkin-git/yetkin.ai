#!/usr/bin/env tsx
/**
 * Zero-Cost Streaming TTS bake — PEDAGOJI.md mediaReleaseSeal.
 * Ses seçimi fırınlamada kadın veya erkek TTS (PEDAGOJI.md §B); slug mührü ezer.
 * Canlı izleme generateSpeech çağırmaz; bu operatör hattı WAV dondurur.
 *
 * Gemini TTS varsayılan KAPALI. API çağrısı yalnız --seal ve --confirm-gemini-spend ile.
 * Kota kilitleri (API'den önce, Error):
 *   1. İstenen ses kursun `courseMasterVoice` stringi ile uyuşmazsa dur.
 *      İstisna: --sample-only --voice= yalnız 1. parçayı o sesle dener; kurs mührü ve ders kasedi değişmez.
 *   2. `--seal` ancak başarılı `--dry-run` metin/zamanlama fişi varsa açılır.
 *   3. Mühürlü dersin `public/media/academy/audio/` MP3'ü varsa tekrar fırın yok.
 * Bake öncesi kapı: --dry-run taraması zorunlu; insan onayı olmadan harici çağrı yok.
 * Skip-preventer: paragraf başı kısa emir ("F2'ye bas") bağlaçlı akışa çevrilir; cue terimleri korunur.
 * İstekler 12–15 doğal nefes bloğu / ders başı 10–12 istek; 3–5 sn mikro dilim YASAK.
 * 1 Maç = MAX 100 Düdük: kurs planı ve gerçekleşen çağrı `ACADEMY_MATCH_WHISTLE_MAX` üstüne çıkmaz.
 * Cümle geçişlerine `[pause]` enjekte edilir; eğitmenin tonlaması blok içinde canlı kalır.
 * Aynı paragraf dilimleri arasına 0.4 sn nefes konur. Kural ve örnek geçişinde 1.75 sn es vardır.
 * Slayt değişince görsel, yeni cümleden 1.5 sn önce açılır.
 * Tempo DSP yoktur. Sakin tempo yönetmen notundadır (`Pace: calm, natural, clear accent`).
 * Seviye ffmpeg EBU R128 loudnorm'dur. Tarak filtreli tempo ve tanh kırpıcı çağrılmaz.
 * İstekler arası 6500ms (RPM 10/dk kalkanı). --force mühürlü yayın MP3'ünün üzerine yazmaz.
 *
 *   npm run generate:academy-audio -- --dry-run
 *   npm run generate:academy-audio -- --dry-run --slug=01_office_ai
 *   npm run generate:academy-audio -- --dry-run --slug=02_ecommerce_ai --key=02_ecommerce_ai-1
 *   npm run generate:academy-audio -- --dry-run --slug=02_ecommerce_ai --key=02_ecommerce_ai-2
 *   npm run generate:academy-audio -- --dry-run --slug=02_ecommerce_ai --key=02_ecommerce_ai-3
 *   npm run generate:academy-audio -- --dry-run --slug=02_ecommerce_ai --key=02_ecommerce_ai-4
 *   npm run generate:academy-audio -- --dry-run --slug=02_ecommerce_ai --key=02_ecommerce_ai-5
 *   npm run generate:academy-audio -- --dry-run --slug=02_ecommerce_ai --key=02_ecommerce_ai-6
 *   npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-1
 *   npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-6
 *   npm run generate:academy-audio -- --dry-run --slug=04_chatbot_nocode --key=04_chatbot_nocode-1
 *   npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --slug=04_chatbot_nocode --key=04_chatbot_nocode-1
 *   npm run generate:academy-audio -- --dry-run --slug=05_prompt_practice --key=05_prompt_practice-1
 *   npm run generate:academy-audio -- --sample-only --seal --confirm-gemini-spend --slug=01_office_ai --key=01_office_ai-1
 *   npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --slug=05_prompt_practice --key=05_prompt_practice-1
 *
 * WAV süresi değişince bake `lib/academy/lesson-audio-timings/{key}.json` yazar;
 * oynatıcı currentTime ile nefes dilimi saniyesini 1:1 kilitler. `ACADEMY_SEALED_AUDIO_DURATION_SEC`
 * yedek tablodur. `cacheV` tarayıcı immutable cache’ini kırar.
 * Çıkış: EBU R128 loudnorm (I=-16) + 48 kHz. Ham Gemini WAV raw-cache'te durur.
 * Akustik mühür: stüdyo, close-mic, reverberasyonsuz. Direktif transkriptin üstünde kalır.
 */
import "./load-academy-bake-env";
import "@/lib/academy/lesson-json-disk";

import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, statSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { Client } from "pg";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";
import { academyDialogueReadingDurationSec } from "@/lib/academy/dialogue-timeline";
import { academyBakeChunkGap } from "@/lib/academy/human-rhythm";
import { ACADEMY_INSTRUCTOR_SPEECH_RATE, academyCourseMasterVoice } from "@/lib/academy/instructors";
import {
  ACADEMY_MEDIA_SEALED_SKU_SLUGS,
  academyMediaSealedLessonKeys,
  isAcademyLessonAudioOnRebakeQueue,
  isAcademyLessonAudioSealed,
} from "@/lib/academy/pilot-sku";
import {
  ACADEMY_MEDIA_RELEASE_BUCKET,
  ACADEMY_MEDIA_RELEASE_LANGUAGE,
  ACADEMY_MEDIA_RELEASE_MAX_BYTES,
  ACADEMY_TTS_PARAGRAPH_PAUSE_SEC,
  academyLessonAudioDiskPath,
  academyLessonAudioReleaseDiskPath,
  academyMediaReleaseJobForLesson,
  academyMediaReleaseJobForPrepStrip,
  type AcademyMediaReleaseJob,
  type AcademySealedSkuSlug,
} from "@/lib/academy/media-release-seal";
import {
  academyBakeVoiceModelId,
  assertAcademySealedMediaModel,
} from "@/lib/kernel/ai/model-roles";
import {
  collectGeminiInlineAudioParts,
  concatPcmWavBuffers,
  concatPcmWavBuffersSeamless,
  createSilentPcmWav,
  decodeGeminiInlineAudio,
  mergeGeminiInlineAudioToWav,
  pcmWavDurationSec,
  PCM_WAV_PLAYBACK_SAMPLE_RATE,
  wrapPcmAsWav,
} from "@/lib/kernel/ai/pcm-wav";
import { canonicalizeGeminiTtsLanguageCode, canonicalizeGeminiTtsVoiceName } from "@/lib/kernel/ai/tts-voices";
import { academyLessonCueParagraphPlan } from "@/lib/academy/lesson-cues";
import {
  ACADEMY_MATCH_WHISTLE_MAX,
  academyMatchWhistlePlan,
  assertAcademyMatchWhistleBudget,
} from "@/lib/academy/production-standard";
import { academyLessonIntroOffsetSec } from "@/lib/academy/lesson-intro";
import type { AcademySealedAudioPiece, AcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { normalizeRuntimeDatabaseUrl } from "@/lib/kernel/postgres-url";
import {
  ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX,
  ACADEMY_TTS_LESSON_REQUEST_MAX,
  ACADEMY_TTS_LESSON_REQUEST_MIN,
  ACADEMY_TTS_RPM_GAP_MS,
  academyLessonRequestTargetForCourse,
  academyTtsLessonRequestBudget,
  assertAcademyTtsLessonRequestBudget,
  injectAcademyTtsBreathPauses,
  packAcademyTtsLessonRequests,
  splitAcademyTtsBreathChunks,
} from "@/lib/academy/tts-breath-chunks";
import { ACADEMY_BAKE_ATEMPO, masterAcademySpeechWav } from "@/lib/academy/tts-loudnorm";
import { assertAcademySpeechQuality } from "@/lib/academy/tts-quality-gate";
import { writeAcademyTtsAbSample } from "@/lib/academy/tts-ab-sample";
import {
  ACADEMY_TTS_DSP_REV,
  academyTtsPieceCachePaths,
  academyTtsPieceFingerprint,
  academyTtsRawPieceCachePaths,
  academyTtsRawPieceFingerprint,
} from "@/lib/academy/tts-piece-cache";
import {
  academyTtsStudioFingerprintMaterial,
  buildAcademyTtsStudioContents,
} from "@/lib/academy/tts-studio-prompt";
import { transcodeAcademyWavToMp3 } from "./transcode-academy-lesson-audio";
import { academyPrepStripForSlug, isAcademyPrepStripKey } from "@/lib/academy/prep-strip";
import {
  expandAcademyTtsSkipPreventer,
  loadAcademyCueParagraphsAsSpoken,
  loadAcademySpokenScriptMarkdownParagraphs,
} from "@/lib/academy/spoken-scripts";

const SPEECH_TIMEOUT_MS = 180_000;
/** İstekler arası zorunlu bekleme — dakikada en fazla ~9 istek (RPM 10 kalkanı). */
const TURN_PAUSE_MS = ACADEMY_TTS_RPM_GAP_MS;
const RATE_LIMIT_RETRY_MS = 20_000;
const RATE_LIMIT_RETRY_CAP_MS = 180_000;
const RATE_LIMIT_RETRY_MAX = 8;
/** `per_day` metni olsa bile kısa retryDelay RPM’dir; günlük kota değil. */
const DAILY_QUOTA_RETRY_DELAY_MIN_SEC = 300;
const NETWORK_RETRY_CAP = 4;

const MIN_WAV_BYTES = 2_048;
const MIN_GEMINI_KEY_CHARS = 8;
const SPEECH_ATTEMPTS = 12;
/** Bu süreçte atılan Gemini TTS düdüğü. 1 Maç = MAX 100 Düdük. */
let matchWhistlesUsed = 0;

function takeMatchWhistle(): number {
  if (matchWhistlesUsed >= ACADEMY_MATCH_WHISTLE_MAX) {
    throw new Error(
      `1 Maç = MAX 100 Düdük. ${matchWhistlesUsed} istek kullanıldı, tavan ${ACADEMY_MATCH_WHISTLE_MAX}. Yeni API çağrısı yok.`,
    );
  }
  matchWhistlesUsed += 1;
  return matchWhistlesUsed;
}
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

/** sample-only ham döküm. Lanczos, SOLA ve FFmpeg bu dosyalara dokunmaz. */
const ACADEMY_RAW_DUMP_DIR = join(process.cwd(), "media-bake", "academy", "raw-dump");
let rawDumpLessonKey: string | null = null;
let rawDumpWritten = false;

function armAcademyRawDump(lessonKey: string, probeVoice: string | null = null): void {
  rawDumpLessonKey = probeVoice ? join(lessonKey, probeVoice) : lessonKey;
  rawDumpWritten = false;
}

function mimeDeclaredSampleRate(mimeType: string | null | undefined): number | null {
  const match = mimeType?.match(/rate=(\d+)/i);
  if (!match) {
    return null;
  }
  const rate = Number.parseInt(match[1] ?? "", 10);
  return Number.isInteger(rate) && rate > 0 ? rate : null;
}

function classifyGeminiAudioEncoding(mimeType: string | null | undefined): string {
  const mime = mimeType?.trim() ?? "";
  if (!mime) {
    return "undeclared";
  }
  if (/linear16|\bl16\b/i.test(mime)) {
    return "LINEAR16";
  }
  if (/pcm/i.test(mime)) {
    return "PCM";
  }
  if (/wav/i.test(mime)) {
    return "WAV";
  }
  return mime;
}

function probeRawPcmEcho(pcm: Buffer, sampleRate: number): {
  windowSamples: number;
  peakCorrelation: number;
  peakLagMs: number;
  highpassEnergyRatio: number;
} | null {
  const samples = Math.floor(pcm.length / 2);
  if (!(sampleRate > 0) || samples < sampleRate / 5) {
    return null;
  }
  const window = Math.min(samples, Math.round(sampleRate * 0.75));
  const offset = Math.min(Math.floor(samples * 0.15), samples - window);
  let energy = 0;
  let highEnergy = 0;
  let previous = 0;
  for (let index = 0; index < window; index += 1) {
    const sample = pcm.readInt16LE((offset + index) * 2);
    energy += sample * sample;
    const delta = sample - previous;
    highEnergy += delta * delta;
    previous = sample;
  }
  const minLag = Math.round(sampleRate * 0.015);
  const maxLag = Math.min(window - 1, Math.round(sampleRate * 0.12));
  let peak = 0;
  let peakLag = minLag;
  for (let lag = minLag; lag <= maxLag; lag += 2) {
    let acc = 0;
    const limit = window - lag;
    for (let index = 0; index < limit; index += 1) {
      acc += pcm.readInt16LE((offset + index) * 2) * pcm.readInt16LE((offset + index + lag) * 2);
    }
    const corr = energy > 0 ? acc / energy : 0;
    if (corr > peak) {
      peak = corr;
      peakLag = lag;
    }
  }
  return {
    windowSamples: window,
    peakCorrelation: Math.round(peak * 1000) / 1000,
    peakLagMs: Math.round((peakLag / sampleRate) * 1000),
    highpassEnergyRatio: energy > 0 ? Math.round((highEnergy / energy) * 1000) / 1000 : 0,
  };
}

function writeGeminiRawAudioDump(input: {
  response: GeminiSpeechResponse;
  speechConfig: {
    languageCode?: string;
    voiceConfig: { prebuiltVoiceConfig: { voiceName: string } };
  };
  model: string;
  voiceName: string;
}): void {
  if (!rawDumpLessonKey || rawDumpWritten) {
    return;
  }
  const candidateParts = input.response.candidates?.[0]?.content?.parts ?? [];
  const topParts = input.response.parts ?? [];
  const audioParts = collectGeminiInlineAudioParts([...candidateParts, ...topParts]);
  if (audioParts.length === 0) {
    return;
  }
  const payloads = audioParts.map((part) => ({
    mimeType: part.mimeType ?? null,
    sampleRateHertz: mimeDeclaredSampleRate(part.mimeType),
    encoding: classifyGeminiAudioEncoding(part.mimeType),
    bytes: decodeGeminiInlineAudio(part.data ?? ""),
  }));
  const payload = Buffer.concat(payloads.map((part) => part.bytes));
  const declaredRates = payloads
    .map((part) => part.sampleRateHertz)
    .filter((rate): rate is number => rate != null);
  const uniqueRates = [...new Set(declaredRates)];
  const isRiff = payload.length >= 12 && payload.subarray(0, 4).equals(Buffer.from("RIFF"));
  let pcm = payload;
  let wav = payload;
  let fmt: { format: number; channels: number; sampleRate: number; bits: number } | null = null;
  const trailingChunks: string[] = [];
  if (isRiff) {
    let offset = 12;
    let data: Buffer | null = null;
    while (offset + 8 <= payload.length) {
      const id = payload.toString("ascii", offset, offset + 4);
      const size = payload.readUInt32LE(offset + 4);
      const start = offset + 8;
      if (id === "fmt " && size >= 16 && start + 16 <= payload.length) {
        fmt = {
          format: payload.readUInt16LE(start),
          channels: payload.readUInt16LE(start + 2),
          sampleRate: payload.readUInt32LE(start + 4),
          bits: payload.readUInt16LE(start + 14),
        };
      } else if (id === "data") {
        const end = Math.min(payload.length, start + Math.max(0, size));
        data = payload.subarray(start, end);
      } else if (id !== "data") {
        trailingChunks.push(id.trim());
      }
      offset = start + size + (size % 2);
    }
    wav = payload;
    pcm = Buffer.from(data ?? payload);
  } else {
    const headerRate = uniqueRates[0] ?? 24_000;
    wav = Buffer.from(wrapPcmAsWav(payload, headerRate, 1, 16));
  }
  const headerRate = fmt?.sampleRate ?? uniqueRates[0] ?? null;
  const dir = join(ACADEMY_RAW_DUMP_DIR, rawDumpLessonKey);
  mkdirSync(dir, { recursive: true });
  const pcmPath = join(dir, "raw_dump.pcm");
  const wavPath = join(dir, "raw_dump.wav");
  writeFileSync(pcmPath, pcm);
  writeFileSync(wavPath, wav);
  const echo = headerRate ? probeRawPcmEcho(pcm, headerRate) : null;
  const meta = {
    lessonKey: rawDumpLessonKey,
    model: input.model,
    voiceName: input.voiceName,
    request: {
      responseModalities: ["AUDIO"],
      speechConfig: input.speechConfig,
      audioConfig: null,
      encoding: null,
      sampleRateHertz: null,
    },
    response: {
      partCount: payloads.length,
      parts: payloads.map((part) => ({
        mimeType: part.mimeType,
        encoding: part.encoding,
        sampleRateHertz: part.sampleRateHertz,
        byteLength: part.bytes.length,
      })),
      declaredSampleRates: uniqueRates,
      wavFmt: fmt,
      encodingFromFmt: fmt?.format === 1 ? "LINEAR16" : null,
      wavHeaderSampleRate: headerRate,
      trailingChunks,
      pcmBytes: pcm.length,
      wavBytes: wav.length,
      container: isRiff ? "RIFF" : "raw-pcm",
      durationSec:
        headerRate && headerRate > 0
          ? Math.round((pcm.length / 2 / headerRate) * 1000) / 1000
          : null,
      echoProbe: echo,
    },
    pipeline: {
      lanczos: false,
      ffmpeg: false,
      sola: false,
      gainDb: 0,
    },
  };
  writeFileSync(join(dir, "raw_dump.meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
  rawDumpWritten = true;
  process.stdout.write(
    `      ham döküm ${meta.response.container} mime=${payloads[0]?.mimeType ?? "yok"} fmt=${headerRate ?? "yok"} Hz ${pcm.length} bayt → ${dir}\n`,
  );
}

function allowedBakeModels(): readonly string[] {
  return [academyBakeVoiceModelId()];
}

function parseArgs(argv: readonly string[]): {
  dryRun: boolean;
  force: boolean;
  seal: boolean;
  confirmGeminiSpend: boolean;
  noDb: boolean;
  noFallback: boolean;
  sampleOnly: boolean;
  bypassCache: boolean;
  slug: AcademySealedSkuSlug | null;
  key: string | null;
  model: string | null;
  voice: string | null;
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
    noFallback: argv.includes("--no-fallback"),
    sampleOnly: argv.includes("--sample-only"),
    bypassCache: argv.includes("--bypass-cache"),
    slug,
    key,
    model: rawModel,
    voice: argv.find((part) => part.startsWith("--voice="))?.slice("--voice=".length)?.trim() || null,
  };
}

type DryRunReceipt = {
  v: 1;
  courseSlug: string;
  lessonKey: string;
  courseMasterVoice: string;
  mediaReleaseSeal: string;
};

function dryRunReceiptPath(courseSlug: string, lessonKey: string): string {
  return join(process.cwd(), "media-bake", "academy", "dry-run-receipts", courseSlug, `${lessonKey}.json`);
}

/**
 * Katman 2 — istenen ses kurs mühründen saparsa API açılmaz.
 * --sample-only --voice= probe döner: kurs mührü ve ders kasedi aynı kalır, yalnız 1. parça o sesle gider.
 */
function assertSingleCourseVoice(
  jobs: readonly AcademyMediaReleaseJob[],
  requestedVoice: string | null,
  sampleOnly: boolean,
): string | null {
  let probe: string | null = null;
  for (const job of jobs) {
    const master = academyCourseMasterVoice(job.courseSlug);
    if (requestedVoice && requestedVoice !== master) {
      if (!sampleOnly) {
        throw new Error(
          `Tek ses kilidi: istenen ses ${requestedVoice}, kurs mührü ${master} (${job.courseSlug}). API çağrısı yok.`,
        );
      }
      const canonical = canonicalizeGeminiTtsVoiceName(requestedVoice);
      if (probe && probe !== canonical) {
        throw new Error(
          `sample-only probe tek ses ister. ${probe} ve ${canonical} birlikte olmaz. API çağrısı yok.`,
        );
      }
      probe = canonical;
      process.stdout.write(
        `sample-only probe: kurs mührü ${master} kalır. 1. parça ${canonical}. Ders mührü yazılmaz.\n`,
      );
    }
    for (const turn of job.turns) {
      if (turn.voice !== master) {
        throw new Error(
          `Tek ses kilidi: tur sesi ${turn.voice}, kurs mührü ${master} (${job.courseSlug}/${job.lessonKey}). API çağrısı yok.`,
        );
      }
    }
  }
  return probe;
}

function writeDryRunReceipt(job: AcademyMediaReleaseJob): void {
  const path = dryRunReceiptPath(job.courseSlug, job.lessonKey);
  mkdirSync(dirname(path), { recursive: true });
  const body: DryRunReceipt = {
    v: 1,
    courseSlug: job.courseSlug,
    lessonKey: job.lessonKey,
    courseMasterVoice: academyCourseMasterVoice(job.courseSlug),
    mediaReleaseSeal: job.mediaReleaseSeal,
  };
  writeFileSync(path, `${JSON.stringify(body)}\n`);
}

/** Katman 2 — --seal, güncel metin/zamanlama dry-run fişi olmadan açılmaz. */
function assertDryRunApproved(job: AcademyMediaReleaseJob): void {
  const path = dryRunReceiptPath(job.courseSlug, job.lessonKey);
  if (!existsSync(path)) {
    throw new Error(
      `Mühür reddedildi: ${job.courseSlug}/${job.lessonKey} için başarılı metin/zamanlama dry-run onayı yok. Önce --dry-run. API çağrısı yok.`,
    );
  }
  let raw: DryRunReceipt;
  try {
    raw = JSON.parse(readFileSync(path, "utf8")) as DryRunReceipt;
  } catch {
    throw new Error(
      `Mühür reddedildi: ${job.courseSlug}/${job.lessonKey} dry-run fişi okunamadı. Önce --dry-run. API çağrısı yok.`,
    );
  }
  const master = academyCourseMasterVoice(job.courseSlug);
  if (raw.v !== 1 || raw.mediaReleaseSeal !== job.mediaReleaseSeal || raw.courseMasterVoice !== master) {
    throw new Error(
      `Mühür reddedildi: ${job.courseSlug}/${job.lessonKey} dry-run mührü güncel metin veya ses ile uyuşmuyor. Önce --dry-run. API çağrısı yok.`,
    );
  }
}

/** Katman 2 — mühürlü dersin yayın MP3'ü duruyorsa tekrar fırın yok. */
function assertSealedMp3Protected(job: AcademyMediaReleaseJob): void {
  const mp3Path = academyLessonAudioReleaseDiskPath(job.courseSlug, job.lessonKey);
  if (isAcademyLessonAudioSealed(job.courseSlug, job.lessonKey) && existsSync(mp3Path)) {
    throw new Error(`Mühürlü kaset korunur: ${mp3Path}. Tekrar fırın yok. API çağrısı yok.`);
  }
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
  const prose = message.match(/Please retry in (\d+)h(\d+)m(\d+(?:\.\d+)?)s/i);
  if (prose) {
    const sec = Number(prose[1]) * 3600 + Number(prose[2]) * 60 + Number(prose[3]);
    return Number.isFinite(sec) && sec > 0 ? sec : null;
  }
  const minutes = message.match(/Please retry in (\d+)m(\d+(?:\.\d+)?)s/i);
  if (minutes) {
    const sec = Number(minutes[1]) * 60 + Number(minutes[2]);
    return Number.isFinite(sec) && sec > 0 ? sec : null;
  }
  const seconds = message.match(/Please retry in (\d+(?:\.\d+)?)s/i);
  if (seconds) {
    const sec = Number(seconds[1]);
    return Number.isFinite(sec) && sec > 0 ? sec : null;
  }
  return null;
}

function isDailyModelQuotaError(error: unknown): boolean {
  const message = errorMessage(error);
  if (!/generate_requests_per_model_per_day|requests_per_day|per_day.*quota|quota.*per_day/i.test(message)) {
    return false;
  }
  const delaySec = parseRetryDelaySec(error);
  return delaySec != null && delaySec >= DAILY_QUOTA_RETRY_DELAY_MIN_SEC;
}

function isPrepayDepletedError(error: unknown): boolean {
  return /prepayment credits are depleted/i.test(errorMessage(error));
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
  const speechConfig = {
    ...(input.languageCode ? { languageCode: input.languageCode } : {}),
    voiceConfig: {
      prebuiltVoiceConfig: { voiceName: input.voiceName },
    },
  };
  const response = (await input.client.models.generateContent({
    model: input.model,
    contents: [{ role: "user", parts: [{ text: buildAcademyTtsStudioContents(input.text) }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig,
    },
  })) as GeminiSpeechResponse;
  writeGeminiRawAudioDump({
    response,
    speechConfig,
    model: input.model,
    voiceName: input.voiceName,
  });
  return wavFromSpeechResponse(response);
}

function collectJobs(
  model: string,
  slugFilter: AcademySealedSkuSlug | null,
  keyFilter: string | null,
): AcademyMediaReleaseJob[] {
  // Ders 0 hazırlık şeridi — müfredat taslağı yoktur; turlar stüdyo konuşma metninden gelir.
  if (keyFilter && isAcademyPrepStripKey(keyFilter)) {
    const slug = slugFilter ?? "01_office_ai";
    const strip = academyPrepStripForSlug(slug);
    if (!strip || strip.key !== keyFilter.trim()) {
      throw new Error(`Hazırlık şeridi yok: ${slug}/${keyFilter}`);
    }
    const job = academyMediaReleaseJobForPrepStrip(
      slug as AcademySealedSkuSlug,
      strip.key,
      strip.title,
      model,
    );
    if (job.turns.length === 0) {
      throw new Error(`DialogueTurn[] boş: ${slug}/${strip.key}`);
    }
    return [job];
  }
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
      const rebake = isAcademyLessonAudioOnRebakeQueue(slug, lesson.key);
      if (!keyFilter && !sealed && !rebake) {
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
      takeMatchWhistle();
      const wav = await requestSpeechWav({
        client: input.client,
        model,
        text: input.text,
        voiceName,
        languageCode,
      });
      return wav;
    } catch (error) {
      const message = errorMessage(error);
      if (message.includes("1 Maç = MAX 100 Düdük")) {
        throw error;
      }
      if (isPrepayDepletedError(error)) {
        throw new Error(
          `Gemini ön ödeme kredisi bitti. Düdük tekrarlanmaz. Kredi açılınca aynı modelle yeniden fırınlanır. ${message}`,
        );
      }
      if (isDailyModelQuotaError(error)) {
        throw error;
      }
      if (isRateLimitError(error)) {
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
      await sleep(TURN_PAUSE_MS);
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
    if (isDailyModelQuotaError(error) || isRateLimitError(error)) {
      throw error;
    }
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
  const fromCues = loadAcademyCueParagraphsAsSpoken(lessonKey);
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
  const atoms: BreathBakeChunk[] = [];
  for (let turnIndex = 0; turnIndex < job.turns.length; turnIndex += 1) {
    const turn = job.turns[turnIndex]!;
    const planned = plan[turnIndex]!;
    const piecesInTurn = splitAcademyTtsBreathChunks(turn.spokenText);
    if (piecesInTurn.length === 0) {
      throw new Error(`Boş tur: ${job.lessonKey} #${turnIndex}`);
    }
    for (let chunkIndex = 0; chunkIndex < piecesInTurn.length; chunkIndex += 1) {
      atoms.push({
        turnIndex,
        chunkIndex,
        text: piecesInTurn[chunkIndex]!,
        voiceName: turn.voice,
        cueId: planned.cueId,
        cueParagraphIndex: planned.cueParagraphIndex,
      });
    }
  }
  const sealedCount = academyMediaSealedLessonKeys(job.courseSlug).length;
  const packTarget =
    sealedCount > 0 ? academyLessonRequestTargetForCourse(sealedCount) : ACADEMY_TTS_LESSON_REQUEST_MAX;
  const requests = packAcademyTtsLessonRequests(
    atoms.map((atom) => atom.text),
    packTarget,
  );
  return requests.map((request, requestIndex) => {
    const first = atoms[request.atomIndexes[0]!]!;
    return {
      turnIndex: first.turnIndex,
      chunkIndex: requestIndex,
      text: expandAcademyTtsSkipPreventer(request.text),
      voiceName: first.voiceName,
      cueId: first.cueId,
      cueParagraphIndex: first.cueParagraphIndex,
    };
  });
}

async function loadOrSynthesizePiece(input: {
  client: GoogleGenAI;
  job: AcademyMediaReleaseJob;
  model: string;
  index: number;
  voiceName: string;
  text: string;
  bypassCache?: boolean;
}): Promise<{ wav: Buffer; wavPath: string; mp3Path: string; fromCache: boolean }> {
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
    speechRate: ACADEMY_INSTRUCTOR_SPEECH_RATE,
    text: spokenText,
    acoustic,
    dspRev: ACADEMY_TTS_DSP_REV,
  });
  const rawPaths = academyTtsRawPieceCachePaths({
    courseSlug: input.job.courseSlug,
    lessonKey: input.job.lessonKey,
    index: input.index,
    fingerprint: rawFingerprint,
  });
  const paths = academyTtsPieceCachePaths({
    courseSlug: input.job.courseSlug,
    lessonKey: input.job.lessonKey,
    index: input.index,
    fingerprint,
  });
  if (!input.bypassCache && existsSync(paths.wav) && statSync(paths.wav).size >= MIN_WAV_BYTES) {
    const cached = readFileSync(paths.wav);
    if (pcmWavDurationSec(cached) > 0) {
      if (!existsSync(paths.mp3)) {
        transcodeAcademyWavToMp3(paths.wav, paths.mp3);
      }
      process.stdout.write(`      önbellek ${input.index + 1} API yok → ${paths.wav}\n`);
      return { wav: cached, wavPath: paths.wav, mp3Path: paths.mp3, fromCache: true };
    }
  }
  let spokenWav: Buffer;
  let fromRawCache = false;
  if (!input.bypassCache && existsSync(rawPaths.wav) && statSync(rawPaths.wav).size >= MIN_WAV_BYTES) {
    spokenWav = readFileSync(rawPaths.wav);
    fromRawCache = true;
    process.stdout.write(`      ham önbellek ${input.index + 1} API yok → ${rawPaths.wav}\n`);
  } else {
    spokenWav = await synthesizeSeamlessScript({
      client: input.client,
      text: spokenText,
      voiceName: input.voiceName,
      model: input.model,
    });
    mkdirSync(rawPaths.dir, { recursive: true });
    writeFileSync(rawPaths.wav, spokenWav);
    process.stdout.write(`      ham Gemini yazıldı → ${rawPaths.wav}\n`);
  }
  const chunkWav = masterAcademySpeechWav(spokenWav, { atempo: true });
  mkdirSync(paths.dir, { recursive: true });
  writeFileSync(paths.wav, chunkWav);
  transcodeAcademyWavToMp3(paths.wav, paths.mp3);
  process.stdout.write(`      parça yazıldı WAV+MP3 → ${paths.wav}\n`);
  return { wav: chunkWav, wavPath: paths.wav, mp3Path: paths.mp3, fromCache: fromRawCache };
}

async function bakeLessonWav(
  client: GoogleGenAI,
  job: AcademyMediaReleaseJob,
  model: string,
  sampleOnly = false,
  voiceProbe: string | null = null,
  bypassCache = false,
): Promise<{
  wav: Buffer;
  pieces: AcademySealedAudioPiece[];
  pauseSec: number;
  visualLeadByPiece: ReadonlyMap<number, number>;
  sampleOnly: boolean;
  samplePath: string | null;
}> {
  assertSpokenScriptMatchesCues(job.lessonKey);
  if (sampleOnly) {
    armAcademyRawDump(job.lessonKey, voiceProbe);
  }
  const breathChunks = collectBreathChunks(job);
  const speechSec = breathChunks.reduce(
    (sum, chunk) => sum + academyDialogueReadingDurationSec(chunk.text, "egitmen"),
    0,
  );
  assertAcademyTtsLessonRequestBudget(
    breathChunks.length,
    isAcademyLessonAudioSealed(job.courseSlug, job.lessonKey),
    speechSec,
  );
  const pauseSec = ACADEMY_TTS_PARAGRAPH_PAUSE_SEC;
  const parts: Buffer[] = [];
  const pieces: AcademySealedAudioPiece[] = [];
  const visualLeadByPiece = new Map<number, number>();
  const introSec = academyLessonIntroOffsetSec(job.lessonKey);
  let cursorSec = introSec;
  if (introSec > 0) {
    parts.push(createSilentPcmWav(Math.round(introSec * 1000), PCM_WAV_PLAYBACK_SAMPLE_RATE));
    process.stdout.write(`    giriş jeneriği ${introSec.toFixed(1)}s sessizlik (konuşma ${introSec.toFixed(1)}s'de)\n`);
  }
  process.stdout.write(
    `    ${breathChunks.length} nefes dilimi atempo=${ACADEMY_BAKE_ATEMPO} WSOLA + loudnorm I=-16 / ${PCM_WAV_PLAYBACK_SAMPLE_RATE / 1000} kHz  nefes=${pauseSec}s\n`,
  );
  for (let index = 0; index < breathChunks.length; index += 1) {
    const chunk = breathChunks[index]!;
    const previous = index > 0 ? breathChunks[index - 1]! : null;
    if (previous) {
      const gap = academyBakeChunkGap({
        prevCueId: previous.cueId,
        nextCueId: chunk.cueId,
        prevParagraphIndex: previous.cueParagraphIndex,
        nextParagraphIndex: chunk.cueParagraphIndex,
        breathPauseSec: pauseSec,
      });
      if (gap.visualLeadSec > 0) {
        visualLeadByPiece.set(index, gap.visualLeadSec);
      }
      parts.push(createSilentPcmWav(Math.round(gap.pauseSec * 1000), PCM_WAV_PLAYBACK_SAMPLE_RATE));
      cursorSec += gap.pauseSec;
      process.stdout.write(
        `      es ${gap.pauseSec.toFixed(1)}s${gap.visualLeadSec > 0 ? ` görsel ${gap.visualLeadSec.toFixed(1)}s önden` : ""}\n`,
      );
    }
    process.stdout.write(
      `      ${index + 1}/${breathChunks.length} cue=${chunk.cueId} p${chunk.cueParagraphIndex}.${chunk.chunkIndex} ${chunk.text.length} karakter ${academyDialogueReadingDurationSec(chunk.text, "egitmen").toFixed(1)}s\n`,
    );
    const piece = await loadOrSynthesizePiece({
      client,
      job,
      model,
      index,
      voiceName: voiceProbe ?? chunk.voiceName,
      text: chunk.text,
      bypassCache: sampleOnly || bypassCache,
    });
    const chunkWav = piece.wav;
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
    const pieceQuality = assertAcademySpeechQuality(chunkWav);
    process.stdout.write(
      `      kalite kapısı parça ${index + 1}: 300 Hz–1 kHz %${(pieceQuality.bandShare * 100).toFixed(1)} LUFS ${pieceQuality.integratedLufs.toFixed(1)}\n`,
    );
    if (sampleOnly) {
      const quality = pieceQuality;
      process.stdout.write(
        `sample-only: 1. parça hazır${piece.fromCache ? " (önbellek, API yok)" : " (1 düdük)"}. Ders mührü yazılmadı. 300 Hz–1 kHz %${(quality.bandShare * 100).toFixed(1)} LUFS ${quality.integratedLufs.toFixed(1)}. Ham döküm: ${join(ACADEMY_RAW_DUMP_DIR, job.lessonKey)}\n`,
      );
      return {
        wav: chunkWav,
        pieces,
        pauseSec,
        visualLeadByPiece,
        sampleOnly: true,
        samplePath: piece.wavPath,
      };
    }
    if (index < breathChunks.length - 1 && !piece.fromCache) {
      await sleep(TURN_PAUSE_MS);
    }
  }
  const merged = concatPcmWavBuffers(parts);
  const wav = masterAcademySpeechWav(merged, { atempo: false });
  const quality = assertAcademySpeechQuality(wav);
  process.stdout.write(
    `    kalite kapısı geçti: 300 Hz–1 kHz %${(quality.bandShare * 100).toFixed(1)} LUFS ${quality.integratedLufs.toFixed(1)}\n`,
  );
  return { wav, pieces, pauseSec, visualLeadByPiece, sampleOnly: false, samplePath: null };
}

/** Bake parça saatlerini dondurur — oynatıcı currentTime ile nefes dilimini 1:1 kilitler. */
function writeSealedAudioTimings(input: {
  job: AcademyMediaReleaseJob;
  wav: Buffer;
  pieces: readonly AcademySealedAudioPiece[];
  pauseSec: number;
  visualLeadByPiece?: ReadonlyMap<number, number>;
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
  overlaySealedCueTimes(input.job, timings, input.visualLeadByPiece);
  return relativePath;
}

/** Türetilmiş kopya adı örneği `01_office_ai_01_cue.json`. SSOT değildir. Konuşma kaynağı spoken-scripts; saat kilidi lib/academy/lesson-cues. */
function academyDocsCurriculumCueFileName(lessonKey: string): string | null {
  const numeric = /^01_office_ai-(\d+)$/u.exec(lessonKey.trim());
  if (numeric) {
    return `01_office_ai_${numeric[1]!.padStart(2, "0")}_cue.json`;
  }
  const letter = /^01_office_ai-([gwk]\d+)$/u.exec(lessonKey.trim());
  if (letter) {
    return `01_office_ai_${letter[1]}_cue.json`;
  }
  return null;
}

/** Cue start/end bake parça saatine kilitlenir. Saat kilidi `lib/academy/lesson-cues`. docs/curriculum kopyası SSOT değildir. */
function overlaySealedCueTimes(
  job: AcademyMediaReleaseJob,
  timings: AcademySealedAudioTimings,
  visualLeadByPiece?: ReadonlyMap<number, number>,
): void {
  const cueRelative = join("lib", "academy", "lesson-cues", `${job.lessonKey}.json`);
  const cuePath = join(process.cwd(), cueRelative);
  if (!existsSync(cuePath)) {
    return;
  }
  const parsed: unknown = JSON.parse(readFileSync(cuePath, "utf8"));
  if (!Array.isArray(parsed)) {
    return;
  }
  const cues = parsed as Array<Record<string, unknown>>;
  for (const cue of cues) {
    const group = timings.pieces.filter((piece) => piece.cueId === cue.id);
    if (group.length === 0) {
      continue;
    }
    const lead = visualLeadByPiece?.get(group[0]!.index) ?? 0;
    cue.start = round3Sec(Math.max(0, group[0]!.start - lead));
    cue.end = group[group.length - 1]!.end;
  }
  writeFileSync(cuePath, `${JSON.stringify(cues, null, 2)}\n`);
  process.stdout.write(`  cue saatleri mühürlendi → ${cueRelative}\n`);
  const docsCueName = academyDocsCurriculumCueFileName(job.lessonKey);
  if (!docsCueName) {
    return;
  }
  const docsRelative = join("docs", "curriculum", docsCueName);
  const docsPath = join(process.cwd(), docsRelative);
  mkdirSync(dirname(docsPath), { recursive: true });
  writeFileSync(
    docsPath,
    `${JSON.stringify(
      {
        derived: true,
        role: "generated-copy",
        speechSource: `lib/academy/spoken-scripts/${job.lessonKey}.md`,
        clockSource: `lib/academy/lesson-cues/${job.lessonKey}.json`,
        lessonKey: job.lessonKey,
        model: academyBakeVoiceModelId(),
        voice: academyCourseMasterVoice(job.courseSlug),
        durationSec: timings.durationSec,
        seal: job.mediaReleaseSeal.slice(0, 12),
        cues,
        pieces: timings.pieces,
      },
      null,
      2,
    )}\n`,
  );
  process.stdout.write(`  curriculum türetilmiş kopya → ${docsRelative}\n`);
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
  const explicitDryRun = process.argv.includes("--dry-run");
  if (args.sampleOnly && !args.seal && !explicitDryRun) {
    const lessonKey = args.key ?? "01_office_ai_ileri-1";
    const sample = writeAcademyTtsAbSample({ lessonKey });
    process.stdout.write(
      `sample-only yerel A/B (API yok): ${sample.lessonKey}\n  ham ${sample.rawPath}\n  işlenmiş ${sample.processedPath}\n  300 Hz–1 kHz %${(sample.quality.bandShare * 100).toFixed(1)} LUFS ${sample.quality.integratedLufs.toFixed(1)}\n`,
    );
    return;
  }
  let model = args.model ?? academyBakeVoiceModelId();
  assertAcademySealedMediaModel("VOICE_TTS", model);
  const jobs = collectJobs(model, args.slug, args.key);
  const voiceProbe = assertSingleCourseVoice(jobs, args.voice, args.sampleOnly);
  const turnCount = jobs.reduce((sum, job) => sum + job.turns.length, 0);
  const forceBake = args.force;
  if (forceBake && !args.bypassCache) {
    process.stdout.write("--force mühürlü MP3'ün üzerine yazmaz. Korunan kaset Error ile durur.\n");
  }
  if (args.bypassCache) {
    process.stdout.write(
      "--bypass-cache parça ve ham önbelleği yok sayar. Mühürlü yayın MP3'ünün üzerine yazar.\n",
    );
  }
  process.stdout.write(
    `academy-audio bake — ${jobs.length} ders, ${turnCount} tur, model=${model}${args.dryRun ? " (dry-run)" : ""}${args.sampleOnly ? " (sample-only)" : ""}\n`,
  );
  if (args.dryRun) {
    const byCourse = new Map<string, number>();
    for (const job of jobs) {
      assertSpokenScriptMatchesCues(job.lessonKey);
      const breathChunks = collectBreathChunks(job);
      byCourse.set(job.courseSlug, (byCourse.get(job.courseSlug) ?? 0) + breathChunks.length);
      const sealed = isAcademyLessonAudioSealed(job.courseSlug, job.lessonKey);
      assertAcademyTtsLessonRequestBudget(breathChunks.length, sealed);
      writeDryRunReceipt(job);
      const budget = academyTtsLessonRequestBudget(breathChunks.length);
      const rpmGapSec = TURN_PAUSE_MS / 1000;
      const minWallSec = breathChunks.length > 1 ? (breathChunks.length - 1) * rpmGapSec : 0;
      const queued = isAcademyLessonAudioOnRebakeQueue(job.courseSlug, job.lessonKey) && !sealed;
      const band = budget.inTargetBand
        ? `bant ${ACADEMY_TTS_LESSON_REQUEST_MIN}–${ACADEMY_TTS_LESSON_REQUEST_MAX}`
        : `hedef ${ACADEMY_TTS_LESSON_REQUEST_MIN}–${ACADEMY_TTS_LESSON_REQUEST_MAX} tavan ${ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX}`;
      process.stdout.write(
        `  ${job.courseSlug}/${job.lessonKey}  ${job.turns.length} paragraf  ${breathChunks.length} istek (${band})  skip-preventer  RPM kalkanı=${rpmGapSec}s  min.ara=${minWallSec.toFixed(0)}s  ${job.turns[0]?.voice ?? "?"}  ${queued ? "KUYRUK" : "MÜHÜR"}  seal=${job.mediaReleaseSeal.slice(0, 12)}  → ${job.publicPath}\n`,
      );
      breathChunks.forEach((chunk, index) => {
        const spokenText = injectAcademyTtsBreathPauses(chunk.text);
        const fingerprint = academyTtsPieceFingerprint({
          model,
          voice: chunk.voiceName,
          speechRate: ACADEMY_INSTRUCTOR_SPEECH_RATE,
          text: spokenText,
          acoustic: academyTtsStudioFingerprintMaterial(spokenText),
          dspRev: ACADEMY_TTS_DSP_REV,
        });
        const paths = academyTtsPieceCachePaths({
          courseSlug: job.courseSlug,
          lessonKey: job.lessonKey,
          index,
          fingerprint,
        });
        const hit = existsSync(paths.wav);
        process.stdout.write(
          `    parça ${index + 1} ${hit ? "önbellek" : "yok"} → ${paths.wav}\n`,
        );
      });
    }
    for (const [slug, count] of byCourse) {
      assertAcademyMatchWhistleBudget(count);
      const matchPlan = academyMatchWhistlePlan(count);
      const bandLabel = matchPlan.inRegulationBand ? "normal süre" : "yedek payına taşabilir";
      process.stdout.write(
        `1 Maç = MAX 100 Düdük: ${slug} plan ${matchPlan.requests} istek (${bandLabel}), ham pay ${matchPlan.reserveRemaining}, uzatma ${matchPlan.extensionReserve}, tavan ${ACADEMY_MATCH_WHISTLE_MAX}.\n`,
      );
    }
    if (args.sampleOnly) {
      process.stdout.write(
        "sample-only: canlıda ders başına yalnız 1. parça gider (1 düdük). Bu taramada API yok.\n",
      );
    }
    process.stdout.write(
      "Bake öncesi kapı: --dry-run taraması tamam. Harici API yok. İnsan --seal ve --confirm-gemini-spend olmadan çağrı açılmaz.\nKeşif bitti.\n",
    );
    return;
  }
  if (!args.seal || !args.confirmGeminiSpend) {
    process.stderr.write(
      "academy-audio bake için --dry-run taraması, --seal ve --confirm-gemini-spend gerekir (Pedagoji E.4 / E.5).\n",
    );
    process.exit(1);
  }
  const plannedByCourse = new Map<string, number>();
  for (const job of jobs) {
    assertDryRunApproved(job);
    if (!args.sampleOnly && !args.bypassCache) {
      assertSealedMp3Protected(job);
    }
    plannedByCourse.set(
      job.courseSlug,
      (plannedByCourse.get(job.courseSlug) ?? 0) + collectBreathChunks(job).length,
    );
  }
  for (const [slug, count] of plannedByCourse) {
    assertAcademyMatchWhistleBudget(count);
    const matchPlan = academyMatchWhistlePlan(count);
    process.stdout.write(
      `1 Maç = MAX 100 Düdük: ${slug} plan ${matchPlan.requests} istek, ham pay ${matchPlan.reserveRemaining}, uzatma ${matchPlan.extensionReserve}, tavan ${ACADEMY_MATCH_WHISTLE_MAX}.\n`,
    );
  }
  const apiKey = sanitizeGeminiApiKey(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY yok.");
  }
  const client = createBakeClient(apiKey);
  for (const job of jobs) {
    const diskPath = academyLessonAudioDiskPath(job.courseSlug, job.lessonKey);
    const mp3Path = academyLessonAudioReleaseDiskPath(job.courseSlug, job.lessonKey);
    const rebake = isAcademyLessonAudioOnRebakeQueue(job.courseSlug, job.lessonKey);
    if (existsSync(diskPath) && !forceBake && !rebake) {
      const bytes = statSync(diskPath).size;
      process.stdout.write(`  atlandı (WAV var, ${bytes} bayt): ${diskPath}\n`);
      if (!existsSync(mp3Path) || statSync(mp3Path).mtimeMs < statSync(diskPath).mtimeMs) {
        transcodeAcademyWavToMp3(diskPath, mp3Path);
        process.stdout.write(`  yayın MP3 yazıldı → ${mp3Path}\n`);
      }
      continue;
    }
    let activeModel = model;
    let activeJob = job;
    let baked: {
      wav: Buffer;
      pieces: AcademySealedAudioPiece[];
      pauseSec: number;
      visualLeadByPiece: ReadonlyMap<number, number>;
      sampleOnly: boolean;
      samplePath: string | null;
    };
    try {
      baked = await bakeLessonWav(
        client,
        activeJob,
        activeModel,
        args.sampleOnly,
        voiceProbe,
        args.bypassCache,
      );
    } catch (error) {
      if (isDailyModelQuotaError(error)) {
        throw new Error(
          `${activeModel} kotası doldu. Alt modele düşülmez. Kota açılınca aynı modelle yeniden fırınlanır. ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      throw error;
    }
    if (baked.sampleOnly) {
      process.stdout.write(`  sample-only durdu → ${baked.samplePath}\n`);
      continue;
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
    transcodeAcademyWavToMp3(diskPath, mp3Path);
    process.stdout.write(`  yayın MP3 yazıldı → ${mp3Path}\n`);
    const timingsPath = writeSealedAudioTimings({
      job: activeJob,
      wav,
      pieces: baked.pieces,
      pauseSec: baked.pauseSec,
      visualLeadByPiece: baked.visualLeadByPiece,
    });
    process.stdout.write(
      `  timings ${baked.pieces.length} nefes dilimi 1:1 kilit → ${timingsPath}\n`,
    );
    if (!args.noDb) {
      await stampMediaReleaseSeal(activeJob, wav, activeModel);
    }
  }
  process.stdout.write(
    `1 Maç = MAX 100 Düdük: kullanılan ${matchWhistlesUsed} istek, tavan ${ACADEMY_MATCH_WHISTLE_MAX}.\n`,
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`academy-audio bake FAIL — ${message}\n`);
  process.exit(1);
});
