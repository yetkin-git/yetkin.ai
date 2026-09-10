/**
 * Ders teleprompter akışı — cue SSOT + bake timings.
 * Canlı mühürlü WAV’da saat HTMLAudio currentTime’dır.
 * Kelime-oranlı paylaşım yalnız timings yokken taslak cue üretiminde kullanılır; yayın senkronu değildir.
 */

import { splitAcademySpokenSentences } from "@/lib/academy/dialogue-timeline";
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
import { applyAcademySpokenPhoneticsToDisplay } from "@/lib/academy/spoken-scripts/phonetics";

export type AcademyTeleprompterLineState = "past" | "active" | "future";

export type AcademyTeleprompterLine = {
  id: string;
  cueId: string;
  section: string;
  text: string;
  start: number;
  end: number;
};

/** Karaoke altyazı — 16:9 sahnede en fazla 3–4 satır. */
export const ACADEMY_KARAOKE_CAPTION_MAX_WORDS = 36;
export const ACADEMY_KARAOKE_CAPTION_MAX_CHARS = 220;

function teleprompterWordCount(text: string): number {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(" ").filter((part) => part.length > 0).length;
}

export function academyLessonSequenceNumber(lessonKey: string): number | null {
  const match = /-(\d+)$/u.exec(lessonKey.trim());
  if (!match) {
    return null;
  }
  const value = Number(match[1]);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Sosyal medya, kodsuz chatbot ve prompt kursunun tamamı ve 4. bölüm sonrası: kısa karaoke bloğu. */
export function academyKaraokeCaptionsCompact(lessonKey: string): boolean {
  const key = lessonKey.trim();
  if (
    key.startsWith("03_social_media_ai-") ||
    key.startsWith("04_chatbot_nocode-") ||
    key.startsWith("05_prompt_practice-")
  ) {
    return true;
  }
  const sequence = academyLessonSequenceNumber(key);
  return sequence != null && sequence >= 4;
}

export function splitAcademyKaraokeCaptionBlocks(text: string): string[] {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return [];
  }
  const sentences = splitAcademySpokenSentences(trimmed);
  if (sentences.length === 0) {
    return [trimmed];
  }
  const blocks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    const overBudget =
      current.length > 0 &&
      (teleprompterWordCount(next) > ACADEMY_KARAOKE_CAPTION_MAX_WORDS ||
        next.length > ACADEMY_KARAOKE_CAPTION_MAX_CHARS);
    if (overBudget) {
      blocks.push(current);
      current = sentence;
    } else {
      current = next;
    }
  }
  if (current) {
    blocks.push(current);
  }
  return blocks;
}

function expandTeleprompterLineIntoCaptionBlocks(line: AcademyTeleprompterLine): AcademyTeleprompterLine[] {
  const blocks = splitAcademyKaraokeCaptionBlocks(line.text);
  if (blocks.length <= 1) {
    return [line];
  }
  const weights = blocks.map((block) => Math.max(1, teleprompterWordCount(block)));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const span = Math.max(0, line.end - line.start);
  const next: AcademyTeleprompterLine[] = [];
  let cursor = line.start;
  for (let index = 0; index < blocks.length; index += 1) {
    const isLast = index === blocks.length - 1;
    const share = totalWeight > 0 ? weights[index]! / totalWeight : 1 / blocks.length;
    const end = isLast ? line.end : cursor + span * share;
    next.push({
      ...line,
      id: `${line.id}:${index}`,
      text: blocks[index]!,
      start: cursor,
      end,
    });
    cursor = end;
  }
  return next;
}

function compactAcademyTeleprompterCaptions(
  lines: readonly AcademyTeleprompterLine[],
): readonly AcademyTeleprompterLine[] {
  return lines.flatMap((line) => expandTeleprompterLineIntoCaptionBlocks(line));
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

function overlayCueDisplayText(
  cues: readonly AcademyLessonCue[],
  piece: Pick<AcademySealedAudioPiece, "cueId" | "cueParagraphIndex" | "chunkIndex" | "text">,
  pieces: readonly Pick<AcademySealedAudioPiece, "cueId" | "cueParagraphIndex">[],
): string {
  const fallback = applyAcademySpokenPhoneticsToDisplay(piece.text);
  const cue = cues.find((row) => row.id === piece.cueId);
  if (!cue) {
    return fallback;
  }
  const displayParagraph = academyLessonCueScriptParagraphs(cue)[piece.cueParagraphIndex];
  if (!displayParagraph) {
    return fallback;
  }
  const displayChunks = splitAcademyTtsBreathChunks(displayParagraph);
  const siblingCount = pieces.filter(
    (row) => row.cueId === piece.cueId && row.cueParagraphIndex === piece.cueParagraphIndex,
  ).length;
  if (displayChunks.length === siblingCount) {
    return displayChunks[piece.chunkIndex] ?? fallback;
  }
  return fallback;
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
      text: overlayCueDisplayText(cues, piece, timings.pieces),
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
  const compactCaptions = academyKaraokeCaptionsCompact(lessonKey);
  if (timings) {
    const timed = buildAcademyTeleprompterFlowFromTimings(cues, timings);
    if (timed) {
      return compactCaptions ? compactAcademyTeleprompterCaptions(timed) : timed;
    }
  }
  const flow = buildAcademyTeleprompterFlow(cues);
  return compactCaptions ? compactAcademyTeleprompterCaptions(flow) : flow;
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
