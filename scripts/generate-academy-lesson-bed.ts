#!/usr/bin/env tsx
/**
 * Lyria 3.5 dip müzik bake — müfredat dersi, `--slug` ve `--key`.
 * İnsan --seal ve --confirm-gemini-spend olmadan harici çağrı yok.
 *   npx tsx scripts/generate-academy-lesson-bed.ts --dry-run --slug=01_office_ai_ileri --key=01_office_ai_ileri-1
 *   npx tsx scripts/generate-academy-lesson-bed.ts --seal --confirm-gemini-spend --slug=01_office_ai_ileri --key=01_office_ai_ileri-1
 */
import "./load-academy-bake-env";

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { BOT104_LESSON_KEYS } from "@/lib/academy/curricula/bot-104/spoken-body";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { PR105_LESSON_KEYS } from "@/lib/academy/curricula/pr-105/spoken-body";
import { SM103_LESSON_KEYS } from "@/lib/academy/curricula/sm-103/spoken-body";
import {
  academyEc102BedKind,
  academyLessonBedPromptForLesson,
  academyStage4bBedTheme,
} from "@/lib/academy/lesson-bed-duck";
import { academyLessonBedDiskPath } from "@/lib/academy/media-release-seal";
import {
  ACADEMY_SEALED_MEDIA_MODEL,
  assertAcademySealedMediaModel,
  isGeminiModelUnavailableError,
} from "@/lib/kernel/ai/model-roles";

const require = createRequire(import.meta.url);
const MIN_GEMINI_KEY_CHARS = 8;
const LYRIA_MODEL = ACADEMY_SEALED_MEDIA_MODEL.MUSIC_GEN;

/** Canlı sınav yolu boşken Aşama 4-B fırını bu anahtarları okur. Sınav yolu açılmaz. */
const STAGE0_BED_KEYS_BY_SLUG: Readonly<Record<string, readonly string[]>> = {
  "05_prompt_practice": PR105_LESSON_KEYS,
  "03_social_media_ai": SM103_LESSON_KEYS,
  "04_chatbot_nocode": BOT104_LESSON_KEYS,
};

type GeminiPart = {
  text?: string;
  inlineData?: { data?: string; mimeType?: string | null };
  inline_data?: { data?: string; mimeType?: string | null; mime_type?: string | null };
};

type GeminiResponse = {
  text?: string;
  candidates?: Array<{
    content?: { parts?: Array<GeminiPart | null> } | null;
  } | null>;
};

type InteractionAudio = {
  data?: string;
  mimeType?: string;
};

type InteractionContentBlock = {
  type?: string;
  data?: string;
  text?: string;
};

type InteractionResponse = {
  output_audio?: InteractionAudio;
  outputAudio?: InteractionAudio;
  outputs?: Array<{ inlineData?: { data?: string; mimeType?: string | null } } | null>;
  steps?: Array<{
    type?: string;
    content?: Array<InteractionContentBlock | null> | null;
  } | null> | null;
};

function parseArgs(argv: readonly string[]): {
  dryRun: boolean;
  seal: boolean;
  confirmGeminiSpend: boolean;
  slug: string | null;
  key: string | null;
} {
  return {
    dryRun: argv.includes("--dry-run") || argv.includes("--sample-only"),
    seal: argv.includes("--seal"),
    confirmGeminiSpend: argv.includes("--confirm-gemini-spend"),
    slug: argv.find((part) => part.startsWith("--slug="))?.slice("--slug=".length)?.trim() || null,
    key: argv.find((part) => part.startsWith("--key="))?.slice("--key=".length)?.trim() || null,
  };
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

function collectInlineAudio(response: GeminiResponse): Buffer | null {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part?.inlineData ?? part?.inline_data;
    const data = inline?.data?.trim();
    if (!data) {
      continue;
    }
    return Buffer.from(data, "base64");
  }
  return null;
}

function collectInteractionAudio(response: InteractionResponse): Buffer | null {
  const direct = response.output_audio ?? response.outputAudio;
  if (direct?.data) {
    return Buffer.from(direct.data, "base64");
  }
  for (const output of response.outputs ?? []) {
    const data = output?.inlineData?.data;
    if (data) {
      return Buffer.from(data, "base64");
    }
  }
  for (const step of response.steps ?? []) {
    if (step?.type && step.type !== "model_output") {
      continue;
    }
    for (const block of step?.content ?? []) {
      if (block?.type === "audio" && block.data) {
        return Buffer.from(block.data, "base64");
      }
    }
  }
  return null;
}

function isAudioPayload(bytes: Buffer): boolean {
  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return true;
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0) {
    return true;
  }
  return bytes.length >= 4 && bytes.toString("ascii", 0, 4) === "RIFF";
}

