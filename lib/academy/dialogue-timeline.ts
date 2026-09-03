/**
 * PEDAGOJI.md tek eğitmen — DialogueTurn[] zaman çizelgesi.
 * Kelime saati: 420 ms / kelime; eğitmen Master Voice %93.
 * Canlı TTS üretmez; oynatıcı mühürlü WAV veya okuma saati ile senkronlar.
 */

import type { DialogueSpeakerId, DialogueTurn } from "@/lib/academy/curricula/types";
import {
  academyDialogueSpeakerDisplayName,
  academyDialogueSpeakerIdFromDisplayName,
} from "@/lib/academy/curricula/types";
import { ACADEMY_INSTRUCTOR_SPEECH_RATE } from "@/lib/academy/instructors";
import {
  ACADEMY_FIVE_ACT_HEADINGS,
  classifyAcademyLessonChunk,
  parseAcademyLessonActText,
  splitAcademyLessonChunks,
  type AcademyFiveAct,
} from "@/lib/academy/lesson-body";

export const ACADEMY_DIALOGUE_MS_PER_WORD = 420;
export const ACADEMY_DIALOGUE_TURN_GAP_SEC = 0.35;

export type DialogueDisplayName = ReturnType<typeof academyDialogueSpeakerDisplayName>;

export type TimedDialogueTurn = DialogueTurn & {
  id: string;
  displayName: DialogueDisplayName;
  act: AcademyFiveAct | null;
  start: number;
  end: number;
};

export type AcademyDialogueTimeline = {
  turns: readonly TimedDialogueTurn[];
  spokenDuration: number;
};

const DIALOGUE_LINE = /^(Eğitmen|Koray|Maya|Can|Ece|Tarık|Gözde):\s+([\s\S]+)$/u;

function isSpokenFiveAct(act: string | null): act is AcademyFiveAct {
  return act === "warmup" || act === "problem" || act === "development" || act === "conclusion";
}

export function parseDialogueLine(paragraph: string): { speaker: DialogueSpeakerId; text: string } | null {
  const match = paragraph.match(DIALOGUE_LINE);
  if (!match) {
    return null;
  }
  const name = match[1]!;
  const text = match[2]!.trim();
  if (!text) {
    return null;
  }
  const speaker = academyDialogueSpeakerIdFromDisplayName(name);
  if (!speaker) {
    return null;
  }
  return { speaker, text };
}

export function academyDialogueDisplayName(speaker: DialogueSpeakerId): DialogueDisplayName {
  return academyDialogueSpeakerDisplayName(speaker);
}

export function academyDialogueSpeechRate(_speaker: DialogueSpeakerId, _slug?: string): number {
  return ACADEMY_INSTRUCTOR_SPEECH_RATE;
}

export function academyDialogueWordCount(text: string): number {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(" ").length;
}

/** Okuma süresi (saniye) — PEDAGOJI.md tempo mührü. */
export function academyDialogueReadingDurationSec(
  text: string,
  speaker: DialogueSpeakerId,
  slug?: string,
): number {
  const words = academyDialogueWordCount(text);
  if (words <= 0) {
    return 0;
  }
  const rate = academyDialogueSpeechRate(speaker, slug);
  const safeRate = rate > 0 ? rate : 1;
  return (words * ACADEMY_DIALOGUE_MS_PER_WORD) / 1000 / safeRate;
}

type UntimedTurn = {
  speaker: DialogueSpeakerId;
  text: string;
  code?: DialogueTurn["code"];
  act: AcademyFiveAct | null;
};

