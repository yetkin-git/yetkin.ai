#!/usr/bin/env tsx
/**
 * 01_office_ai-5 — HOŞ GELDİN nefes dilimindeki 235 sn ölü sessizliği keser.
 * Yeni Gemini TTS harcaması yok; konuşma PCM’i durur. Timing + cue + yayın MP3 yeniden mühürlenir.
 *
 *   npx tsx scripts/repair-office-ai-05-silence-hole.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { extractPcmFromWav, pcmWavDurationSec, wrapPcmAsWav } from "@/lib/kernel/ai/pcm-wav";
import type { AcademySealedAudioPiece, AcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { academyLessonAudioDiskPath, academyLessonAudioReleaseDiskPath } from "@/lib/academy/media-release-seal";
import { transcodeAcademyWavToMp3 } from "./transcode-academy-lesson-audio";
import timingsJson from "../lib/academy/lesson-audio-timings/01_office_ai-5.json" with { type: "json" };

const COURSE_SLUG = "01_office_ai";
const LESSON_KEY = "01_office_ai-5";
const VOICE_RMS = 400;
const MAX_HOLE_KEEP_RATIO = 2.4;

function round3Sec(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function parseWavHeader(wav: Buffer): { sampleRate: number; channels: number; bits: number } {
  let offset = 12;
  let sampleRate = 0;
  let channels = 0;
  let bits = 0;
  while (offset + 8 <= wav.length) {
    const id = wav.toString("ascii", offset, offset + 4);
    const size = wav.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (id === "fmt " && size >= 16 && start + 16 <= wav.length) {
      channels = wav.readUInt16LE(start + 2);
      sampleRate = wav.readUInt32LE(start + 4);
      bits = wav.readUInt16LE(start + 14);
      break;
    }
    offset = start + size + (size % 2);
  }
  if (!(sampleRate > 0) || channels !== 1 || bits !== 16) {
    throw new Error(`Beklenen 48 kHz mono 16-bit WAV değil: rate=${sampleRate} ch=${channels} bits=${bits}`);
  }
  return { sampleRate, channels, bits };
}

function rmsAt(pcm: Buffer, sampleRate: number, sec: number, winSec: number): number {
  const bytesPerSample = 2;
  const start = Math.max(0, Math.floor(sec * sampleRate) * bytesPerSample);
  const n = Math.max(1, Math.floor(winSec * sampleRate));
  let sum = 0;
  let count = 0;
  for (let i = 0; i < n && start + i * bytesPerSample + 1 < pcm.length; i += 1) {
    const sample = pcm.readInt16LE(start + i * bytesPerSample);
    sum += sample * sample;
    count += 1;
  }
  return count ? Math.sqrt(sum / count) : 0;
}

function lastVoiceSec(pcm: Buffer, sampleRate: number, fromSec: number, toSec: number): number {
  let last = fromSec;
  for (let t = fromSec; t < toSec; t += 0.05) {
    if (rmsAt(pcm, sampleRate, t, 0.05) >= VOICE_RMS) {
      last = t;
    }
  }
  return round3Sec(last);
}

function slicePcm(pcm: Buffer, sampleRate: number, startSec: number, endSec: number): Buffer {
  const start = Math.max(0, Math.floor(startSec * sampleRate) * 2);
  const end = Math.max(start, Math.min(pcm.length, Math.floor(endSec * sampleRate) * 2));
  return pcm.subarray(start, end);
}

function overlayCueTimes(timings: AcademySealedAudioTimings): void {
  const cueRelative = join("lib", "academy", "lesson-cues", `${LESSON_KEY}.json`);
  const cuePath = join(process.cwd(), cueRelative);
  const parsed: unknown = JSON.parse(readFileSync(cuePath, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error("cue JSON dizi değil");
  }
  const cues = parsed as Array<Record<string, unknown>>;
  for (const cue of cues) {
    const group = timings.pieces.filter((piece) => piece.cueId === cue.id);
    if (group.length === 0) {
      continue;
    }
    cue.start = group[0]!.start;
    cue.end = group[group.length - 1]!.end;
  }
  writeFileSync(cuePath, `${JSON.stringify(cues, null, 2)}\n`);
  process.stdout.write(`  cue saatleri mühürlendi → ${cueRelative}\n`);
  const docsRelative = join("docs", "curriculum", "01_office_ai_05_cue.json");
  const docsPath = join(process.cwd(), docsRelative);
  if (!existsSync(docsPath)) {
    process.stdout.write(`  curriculum türetilmiş kopya yok, atlandı → ${docsRelative}\n`);
    return;
  }
  const docsRaw: unknown = JSON.parse(readFileSync(docsPath, "utf8"));
  const docs = docsRaw && typeof docsRaw === "object" ? (docsRaw as Record<string, unknown>) : {};
  docs.derived = true;
  docs.role = "generated-copy";
  docs.speechSource = `lib/academy/spoken-scripts/${LESSON_KEY}.md`;
  docs.clockSource = cueRelative.replace(/\\/gu, "/");
  docs.durationSec = timings.durationSec;
  docs.cues = cues;
  docs.pieces = timings.pieces;
  writeFileSync(docsPath, `${JSON.stringify(docs, null, 2)}\n`);
  process.stdout.write(`  curriculum türetilmiş kopya → ${docsRelative}\n`);
}

function main(): void {
  const timings = timingsJson as AcademySealedAudioTimings;
  const holePiece = timings.pieces[1];
  if (!holePiece || holePiece.cueId !== "cue-02") {
    throw new Error("01_office_ai-5 parça 1 HOŞ GELDİN değil");
  }
  const wavPath = academyLessonAudioDiskPath(COURSE_SLUG, LESSON_KEY);
  const mp3Path = academyLessonAudioReleaseDiskPath(COURSE_SLUG, LESSON_KEY);
  const wav = readFileSync(wavPath);
  const { sampleRate } = parseWavHeader(wav);
  const pcm = extractPcmFromWav(wav);
  const durationSec = pcmWavDurationSec(wav);
  const pauseSec = timings.pauseSec > 0 ? timings.pauseSec : 0.4;
  const nextPiece = timings.pieces[2];
  if (!nextPiece) {
    throw new Error("parça 2 yok");
  }
  const lastVoice = lastVoiceSec(pcm, sampleRate, holePiece.start, holePiece.end);
  const spokenSec = lastVoice - holePiece.start;
  const inflatedSec = holePiece.end - holePiece.start;
  if (!(spokenSec > 8) || inflatedSec <= spokenSec * MAX_HOLE_KEEP_RATIO) {
    process.stdout.write(
      `onarım gerekmez: parça1 konuşma=${spokenSec.toFixed(3)}s ham=${inflatedSec.toFixed(3)}s lastVoice=${lastVoice}\n`,
    );
    return;
  }
  const cutStart = round3Sec(lastVoice + pauseSec);
  const cutEnd = nextPiece.start;
  const cutLen = round3Sec(cutEnd - cutStart);
  if (!(cutLen > 30)) {
    throw new Error(`kesilecek delik çok kısa: ${cutLen}s`);
  }
  const head = slicePcm(pcm, sampleRate, 0, cutStart);
  const tail = slicePcm(pcm, sampleRate, cutEnd, durationSec);
  const repaired = wrapPcmAsWav(Buffer.concat([head, tail]), sampleRate, 1, 16);
  const newDuration = round3Sec(pcmWavDurationSec(repaired));
  const expectedDuration = round3Sec(cutStart + (durationSec - cutEnd));
  if (Math.abs(newDuration - expectedDuration) > 0.02) {
    throw new Error(`WAV süre uyuşmaz: new=${newDuration} expected=${expectedDuration}`);
  }
  const pieces: AcademySealedAudioPiece[] = timings.pieces.map((piece, index) => {
    if (index === 1) {
      return { ...piece, end: lastVoice };
    }
    if (index >= 2) {
      return {
        ...piece,
        start: round3Sec(piece.start - cutLen),
        end: round3Sec(piece.end - cutLen),
      };
    }
    return piece;
  });
  const lastEnd = pieces.at(-1)?.end ?? 0;
  if (Math.abs(lastEnd - newDuration) > 0.02) {
    throw new Error(`son perde WAV’a oturmadı: last=${lastEnd} wav=${newDuration}`);
  }
  const next: AcademySealedAudioTimings = {
    lessonKey: LESSON_KEY,
    pauseSec,
    durationSec: newDuration,
    cacheV: Math.max(1, Math.round(newDuration * 1000)),
    pieces,
  };
  mkdirSync(dirname(wavPath), { recursive: true });
  writeFileSync(wavPath, repaired);
  const timingsRelative = join("lib", "academy", "lesson-audio-timings", `${LESSON_KEY}.json`);
  writeFileSync(join(process.cwd(), timingsRelative), `${JSON.stringify(next, null, 2)}\n`);
  overlayCueTimes(next);
  transcodeAcademyWavToMp3(wavPath, mp3Path);
  process.stdout.write(
    `onarım OK — hole=${cutLen}s lastVoice=${lastVoice} duration ${durationSec.toFixed(3)}→${newDuration} cacheV=${next.cacheV}\n`,
  );
  process.stdout.write(`  WAV ${repaired.byteLength} bayt → ${wavPath}\n`);
  process.stdout.write(`  MP3 yazıldı → ${mp3Path}\n`);
  process.stdout.write(`  timings → ${timingsRelative}\n`);
  for (const piece of pieces) {
    process.stdout.write(
      `    p${piece.index} ${piece.cueId} ${piece.start}–${piece.end} (${(piece.end - piece.start).toFixed(3)}s)\n`,
    );
  }
}

main();
