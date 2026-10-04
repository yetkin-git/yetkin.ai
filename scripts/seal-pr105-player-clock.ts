/**
 * PR-105 oynatıcı saati.
 * Parça önbelleğindeki WAV süreleri ve fırındaki 0.4 sn sessizlik, slayt geçişini kilitler.
 * Görsel API yok. Yazmak için --write.
 *
 *   npx tsx scripts/seal-pr105-player-clock.ts
 *   npx tsx scripts/seal-pr105-player-clock.ts --write
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PR105_CINEMA_LESSONS } from "@/lib/academy/curricula/pr-105/cinema-slides";
import { PR105_SECTION_MAP } from "@/lib/academy/curricula/pr-105/sections";
import { cleanAcademySpokenTextForTts } from "@/lib/academy/lesson-body";
import { ACADEMY_TTS_PARAGRAPH_PAUSE_SEC } from "@/lib/academy/media-release-seal";
import { expandAcademyTtsSkipPreventer } from "@/lib/academy/spoken-scripts";
import {
  academyLessonRequestTargetForCourse,
  packAcademyTtsLessonRequests,
  splitAcademyTtsBreathChunks,
} from "@/lib/academy/tts-breath-chunks";
import { pcmWavDurationSec } from "@/lib/kernel/ai/pcm-wav";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;

const ROOT = process.cwd();
const SENTENCE_BOUNDARY = /(?<=(?<!\d)\.|[!?…])\s+/u;
const PAUSE_SEC = ACADEMY_TTS_PARAGRAPH_PAUSE_SEC;

type TaggedParagraph = {
  cueIndex: number;
  paragraphIndex: number;
  text: string;
};

type TaggedAtom = TaggedParagraph & { text: string };

type CueSegment = {
  cueIndex: number;
  paragraphIndex: number;
  text: string;
};

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function normalize(text: string): string {
  return text.replace(/\s+/gu, " ").trim();
}

function spokenParts(markdown: string): string[] {
  const stripped = markdown
    .replace(/<!--[\s\S]*?-->/gu, "\n\n")
    .replace(/^#{1,6}\s+.*$/gmu, "")
    .replace(/\*\*([^*]+)\*\*/gu, "$1")
    .replace(/\*([^*]+)\*/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1");
  return stripped
    .split(/\n\n+/u)
    .map((part) =>
      cleanAcademySpokenTextForTts(expandAcademyTtsSkipPreventer(part.replace(/[^\S\n]+/gu, " ").trim())),
    )
    .filter((part) => part.length > 0);
}

