#!/usr/bin/env tsx
/**
 * Junior ders içi 16:9 plaka fırını.
 * Model: ACADEMY_SEALED_MEDIA_MODEL.JUNIOR_COVER_GEN (gemini-3.1-flash-lite-image, Nano Banana 2 Lite).
 * Plaka kapak değildir. Aynı kimlik, ayrı klasör: public/media/junior/scenes/{ders}/step-{adım}.jpg
 * Yetişkin IMAGE_GEN bu plakanın yedeği değildir. Video bu betikle üretilmez.
 * Harcama: --confirm-gemini-spend olmadan dış çağrı açılmaz.
 *
 *   npx tsx scripts/bake-junior-scene-images.ts
 *   npx tsx scripts/bake-junior-scene-images.ts --dry-run --key=jr_06_fen-1
 *   npx tsx scripts/bake-junior-scene-images.ts --confirm-gemini-spend
 */
import "./load-academy-bake-env";

import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import {
  ACADEMY_SEALED_MEDIA_MODEL,
  assertAcademySealedMediaModel,
  isGeminiModelUnavailableError,
} from "@/lib/kernel/ai/model-roles";
import {
  JUNIOR_SCENE_PLATES,
  JUNIOR_SCENE_PROMPT_SUFFIX,
  juniorSceneDiskRelative,
  juniorScenePublicPath,
  type JuniorScenePlate,
} from "@/lib/junior/scene-media";

const require = createRequire(import.meta.url);
const PLATE_MODEL = ACADEMY_SEALED_MEDIA_MODEL.JUNIOR_COVER_GEN;
const MIN_GEMINI_KEY_CHARS = 8;
const WIDTH = 1280;
const HEIGHT = 720;
const JPEG_QUALITY = 82;

type GeminiPart = {
  inlineData?: { data?: string; mimeType?: string | null };
  inline_data?: { data?: string; mimeType?: string | null; mime_type?: string | null };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<GeminiPart | null> } | null;
  } | null>;
};