async function bakeLyriaBed(client: GoogleGenAI, prompt: string): Promise<Buffer> {
  assertAcademySealedMediaModel("MUSIC_GEN", LYRIA_MODEL);
  const interactions = client as GoogleGenAI & {
    interactions?: {
      create: (input: { model: string; input: string }) => Promise<InteractionResponse>;
    };
  };
  if (typeof interactions.interactions?.create === "function") {
    try {
      const interaction = await interactions.interactions.create({
        model: LYRIA_MODEL,
        input: prompt,
      });
      const fromInteraction = collectInteractionAudio(interaction);
      if (fromInteraction && fromInteraction.byteLength > 2048 && isAudioPayload(fromInteraction)) {
        return fromInteraction;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (isGeminiModelUnavailableError(error)) {
        throw new Error(
          `Müzik mühürü fail-closed. ${LYRIA_MODEL} API'de yok. lyria-3 ve alt modele geçilmez. ${message}`,
        );
      }
      process.stderr.write(
        `Lyria interactions ${LYRIA_MODEL} durdu; aynı model generateContent ile sürer. Alt model yok. ${message}\n`,
      );
    }
  }
  const response = (await client.models.generateContent({
    model: LYRIA_MODEL,
    contents: prompt,
  })) as GeminiResponse & {
    promptFeedback?: { blockReason?: string; blockReasonMessage?: string };
  };
  const fromContent = collectInlineAudio(response);
  if (fromContent && fromContent.byteLength > 2048 && isAudioPayload(fromContent)) {
    return fromContent;
  }
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const summary = parts
    .map((part) => {
      const mime = part?.inlineData?.mimeType ?? part?.inline_data?.mimeType ?? part?.inline_data?.mime_type ?? "";
      const text = part?.text?.replace(/\s+/g, " ").trim().slice(0, 180) ?? "";
      return [mime, text].filter(Boolean).join(":");
    })
    .filter(Boolean)
    .join(" | ");
  const feedback = response.promptFeedback;
  const block = [feedback?.blockReason, feedback?.blockReasonMessage].filter(Boolean).join(" ");
  throw new Error(
    `Lyria 3.5 boş dip müzik döndü.${block ? ` block=${block}` : ""}${summary ? ` parts=${summary}` : " parts=yok"}`,
  );
}

function bedLessonKeys(slug: string): readonly string[] {
  const live = curriculumLessonKeysForSlug(slug);
  if (live.length > 0) {
    return live;
  }
  return STAGE0_BED_KEYS_BY_SLUG[slug] ?? [];
}

function requireCurriculumLesson(slug: string, key: string): void {
  if (!/^[a-z0-9][a-z0-9_-]{0,80}$/.test(slug) || !/^[a-z0-9][a-z0-9_-]{0,80}$/.test(key)) {
    throw new Error("Lyria bed slug ve key yalnız küçük harf, rakam, alt çizgi ve tire kabul eder.");
  }
  const keys = bedLessonKeys(slug);
  if (!keys.includes(key)) {
    throw new Error(`Lyria bed müfredat dışı: ${slug}/${key}.`);
  }
}

function ffmpegBinary(): string {
  const ffmpegPath = require("ffmpeg-static") as string | null;
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static ikili yok.");
  }
  return ffmpegPath;
}

/** Lyria çıktısını 44.1 kHz stereo MP3 olarak mühürler. Duck kazancı oynatıcıdadır. */
function sealStereoBed(raw: Buffer, diskPath: string): void {
  mkdirSync(dirname(diskPath), { recursive: true });
  const rawPath = `${diskPath}.lyria-raw`;
  writeFileSync(rawPath, raw);
  try {
    const result = spawnSync(
      ffmpegBinary(),
      [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        rawPath,
        "-ar",
        "44100",
        "-ac",
        "2",
        "-c:a",
        "libmp3lame",
        "-b:a",
        "192k",
        diskPath,
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    if (result.status !== 0) {
      const stderr = result.stderr?.toString("utf8").trim() ?? "";
      throw new Error(`bed mp3 mühür FAIL: ${stderr.slice(-400) || `exit ${result.status}`}`);
    }
  } finally {
    unlinkSync(rawPath);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const slug = args.slug ?? "";
  const key = args.key ?? "";
  if (!slug || !key) {
    throw new Error("Lyria bed --slug ve --key ister.");
  }
  requireCurriculumLesson(slug, key);
  const prompt = academyLessonBedPromptForLesson(key);
  const bedKind = academyEc102BedKind(key);
  const stage4b = academyStage4bBedTheme(key);
  const diskPath = academyLessonBedDiskPath(slug, key);
  if (args.dryRun || !args.seal || !args.confirmGeminiSpend) {
    process.stdout.write(
      `academy-bed bake — ${slug}/${key} model=${LYRIA_MODEL}${bedKind ? ` yatak=${bedKind}` : ""}${stage4b ? ` tema=${stage4b} duck=-22dB` : ""}${args.dryRun || !args.seal ? " (dry-run)" : ""}\n  → ${diskPath}\n`,
    );
    if (!args.seal || !args.confirmGeminiSpend) {
      process.stdout.write(
        "Bake öncesi kapı: --seal ve --confirm-gemini-spend olmadan Lyria çağrısı açılmaz.\n",
      );
      if (!args.dryRun) {
        process.exit(1);
      }
    }
    return;
  }
  const apiKey = sanitizeGeminiApiKey(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY yok.");
  }
  const client = new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 300_000,
      retryOptions: { attempts: 1, httpStatusCodes: [] as number[] },
    },
  });
  process.stdout.write(`Lyria ${LYRIA_MODEL} dip müzik ${slug}/${key}\n`);
  const mp3 = await bakeLyriaBed(client, prompt);
  sealStereoBed(mp3, diskPath);
  process.stdout.write(`yazıldı 44.1 kHz stereo → ${join("public", "media", "academy", "audio", slug, `${key}.bed.mp3`)}\n`);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`academy-bed bake FAIL — ${message}\n`);
  process.exit(1);
});
