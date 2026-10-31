/**
 * 01_office_ai-1 konuşma WAV'ından kelime saati.
 * Parça start/end, metin, durationSec ve cacheV değişmez. Ses dosyası yazılmaz.
 * Sessizlik kelimeye yayılmaz. WAV yoksa veya süre kütüğü tutmazsa dosya yazılmaz.
 *
 *   npx tsx scripts/bake-academy-acoustic-words.ts
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  parseAcademySealedAudioTimings,
  type AcademySealedAudioPiece,
  type AcademySealedAudioWord,
} from "@/lib/academy/lesson-audio-timings";
import { academyLessonAudioDiskPath } from "@/lib/academy/media-release-seal";
import { applyAcademySpokenPhoneticsToDisplay } from "@/lib/academy/spoken-scripts/phonetics";
import {
  academyKaraokeNormalizeLine,
  academyKaraokeReconstructLine,
  academyKaraokeStripLines,
  academyKaraokeWords,
  type AcademyTeleprompterLine,
} from "@/lib/academy/lesson-teleprompter-flow";
import { alignWordsByAcoustics, JUNIOR_SYNC_SILENCE } from "@/lib/junior/pilot-engine/word-aligner";
import { decodeAudioToMonoPcm, JUNIOR_ANALYSIS_SAMPLE_RATE, pcmDurationMs } from "./junior-audio-pcm";

const ROOT = process.cwd();
const LESSON_KEY = "01_office_ai-1";
const COURSE_SLUG = "01_office_ai";
const MIN_GAP_SEC = JUNIOR_SYNC_SILENCE.minSilenceMs / 1000;

function assertNoExtraArgs(argv: readonly string[]): void {
  if (argv.length > 0) {
    throw new Error("Bu fırın yalnız 01_office_ai-1 konuşma WAV'ını okur. Başka anahtar kapalıdır.");
  }
}

function speechTokens(text: string): string[] {
  return text.replace(/\s+/gu, " ").trim().split(" ").filter((token) => token.length > 0);
}

function roundSpeechSec(ms: number): number {
  return Math.round(ms) / 1000;
}

function sealPieceWords(
  piece: AcademySealedAudioPiece,
  samples: Int16Array,
): readonly AcademySealedAudioWord[] {
  const tokens = speechTokens(piece.text);
  if (tokens.length === 0) {
    throw new Error(`Parça ${piece.index} metni boş. Kelime yazılmadı.`);
  }
  const windowStartMs = Math.round(piece.start * 1000);
  const windowEndMs = Math.round(piece.end * 1000);
  if (windowEndMs <= windowStartMs) {
    throw new Error(`Parça ${piece.index} penceresi yok. Kelime yazılmadı.`);
  }
  const aligned = alignWordsByAcoustics(
    tokens,
    samples,
    JUNIOR_ANALYSIS_SAMPLE_RATE,
    windowStartMs,
    windowEndMs,
  );
  if (aligned.length !== tokens.length) {
    throw new Error(`Parça ${piece.index} hizalaması kelime sayısını değiştirdi. Dosya yazılmadı.`);
  }
  const words: AcademySealedAudioWord[] = [];
  for (let index = 0; index < aligned.length; index += 1) {
    const token = tokens[index];
    const row = aligned[index];
    if (!token || !row || row.word !== token) {
      throw new Error(`Parça ${piece.index} token sırası bozuldu. Dosya yazılmadı.`);
    }
    const start = roundSpeechSec(row.startMs);
    const end = roundSpeechSec(row.endMs);
    if (start < piece.start || end > piece.end || end < start) {
      throw new Error(
        `Parça ${piece.index} «${token}» ${start}–${end} parça ${piece.start}–${piece.end} dışında. Dosya yazılmadı.`,
      );
    }
    const previous = words[index - 1];
    if (previous && start < previous.end) {
      throw new Error(`Parça ${piece.index} kelimeleri üst üste biniyor. Dosya yazılmadı.`);
    }
    if (previous) {
      const rawGap = (row.startMs - aligned[index - 1]!.endMs) / 1000;
      const keptGap = start - previous.end;
      if (rawGap >= MIN_GAP_SEC && keptGap < rawGap - 0.02) {
        throw new Error(`Parça ${piece.index} sessizliği kelimeye yayıldı. Dosya yazılmadı.`);
      }
    }
    words.push({ text: token, start, end });
  }
  if (words.map((word) => word.text).join(" ") !== speechTokens(piece.text).join(" ")) {
    throw new Error(`Parça ${piece.index} metni kelime dizisiyle örtüşmüyor. Dosya yazılmadı.`);
  }
  const display = applyAcademySpokenPhoneticsToDisplay(piece.text.trim());
  const line: AcademyTeleprompterLine = {
    id: `${piece.cueId}:${piece.cueParagraphIndex}:${piece.chunkIndex}:${piece.index}`,
    cueId: piece.cueId,
    section: "",
    text: display,
    start: piece.start,
    end: piece.end,
    words,
  };
  const chips = academyKaraokeWords(line);
  if (academyKaraokeReconstructLine(chips) !== academyKaraokeNormalizeLine(display)) {
    throw new Error(`Parça ${piece.index} ekran kilidi tutmadı. Dosya yazılmadı.`);
  }
  const strip = academyKaraokeStripLines([line]);
  for (const row of strip) {
    if (!row.words || row.words.length === 0) {
      throw new Error(`Parça ${piece.index} cümle saati kelime dizisini düşürdü. Dosya yazılmadı.`);
    }
    const rowChips = academyKaraokeWords(row);
    if (academyKaraokeReconstructLine(rowChips) !== academyKaraokeNormalizeLine(row.text)) {
      throw new Error(`Parça ${piece.index} cümle ekranı tutmadı. Dosya yazılmadı.`);
    }
  }
  return words;
}

function main(): void {
  assertNoExtraArgs(process.argv.slice(2));
  const wavPath = academyLessonAudioDiskPath(COURSE_SLUG, LESSON_KEY, ROOT);
  if (!existsSync(wavPath)) {
    throw new Error(
      `Konuşma WAV yok: ${wavPath}. Kelime saati yazılmadı. Yayın MP3 hard-mix'tir; yatak ve 3 sn adelay kelime sınırını kaydırır.`,
    );
  }
  const timingsPath = join(ROOT, "lib", "academy", "lesson-audio-timings", `${LESSON_KEY}.json`);
  const parsed = parseAcademySealedAudioTimings(JSON.parse(readFileSync(timingsPath, "utf8")) as unknown);
  if (!parsed || parsed.lessonKey !== LESSON_KEY || parsed.pieces.length === 0) {
    throw new Error("Zaman kütüğü okunamadı. Kelime yazılmadı.");
  }
  if (parsed.pieces[0]?.start !== 2) {
    throw new Error("İlk parça 2.000 sn değil. Hizalama açılmadı.");
  }
  process.stdout.write(`${LESSON_KEY} PCM okunuyor → ${wavPath}\n`);
  const samples = decodeAudioToMonoPcm(wavPath, JUNIOR_ANALYSIS_SAMPLE_RATE);
  const durationMs = pcmDurationMs(samples, JUNIOR_ANALYSIS_SAMPLE_RATE);
  const expectedMs = Math.round(parsed.durationSec * 1000);
  if (Math.abs(durationMs - expectedMs) > 40) {
    throw new Error(`WAV süresi ${durationMs} ms, kütük ${expectedMs} ms. Kelime yazılmadı.`);
  }
  const pieces = parsed.pieces.map((piece, index) => {
    process.stdout.write(`${LESSON_KEY} parça ${index + 1}/${parsed.pieces.length} hizalanıyor\n`);
    return { ...piece, words: sealPieceWords(piece, samples) };
  });
  const body = {
    lessonKey: parsed.lessonKey,
    pauseSec: parsed.pauseSec,
    durationSec: parsed.durationSec,
    cacheV: parsed.cacheV,
    pieces: pieces.map((piece) => ({
      index: piece.index,
      cueId: piece.cueId,
      cueParagraphIndex: piece.cueParagraphIndex,
      chunkIndex: piece.chunkIndex,
      start: piece.start,
      end: piece.end,
      text: piece.text,
      words: piece.words,
    })),
  };
  writeFileSync(timingsPath, `${JSON.stringify(body, null, 2)}\n`, "utf8");
  const words = pieces.reduce((sum, piece) => sum + piece.words.length, 0);
  process.stdout.write(`${LESSON_KEY} kelime saati yazıldı → ${timingsPath} kelime=${words}\n`);
}

main();
