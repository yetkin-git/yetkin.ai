#!/usr/bin/env tsx
/**
 * Bake WAV → yayın MP3. Vercel Pro statik tavanı 1 GB; WAV Git/Vercel dışındadır.
 *
 *   npx tsx scripts/transcode-academy-lesson-audio.ts
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { ACADEMY_MEDIA_SEALED_AUDIO } from "@/lib/academy/pilot-sku";
import {
  ACADEMY_SEALED_AUDIO_DEPLOY_MAX_BYTES,
  isAcademyMpegAudioBuffer,
} from "@/lib/academy/lesson-audio";
import {
  academyLessonAudioDiskPath,
  academyLessonAudioLegacyPublicWavPath,
  academyLessonAudioReleaseDiskPath,
} from "@/lib/academy/media-release-seal";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;
const ROOT = process.cwd();
const TRANSCODE_CONCURRENCY = 3;
/** Yayın saati. 24 kHz oynatma boru bandı bırakır. */
export const ACADEMY_MP3_SAMPLE_RATE = 48_000;
/** Taban 192 kbps. Mühür 320 kbps CBR — LAME alçak geçirenini konuşma bandının üstüne iter. */
export const ACADEMY_MP3_BITRATE = "320k";
const ACADEMY_MP3_BITRATE_FLOOR_KBPS = 192;

function assertMp3BitrateLocked(): void {
  const kbps = Number.parseInt(ACADEMY_MP3_BITRATE, 10);
  if (!Number.isFinite(kbps) || kbps < ACADEMY_MP3_BITRATE_FLOOR_KBPS) {
    throw new Error(`MP3 bitrate tabanı ${ACADEMY_MP3_BITRATE_FLOOR_KBPS} kbps; kilit ${ACADEMY_MP3_BITRATE}.`);
  }
}

function readWavLayout(wavPath: string): { sampleRate: number; channels: number } {
  const header = readFileSync(wavPath).subarray(0, 44);
  if (header.length < 44 || header.toString("ascii", 0, 4) !== "RIFF") {
    return { sampleRate: ACADEMY_MP3_SAMPLE_RATE, channels: 1 };
  }
  const channels = header.readUInt16LE(22);
  const sampleRate = header.readUInt32LE(24);
  return {
    sampleRate: sampleRate > 0 ? sampleRate : ACADEMY_MP3_SAMPLE_RATE,
    channels: channels > 0 ? channels : 1,
  };
}

export function resolveAcademyBakeWavPath(
  courseSlug: string,
  lessonKey: string,
  root = ROOT,
): string | null {
  const bake = academyLessonAudioDiskPath(courseSlug, lessonKey, root);
  if (existsSync(bake)) {
    return bake;
  }
  const legacy = academyLessonAudioLegacyPublicWavPath(courseSlug, lessonKey, root);
  if (existsSync(legacy)) {
    return legacy;
  }
  return null;
}

export function transcodeAcademyWavToMp3(wavPath: string, mp3Path: string): void {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static ikili yok; npm ci / ffmpeg-static kur.");
  }
  assertMp3BitrateLocked();
  mkdirSync(dirname(mp3Path), { recursive: true });
  const layout = readWavLayout(wavPath);
  const args = [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    wavPath,
  ];
  if (layout.sampleRate !== ACADEMY_MP3_SAMPLE_RATE) {
    args.push(
      "-af",
      `aresample=osr=${ACADEMY_MP3_SAMPLE_RATE}:filter_size=256:phase_count=64:linear_interp=0:cutoff=0.99`,
    );
  }
  args.push("-ar", String(ACADEMY_MP3_SAMPLE_RATE), "-codec:a", "libmp3lame", "-b:a", ACADEMY_MP3_BITRATE);
  if (layout.channels <= 1) {
    args.push("-ac", "1");
  }
  args.push("-id3v2_version", "3", mp3Path);
  const result = spawnSync(ffmpegPath, args, { stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0) {
    const err = result.stderr?.toString("utf8").trim() || `exit ${result.status}`;
    throw new Error(`ffmpeg FAIL ${wavPath}: ${err}`);
  }
  if (!existsSync(mp3Path)) {
    throw new Error(`MP3 yazılmadı: ${mp3Path}`);
  }
}

function sealedJobs(): { courseSlug: string; lessonKey: string }[] {
  const jobs: { courseSlug: string; lessonKey: string }[] = [];
  for (const [courseSlug, keys] of Object.entries(ACADEMY_MEDIA_SEALED_AUDIO)) {
    for (const lessonKey of keys) {
      jobs.push({ courseSlug, lessonKey });
    }
  }
  return jobs;
}

async function runPool<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>): Promise<void> {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) {
        return;
      }
      await worker(item);
    }
  });
  await Promise.all(runners);
}

async function main(): Promise<void> {
  const jobs = sealedJobs();
  let converted = 0;
  let skipped = 0;
  await runPool(jobs, TRANSCODE_CONCURRENCY, async (job) => {
    const wavPath = resolveAcademyBakeWavPath(job.courseSlug, job.lessonKey);
    const mp3Path = academyLessonAudioReleaseDiskPath(job.courseSlug, job.lessonKey);
    if (!wavPath) {
      if (existsSync(mp3Path)) {
        skipped += 1;
        process.stdout.write(`  atlandı (WAV yok, MP3 var): ${job.lessonKey}\n`);
        return;
      }
      throw new Error(`WAV yok: ${job.courseSlug}/${job.lessonKey}`);
    }
    if (existsSync(mp3Path) && statSync(mp3Path).mtimeMs >= statSync(wavPath).mtimeMs) {
      skipped += 1;
      process.stdout.write(`  atlandı (MP3 güncel): ${job.lessonKey}\n`);
      return;
    }
    transcodeAcademyWavToMp3(wavPath, mp3Path);
    converted += 1;
    const mb = (statSync(mp3Path).size / (1024 * 1024)).toFixed(1);
    process.stdout.write(`  yazıldı ${mb} MB → ${job.courseSlug}/${job.lessonKey}.mp3\n`);
  });

  let totalBytes = 0;
  for (const job of jobs) {
    const mp3Path = academyLessonAudioReleaseDiskPath(job.courseSlug, job.lessonKey);
    if (!existsSync(mp3Path)) {
      throw new Error(`yayın MP3 yok: ${job.lessonKey}`);
    }
    if (!isAcademyMpegAudioBuffer(readFileSync(mp3Path))) {
      throw new Error(`MP3 başlığı bozuk: ${job.lessonKey}`);
    }
    totalBytes += statSync(mp3Path).size;
  }
  if (totalBytes > ACADEMY_SEALED_AUDIO_DEPLOY_MAX_BYTES) {
    throw new Error(
      `MP3 bütçesi aşıldı: ${totalBytes} > ${ACADEMY_SEALED_AUDIO_DEPLOY_MAX_BYTES}`,
    );
  }
  process.stdout.write(
    `academy-audio transcode OK — ${converted} yazıldı, ${skipped} atlandı, ${(totalBytes / (1024 * 1024)).toFixed(1)} MB / ${(ACADEMY_SEALED_AUDIO_DEPLOY_MAX_BYTES / (1024 * 1024)).toFixed(0)} MB tavan\n`,
  );
}

function isExecutedDirectly(): boolean {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return import.meta.url === pathToFileURL(resolve(entry)).href;
}

if (isExecutedDirectly()) {
  void main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`academy-audio transcode FAIL — ${message}\n`);
    process.exit(1);
  });
}