function collectDialogueTurns(body: string): UntimedTurn[] {
  const turns: UntimedTurn[] = [];
  let currentAct: AcademyFiveAct | null = null;
  for (const chunk of splitAcademyLessonChunks(body)) {
    const segment = classifyAcademyLessonChunk(chunk);
    if (segment.kind === "code") {
      const last = turns.at(-1);
      if (last && !last.code) {
        last.code = { language: segment.language, source: segment.source };
      }
      continue;
    }
    if (segment.kind !== "text") {
      continue;
    }
    const parsed = parseAcademyLessonActText(segment.text);
    if (parsed.act) {
      currentAct = isSpokenFiveAct(parsed.act) ? parsed.act : null;
    }
    const prose = parsed.body || (parsed.heading ? "" : segment.text);
    const paragraphs = prose
      .split(/\n\n+/u)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    for (const paragraph of paragraphs) {
      const line = parseDialogueLine(paragraph);
      if (line) {
        turns.push({
          speaker: "egitmen",
          text: line.text,
          act: currentAct,
        });
        continue;
      }
      if (currentAct && isSpokenFiveAct(currentAct) && paragraph.length > 0) {
        turns.push({
          speaker: "egitmen",
          text: paragraph,
          act: currentAct,
        });
      }
    }
  }
  return turns;
}

export function buildAcademyDialogueTimeline(body: string, slug?: string): AcademyDialogueTimeline {
  const collected = collectDialogueTurns(body);
  const turns: TimedDialogueTurn[] = [];
  let offset = 0;
  for (let index = 0; index < collected.length; index += 1) {
    const turn = collected[index]!;
    const duration = academyDialogueReadingDurationSec(turn.text, turn.speaker, slug);
    const start = offset;
    const end = start + Math.max(duration, 0.4);
    turns.push({
      id: `${turn.act ?? "line"}:${index}:${turn.speaker}`,
      speaker: turn.speaker,
      text: turn.text,
      ...(turn.code ? { code: turn.code } : {}),
      displayName: academyDialogueDisplayName(turn.speaker),
      act: turn.act,
      start,
      end,
    });
    offset = end + (index < collected.length - 1 ? ACADEMY_DIALOGUE_TURN_GAP_SEC : 0);
  }
  const spokenDuration = turns.at(-1)?.end ?? 0;
  return { turns, spokenDuration };
}

export function activeAcademyDialogueTurnIndex(
  turns: readonly TimedDialogueTurn[],
  elapsedSec: number,
): number {
  if (turns.length === 0) {
    return 0;
  }
  if (!Number.isFinite(elapsedSec) || elapsedSec <= 0) {
    return 0;
  }
  const last = turns[turns.length - 1]!;
  if (elapsedSec >= last.end) {
    return turns.length - 1;
  }
  for (let index = 0; index < turns.length; index += 1) {
    const turn = turns[index]!;
    if (elapsedSec >= turn.start && elapsedSec < turn.end) {
      return index;
    }
    if (elapsedSec < turn.start) {
      return Math.max(0, index - 1);
    }
  }
  return turns.length - 1;
}

/** WAV süresi ile kelime saatini aynı orana çeker. */
export function academyDialogueSpokenElapsedSec(input: {
  currentTime: number;
  audioDuration: number;
  spokenDuration: number;
}): number {
  const currentTime = Number.isFinite(input.currentTime) ? Math.max(0, input.currentTime) : 0;
  const audioDuration = Number.isFinite(input.audioDuration) ? input.audioDuration : 0;
  const spokenDuration = Number.isFinite(input.spokenDuration) ? input.spokenDuration : 0;
  if (audioDuration > 0 && spokenDuration > 0) {
    return (currentTime / audioDuration) * spokenDuration;
  }
  return currentTime;
}

export function academyFiveActHeading(act: AcademyFiveAct | null): string | null {
  if (!act) {
    return null;
  }
  return ACADEMY_FIVE_ACT_HEADINGS[act] ?? null;
}

const MIN_STAGE_SENTENCE_WORDS = 6;
/** 16:9 sahne — 4–5 satırlık blok düşünce; cümle cümle oynaklık yok. */
const MAX_STAGE_PARAGRAPH_WORDS = 64;
const MAX_STAGE_PARAGRAPH_CHARS = 420;

