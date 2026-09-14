#!/usr/bin/env tsx
/**
 * Lyria 3.5 dip müzik bake — 01_office_ai-1.
 * İnsan --seal ve --confirm-gemini-spend olmadan harici çağrı yok.
 *   npx tsx scripts/generate-academy-lesson-bed.ts --dry-run --slug=01_office_ai --key=01_office_ai-1
 *   npx tsx scripts/generate-academy-lesson-bed.ts --seal --confirm-gemini-spend --slug=01_office_ai --key=01_office_ai-1
 */
import "./load-academy-bake-env";

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { academyLessonBedDiskPath } from "@/lib/academy/media-release-seal";

const MIN_GEMINI_KEY_CHARS = 8;
const LESSON_KEY = "01_office_ai-1";
const COURSE_SLUG = "01_office_ai";
const LYRIA_MODEL = "lyria-3.5";
const BED_PROMPT =
  "Instrumental only, no vocals, no lyrics. Warm contemporary Turkish office underscore for an Excel training lesson. Soft piano, muted guitar, light brushed percussion, gentle analog pad. Loop-friendly 6 to 8 minutes. Designed as a ducked bed: stays quiet under speech, swells politely in 3 to 5 second breath gaps. No melody that fights a female narrator. 44.1 kHz stereo.";

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

type InteractionResponse = {
  output_audio?: InteractionAudio;
  outputAudio?: InteractionAudio;
  outputs?: Array<{ inlineData?: { data?: string; mimeType?: string | null } } | null>;
};

function parseArgs(argv: readonly string[]): {
  dryRun: boolean;
  seal: boolean;
  confirmGeminiSpend: boolean;
  slug: string | null;
  key: string | null;
} {
  return {
    dryRun: argv.includes("--dry-run"),
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
  return null;
}

async function bakeLyriaBed(client: GoogleGenAI): Promise<Buffer> {
  const interactions = client as GoogleGenAI & {
    interactions?: {
      create: (input: { model: string; input: string }) => Promise<InteractionResponse>;
    };
  };
  if (typeof interactions.interactions?.create === "function") {
    const interaction = await interactions.interactions.create({
      model: LYRIA_MODEL,
      input: BED_PROMPT,
    });
    const fromInteraction = collectInteractionAudio(interaction);
    if (fromInteraction && fromInteraction.byteLength > 2048) {
      return fromInteraction;
    }
  }
  const response = (await client.models.generateContent({
    model: LYRIA_MODEL,
    contents: BED_PROMPT,
  })) as GeminiResponse;
  const fromContent = collectInlineAudio(response);
  if (!fromContent || fromContent.byteLength < 2048) {
    throw new Error("Lyria 3.5 boş dip müzik döndü.");
  }
  return fromContent;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const slug = args.slug ?? COURSE_SLUG;
  const key = args.key ?? LESSON_KEY;
  if (slug !== COURSE_SLUG || key !== LESSON_KEY) {
    throw new Error(`Lyria bed yalnız ${COURSE_SLUG}/${LESSON_KEY}.`);
  }
  const diskPath = academyLessonBedDiskPath(slug, key);
  if (args.dryRun || !args.seal || !args.confirmGeminiSpend) {
    process.stdout.write(
      `academy-bed bake — ${slug}/${key} model=${LYRIA_MODEL}${args.dryRun || !args.seal ? " (dry-run)" : ""}\n  → ${diskPath}\n`,
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
      timeout: 180_000,
      retryOptions: { attempts: 1, httpStatusCodes: [] as number[] },
    },
  });
  process.stdout.write(`Lyria ${LYRIA_MODEL} dip müzik\n`);
  const mp3 = await bakeLyriaBed(client);
  mkdirSync(dirname(diskPath), { recursive: true });
  writeFileSync(diskPath, mp3);
  process.stdout.write(`yazıldı ${mp3.byteLength} bayt → ${join("public", "media", "academy", "audio", slug, `${key}.bed.mp3`)}\n`);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`academy-bed bake FAIL — ${message}\n`);
  process.exit(1);
});
