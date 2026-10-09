#!/usr/bin/env tsx
/**
 * Junior 6. sınıf çekirdek kapak fırını.
 * Model: ACADEMY_SEALED_MEDIA_MODEL.JUNIOR_COVER_GEN (gemini-3.1-flash-lite-image, Nano Banana 2 Lite).
 * Yetişkin IMAGE_GEN bu kapağın yedeği değildir.
 * Çıkış: public/media/junior/covers/{lessonKey}.jpg
 * Harcama: --confirm-gemini-spend olmadan dış çağrı açılmaz.
 *
 *   npx tsx scripts/bake-junior-covers.ts
 *   npx tsx scripts/bake-junior-covers.ts --dry-run --key=jr_06_mat-1
 *   npx tsx scripts/bake-junior-covers.ts --confirm-gemini-spend --key=jr_06_mat-1
 */
import "./load-academy-bake-env";

import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { JUNIOR_FEN_LESSONS } from "@/lib/junior/content/fen";
import { JUNIOR_ING_LESSONS } from "@/lib/junior/content/ing";
import { JUNIOR_MAT_LESSONS } from "@/lib/junior/content/mat";
import { JUNIOR_SOSYAL_LESSONS } from "@/lib/junior/content/sosyal";
import { JUNIOR_TURKCE_LESSONS } from "@/lib/junior/content/turkce";
import { JUNIOR_COVER_PUBLIC_DIR, juniorCoverPublicPath } from "@/lib/junior/covers";
import {
  ACADEMY_SEALED_MEDIA_MODEL,
  assertAcademySealedMediaModel,
  isGeminiModelUnavailableError,
} from "@/lib/kernel/ai/model-roles";

const require = createRequire(import.meta.url);
const COVER_MODEL = ACADEMY_SEALED_MEDIA_MODEL.JUNIOR_COVER_GEN;
const MIN_GEMINI_KEY_CHARS = 8;
const WIDTH = 1280;
const HEIGHT = 720;
const JPEG_QUALITY = 82;
const OUT_DIR = join(process.cwd(), "public", JUNIOR_COVER_PUBLIC_DIR.replace(/^\//, ""));

const SUBJECT_BY_SLUG: Record<string, string> = {
  jr_06_mat: "Matematik",
  jr_06_fen: "Fen Bilimleri",
  jr_06_turkce: "Türkçe",
  jr_06_ing_main: "İngilizce",
  jr_06_sosyal: "Sosyal Bilgiler",
};

type CoverLesson = { key: string; title: string; subject: string };

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

function lessonSubject(lessonKey: string): string {
  const slug = lessonKey.replace(/-\d+$/u, "");
  const subject = SUBJECT_BY_SLUG[slug];
  if (!subject) {
    throw new Error(`Junior kapak: branş yok (${lessonKey}).`);
  }
  return subject;
}

function coreLessons(): CoverLesson[] {
  const rows = [
    ...JUNIOR_MAT_LESSONS,
    ...JUNIOR_FEN_LESSONS,
    ...JUNIOR_TURKCE_LESSONS,
    ...JUNIOR_ING_LESSONS,
    ...JUNIOR_SOSYAL_LESSONS,
  ];
  if (rows.length !== 105) {
    throw new Error(`Junior kapak: çekirdek konu 105 olmalı. Gelen ${rows.length}.`);
  }
  return rows.map((lesson) => ({
    key: lesson.key,
    title: lesson.title,
    subject: lessonSubject(lesson.key),
  }));
}

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

function coverPrompt(lesson: CoverLesson): string {
  return [
    `6. sınıf ${lesson.subject} ders kapağı.`,
    `Konu: ${lesson.title}.`,
    "Sade, sıcak, çocuk kitabı illüstrasyonu. Yatay 16:9.",
    "Görselde yazı, logo, marka ve korkutucu öğe yok.",
  ].join(" ");
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

async function bakeOne(client: GoogleGenAI, lesson: CoverLesson, dest: string): Promise<void> {
  assertAcademySealedMediaModel("JUNIOR_COVER_GEN", COVER_MODEL);
  const response = (await client.models.generateContent({
    model: COVER_MODEL,
    contents: coverPrompt(lesson),
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K",
      },
    },
  })) as GeminiResponse;
  const inline = collectInlineImage(response);
  if (!inline) {
    throw new Error(`Kapak mühürü fail-closed. ${COVER_MODEL} boş döndü. Alt modele geçilmez.`);
  }
  const bytes = Buffer.from(inline.data, "base64");
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

async function main(): Promise<void> {
  assertAcademySealedMediaModel("JUNIOR_COVER_GEN", COVER_MODEL);
  if (COVER_MODEL !== "gemini-3.1-flash-lite-image") {
    throw new Error(`Junior kapak modeli gemini-3.1-flash-lite-image olmalı. Gelen ${COVER_MODEL}.`);
  }
  const onlyKey = argValue("--key");
  const lessons = coreLessons().filter((lesson) => (onlyKey ? lesson.key === onlyKey : true));
  if (lessons.length === 0) {
    throw new Error(`Junior kapak: ders yok (${onlyKey ?? "tümü"}).`);
  }
  const spend = process.argv.includes("--confirm-gemini-spend");
  const dryRun = !spend || process.argv.includes("--dry-run");
  process.stdout.write(
    `Junior kapak ${COVER_MODEL} · ${lessons.length} konu · ${dryRun ? "dry-run" : "fırın"}\n`,
  );
  for (const lesson of lessons) {
    const publicPath = juniorCoverPublicPath(lesson.key);
    const dest = join(OUT_DIR, `${lesson.key}.jpg`);
    process.stdout.write(`${lesson.key} ${lesson.subject} → ${publicPath}${existsSync(dest) ? " (diskte var)" : ""}\n`);
  }
  if (dryRun) {
    process.stdout.write("Harcama kapalı. Dış çağrı yok.\n");
    return;
  }
  const apiKey = sanitizeGeminiApiKey(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY yok. Kapak fırını açılmadı.");
  }
  mkdirSync(OUT_DIR, { recursive: true });
  const client = new GoogleGenAI({ apiKey });
  for (const lesson of lessons) {
    const dest = join(OUT_DIR, `${lesson.key}.jpg`);
    if (existsSync(dest) && !process.argv.includes("--force")) {
      process.stdout.write(`${lesson.key} duruyor.\n`);
      continue;
    }
    try {
      await bakeOne(client, lesson, dest);
      process.stdout.write(`${lesson.key} yazıldı.\n`);
    } catch (error) {
      if (isGeminiModelUnavailableError(error)) {
        throw new Error(`Kapak mühürü fail-closed. ${COVER_MODEL} yok. Alt model açılmaz.`);
      }
      throw error;
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
