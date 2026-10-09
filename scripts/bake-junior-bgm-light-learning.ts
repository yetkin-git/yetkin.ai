#!/usr/bin/env tsx
/**
 * Junior odak yatağı — ACADEMY_SEALED_MEDIA_MODEL.MUSIC_GEN.
 * Vokalsiz, 44.1 kHz stereo. Sinüs üreticisi yoktur.
 * Harcama: --seal ve --confirm-gemini-spend olmadan Lyria çağrısı açılmaz.
 *
 *   npx tsx scripts/bake-junior-bgm-light-learning.ts --dry-run
 *   npx tsx scripts/bake-junior-bgm-light-learning.ts --seal --confirm-gemini-spend
 */
import "./load-academy-bake-env";

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import {
  JUNIOR_BED_CHANNELS,
  JUNIOR_BED_LAYER,
  JUNIOR_BED_PROMPT,
  JUNIOR_BED_SAMPLE_RATE_HZ,
  JUNIOR_BGM_PUBLIC_PATH,
} from "@/lib/junior/voice";
import {
  ACADEMY_SEALED_MEDIA_MODEL,
  assertAcademySealedMediaModel,
  isGeminiModelUnavailableError,
} from "@/lib/kernel/ai/model-roles";

const require = createRequire(import.meta.url);
const MIN_GEMINI_KEY_CHARS = 8;
const LYRIA_MODEL = ACADEMY_SEALED_MEDIA_MODEL.MUSIC_GEN;
const out = join(process.cwd(), "public", JUNIOR_BGM_PUBLIC_PATH.replace(/^\//, ""));

type GeminiPart = {
  text?: string;
  inlineData?: { data?: string; mimeType?: string | null };
  inline_data?: { data?: string; mimeType?: string | null; mime_type?: string | null };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<GeminiPart | null> } | null;
  } | null>;
};

type InteractionAudio = { data?: string };
type InteractionContentBlock = { type?: string; data?: string };
type InteractionResponse = {
  output_audio?: InteractionAudio;
  outputAudio?: InteractionAudio;
  outputs?: Array<{ inlineData?: { data?: string } } | null>;
  steps?: Array<{
    type?: string;
    content?: Array<InteractionContentBlock | null> | null;
  } | null> | null;
};

function sanitizeGeminiApiKey(raw: string | undefined | null): string | null {
  if (raw == null) {
    return null;
  }
  let value = raw.replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
  const quote = value[0];
  if ((quote === '"' || quote === "'" || quote === "`") && value.length >= 2 && value.endsWith(quote)) {
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

async function bakeLyriaBed(client: GoogleGenAI): Promise<Buffer> {
  assertAcademySealedMediaModel("MUSIC_GEN", LYRIA_MODEL);
  if (LYRIA_MODEL !== JUNIOR_BED_LAYER.model || JUNIOR_BED_LAYER.vocal !== false) {
    throw new Error("Junior yatak katmanı MUSIC_GEN ve vokalsiz sözleşmeden koptu.");
  }
  const interactions = client as GoogleGenAI & {
    interactions?: { create: (input: { model: string; input: string }) => Promise<InteractionResponse> };
  };
  if (typeof interactions.interactions?.create === "function") {
    try {
      const interaction = await interactions.interactions.create({
        model: LYRIA_MODEL,
        input: JUNIOR_BED_PROMPT,
      });
      const fromInteraction = collectInteractionAudio(interaction);
      if (fromInteraction && fromInteraction.byteLength > 2048 && isAudioPayload(fromInteraction)) {
        return fromInteraction;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (isGeminiModelUnavailableError(error)) {
        throw new Error(`Müzik mühürü fail-closed. ${LYRIA_MODEL} API'de yok. Alt modele geçilmez. ${message}`);
      }
      process.stderr.write(`Lyria interactions durdu; aynı model generateContent ile sürer. ${message}\n`);
    }
  }
  const response = (await client.models.generateContent({
    model: LYRIA_MODEL,
    contents: JUNIOR_BED_PROMPT,
  })) as GeminiResponse;
  const fromContent = collectInlineAudio(response);
  if (fromContent && fromContent.byteLength > 2048 && isAudioPayload(fromContent)) {
    return fromContent;
  }
  throw new Error("Lyria boş dip müzik döndü. Sinüs yedeği yok.");
}

function ffmpegBinary(): string {
  const ffmpegPath = require("ffmpeg-static") as string | null;
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static ikili yok.");
  }
  return ffmpegPath;
}

function sealStereoBed(raw: Buffer): void {
  mkdirSync(dirname(out), { recursive: true });
  const rawPath = `${out}.lyria-raw`;
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
        String(JUNIOR_BED_SAMPLE_RATE_HZ),
        "-ac",
        String(JUNIOR_BED_CHANNELS),
        "-c:a",
        "libmp3lame",
        "-b:a",
        "192k",
        out,
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
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const seal = argv.includes("--seal");
  const confirm = argv.includes("--confirm-gemini-spend");
  assertAcademySealedMediaModel("MUSIC_GEN", LYRIA_MODEL);
  process.stdout.write(
    `junior-bed bake — model=${LYRIA_MODEL} vocal=${JUNIOR_BED_LAYER.vocal} ${JUNIOR_BED_SAMPLE_RATE_HZ} Hz ${JUNIOR_BED_CHANNELS} ch\n  → ${out}\n`,
  );
  if (!seal || !confirm) {
    process.stdout.write("Bake öncesi kapı: --seal ve --confirm-gemini-spend olmadan Lyria çağrısı açılmaz.\n");
    if (!dryRun) {
      process.exit(1);
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
  const raw = await bakeLyriaBed(client);
  sealStereoBed(raw);
  process.stdout.write(`yazıldı ${JUNIOR_BED_SAMPLE_RATE_HZ} Hz stereo → ${out}\n`);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`junior-bed bake FAIL — ${message}\n`);
  process.exit(1);
});
