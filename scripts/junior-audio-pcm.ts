import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Zarf ve sessizlik ölçümü için yeterli bant. Oynatıcının çaldığı dosya çözülür. */
export const JUNIOR_ANALYSIS_SAMPLE_RATE = 16_000;

/** MP3 veya WAV dosyasını tek kanal 16 bit PCM'e çözer. */
export function decodeAudioToMonoPcm(path: string, sampleRate = JUNIOR_ANALYSIS_SAMPLE_RATE): Int16Array {
  if (!existsSync(path)) {
    throw new Error(`Ses dosyası yok: ${path}`);
  }
  const ffmpegPath = require("ffmpeg-static") as string | null;
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static ikili yok; ses çözülemedi.");
  }
  const result = spawnSync(
    ffmpegPath,
    ["-hide_banner", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", String(sampleRate), "-f", "s16le", "pipe:1"],
    { maxBuffer: 1024 * 1024 * 1024 },
  );
  if (result.status !== 0 || !result.stdout) {
    throw new Error(`Ses çözülemedi: ${path} ${String(result.stderr ?? "").slice(0, 200)}`);
  }
  const bytes = Buffer.from(result.stdout);
  const samples = new Int16Array(Math.floor(bytes.length / 2));
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = bytes.readInt16LE(index * 2);
  }
  return samples;
}

export function pcmDurationMs(samples: Int16Array, sampleRate = JUNIOR_ANALYSIS_SAMPLE_RATE): number {
  return Math.round((samples.length / sampleRate) * 1000);
}