export function splitAcademySpokenSentences(text: string): string[] {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return [];
  }
  const parts = trimmed.split(/(?<=[.!?…])\s+/u).map((part) => part.trim()).filter((part) => part.length > 0);
  if (parts.length === 0) {
    return [trimmed];
  }
  const merged: string[] = [];
  for (const part of parts) {
    const last = merged.at(-1);
    if (last && academyDialogueWordCount(last) < MIN_STAGE_SENTENCE_WORDS) {
      merged[merged.length - 1] = `${last} ${part}`;
    } else {
      merged.push(part);
    }
  }
  return merged;
}

export function splitAcademySpokenParagraphs(text: string): string[] {
  const sentences = splitAcademySpokenSentences(text);
  if (sentences.length === 0) {
    return [];
  }
  const paragraphs: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    const overBudget =
      current.length > 0 &&
      (academyDialogueWordCount(next) > MAX_STAGE_PARAGRAPH_WORDS || next.length > MAX_STAGE_PARAGRAPH_CHARS);
    if (overBudget) {
      paragraphs.push(current);
      current = sentence;
    } else {
      current = next;
    }
  }
  if (current) {
    paragraphs.push(current);
  }
  return paragraphs;
}

function spokenChunkAtElapsed(
  chunks: readonly string[],
  turn: TimedDialogueTurn,
  elapsedSec: number,
): { chunk: string; chunkIndex: number } {
  if (chunks.length === 0) {
    return { chunk: "", chunkIndex: 0 };
  }
  const totalWords = chunks.reduce((sum, chunk) => sum + Math.max(1, academyDialogueWordCount(chunk)), 0);
  const span = Math.max(0.001, turn.end - turn.start);
  const local = Math.max(0, Math.min(span, elapsedSec - turn.start));
  let offset = 0;
  for (let index = 0; index < chunks.length; index += 1) {
    const words = Math.max(1, academyDialogueWordCount(chunks[index]!));
    const duration = span * (words / totalWords);
    const end = index === chunks.length - 1 ? span : offset + duration;
    if (local < end || index === chunks.length - 1) {
      return { chunk: chunks[index]!, chunkIndex: index };
    }
    offset = end;
  }
  return { chunk: chunks[chunks.length - 1]!, chunkIndex: chunks.length - 1 };
}

export function academySpokenSentenceAtElapsed(
  turns: readonly TimedDialogueTurn[],
  elapsedSec: number,
): { turnIndex: number; sentence: string; sentenceIndex: number } {
  const turnIndex = activeAcademyDialogueTurnIndex(turns, elapsedSec);
  const turn = turns[turnIndex];
  if (!turn) {
    return { turnIndex: 0, sentence: "", sentenceIndex: 0 };
  }
  const spoken = spokenChunkAtElapsed(splitAcademySpokenSentences(turn.text), turn, elapsedSec);
  return { turnIndex, sentence: spoken.chunk, sentenceIndex: spoken.chunkIndex };
}

export function academySpokenParagraphAtElapsed(
  turns: readonly TimedDialogueTurn[],
  elapsedSec: number,
): { turnIndex: number; paragraph: string; paragraphIndex: number } {
  const turnIndex = activeAcademyDialogueTurnIndex(turns, elapsedSec);
  const turn = turns[turnIndex];
  if (!turn) {
    return { turnIndex: 0, paragraph: "", paragraphIndex: 0 };
  }
  const spoken = spokenChunkAtElapsed(splitAcademySpokenParagraphs(turn.text), turn, elapsedSec);
  return { turnIndex, paragraph: spoken.chunk, paragraphIndex: spoken.chunkIndex };
}

export type AcademyTeleprompterCue = {
  id: string;
  text: string;
  turnIndex: number;
  sentenceIndex: number;
  act: AcademyFiveAct | null;
  start: number;
  end: number;
};

export type AcademyTeleprompterProgress = {
  cueIndex: number;
  localRatio: number;
};

