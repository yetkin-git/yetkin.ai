#!/usr/bin/env tsx
/**
 * 01_office_ai-1 Warm-up B-roll bake — izlemede generate yok (PEDAGOJI §E.4–E.5).
 * Pahalı Veo 3.1 yok. Varsayılan: yerel `/public/media/academy/micro/` MP4 reuse
 * veya Veo 3.1 Lite. Yedek: Nano Banana 2 plaka + Ken Burns (ffmpeg zoompan / CSS).
 *   npx tsx scripts/generate-academy-lesson-veo.ts --dry-run
 *   npx tsx scripts/generate-academy-lesson-veo.ts --seal --confirm-gemini-spend
 *   npx tsx scripts/generate-academy-lesson-veo.ts --seal --confirm-gemini-spend --force
 */
import "./load-academy-bake-env";

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import {
  ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY,
  ACADEMY_VEO_BAKE_DURATION_SEC,
  ACADEMY_VEO_BAKE_MODEL,
  assertAcademyVeoBudgetBakeModel,
  assertAcademyVeoLessonBudget,
} from "@/lib/academy/lesson-veo";
import { academyMicroVideoPublicSources } from "@/lib/academy/lesson-media";

const ROOT = process.cwd();
const MIN_GEMINI_KEY_CHARS = 8;
const VEO_PROMPT =
  "Cinematic 16:9 B-roll of a contemporary Turkish office at dusk. Slow push-in over a cluttered desk: laptop showing a messy Excel sheet with merged header cells transforming into flowing columns of clean data, soft particles of numbers drifting like light. Warm lamp, ceramic coffee cup, shallow depth of field, no readable long paragraphs, no logos of other brands, no faces looking at camera. Photoreal, 8 seconds, office / data-flow mood.";

type VideoFile = {
  uri?: string;
  videoBytes?: string;
  video_bytes?: string;
};

type GeneratedVideo = {
  video?: VideoFile;
};

type GenerateVideosOperation = {
  done?: boolean;
  error?: { message?: string } | string | null;
  response?: {
    generatedVideos?: Array<GeneratedVideo | null>;
    generated_videos?: Array<GeneratedVideo | null>;
  };
};

function parseArgs(argv: readonly string[]): {
  dryRun: boolean;
  seal: boolean;
  confirmGeminiSpend: boolean;
  force: boolean;
} {
  return {
    dryRun: argv.includes("--dry-run"),
    seal: argv.includes("--seal"),
    confirmGeminiSpend: argv.includes("--confirm-gemini-spend"),
    force: argv.includes("--force"),
  };
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

function publicMp4Path(): string {
  return join(ROOT, "public", academyMicroVideoPublicSources(ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY).mp4.slice(1));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function pollVeoOperation(
  gateway: {
    operations?: {
      getVideosOperation?: (input: { operation: GenerateVideosOperation }) => Promise<GenerateVideosOperation>;
      get?: (input: { operation: GenerateVideosOperation }) => Promise<GenerateVideosOperation>;
    };
  },
  operation: GenerateVideosOperation,
): Promise<GenerateVideosOperation> {
  let current = operation;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (current.done) {
      return current;
    }
    process.stdout.write(`  Veo poll ${attempt + 1}/40\n`);
    await sleep(10_000);
    const next = gateway.operations?.getVideosOperation
      ? await gateway.operations.getVideosOperation({ operation: current })
      : gateway.operations?.get
        ? await gateway.operations.get({ operation: current })
        : null;
    if (!next) {
      break;
    }
    current = next;
  }
  return current;
}

function operationErrorMessage(operation: GenerateVideosOperation): string | null {
  const error = operation.error;
  if (!error) {
    return null;
  }
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }
  if (typeof error === "object" && typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }
  return null;
}

async function downloadVeoMp4(
  gateway: {
    files?: {
      download: (input: { file: unknown; downloadPath: string }) => Promise<unknown>;
    };
  },
  generated: GeneratedVideo,
  dest: string,
): Promise<Buffer> {
  const video = generated.video;
  const inline = video?.videoBytes ?? video?.video_bytes;
  if (inline) {
    return Buffer.from(inline, "base64");
  }
  if (!gateway.files?.download) {
    throw new Error("Veo 3.1 Lite URI var ama files.download yok.");
  }
  mkdirSync(dirname(dest), { recursive: true });
  await gateway.files.download({
    file: video ?? generated,
    downloadPath: dest,
  });
  if (!existsSync(dest)) {
    throw new Error("Veo 3.1 Lite indirme boş.");
  }
  return readFileSync(dest);
}

