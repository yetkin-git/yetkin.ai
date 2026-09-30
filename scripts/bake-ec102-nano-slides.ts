#!/usr/bin/env tsx
/**
 * EC-102 Nano Banana 2 slaytları — 16:9, 4K.
 * Siyah metin kutusu karelerinin üstüne mühürlü kapak istemini yazar.
 *   npx tsx scripts/bake-ec102-nano-slides.ts --confirm-gemini-spend
 *   npx tsx scripts/bake-ec102-nano-slides.ts --confirm-gemini-spend --lesson=1
 */
import "./load-academy-bake-env";

import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { ECOMMERCE_CINEMA_LESSONS } from "@/lib/academy/curricula/02_ecommerce_ai/cinema-slides";
import { ACADEMY_SEALED_MEDIA_MODEL, assertAcademySealedMediaModel } from "@/lib/kernel/ai/model-roles";

const ROOT = process.cwd();
const IMAGE_MODEL = ACADEMY_SEALED_MEDIA_MODEL.IMAGE_GEN;
const MIN_GEMINI_KEY_CHARS = 8;

const LESSON_PROMPTS: Record<string, string> = {
  "02_ecommerce_ai-1":
    "4K photograph, 3840 by 2160, 16:9. One quiet wooden worktable in warm daylight. Two folded ecru cotton kitchen towels on the left, plain cloth with no print. A small beige ceramic bowl in the center. A smooth river stone on the right. One continuous photograph, one table, no screen, no paper facing the camera, no sign. Palette: warm wood, ecru cotton, beige ceramic. Photoreal, sharp, quiet.",
  "02_ecommerce_ai-2":
    "4K photograph, 3840 by 2160, 16:9. One quiet studio table in warm daylight. One beige ceramic mug, handle on the right, centered on a plain white surface. The mug fills the middle of one continuous frame. Even studio light, a soft shadow under the base, a thin white margin around the mug. Beige clay stays beige. One single photograph of one mug. No paper, no screen, no second object. Palette: beige ceramic and clean white. Photoreal, sharp, quiet.",
  "02_ecommerce_ai-3":
    "4K photograph, 3840 by 2160, 16:9. One quiet wooden worktable in warm daylight. A small brass star on the left. An open cardboard box in the center with one beige ceramic mug inside, handle intact. Three plain wooden blocks on the right, the left block tallest. One continuous photograph. No paper, no screen, no sign. Palette: warm wood, cardboard, brass, beige ceramic. Photoreal, sharp, quiet.",
  "02_ecommerce_ai-4":
    "4K photograph, 3840 by 2160, 16:9. One quiet wooden worktable in warm daylight. A small open brass dish of coins on the left. A small brass balance scale in the center. Three beige ceramic mugs on the right, the left mug sitting lower than the other two. One continuous photograph. No paper, no screen, no sign. Palette: warm wood, brass, beige ceramic. Photoreal, sharp, quiet.",
  "02_ecommerce_ai-5":
    "4K photograph, 3840 by 2160, 16:9. One quiet wooden worktable in warm daylight. In a row: one beige ceramic mug, one folded ecru kitchen towel, one plain glass tea cup. To the right, a neat fan of thick cream cardstock seen only from the edge. A still-warm glass of tea and one small sealed kraft parcel at the near edge. One continuous photograph. No screen, no sign, no grid. Palette: warm wood, beige ceramic, ecru cloth, clear glass, kraft. Photoreal, sharp, quiet.",
  "02_ecommerce_ai-6":
    "4K photograph, 3840 by 2160, 16:9. One quiet wooden worktable in warm daylight, the last calm scene of the day. Five small brass stars in a row on the left. A closed kraft envelope in the center. A second kraft envelope just beside it, also closed. A small glass of tea at the near edge. One continuous photograph. No screen, no sign, no open page. Palette: warm wood, brass, kraft, tea amber. Photoreal, sharp, quiet.",
};

const BEAT_CAMERA = [
  "Camera: wide, the whole table in morning light.",
  "Camera: closer on the center object, side objects still in frame.",
  "Camera: lower angle along the table edge, the same objects.",
  "Camera: the same table settled, slightly wider.",
  "Camera: warm late light, a small glass of tea at the near edge, the same objects still on the table.",
  "Camera: closing frame, tea glass in front, quiet end of the day.",
] as const;

