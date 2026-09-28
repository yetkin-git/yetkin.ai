/**
 * Akademi konuşma seviyesi — EBU R128.
 * Konuşma parçası ffmpeg `atempo=0.93` (WSOLA) ve loudnorm görür.
 * Birleşik zaman çizelgesi atempo almaz; es payı pedagoji süresinde kalır.
 * `tempoStretchPcmWav` yasaktır.
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);

export const ACADEMY_LOUDNORM_I = -16;
export const ACADEMY_LOUDNORM_TP = -1.5;
export const ACADEMY_LOUDNORM_LRA = 11;

/** Tek geçiş EBU R128. Fırın kazancı budur; tanh kırpıcı değildir. */
export const ACADEMY_LOUDNORM_FILTER =
  `loudnorm=I=${ACADEMY_LOUDNORM_I}:TP=${ACADEMY_LOUDNORM_TP}:LRA=${ACADEMY_LOUDNORM_LRA}`;

/** Konuşma parçası WSOLA. Birleşik ders zaman çizelgesine uygulanmaz. */
export const ACADEMY_BAKE_ATEMPO = 0.93 as const;

function ffmpegBinary(): string {
  const ffmpegPath = require("ffmpeg-static") as string | null;
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static ikili yok; npm ci / ffmpeg-static kur.");
  }
  return ffmpegPath;
}

function runFfmpeg(args: string[]): { status: number | null; stderr: string } {
  const result = spawnSync(ffmpegBinary(), args, { stdio: ["ignore", "pipe", "pipe"] });
  return { status: result.status, stderr: result.stderr?.toString("utf8") ?? "" };
}

export type AcademySpeechMasterOptions = {
  /** Konuşma parçasında WSOLA. Birleşik zaman çizelgesinde `false`. */
  atempo?: boolean;
};

/**
 * 48 kHz mono PCM16 + EBU R128. Tarak filtresi ve tanh yok.
 * `atempo` açıksa ffmpeg WSOLA `atempo=0.93` loudnorm'dan önce gelir.
 * soxr yoksa swr `aresample` yedeği aynı seviyeyi basar.
 */
export function masterAcademySpeechWav(
  wav: Buffer,
  options?: AcademySpeechMasterOptions,
): Buffer {
  const applyAtempo = options?.atempo ?? true;
  const tempo = applyAtempo ? `atempo=${ACADEMY_BAKE_ATEMPO},` : "";
  const dir = mkdtempSync(join(tmpdir(), "yetkin-tts-"));
  const input = join(dir, "in.wav");
  const output = join(dir, "out.wav");
  try {
    writeFileSync(input, wav);
    const filters = [
      `${tempo}${ACADEMY_LOUDNORM_FILTER},aresample=48000:resampler=soxr`,
      `${tempo}${ACADEMY_LOUDNORM_FILTER},aresample=48000`,
    ];
    let lastError = "loudnorm fail";
    for (const filter of filters) {
      const result = runFfmpeg([
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        input,
        "-af",
        filter,
        "-ar",
        "48000",
        "-ac",
        "1",
        "-c:a",
        "pcm_s16le",
        output,
      ]);
      if (result.status === 0) {
        return readFileSync(output);
      }
      lastError = result.stderr.trim() || `exit ${result.status}`;
    }
    throw new Error(`ffmpeg loudnorm FAIL: ${lastError}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** İkinci loudnorm geçişinin `input_i` değeri — işlenmiş dosyanın bütünleşik LUFS'u. */
export function measureIntegratedLufs(wav: Buffer): number {
  const dir = mkdtempSync(join(tmpdir(), "yetkin-lufs-"));
  const input = join(dir, "in.wav");
  try {
    writeFileSync(input, wav);
    const result = runFfmpeg([
      "-hide_banner",
      "-nostats",
      "-i",
      input,
      "-af",
      `${ACADEMY_LOUDNORM_FILTER}:print_format=json`,
      "-f",
      "null",
      "-",
    ]);
    const match = result.stderr.match(/\{[\s\S]*"input_i"[\s\S]*?\}/);
    if (!match) {
      throw new Error(`LUFS ölçülemedi: ${result.stderr.slice(0, 240)}`);
    }
    const parsed = JSON.parse(match[0]) as { input_i?: string };
    const lufs = Number(parsed.input_i);
    if (!Number.isFinite(lufs)) {
      throw new Error("LUFS sayı değil.");
    }
    return lufs;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