function paragraphsWithCue(markdown: string): TaggedParagraph[] {
  const chunks = markdown.trim().split(/^## /mu);
  const rows: TaggedParagraph[] = [];
  chunks.forEach((chunk, cueIndex) => {
    const body = cueIndex === 0 ? chunk : chunk.replace(/^[^\n]*\n/u, "");
    const parts = spokenParts(body);
    parts.forEach((text, paragraphIndex) => {
      rows.push({ cueIndex, paragraphIndex, text });
    });
  });
  const flat = spokenParts(markdown);
  if (rows.length !== flat.length || rows.some((row, index) => row.text !== flat[index])) {
    throw new Error("Başlık bölmesi konuşma paragraflarını kaydırdı.");
  }
  return rows;
}

function pieceWavs(sectionNumber: number): string[] {
  const dir = join(ROOT, "media-bake", "academy", "piece-cache", "pr-105", `section_${sectionNumber}`);
  const newest = new Map<string, string>();
  for (const name of readdirSync(dir)) {
    const match = /^(\d{2})-.+\.wav$/u.exec(name);
    if (!match) continue;
    const index = match[1]!;
    const previous = newest.get(index);
    if (!previous) {
      newest.set(index, name);
      continue;
    }
    const previousStamp = statSync(join(dir, previous)).mtimeMs;
    const nextStamp = statSync(join(dir, name)).mtimeMs;
    if (nextStamp >= previousStamp) newest.set(index, name);
  }
  return [...newest.keys()].sort().map((index) => join(dir, newest.get(index)!));
}

function splitSentences(text: string): string[] {
  return normalize(text)
    .split(SENTENCE_BOUNDARY)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

type ConsumeState = { atomIndex: number; offset: number };

function consumeRequest(requestText: string, atoms: readonly TaggedAtom[], state: ConsumeState): CueSegment[] {
  const request = normalize(requestText);
  let cursor = 0;
  const parts: Array<{ cueIndex: number; paragraphIndex: number; text: string }> = [];
  while (cursor < request.length) {
    const atom = atoms[state.atomIndex];
    if (!atom) {
      throw new Error(`İstek atom bitti: ${request.slice(cursor, cursor + 48)}`);
    }
    const available = atom.text.slice(state.offset);
    if (request.startsWith(available, cursor)) {
      parts.push({ cueIndex: atom.cueIndex, paragraphIndex: atom.paragraphIndex, text: available });
      cursor += available.length;
      state.atomIndex += 1;
      state.offset = 0;
      if (request[cursor] === " ") cursor += 1;
      continue;
    }
    if (available.startsWith(request.slice(cursor))) {
      const take = request.slice(cursor);
      parts.push({ cueIndex: atom.cueIndex, paragraphIndex: atom.paragraphIndex, text: take });
      state.offset += take.length;
      if (atom.text[state.offset] === " ") state.offset += 1;
      cursor = request.length;
      continue;
    }
    throw new Error(
      `İstek atomla örtüşmedi: istek="${request.slice(cursor, cursor + 60)}" atom="${available.slice(0, 60)}"`,
    );
  }
  const segments: CueSegment[] = [];
  for (const part of parts) {
    const last = segments.at(-1);
    if (last && last.cueIndex === part.cueIndex && last.paragraphIndex === part.paragraphIndex) {
      last.text = `${last.text} ${part.text}`.replace(/\s+/gu, " ").trim();
      continue;
    }
    if (last && last.cueIndex === part.cueIndex) {
      last.text = `${last.text} ${part.text}`.replace(/\s+/gu, " ").trim();
      continue;
    }
    segments.push({ cueIndex: part.cueIndex, paragraphIndex: part.paragraphIndex, text: part.text });
  }
  return segments;
}

type Silence = { start: number; end: number };

function detectSilences(wavPath: string): Silence[] {
  if (!ffmpegPath) throw new Error("ffmpeg-static yok.");
  const result = spawnSync(
    ffmpegPath,
    ["-hide_banner", "-i", wavPath, "-af", "silencedetect=noise=-32dB:d=0.18", "-f", "null", "-"],
    { encoding: "utf8" },
  );
  const log = `${result.stderr ?? ""}\n${result.stdout ?? ""}`;
  const silences: Silence[] = [];
  let pending: number | null = null;
  for (const line of log.split(/\r?\n/u)) {
    const start = line.match(/silence_start:\s*(-?\d+(?:\.\d+)?)/u);
    if (start) {
      pending = Number(start[1]);
      continue;
    }
    const end = line.match(/silence_end:\s*(-?\d+(?:\.\d+)?)/u);
    if (end && pending != null) {
      const endSec = Number(end[1]);
      if (endSec > pending) silences.push({ start: pending, end: endSec });
      pending = null;
    }
  }
  return silences;
}

function speechAtoms(winStart: number, winEnd: number, silences: Silence[]): Array<{ start: number; end: number }> {
  const cuts = [winStart, winEnd];
  for (const silence of silences) {
    if (silence.end <= winStart || silence.start >= winEnd) continue;
    cuts.push(Math.max(silence.start, winStart), Math.min(silence.end, winEnd));
  }
  cuts.sort((left, right) => left - right);
  const atoms: Array<{ start: number; end: number }> = [];
  for (let index = 0; index < cuts.length - 1; index += 1) {
    const start = cuts[index]!;
    const end = cuts[index + 1]!;
    if (end - start < 0.04) continue;
    const silent = silences.some((silence) => start >= silence.start - 0.02 && end <= silence.end + 0.02);
    if (!silent) atoms.push({ start, end });
  }
  return atoms;
}

function alignSentences(
  winStart: number,
  winEnd: number,
  sentences: string[],
  silences: Silence[],
): Array<{ start: number; end: number }> {
  if (sentences.length <= 1) return [{ start: winStart, end: winEnd }];
  const atoms = speechAtoms(winStart, winEnd, silences);
  if (atoms.length < sentences.length) {
    throw new Error(`Atom ${atoms.length} < cümle ${sentences.length}`);
  }
  const weights = sentences.map((sentence) => Math.max(1, sentence.length));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const prefix = [0];
  for (const atom of atoms) prefix.push(prefix[prefix.length - 1]! + (atom.end - atom.start));
  const totalSpeech = prefix[prefix.length - 1]!;
  const expected = weights.map((weight) => (totalSpeech * weight) / totalWeight);
  const sentenceCount = sentences.length;
  const atomCount = atoms.length;
  const INF = 1e15;
  const dp: number[][] = Array.from({ length: sentenceCount + 1 }, () => Array(atomCount + 1).fill(INF));
  const prev: number[][] = Array.from({ length: sentenceCount + 1 }, () => Array(atomCount + 1).fill(-1));
  dp[0]![0] = 0;
  for (let sentenceIndex = 1; sentenceIndex <= sentenceCount; sentenceIndex += 1) {
    for (let atomEnd = sentenceIndex; atomEnd <= atomCount; atomEnd += 1) {
      if (atomCount - atomEnd < sentenceCount - sentenceIndex) continue;
      let best = INF;
      let bestStart = -1;
      for (let atomStart = sentenceIndex - 1; atomStart < atomEnd; atomStart += 1) {
        const base = dp[sentenceIndex - 1]![atomStart]!;
        if (base >= INF / 2) continue;
        const duration = prefix[atomEnd]! - prefix[atomStart]!;
        const target = expected[sentenceIndex - 1]!;
        let cost = base + (duration - target) ** 2;
        if (duration < 0.25 && weights[sentenceIndex - 1]! > 12) cost += 1_000_000;
        if (cost < best) {
          best = cost;
          bestStart = atomStart;
        }
      }
      dp[sentenceIndex]![atomEnd] = best;
      prev[sentenceIndex]![atomEnd] = bestStart;
    }
  }
  if (dp[sentenceCount]![atomCount]! >= INF / 2) {
    throw new Error("Cümle atomlara oturmadı.");
  }
  const spans: Array<{ start: number; end: number }> = [];
  let atomEnd = atomCount;
  for (let sentenceIndex = sentenceCount; sentenceIndex >= 1; sentenceIndex -= 1) {
    const atomStart = prev[sentenceIndex]![atomEnd]!;
    spans.push({ start: atoms[atomStart]!.start, end: atoms[atomEnd - 1]!.end });
    atomEnd = atomStart;
  }
  spans.reverse();
  spans[0]!.start = winStart;
  spans[spans.length - 1]!.end = winEnd;
  return spans;
}

type PieceRow = {
  cueIndex: number;
  paragraphIndex: number;
  chunkIndex: number;
  start: number;
  end: number;
  text: string;
};

function lessonClock(sectionNumber: number): {
  lessonKey: string;
  title: string;
  pieces: PieceRow[];
  durationSec: number;
  wavSec: number;
  spans: number;
} {
  const section = PR105_SECTION_MAP[sectionNumber - 1];
  if (!section?.lessonKey) throw new Error(`Ders yok: ${sectionNumber}`);
  const paragraphs = paragraphsWithCue(section.contentMarkdown);
  const atoms: TaggedAtom[] = paragraphs.flatMap((paragraph) =>
    splitAcademyTtsBreathChunks(paragraph.text).map((text) => ({ ...paragraph, text })),
  );
  const target = academyLessonRequestTargetForCourse(PR105_SECTION_MAP.length);
  const requests = packAcademyTtsLessonRequests(
    atoms.map((atom) => atom.text),
    target,
  );
  const wavs = pieceWavs(sectionNumber);
  if (wavs.length !== requests.length) {
    throw new Error(`Ders ${sectionNumber} parça ${wavs.length} istek ${requests.length}`);
  }
  const state: ConsumeState = { atomIndex: 0, offset: 0 };
  const pieces: PieceRow[] = [];
  let cursor = 0;
  let spans = 0;
  for (let index = 0; index < requests.length; index += 1) {
    const segments = consumeRequest(requests[index]!.text, atoms, state);
    const wav = readFileSync(wavs[index]!);
    const pieceSec = pcmWavDurationSec(wav);
    if (!(pieceSec > 0)) throw new Error(`Parça süresi yok: ${wavs[index]}`);
    if (segments.length === 1) {
      const segment = segments[0]!;
      const siblings = pieces.filter(
        (row) => row.cueIndex === segment.cueIndex && row.paragraphIndex === segment.paragraphIndex,
      );
      pieces.push({
        cueIndex: segment.cueIndex,
        paragraphIndex: segment.paragraphIndex,
        chunkIndex: siblings.length,
        start: round3(cursor),
        end: round3(cursor + pieceSec),
        text: segment.text,
      });
    } else {
      spans += 1;
      const sentences = segments.flatMap((segment) => splitSentences(segment.text));
      const owners: number[] = [];
      for (const segment of segments) {
        for (const _sentence of splitSentences(segment.text)) owners.push(segment.cueIndex);
      }
      const silences = detectSilences(wavs[index]!).map((silence) => ({
        start: silence.start,
        end: silence.end,
      }));
      const aligned = alignSentences(0, pieceSec, sentences, silences);
      let sentenceCursor = 0;
      for (const segment of segments) {
        const count = splitSentences(segment.text).length;
        const group = aligned.slice(sentenceCursor, sentenceCursor + count);
        sentenceCursor += count;
        const siblings = pieces.filter(
          (row) => row.cueIndex === segment.cueIndex && row.paragraphIndex === segment.paragraphIndex,
        );
        pieces.push({
          cueIndex: segment.cueIndex,
          paragraphIndex: segment.paragraphIndex,
          chunkIndex: siblings.length,
          start: round3(cursor + group[0]!.start),
          end: round3(cursor + group[group.length - 1]!.end),
          text: segment.text,
        });
      }
      void owners;
    }
    cursor += pieceSec;
    if (index < requests.length - 1) cursor += PAUSE_SEC;
  }
  if (state.atomIndex !== atoms.length || state.offset !== 0) {
    throw new Error(`Ders ${sectionNumber} atom tüketilmedi: ${state.atomIndex}/${atoms.length} ofset ${state.offset}`);
  }
  const wavPath = join(ROOT, "media-bake", "academy", "audio", "pr-105", `section_${sectionNumber}.wav`);
  const wavSec = pcmWavDurationSec(readFileSync(wavPath));
  return {
    lessonKey: section.lessonKey,
    title: section.title,
    pieces,
    durationSec: round3(cursor),
    wavSec: round3(wavSec),
    spans,
  };
}

function cueJson(sectionNumber: number, pieces: readonly PieceRow[]): unknown[] {
  const section = PR105_SECTION_MAP[sectionNumber - 1]!;
  const lessonKey = section.lessonKey!;
  const cinema = PR105_CINEMA_LESSONS[lessonKey as keyof typeof PR105_CINEMA_LESSONS];
  const paragraphs = paragraphsWithCue(section.contentMarkdown);
  return cinema.slides.map((slide) => {
    const cueIndex = slide.cueIndex - 1;
    const group = pieces.filter((piece) => piece.cueIndex === cueIndex);
    if (group.length === 0) throw new Error(`${lessonKey} cue ${slide.cueIndex} parçasız`);
    const body = paragraphs.filter((row) => row.cueIndex === cueIndex).map((row) => row.text);
    return {
      id: `cue-${String(slide.cueIndex).padStart(2, "0")}`,
      start: group[0]!.start,
      end: group[group.length - 1]!.end,
      text: slide.headline,
      section: slide.section,
      paragraphs: body,
    };
  });
}

function timingsJson(lessonKey: string, pieces: readonly PieceRow[], durationSec: number): unknown {
  return {
    lessonKey,
    pauseSec: PAUSE_SEC,
    durationSec,
    cacheV: Math.round(durationSec * 1000),
    pieces: pieces.map((piece, index) => ({
      index,
      cueId: `cue-${String(piece.cueIndex + 1).padStart(2, "0")}`,
      cueParagraphIndex: piece.paragraphIndex,
      chunkIndex: piece.chunkIndex,
      start: piece.start,
      end: piece.end,
      text: piece.text,
    })),
  };
}

function main(): void {
  const write = process.argv.includes("--write");
  for (let sectionNumber = 1; sectionNumber <= 6; sectionNumber += 1) {
    const clock = lessonClock(sectionNumber);
    const deltaMs = Math.round((clock.durationSec - clock.wavSec) * 1000);
    const cues = clock.pieces.reduce<number[]>((acc, piece) => {
      if (!acc.includes(piece.cueIndex)) acc.push(piece.cueIndex);
      return acc;
    }, []);
    let previousStart = -1;
    for (const piece of clock.pieces) {
      if (!(piece.end > piece.start) || piece.start < previousStart) {
        throw new Error(`${clock.lessonKey} parça saati geri sarıyor: ${piece.start}–${piece.end}`);
      }
      previousStart = piece.start;
    }
    if (clock.pieces[0]?.start !== 0) {
      throw new Error(`${clock.lessonKey} ilk slayt 0 sn değil.`);
    }
    process.stdout.write(
      `${clock.lessonKey}  parça ${clock.pieces.length}  kurgu ${clock.durationSec.toFixed(3)}s  wav ${clock.wavSec.toFixed(3)}s  delta ${deltaMs} ms  ara-cue ${clock.spans}  slayt ${cues.join(",")}\n`,
    );
    if (Math.abs(deltaMs) > 30) {
      throw new Error(`${clock.lessonKey} kurgu ile WAV ${deltaMs} ms ayrıştı.`);
    }
    if (write) {
      const cuePath = join(ROOT, "lib", "academy", "lesson-cues", `${clock.lessonKey}.json`);
      const timingPath = join(ROOT, "lib", "academy", "lesson-audio-timings", `${clock.lessonKey}.json`);
      mkdirSync(join(ROOT, "lib", "academy", "lesson-cues"), { recursive: true });
      writeFileSync(cuePath, `${JSON.stringify(cueJson(sectionNumber, clock.pieces), null, 2)}\n`);
      writeFileSync(
        timingPath,
        `${JSON.stringify(timingsJson(clock.lessonKey, clock.pieces, clock.wavSec), null, 2)}\n`,
      );
    }
  }
  if (!write) process.stdout.write("Ölçüm bitti. Yazmak için --write.\n");
}

main();