/** Vurgu, sesin bir tık gerisinde kalsın — cümle okunmadan kaymasın. */
export const ACADEMY_SPOKEN_HIGHLIGHT_LAG_SEC = 0.45;

export function academySpokenHighlightElapsedSec(elapsedSec: number): number {
  const elapsed = Number.isFinite(elapsedSec) ? elapsedSec : 0;
  return Math.max(0, elapsed - ACADEMY_SPOKEN_HIGHLIGHT_LAG_SEC);
}

/** Cümle damgaları — ses saatiyle kayar yazı. Metin bloğu değişmez. */
export function buildAcademyTeleprompterCues(
  turns: readonly TimedDialogueTurn[],
): AcademyTeleprompterCue[] {
  const cues: AcademyTeleprompterCue[] = [];
  for (let turnIndex = 0; turnIndex < turns.length; turnIndex += 1) {
    const turn = turns[turnIndex]!;
    const sentences = splitAcademySpokenSentences(turn.text);
    if (sentences.length === 0) {
      continue;
    }
    const totalWords = sentences.reduce(
      (sum, sentence) => sum + Math.max(1, academyDialogueWordCount(sentence)),
      0,
    );
    const span = Math.max(0.001, turn.end - turn.start);
    let offset = 0;
    for (let sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex += 1) {
      const text = sentences[sentenceIndex]!;
      const words = Math.max(1, academyDialogueWordCount(text));
      const duration = span * (words / totalWords);
      const start = turn.start + offset;
      const end = sentenceIndex === sentences.length - 1 ? turn.end : start + duration;
      cues.push({
        id: `${turn.id}:${sentenceIndex}`,
        text,
        turnIndex,
        sentenceIndex,
        act: turn.act,
        start,
        end,
      });
      offset += duration;
    }
  }
  return cues;
}

export function academyTeleprompterProgress(
  cues: readonly AcademyTeleprompterCue[],
  elapsedSec: number,
): AcademyTeleprompterProgress {
  if (cues.length === 0) {
    return { cueIndex: 0, localRatio: 0 };
  }
  const elapsed = academySpokenHighlightElapsedSec(elapsedSec);
  const last = cues[cues.length - 1]!;
  if (elapsed >= last.end) {
    return { cueIndex: cues.length - 1, localRatio: 1 };
  }
  for (let index = 0; index < cues.length; index += 1) {
    const cue = cues[index]!;
    if (elapsed < cue.start) {
      return { cueIndex: Math.max(0, index - 1), localRatio: 0 };
    }
    if (elapsed < cue.end) {
      const span = Math.max(0.001, cue.end - cue.start);
      return {
        cueIndex: index,
        localRatio: Math.max(0, Math.min(1, (elapsed - cue.start) / span)),
      };
    }
  }
  return { cueIndex: cues.length - 1, localRatio: 1 };
}

/** Okunan cümleyi kutunun tam ortasında tutar (`block: 'center'`). Ses bitmeden sonraki cue'ya kaymaz. */
export const ACADEMY_TELEPROMPTER_FOCUS_RATIO = 0.5;

export function academyTeleprompterTranslateY(input: {
  cueTop: number;
  cueHeight: number;
  localRatio: number;
  viewportHeight: number;
  focusRatio?: number;
  nextCueTop?: number;
}): number {
  const focusRatio = input.focusRatio ?? ACADEMY_TELEPROMPTER_FOCUS_RATIO;
  const focusY = Math.max(0, input.viewportHeight) * focusRatio;
  const cueCenter = input.cueTop + Math.max(0, input.cueHeight) / 2;
  return -(cueCenter - focusY);
}

export function academyLessonStageCaption(text: string, maxChars = 220): string {
  const sentences = splitAcademySpokenSentences(text);
  const first = sentences[0]?.replace(/\s+/gu, " ").trim() ?? "";
  if (!first) {
    return "";
  }
  if (first.length <= maxChars) {
    return first;
  }
  const window = first.slice(0, maxChars);
  const lastSpace = window.lastIndexOf(" ");
  const clipped = (lastSpace > 40 ? window.slice(0, lastSpace) : window).trim();
  return `${clipped}…`;
}