type GeminiPart = {
  inlineData?: { data?: string; mimeType?: string | null };
  inline_data?: { data?: string; mimeType?: string | null; mime_type?: string | null };
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<GeminiPart | null> } | null } | null>;
};

function parseLessonFilter(argv: readonly string[]): number | null {
  const raw = argv.find((part) => part.startsWith("--lesson="))?.slice("--lesson=".length);
  if (!raw) {
    return null;
  }
  const lesson = Number(raw);
  return Number.isInteger(lesson) && lesson >= 1 && lesson <= 6 ? lesson : null;
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

function powershellToJpeg(sourcePath: string, jpegPath: string): Promise<void> {
  const source = sourcePath.replace(/'/g, "''");
  const target = jpegPath.replace(/'/g, "''");
  const command = [
    "Add-Type -AssemblyName System.Drawing",
    `$image = [System.Drawing.Image]::FromFile('${source}')`,
    `$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }`,
    "$encoder = [System.Drawing.Imaging.Encoder]::Quality",
    "$parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)",
    "$parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]92)",
    `$image.Save('${target}', $codec, $parameters)`,
    "$image.Dispose()",
  ].join("; ");
  return new Promise((resolve, reject) => {
    const child = spawn("powershell", ["-NoProfile", "-Command", command], { stdio: "ignore" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`JPEG dönüşü çıkış ${code ?? "yok"}`));
    });
  });
}

async function writeJpeg(bytes: Buffer, mimeType: string, jpegPath: string): Promise<void> {
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
    writeFileSync(jpegPath, bytes);
    return;
  }
  const dir = mkdtempSync(join(tmpdir(), "ec102-slide-"));
  const sourcePath = join(dir, "slide.bin");
  try {
    writeFileSync(sourcePath, bytes);
    await powershellToJpeg(sourcePath, jpegPath);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function generateSlide(client: GoogleGenAI, prompt: string): Promise<{ mimeType: string; data: string }> {
  assertAcademySealedMediaModel("IMAGE_GEN", IMAGE_MODEL);
  const response = (await client.models.generateContent({
    model: IMAGE_MODEL,
    contents: prompt,
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "4K",
      },
    },
  })) as GeminiResponse;
  const inline = collectInlineImage(response);
  if (!inline) {
    throw new Error(
      `Görsel mühürü fail-closed. ${IMAGE_MODEL} boş döndü. Alt modele geçilmez.`,
    );
  }
  return inline;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (!argv.includes("--confirm-gemini-spend")) {
    throw new Error("Görsel fırını --confirm-gemini-spend olmadan açılmaz.");
  }
  const lessonFilter = parseLessonFilter(argv);
  const apiKey = sanitizeGeminiApiKey(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY yok.");
  }
  const client = new GoogleGenAI({ apiKey });
  const keys = Object.keys(ECOMMERCE_CINEMA_LESSONS).filter((lessonKey) => {
    if (lessonFilter == null) {
      return true;
    }
    return lessonKey.endsWith(`-${lessonFilter}`);
  });
  for (const lessonKey of keys) {
    const lesson = ECOMMERCE_CINEMA_LESSONS[lessonKey];
    const base = LESSON_PROMPTS[lessonKey];
    if (!lesson || !base) {
      throw new Error(`Kapak istemi yok: ${lessonKey}`);
    }
    for (const cue of lesson.cues) {
      const camera = BEAT_CAMERA[Math.min(cue.cueIndex, BEAT_CAMERA.length) - 1] ?? BEAT_CAMERA[0];
      const prompt = `${base} ${camera} One photograph of this same table.`;
      const relative = `public/academy/cinema/${lessonKey}-cue-${cue.cueIndex}.jpg`;
      const diskPath = join(ROOT, relative);
      process.stdout.write(`fırın ${relative}\n`);
      const image = await generateSlide(client, prompt);
      const bytes = Buffer.from(image.data, "base64");
      await writeJpeg(bytes, image.mimeType, diskPath);
      const written = readFileSync(diskPath);
      if (written.length < 8_000 || written[0] !== 0xff || written[1] !== 0xd8) {
        throw new Error(`JPEG mühürü tutmadı: ${relative}`);
      }
      process.stdout.write(`yazıldı ${relative} ${written.length}\n`);
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "EC-102 slayt fırını durdu.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