const sharp = require("sharp") as (
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

function argValue(flag: string): string | null {
  const prefix = `${flag}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length).trim() : null;
}

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

function platePrompt(plate: JuniorScenePlate): string {
  return `${plate.prompt} ${JUNIOR_SCENE_PROMPT_SUFFIX}`;
}

function collectInlineImage(response: GeminiResponse): { data: string } | null {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline: GeminiPart["inline_data"] = part?.inlineData ?? part?.inline_data;
    const data = inline?.data?.trim();
    if (!data) {
      continue;
    }
    const mime =
      (typeof inline?.mimeType === "string" && inline.mimeType) ||
      (typeof inline?.mime_type === "string" && inline.mime_type) ||
      "image/png";
    if (mime.startsWith("image/")) {
      return { data };
    }
  }
  return null;
}

function isRetryableGeminiError(error: unknown): boolean {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status)
      : Number.NaN;
  if (status === 429 || status === 503 || status === 500) {
    return true;
  }
  const message = error instanceof Error ? error.message : String(error);
  return /429|RESOURCE_EXHAUSTED|UNAVAILABLE|503|500/i.test(message);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function bakeOne(client: GoogleGenAI, plate: JuniorScenePlate, dest: string): Promise<void> {
  assertAcademySealedMediaModel("JUNIOR_COVER_GEN", PLATE_MODEL);
  let response: GeminiResponse | null = null;
  let lastError: unknown;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      response = (await client.models.generateContent({
        model: PLATE_MODEL,
        contents: platePrompt(plate),
        config: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K",
          },
        },
      })) as GeminiResponse;
      break;
    } catch (error) {
      lastError = error;
      if (isGeminiModelUnavailableError(error) || !isRetryableGeminiError(error) || attempt === 4) {
        throw error;
      }
      const waitMs = attempt * 8_000;
      process.stdout.write(`${plate.lessonKey} adım ${plate.step} yeniden (${attempt}) ${waitMs} ms\n`);
      await sleep(waitMs);
    }
  }
  if (!response) {
    throw lastError instanceof Error ? lastError : new Error("Plaka yanıtı yok.");
  }
  const inline = collectInlineImage(response);
  if (!inline) {
    throw new Error(`Plaka mühürü fail-closed. ${PLATE_MODEL} boş döndü. Alt modele geçilmez.`);
  }
  const bytes = Buffer.from(inline.data, "base64");
  mkdirSync(dirname(dest), { recursive: true });
  await sharp(bytes)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: JPEG_QUALITY, chromaSubsampling: "4:2:0" })
    .withMetadata({ density: 96 })
    .toFile(dest);
  const written = readFileSync(dest);
  const meta = await sharp(written).metadata();
  if (
    written.length < 4_000 ||
    written[0] !== 0xff ||
    written[1] !== 0xd8 ||
    meta.width !== WIDTH ||
    meta.height !== HEIGHT ||
    meta.format !== "jpeg"
  ) {
    throw new Error(`JPEG mühürü tutmadı: ${dest}`);
  }
}

function selectedPlates(): JuniorScenePlate[] {
  const onlyKey = argValue("--key");
  const onlyGroup = argValue("--group");
  return JUNIOR_SCENE_PLATES.filter((plate) => {
    if (onlyKey && plate.lessonKey !== onlyKey) {
      return false;
    }
    if (onlyGroup && plate.group !== onlyGroup) {
      return false;
    }
    return true;
  });
}

async function main(): Promise<void> {
  assertAcademySealedMediaModel("JUNIOR_COVER_GEN", PLATE_MODEL);
  if (PLATE_MODEL !== "gemini-3.1-flash-lite-image") {
    throw new Error(`Junior plaka modeli gemini-3.1-flash-lite-image olmalı. Gelen ${PLATE_MODEL}.`);
  }
  const plates = selectedPlates();
  if (plates.length === 0) {
    throw new Error("Junior plaka: seçilen ders yok.");
  }
  const spend = process.argv.includes("--confirm-gemini-spend");
  const dryRun = !spend || process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");
  process.stdout.write(
    `Junior plaka ${PLATE_MODEL} · ${plates.length} kare · ${dryRun ? "dry-run" : "fırın"}\n`,
  );
  for (const plate of plates) {
    const publicPath = juniorScenePublicPath(plate.lessonKey, plate.step, "jpg");
    const dest = join(process.cwd(), juniorSceneDiskRelative(plate.lessonKey, plate.step, "jpg"));
    process.stdout.write(
      `${plate.group} ${plate.lessonKey} adım ${plate.step} → ${publicPath}${existsSync(dest) ? " (diskte var)" : ""}\n`,
    );
  }
  if (dryRun) {
    process.stdout.write("Harcama kapalı. Dış çağrı yok.\n");
    return;
  }
  const apiKey = sanitizeGeminiApiKey(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY yok. Plaka fırını açılmadı.");
  }
  const client = new GoogleGenAI({ apiKey });
  let written = 0;
  let kept = 0;
  for (const plate of plates) {
    const dest = join(process.cwd(), juniorSceneDiskRelative(plate.lessonKey, plate.step, "jpg"));
    if (existsSync(dest) && !force) {
      process.stdout.write(`${plate.lessonKey} adım ${plate.step} duruyor.\n`);
      kept += 1;
      continue;
    }
    try {
      await bakeOne(client, plate, dest);
      written += 1;
      process.stdout.write(`${plate.lessonKey} adım ${plate.step} yazıldı.\n`);
    } catch (error) {
      if (isGeminiModelUnavailableError(error)) {
        throw new Error(`Plaka mühürü fail-closed. ${PLATE_MODEL} yok. Alt model açılmaz.`);
      }
      throw error;
    }
  }
  process.stdout.write(`Junior plaka bitti. Yazılan ${written}. Durdurulan ${kept}.\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
