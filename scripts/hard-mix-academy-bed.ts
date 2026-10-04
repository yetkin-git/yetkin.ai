#!/usr/bin/env tsx
/**
 * Lyria yatağını konuşma kasetinin içine FFmpeg ile mühürler.
 * Kaynak konuşma: bake WAV (`media-bake/academy/audio`). Yayın MP3'ü ikinci kez sıkılmaz.
 * Giriş yalnız müzik (crescendo, -20 dB → -8 dB). OFF-201 4.00 sn, OFF-101 3.00 sn.
 * Konuşma gecikmeli girer. Yatak 0.4 sn’de -18 dB’ye iner; sidechain tepeyi -20 dB bandına çeker.
 * Yatak döngüsü konuşma+giriş süresine kesilir. Ardından EBU R128.
 * Yeniden çalıştırma WAV'dan basar; miks üst üste binmez.
 *
 *   npx tsx scripts/hard-mix-academy-bed.ts
 *   npx tsx scripts/hard-mix-academy-bed.ts --slug=01_office_ai
 *   npx tsx scripts/hard-mix-academy-bed.ts --slug=01_office_ai --key=01_office_ai-1
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { ACADEMY_BED_HARD_MIX_LESSON_KEYS } from "@/lib/academy/lesson-audio";
import {
  ACADEMY_BED_HARD_MIX_DB,
  ACADEMY_BED_INTRO_DUCK_SEC,
  ACADEMY_BED_INTRO_FLOOR_DB,
  ACADEMY_BED_INTRO_PEAK_DB,
  academyBedDbToLinear,
  academyBedIntroSec,
} from "@/lib/academy/lesson-bed-duck";
import { ACADEMY_LOUDNORM_FILTER } from "@/lib/academy/tts-loudnorm";

const require = createRequire(import.meta.url);

const SLUG =
  process.argv.find((part) => part.startsWith("--slug="))?.slice("--slug=".length)?.trim() ||
  "01_office_ai_ileri";
const KEY = process.argv.find((part) => part.startsWith("--key="))?.slice("--key=".length)?.trim() || "";
const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public", "media", "academy", "audio", SLUG);
const WAV_DIR = join(ROOT, "media-bake", "academy", "audio", SLUG);
const SPEECH_MASTER_DIR = join(ROOT, "media-bake", "academy", "speech-master", SLUG);

const SIDECHAIN =
  "sidechaincompress=threshold=0.05:ratio=2.5:attack=20:release=450:makeup=1:knee=6:mix=0.65:level_sc=1";

function ffmpegBinary(): string {
  const ffmpegPath = require("ffmpeg-static") as string | null;
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static ikili yok.");
  }
  return ffmpegPath;
}

function filterGraph(intro: number): string {
  const duckSec = ACADEMY_BED_INTRO_DUCK_SEC;
  const introMs = Math.round(intro * 1000);
  const floor = academyBedDbToLinear(ACADEMY_BED_INTRO_FLOOR_DB);
  const peak = academyBedDbToLinear(ACADEMY_BED_INTRO_PEAK_DB);
  const duck = academyBedDbToLinear(ACADEMY_BED_HARD_MIX_DB);
  const ramp = [
    `if(lt(t\\,${intro})\\,${floor}+(${peak}-${floor})*(t/${intro})\\,`,
    `if(lt(t\\,${intro + duckSec})\\,${peak}+(${duck}-${peak})*((t-${intro})/${duckSec})\\,${duck}))`,
  ].join("");
  return [
    `[0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,adelay=${introMs}|${introMs},asplit=2[voice][sc]`,
    `[1:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume='${ramp}':eval=frame[bed]`,
    `[bed][sc]${SIDECHAIN}[ducked]`,
    `[voice][ducked]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,${ACADEMY_LOUDNORM_FILTER}[out]`,
  ].join(";");
}

function speechInput(lessonKey: string): string {
  const wav = join(WAV_DIR, `${lessonKey}.wav`);
  if (existsSync(wav)) {
    return wav;
  }
  mkdirSync(SPEECH_MASTER_DIR, { recursive: true });
  const master = join(SPEECH_MASTER_DIR, `${lessonKey}.mp3`);
  if (!existsSync(master)) {
    const published = join(PUBLIC_DIR, `${lessonKey}.mp3`);
    if (!existsSync(published)) {
      throw new Error(`konuşma yok: ${lessonKey}`);
    }
    copyFileSync(published, master);
  }
  return master;
}

function bumpCacheV(lessonKey: string, introSec: number): void {
  const path = join(ROOT, "lib", "academy", "lesson-audio-timings", `${lessonKey}.json`);
  const text = readFileSync(path, "utf8");
  const duration = Number(text.match(/"durationSec":\s*([\d.]+)/)?.[1]);
  const cacheV = Number(text.match(/"cacheV":\s*(\d+)/)?.[1]);
  if (!Number.isFinite(duration) || !Number.isFinite(cacheV)) {
    throw new Error(`cacheV okunamadı: ${lessonKey}`);
  }
  const stamp = Math.round((duration + introSec) * 1000);
  if (cacheV === stamp) {
    return;
  }
  writeFileSync(path, text.replace(/"cacheV":\s*\d+/u, `"cacheV": ${stamp}`));
}

function mixLesson(lessonKey: string): { bytes: number; speech: string; introSec: number } {
  const introSec = academyBedIntroSec(lessonKey);
  const speech = speechInput(lessonKey);
  const bed = join(PUBLIC_DIR, `${lessonKey}.bed.mp3`);
  const dest = join(PUBLIC_DIR, `${lessonKey}.mp3`);
  const temp = join(PUBLIC_DIR, `${lessonKey}.hardmix.tmp.mp3`);
  if (!existsSync(bed)) {
    throw new Error(`yatak yok: ${bed}`);
  }
  const result = spawnSync(
    ffmpegBinary(),
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      speech,
      "-stream_loop",
      "-1",
      "-i",
      bed,
      "-filter_complex",
      filterGraph(introSec),
      "-map",
      "[out]",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "320k",
      temp,
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  if (result.status !== 0) {
    const stderr = result.stderr?.toString("utf8").trim() ?? "";
    throw new Error(`${lessonKey} miks FAIL: ${stderr.slice(-500) || `exit ${result.status}`}`);
  }
  copyFileSync(temp, dest);
  unlinkSync(temp);
  bumpCacheV(lessonKey, introSec);
  return { bytes: statSync(dest).size, speech, introSec };
}

function measureLufs(filePath: string): string {
  const result = spawnSync(
    ffmpegBinary(),
    [
      "-hide_banner",
      "-nostats",
      "-i",
      filePath,
      "-af",
      `${ACADEMY_LOUDNORM_FILTER}:print_format=json`,
      "-f",
      "null",
      "-",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  const stderr = result.stderr?.toString("utf8") ?? "";
  const match = stderr.match(/"input_i"\s*:\s*"(-?[\d.]+)"/);
  return match?.[1] ?? "ölçülemedi";
}

const rows: string[] = [];
const lessonKeys = ACADEMY_BED_HARD_MIX_LESSON_KEYS.filter((lessonKey) =>
  lessonKey.startsWith(`${SLUG}-`) && (KEY.length === 0 || lessonKey === KEY),
);
if (lessonKeys.length === 0) {
  throw new Error(`hard-mix dersi yok: ${SLUG}`);
}
for (const lessonKey of lessonKeys) {
  process.stdout.write(`miks ${lessonKey}\n`);
  const mixed = mixLesson(lessonKey);
  const lufs = measureLufs(join(PUBLIC_DIR, `${lessonKey}.mp3`));
  const line = `${lessonKey}  ${mixed.bytes} bayt  LUFS ${lufs}  giriş ${mixed.introSec.toFixed(2)}s  konuşma ${mixed.speech}`;
  rows.push(line);
  process.stdout.write(`${line}\n`);
}

process.stdout.write(`HARD-MIX ${rows.length} ders\n`);