async function bakeVeoMp4(client: GoogleGenAI, dest: string): Promise<Buffer> {
  assertAcademyVeoBudgetBakeModel(ACADEMY_VEO_BAKE_MODEL);
  assertAcademyVeoLessonBudget({
    calls: 1,
    durationSec: ACADEMY_VEO_BAKE_DURATION_SEC,
  });
  const gateway = client as unknown as {
    models: { generateVideos: (input: Record<string, unknown>) => Promise<GenerateVideosOperation> };
    operations?: {
      getVideosOperation?: (input: { operation: GenerateVideosOperation }) => Promise<GenerateVideosOperation>;
      get?: (input: { operation: GenerateVideosOperation }) => Promise<GenerateVideosOperation>;
    };
    files?: {
      download: (input: { file: unknown; downloadPath: string }) => Promise<unknown>;
    };
  };
  const operation = await gateway.models.generateVideos({
    model: ACADEMY_VEO_BAKE_MODEL,
    source: { prompt: VEO_PROMPT },
    config: {
      aspectRatio: "16:9",
      resolution: "720p",
      durationSeconds: ACADEMY_VEO_BAKE_DURATION_SEC,
      numberOfVideos: 1,
    },
  });
  const current = await pollVeoOperation(gateway, operation);
  const failed = operationErrorMessage(current);
  if (failed) {
    throw new Error(`Veo 3.1 Lite işlem hatası: ${failed}`);
  }
  if (!current.done) {
    throw new Error("Veo 3.1 Lite zaman aşımı.");
  }
  const videos = current.response?.generatedVideos ?? current.response?.generated_videos ?? [];
  const generated = videos[0];
  if (!generated) {
    throw new Error("Veo 3.1 Lite boş video döndü.");
  }
  return downloadVeoMp4(gateway, generated, dest);
}

function writeCinematicFallbackMp4(): void {
  const require = createRequire(import.meta.url);
  const ffmpegPath = require("ffmpeg-static") as string | null;
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static yok; Veo yedeği yazılamadı.");
  }
  const frame = join(ROOT, "public", "media", "01_office_ai_01_frame_01.png");
  const out = publicMp4Path();
  mkdirSync(dirname(out), { recursive: true });
  const source = existsSync(frame) ? frame : join(ROOT, "public", "icon.svg");
  const result = spawnSync(
    ffmpegPath,
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-loop",
      "1",
      "-i",
      source,
      "-t",
      String(ACADEMY_VEO_BAKE_DURATION_SEC),
      "-vf",
      "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,zoompan=z='min(zoom+0.0012,1.12)':d=200:s=1280x720:fps=25",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-an",
      "-t",
      String(ACADEMY_VEO_BAKE_DURATION_SEC),
      out,
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  if (result.status !== 0) {
    throw new Error(`ffmpeg Veo yedeği FAIL: ${result.stderr?.toString("utf8").trim() || result.status}`);
  }
  process.stdout.write(`yedek sinema ${out}\n`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const dest = publicMp4Path();
  assertAcademyVeoBudgetBakeModel(ACADEMY_VEO_BAKE_MODEL);
  if (existsSync(dest) && !args.force) {
    process.stdout.write(
      `reuse ${dest} (PEDAGOJI §E.4 yerel kaset; pahalı Veo 3.1 yok, API yok)\n`,
    );
    return;
  }
  if (args.dryRun || !args.seal || !args.confirmGeminiSpend) {
    process.stdout.write(
      `dry-run ${ACADEMY_VEO_BAKE_MODEL} ${ACADEMY_VEO_BAKE_DURATION_SEC}s → ${dest}\n`,
    );
    if (!existsSync(dest)) {
      writeCinematicFallbackMp4();
    }
    return;
  }
  const apiKey = sanitizeGeminiApiKey(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    writeCinematicFallbackMp4();
    throw new Error("GEMINI_API_KEY yok; sinema yedeği yazıldı.");
  }
  const client = new GoogleGenAI({ apiKey });
  try {
    const mp4 = await bakeVeoMp4(client, dest);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, mp4);
    process.stdout.write(`yazıldı ${mp4.byteLength} bayt → ${dest}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    writeCinematicFallbackMp4();
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
