/**
 * Mühürlü WAV parça saati — bake 3–5 sn nefes dilimlerini 0.4 sn sessizlikle dondurur.
 * Oynatıcı currentTime bu saniyelerle 1:1; kelime-oranlı duvar saati değildir.
 */

import {
  academyLessonJsonGeneration,
  readAcademyLessonJson,
} from "@/lib/academy/lesson-json-store";

export type AcademySealedAudioPiece = {
  index: number;
  cueId: string;
  cueParagraphIndex: number;
  chunkIndex: number;
  start: number;
  end: number;
  text: string;
};

export type AcademySealedAudioTimings = {
  lessonKey: string;
  pauseSec: number;
  durationSec: number;
  cacheV: number;
  pieces: readonly AcademySealedAudioPiece[];
};

function finiteNonNeg(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

function parsePiece(raw: unknown, index: number): AcademySealedAudioPiece | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const rec = raw as Record<string, unknown>;
  const cueId = typeof rec.cueId === "string" ? rec.cueId.trim() : "";
  const cueParagraphIndex = typeof rec.cueParagraphIndex === "number" ? rec.cueParagraphIndex : index;
  const chunkIndex = typeof rec.chunkIndex === "number" ? rec.chunkIndex : 0;
  const start = finiteNonNeg(rec.start);
  const end = finiteNonNeg(rec.end);
  const text = typeof rec.text === "string" ? rec.text.replace(/\s+/gu, " ").trim() : "";
  if (!cueId || start == null || end == null || end < start) {
    return null;
  }
  const pieceIndex = typeof rec.index === "number" && Number.isInteger(rec.index) ? rec.index : index;
  return {
    index: pieceIndex,
    cueId,
    cueParagraphIndex: Number.isInteger(cueParagraphIndex) && cueParagraphIndex >= 0 ? cueParagraphIndex : 0,
    chunkIndex: Number.isInteger(chunkIndex) && chunkIndex >= 0 ? chunkIndex : 0,
    start,
    end,
    text,
  };
}

export function parseAcademySealedAudioTimings(raw: unknown): AcademySealedAudioTimings | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const rec = raw as Record<string, unknown>;
  const lessonKey = typeof rec.lessonKey === "string" ? rec.lessonKey.trim() : "";
  const pauseSec = finiteNonNeg(rec.pauseSec);
  const durationSec = finiteNonNeg(rec.durationSec);
  const cacheV = finiteNonNeg(rec.cacheV);
  if (!lessonKey || pauseSec == null || durationSec == null || cacheV == null) {
    return null;
  }
  if (!Array.isArray(rec.pieces)) {
    return null;
  }
  const pieces: AcademySealedAudioPiece[] = [];
  for (let index = 0; index < rec.pieces.length; index += 1) {
    const piece = parsePiece(rec.pieces[index], index);
    if (!piece) {
      return null;
    }
    pieces.push(piece);
  }
  return { lessonKey, pauseSec, durationSec, cacheV, pieces };
}

let seenTimingGeneration = -1;
const parsedTimingCache = new Map<string, AcademySealedAudioTimings | null>();

function syncTimingCacheGeneration(): void {
  const generation = academyLessonJsonGeneration();
  if (seenTimingGeneration !== generation) {
    parsedTimingCache.clear();
    seenTimingGeneration = generation;
  }
}

export function loadAcademySealedAudioTimings(lessonKey: string): AcademySealedAudioTimings | null {
  const key = lessonKey.trim();
  syncTimingCacheGeneration();
  if (parsedTimingCache.has(key)) {
    return parsedTimingCache.get(key) ?? null;
  }
  const raw = readAcademyLessonJson("lesson-audio-timings", key);
  if (raw === undefined) return null;
  if (raw == null) {
    parsedTimingCache.set(key, null);
    return null;
  }
  const row = parseAcademySealedAudioTimings(raw);
  const value = row && row.pieces.length > 0 && row.durationSec > 0 ? row : null;
  parsedTimingCache.set(key, value);
  return value;
}

export function academySealedAudioParagraphCount(
  cues: readonly { paragraphs?: readonly string[] }[],
): number {
  return cues.reduce((sum, cue) => sum + (cue.paragraphs?.length ?? 0), 0);
}

export function applyAcademySealedAudioTimingsToCues<T extends { id: string; start: number; end: number }>(
  cues: readonly T[],
  timings: AcademySealedAudioTimings | null,
): readonly T[] {
  if (!timings || timings.pieces.length === 0) {
    return cues;
  }
  return cues.map((cue) => {
    const group = timings.pieces.filter((piece) => piece.cueId === cue.id);
    if (group.length === 0) {
      return cue;
    }
    const start = group[0]!.start;
    const end = group[group.length - 1]!.end;
    return { ...cue, start, end };
  });
}
