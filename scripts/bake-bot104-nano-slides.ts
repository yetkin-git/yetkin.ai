#!/usr/bin/env tsx
/**
 * BOT-104 Nano Banana 2 slaytları — 16:9 kaynak, 1920×1080 JPEG %82.
 *   npx tsx scripts/bake-bot104-nano-slides.ts --confirm-gemini-spend
 */
import "./load-academy-bake-env";

import { createRequire } from "node:module";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { BOT104_CINEMA_LESSONS } from "@/lib/academy/curricula/bot-104/cinema-slides";
import { BOT104_LESSON_KEYS } from "@/lib/academy/curricula/bot-104/spoken-body";
import { ACADEMY_SEALED_MEDIA_MODEL, assertAcademySealedMediaModel } from "@/lib/kernel/ai/model-roles";

const ROOT = process.cwd();
const IMAGE_MODEL = ACADEMY_SEALED_MEDIA_MODEL.IMAGE_GEN;
const MIN_GEMINI_KEY_CHARS = 8;
const DONE_LOG = join(ROOT, ".tmp", "bot104-nano-slides-done.txt");
const WIDTH = 1920;
const HEIGHT = 1080;
const JPEG_QUALITY = 82;

const nodeRequire = createRequire(import.meta.url);
const sharp = nodeRequire("sharp") as (
  input: Buffer,
) => {
  metadata: () => Promise<{ width?: number; height?: number; format?: string }>;
  resize: (
    width: number,
    height: number,
    options: { fit: "cover"; position: "centre" },
  ) => {
    jpeg: (options: { quality: number; chromaSubsampling: "4:2:0" }) => {
      withMetadata: (options: { density: number }) => {
        toFile: (path: string) => Promise<void>;
      };
    };
  };
};

type GeminiPart = {
  inlineData?: { data?: string; mimeType?: string | null };
  inline_data?: { data?: string; mimeType?: string | null; mime_type?: string | null };
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<GeminiPart | null> } | null } | null>;
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

function collectInlineImage(response: GeminiResponse): { mimeType: string; data: string } | null {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part?.inlineData ?? part?.inline_data;
    const data = inline?.data?.trim();
    if (!data) {
      continue;
    }
    const mime =
      (typeof inline?.mimeType === "string" && inline.mimeType) ||
      (typeof (inline as { mime_type?: string }).mime_type === "string" &&
        (inline as { mime_type?: string }).mime_type) ||
      "image/png";
    if (mime.startsWith("image/")) {
      return { mimeType: mime, data };
    }
  }
  return null;
}

function readDoneSet(): Set<string> {
  if (!existsSync(DONE_LOG)) {
    return new Set();
  }
  const lines = readFileSync(DONE_LOG, "utf8")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  return new Set(lines);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isQuota(error: unknown): boolean {
  return /402|429|RESOURCE_EXHAUSTED|quota/iu.test(errorText(error));
}

function isRetryable(error: unknown): boolean {
  if (isQuota(error)) {
    return false;
  }
  return /500|503|UNAVAILABLE|overloaded|boş döndü|fetch failed|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket|terminated|aborted|UND_ERR/iu.test(
    errorText(error),
  );
}

async function generateSlide(client: GoogleGenAI, prompt: string): Promise<Buffer> {
  assertAcademySealedMediaModel("IMAGE_GEN", IMAGE_MODEL);
  const response = (await client.models.generateContent({
    model: IMAGE_MODEL,
    contents: prompt,
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "2K",
      },
    },
  })) as GeminiResponse;
  const inline = collectInlineImage(response);
  if (!inline) {
    throw new Error(`Görsel mühürü fail-closed. ${IMAGE_MODEL} boş döndü. Alt modele geçilmez.`);
  }
  return Buffer.from(inline.data, "base64");
}

async function generateSlideWithRetry(client: GoogleGenAI, prompt: string): Promise<Buffer> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await generateSlide(client, prompt);
    } catch (error) {
      lastError = error;
      if (isQuota(error)) {
        throw new Error(`Kota. Fırın durdu. ${errorText(error)}`);
      }
      if (!isRetryable(error) || attempt === 3) {
        throw error;
      }
      const waitMs = 5000 * attempt;
      process.stdout.write(`yeniden deneme ${attempt} bekleme ${waitMs}ms\n`);
      await sleep(waitMs);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Görsel fırını durdu.");
}

async function writeFrame(bytes: Buffer, jpegPath: string): Promise<{ width: number; height: number; bytes: number }> {
  await sharp(bytes)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: JPEG_QUALITY, chromaSubsampling: "4:2:0" })
    .withMetadata({ density: 96 })
    .toFile(jpegPath);
  const written = readFileSync(jpegPath);
  const meta = await sharp(written).metadata();
  if (
    written.length < 8_000 ||
    written[0] !== 0xff ||
    written[1] !== 0xd8 ||
    meta.width !== WIDTH ||
    meta.height !== HEIGHT ||
    meta.format !== "jpeg"
  ) {
    throw new Error(`JPEG mühürü tutmadı: ${jpegPath}`);
  }
  return { width: meta.width, height: meta.height, bytes: written.length };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (!argv.includes("--confirm-gemini-spend")) {
    throw new Error("Görsel fırını --confirm-gemini-spend olmadan açılmaz.");
  }
  const apiKey = sanitizeGeminiApiKey(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY yok.");
  }
  const client = new GoogleGenAI({ apiKey });
  const done = readDoneSet();
  mkdirSync(join(ROOT, ".tmp"), { recursive: true });
  mkdirSync(join(ROOT, "public", "academy", "cinema"), { recursive: true });
  let calls = 0;
  for (const lessonKey of BOT104_LESSON_KEYS) {
    const lesson = BOT104_CINEMA_LESSONS[lessonKey];
    for (const slide of lesson.slides) {
      const relative = `public/academy/cinema/${lessonKey}-cue-${slide.cueIndex}.jpg`;
      if (done.has(relative)) {
        process.stdout.write(`atlandı ${relative}\n`);
        continue;
      }
      process.stdout.write(`fırın ${relative}\n`);
      const bytes = await generateSlideWithRetry(client, slide.imagePrompt);
      calls += 1;
      const frame = await writeFrame(bytes, join(ROOT, relative));
      appendFileSync(DONE_LOG, `${relative}\n`);
      process.stdout.write(
        `yazıldı ${relative} ${frame.width}x${frame.height} ${(frame.bytes / 1024).toFixed(1)}KB çağrı=${calls}\n`,
      );
      await sleep(2000);
    }
  }
  process.stdout.write(`bitti çağrı=${calls}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "BOT-104 slayt fırını durdu.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
