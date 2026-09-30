/**
 * EC-102 disk denetimi. API çağırmaz.
 * Yayın MP3, sinema JPEG, Zephyr mührü ve ders 1 perde yüksekliği.
 *   npx tsx scripts/verify-ec102-live-media.ts
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { academyCourseVoiceSeal } from "@/lib/academy/instructors";
import { ACADEMY_EC102_CINEMA_CACHE_V, academyCinemaCueSlidePublicPath } from "@/lib/academy/lesson-visual-stage";
import { academyLessonAudioPlaybackSrc } from "@/lib/academy/lesson-audio";
import "@/lib/academy/lesson-json-disk";

const ROOT = process.cwd();
const AUDIO_DIR = join(ROOT, "public", "media", "academy", "audio", "02_ecommerce_ai");
const CINEMA_DIR = join(ROOT, "public", "academy", "cinema");
const WAV = join(ROOT, "media-bake", "academy", "audio", "02_ecommerce_ai", "02_ecommerce_ai-1.wav");

function stamp(ms: number): string {
  return new Date(ms).toLocaleString("sv-SE", { timeZone: "Europe/Istanbul", hour12: false });
}

function magic(path: string): string {
  const bytes = readFileSync(path).subarray(0, 3);
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return "jpeg";
  }
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return "id3-mp3";
  }
  if (bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0) {
    return "mp3";
  }
  return `bilinmiyor ${bytes.toString("hex")}`;
}

function medianF0(path: string): { medianHz: number; frames: number } {
  const buf = readFileSync(path);
  let off = 12;
  let rate = 0;
  let channels = 0;
  let bits = 0;
  let dataOff = 0;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "fmt ") {
      channels = buf.readUInt16LE(off + 10);
      rate = buf.readUInt32LE(off + 12);
      bits = buf.readUInt16LE(off + 22);
    } else if (id === "data") {
      dataOff = off + 8;
      break;
    }
    off += 8 + size + (size % 2);
  }
  const bytesPer = channels * (bits / 8);
  const startSec = 20;
  const durSec = 8;
  const n = Math.floor(durSec * rate);
  const step = 4;
  const dsRate = rate / step;
  const ds = new Float64Array(Math.floor(n / step));
  const start = dataOff + Math.floor(startSec * rate) * bytesPer;
  for (let i = 0; i < ds.length; i += 1) {
    ds[i] = buf.readInt16LE(start + i * step * bytesPer) / 32768;
  }
  const minF = 70;
  const maxF = 320;
  const minL = Math.floor(dsRate / maxF);
  const maxL = Math.floor(dsRate / minF);
  const win = Math.floor(dsRate * 0.04);
  const hop = Math.floor(dsRate * 0.02);
  const pitches: number[] = [];
  for (let cursor = 0; cursor + win + maxL < ds.length; cursor += hop) {
    let energy = 0;
    for (let i = 0; i < win; i += 1) {
      energy += ds[cursor + i]! * ds[cursor + i]!;
    }
    if (Math.sqrt(energy / win) < 0.02) {
      continue;
    }
    let best = -1;
    let bestLag = minL;
    for (let lag = minL; lag <= maxL; lag += 1) {
      let corr = 0;
      for (let i = 0; i < win; i += 1) {
        corr += ds[cursor + i]! * ds[cursor + i + lag]!;
      }
      if (corr > best) {
        best = corr;
        bestLag = lag;
      }
    }
    const freq = dsRate / bestLag;
    if (freq >= minF && freq <= maxF) {
      pitches.push(freq);
    }
  }
  pitches.sort((a, b) => a - b);
  return {
    medianHz: Math.round(pitches[Math.floor(pitches.length / 2)] ?? 0),
    frames: pitches.length,
  };
}

const seal = academyCourseVoiceSeal("02_ecommerce_ai");
process.stdout.write(
  `mühür ses=${seal.courseMasterVoice} cinsiyet=${seal.gender} sinemaDamga=${ACADEMY_EC102_CINEMA_CACHE_V}\n`,
);
process.stdout.write(`oynatıcı ${academyLessonAudioPlaybackSrc("02_ecommerce_ai", "02_ecommerce_ai-1")}\n`);
process.stdout.write(`kare ${academyCinemaCueSlidePublicPath("02_ecommerce_ai-1", "cue-01")}\n`);

const audioNames = readdirSync(AUDIO_DIR)
  .filter((name) => name.endsWith(".mp3") && !name.endsWith(".bed.mp3"))
  .sort();
for (const name of audioNames) {
  const path = join(AUDIO_DIR, name);
  const stat = statSync(path);
  process.stdout.write(
    `MP3 ${path} ${stat.size} ${stamp(stat.mtimeMs)} ${magic(path)}\n`,
  );
}

const jpgNames = readdirSync(CINEMA_DIR)
  .filter((name) => name.startsWith("02_ecommerce_ai-") && name.endsWith(".jpg"))
  .sort();
for (const name of jpgNames) {
  const path = join(CINEMA_DIR, name);
  const stat = statSync(path);
  process.stdout.write(
    `JPG ${path} ${stat.size} ${stamp(stat.mtimeMs)} ${magic(path)}\n`,
  );
}

const pitch = medianF0(WAV);
process.stdout.write(
  `perde ders1 20-28sn ortanca ${pitch.medianHz} Hz kare ${pitch.frames} kaynak ${WAV}\n`,
);
