/**
 * PEDAGOJI.md tek eğitmen — DialogueTurn[] zaman çizelgesi.
 * Kelime saati: 420 ms / kelime; eğitmen Master Voice %100 (yavaşlatma yok).
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
    if (isSpokenFiveAct(parsed.act)) {
      currentAct = parsed.act;
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