export function academyActiveCodeLineIndex(input: {
  source: string;
  spokenText: string;
  turnStart: number;
  turnEnd: number;
  elapsedSec: number;
}): number | null {
  const lines = input.source.split("\n");
  if (lines.length === 0) {
    return null;
  }
  const spoken = input.spokenText.trim();
  let bestIndex: number | null = null;
  let bestScore = 0;
  if (spoken) {
    const spokenLower = spoken.toLocaleLowerCase("tr-TR");
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index] ?? "";
      if (!line.trim()) {
        continue;
      }
      const tokens = line.match(/[A-Za-z_][A-Za-z0-9_]{1,}/gu) ?? [];
      let score = 0;
      for (const token of tokens) {
        if (token.length < 2) {
          continue;
        }
        if (spokenLower.includes(token.toLocaleLowerCase("tr-TR"))) {
          score += token.length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }
  }
  if (bestIndex != null && bestScore > 0) {
    return bestIndex;
  }
  const contentIndexes = lines
    .map((line, index) => (line.trim() ? index : -1))
    .filter((index) => index >= 0);
  if (contentIndexes.length === 0) {
    return 0;
  }
  const span = Math.max(0.001, input.turnEnd - input.turnStart);
  const ratio = Math.max(0, Math.min(0.999, (input.elapsedSec - input.turnStart) / span));
  const pick = Math.floor(ratio * contentIndexes.length);
  return contentIndexes[Math.min(pick, contentIndexes.length - 1)] ?? 0;
}

export type AcademyLessonStageFrame = {
  act: AcademyFiveAct | null;
  heading: string | null;
  caption: string;
  code: { language: string; source: string } | null;
  codeLineIndex: number | null;
};

/** 16:9 sahne — o an okunan paragraf veya anlatılan kod satırı. */
export function academyLessonStageFrame(input: {
  turns: readonly TimedDialogueTurn[];
  activeIndex: number;
  elapsedSec?: number;
  fallbackCodes?: readonly { language: string; source: string }[];
}): AcademyLessonStageFrame {
  const fallback = input.fallbackCodes?.find((snippet) => snippet.source.trim());
  if (input.turns.length === 0) {
    return {
      act: null,
      heading: null,
      caption: "",
      code: fallback ? { language: fallback.language, source: fallback.source } : null,
      codeLineIndex: null,
    };
  }
  const index = Math.max(0, Math.min(input.activeIndex, input.turns.length - 1));
  const turn = input.turns[index]!;
  const elapsedSec = Number.isFinite(input.elapsedSec) ? (input.elapsedSec as number) : turn.start;
  const paragraph = spokenChunkAtElapsed(splitAcademySpokenParagraphs(turn.text), turn, elapsedSec);
  const sentence = spokenChunkAtElapsed(splitAcademySpokenSentences(turn.text), turn, elapsedSec);
  let code: AcademyLessonStageFrame["code"] = null;
  if (turn.act === "development") {
    for (let cursor = index; cursor >= 0; cursor -= 1) {
      const candidate = input.turns[cursor]!;
      if (candidate.act !== "development") {
        break;
      }
      if (candidate.code?.source.trim()) {
        code = { language: candidate.code.language, source: candidate.code.source };
        break;
      }
    }
    if (!code && fallback) {
      code = { language: fallback.language, source: fallback.source };
    }
  }
  return {
    act: turn.act,
    heading: academyFiveActHeading(turn.act),
    caption: paragraph.chunk,
    code,
    codeLineIndex: code
      ? academyActiveCodeLineIndex({
          source: code.source,
          spokenText: sentence.chunk,
          turnStart: turn.start,
          turnEnd: turn.end,
          elapsedSec,
        })
      : null,
  };
}
