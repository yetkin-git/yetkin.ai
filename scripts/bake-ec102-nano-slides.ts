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
import { ECOMMERCE_CINEMA_LESSONS } from "@/lib/academy/curricula/ecommerce_ai/cinema-slides";
import { ACADEMY_SEALED_MEDIA_MODEL, assertAcademySealedMediaModel } from "@/lib/kernel/ai/model-roles";

const ROOT = process.cwd();
const IMAGE_MODEL = ACADEMY_SEALED_MEDIA_MODEL.IMAGE_GEN;
const MIN_GEMINI_KEY_CHARS = 8;

const LESSON_PROMPTS: Record<string, string> = {
  "02_ecommerce_ai-1":
    "4K lesson cover, 3840 by 2160, 16:9. One consistent visual system for EC-102 lesson 1. A quiet e-commerce worktable in warm daylight. Three symbols only, arranged as one scene, not a collage. On the left, two folded ecru cotton kitchen towels, soft cloth, no print, no logo. In the center, one marketplace vitrin card: a clean product-page title bar, the title a long product-type line followed by three short marks for color, measure, and count, no readable letters, no digits, no brand wordmark. On the right, one search field with three blank keyword chips under it, standing for the words a buyer types. The cotton towel, the vitrin title, and the search words are the whole story. No second product, no watermark, no brand logos, no trademark wordmarks. No faces, no phone, no address, no price tag. Palette: warm paper, ecru cotton, clean white margin, soft cardboard. Photoreal, sharp, quiet, series-ready.",
  "02_ecommerce_ai-2":
    "4K lesson cover, 3840 by 2160, 16:9. One consistent visual system for EC-102 lesson 2. A quiet e-commerce worktable in warm daylight. One beige ceramic mug, handle on the right, shown as a single transformation, not a collage of many products. The left edge is the raw phone photo: the same mug on a wooden kitchen table, a dinner plate behind it, a warm window shadow across the body. The finished frame is the lesson: that mug centered in a 1:1 square on a plain white background, filling most of the square, a thin white margin, even studio light on every side, a soft base shadow under the mug, beige color unchanged, handle fully visible, no second mug. No decorative frame, no price, no letters, no watermark, no logo on the finished mug. No brand logos, no trademark wordmarks. No faces, no address, no price tag, no extra handle, no cut handle, no second product. Palette: beige ceramic, a narrow wood edge only as the before, clean white studio. Photoreal, sharp, quiet, series-ready.",
  "02_ecommerce_ai-3":
    "4K lesson cover, 3840 by 2160, 16:9. One consistent visual system for EC-102 lesson 3. A quiet e-commerce worktable in warm daylight. Three symbols only, arranged as one scene, not a collage of many products. On the left, a seller review panel: a single amber star, the other stars dim, a short stack of comment lines with no readable words. In the center, an open cardboard return box with a beige ceramic mug inside, handle intact, a simple return arrow on the carton, no carrier logo. On the right, one analysis sheet: three grouped bars, the tallest bar first, a short source label under each bar with no readable letters. The mug color stays beige. No second product, no price tag, no watermark, no brand logos, no trademark wordmarks. No faces, no phone numbers, no addresses, no order numbers. Palette: warm paper, cardboard brown, amber star, beige ceramic, clean white margin. Photoreal, sharp, quiet, series-ready.",
  "02_ecommerce_ai-4":
    "4K lesson cover, 3840 by 2160, 16:9. One consistent visual system for EC-102 lesson 4. A quiet e-commerce worktable in warm daylight. Three symbols only, arranged as one scene, not a collage of many products. On the left, a small open cash drawer: paper notes and coins in neat stacks, no readable amounts, no bank name. In the center, one cost sheet with four short rows and a remainder line under a thin rule, marks only, no readable letters, no digits. On the right, three upright price cards of one beige ceramic mug, the left card sitting below a faint floor line, the middle and right cards sitting above that line, no readable prices. The mug color stays beige. No second product, no watermark, no brand logos, no trademark wordmarks. No faces, no IBAN, no invoice photo, no tax number. Palette: warm paper, brass drawer, cardboard brown, beige ceramic, clean white margin. Photoreal, sharp, quiet, series-ready.",
  "02_ecommerce_ai-5":
    "4K lesson cover, 3840 by 2160, 16:9. One consistent visual system for EC-102 lesson 5. A quiet e-commerce worktable in warm daylight. Three symbols only, arranged as one scene, not a collage. On the left, one open spreadsheet list with three short rows: a beige ceramic mug, a folded ecru kitchen towel, and a plain glass tea cup, shown as objects in the cells, column marks only, no readable letters, no digits. In the center, one blank template card with three stacked slots, and from that single card a neat fan of many finished description cards spreading to the right, same order on every card, no readable words. On the right, a still-warm glass of tea beside one small sealed parcel, the table otherwise clear. No second spreadsheet, no watermark, no brand logos, no trademark wordmarks, no Excel logo. No faces, no phone, no address, no IBAN, no price tag. Palette: warm paper, cardboard brown, beige ceramic, ecru cloth, clear glass, clean white margin. Photoreal, sharp, quiet, series-ready.",
  "02_ecommerce_ai-6":
    "4K lesson cover, 3840 by 2160, 16:9. One consistent visual system for EC-102 lesson 6, the module finale. A quiet e-commerce worktable in warm daylight. Three symbols only, arranged as one scene, not a collage. On the left, one store-rating panel standing upright, a high row of simple star marks, no readable score, no digits, no letters. In the center, one customer message window, a single quiet question card inside a plain panel, marks only, no readable words. On the right, one reply-assistant card, a short draft held just beside the window, not yet sent, no readable words, no robot, no face. A small still-warm glass of tea sits at the near edge of the table. No second screen, no watermark, no brand logos, no trademark wordmarks. No faces, no hands in close-up, no phone number, no address, no IBAN, no price tag. Palette: warm paper, cardboard brown, beige ceramic, soft star gold, clean white margin. Photoreal, sharp, quiet, series-ready.",
};

const BEAT_CAMERA = [
  "Camera: wide, the whole table in morning light.",
  "Camera: closer on the center symbol, side symbols still in frame.",
  "Camera: a blank paper card on the near edge of the same table, no letters and no digits.",
  "Camera: the same table settled, slightly wider.",
  "Camera: warm late light, a small glass of tea at the near edge, the lesson symbols still on the table.",
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
      const prompt = `${base} Beat: ${cue.section}. ${camera} Photoreal tabletop photograph only. Do not draw a software dashboard, headline, caption box, or black text panel. No readable words.`;
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
