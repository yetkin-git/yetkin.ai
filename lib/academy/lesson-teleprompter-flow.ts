/**
 * Ders teleprompter akışı — cue SSOT + bake timings.
 * Canlı mühürlü WAV’da saat HTMLAudio currentTime’dır.
 * Kelime-oranlı paylaşım yalnız timings yokken taslak cue üretiminde kullanılır; yayın senkronu değildir.
 */

import {
  type AcademyLessonCue,
  loadAcademyLessonCues,
} from "@/lib/academy/lesson-cues";
import {
  type AcademySealedAudioPiece,
  type AcademySealedAudioTimings,
  loadAcademySealedAudioTimings,
} from "@/lib/academy/lesson-audio-timings";
import { splitAcademyTtsBreathChunks } from "@/lib/academy/tts-breath-chunks";

export type AcademyTeleprompterLineState = "past" | "active" | "future";

export type AcademyTeleprompterLine = {
  id: string;
  cueId: string;
  section: string;
  text: string;
  start: number;
  end: number;
};

function teleprompterWordCount(text: string): number {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(" ").filter((part) => part.length > 0).length;
}

export function academyLessonCueScriptParagraphs(cue: AcademyLessonCue): readonly string[] {
  if (cue.paragraphs && cue.paragraphs.length > 0) {
    return cue.paragraphs;
  }
  const fallback = cue.text.replace(/\s+/gu, " ").trim();
  return fallback ? [fallback] : [];
}

export function buildAcademyTeleprompterFlow(
  cues: readonly AcademyLessonCue[],
): readonly AcademyTeleprompterLine[] {
  const lines: AcademyTeleprompterLine[] = [];
  for (const cue of cues) {
    const paragraphs = academyLessonCueScriptParagraphs(cue);
    if (paragraphs.length === 0) {
      continue;
    }
    const weights = paragraphs.map((paragraph) => Math.max(1, teleprompterWordCount(paragraph)));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const span = Math.max(0, cue.end - cue.start);
    let cursor = cue.start;
    for (let index = 0; index < paragraphs.length; index += 1) {
      const isLast = index === paragraphs.length - 1;
      const share = totalWeight > 0 ? weights[index]! / totalWeight : 1 / paragraphs.length;
      const end = isLast ? cue.end : cursor + span * share;
      lines.push({
        id: `${cue.id}:${index}`,
        cueId: cue.id,
        section: cue.section,
        text: paragraphs[index]!,
        start: cursor,
        end,
      });
      cursor = end;
    }
  }
  return lines;
}

function pieceLineId(piece: Pick<AcademySealedAudioPiece, "cueId" | "cueParagraphIndex" | "chunkIndex" | "index">): string {
  return `${piece.cueId}:${piece.cueParagraphIndex}:${piece.chunkIndex}:${piece.index}`;
}

function cueSectionById(cues: readonly AcademyLessonCue[], cueId: string): string {
  return cues.find((cue) => cue.id === cueId)?.section ?? "";
}

export function buildAcademyTeleprompterFlowFromTimings(
  cues: readonly AcademyLessonCue[],
  timings: AcademySealedAudioTimings,
): readonly AcademyTeleprompterLine[] | null {
  if (timings.pieces.length === 0) {
    return null;
  }
  if (timings.pieces.every((piece) => piece.text.trim().length > 0)) {
    return timings.pieces.map((piece) => ({
      id: pieceLineId(piece),
      cueId: piece.cueId,
      section: cueSectionById(cues, piece.cueId),
      text: piece.text,
      start: piece.start,
      end: piece.end,
    }));
  }
  const rows: { cueId: string; section: string; text: string }[] = [];
  for (const cue of cues) {
    for (const text of academyLessonCueScriptParagraphs(cue)) {
      rows.push({ cueId: cue.id, section: cue.section, text });
    }
  }
  if (rows.length > 0 && rows.length === timings.pieces.length) {
    const lines: AcademyTeleprompterLine[] = [];
    for (let index = 0; index < timings.pieces.length; index += 1) {
      const piece = timings.pieces[index]!;
      const row = rows[index]!;
      if (piece.cueId !== row.cueId) {
        return null;
      }
      lines.push({
        id: pieceLineId(piece),
        cueId: row.cueId,
        section: row.section,
        text: row.text,
        start: piece.start,
        end: piece.end,
      });
    }
    return lines;
  }
  const planned: { cueId: string; section: string; text: string }[] = [];
  for (const cue of cues) {
    for (const paragraph of academyLessonCueScriptParagraphs(cue)) {
      for (const text of splitAcademyTtsBreathChunks(paragraph)) {
        planned.push({ cueId: cue.id, section: cue.section, text });
      }
    }
  }
  if (planned.length === 0 || planned.length !== timings.pieces.length) {
    return null;
  }
  const lines: AcademyTeleprompterLine[] = [];
  for (let index = 0; index < timings.pieces.length; index += 1) {
    const piece = timings.pieces[index]!;
    const row = planned[index]!;
    if (piece.cueId !== row.cueId) {
      return null;
    }
    lines.push({
      id: pieceLineId(piece),
      cueId: row.cueId,
      section: row.section,
      text: row.text,
      start: piece.start,
      end: piece.end,
    });
  }
  return lines;
}

export function loadAcademyTeleprompterFlow(lessonKey: string): readonly AcademyTeleprompterLine[] {
  const cues = loadAcademyLessonCues(lessonKey);
  const timings = loadAcademySealedAudioTimings(lessonKey);
  if (timings) {
    const timed = buildAcademyTeleprompterFlowFromTimings(cues, timings);
    if (timed) {
      return timed;
    }
  }
  return buildAcademyTeleprompterFlow(cues);
}

export function academyTeleprompterActiveLineIndex(
  lines: readonly Pick<AcademyTeleprompterLine, "start" | "end">[],
  currentTime: number,
): number | null {
  if (lines.length === 0) {
    return null;
  }
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  const first = lines[0]!;
  if (t < first.start) {
    return null;
  }
  let lastHit: number | null = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    if (t >= line.start && t < line.end) {
      return index;
    }
    if (t >= line.end) {
      lastHit = index;
    }
  }
  return lastHit ?? 0;
}

export function academyTeleprompterLineState(
  line: Pick<AcademyTeleprompterLine, "start" | "end">,
  currentTime: number,
  activeIndex: number | null,
  lineIndex: number,
): AcademyTeleprompterLineState {
  if (activeIndex == null) {
    return currentTime < line.start ? "future" : "past";
  }
  if (lineIndex === activeIndex) {
    return "active";
  }
  return lineIndex < activeIndex ? "past" : "future";
}
