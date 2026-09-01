/**
 * Dersi Dinle SSOT — ekran bölümleri ile konuşulan metin aynı diziden okunur.
 * Dört bölüm (büyüme SKU) veya beş perde (Amiral Ders).
 * Koray/Maya replik ayrımı yok; ilerleme bölüm indeksidir.
 */

import {
  spokenAcademyLessonSegment,
  type AcademyLessonHeadingAct,
} from "@/lib/academy/lesson-body";
import {
  academyListenPlaybackRateForSpeaker,
  academyListenReadingDurationSec,
  type AcademyStudioSpeechSpeaker,
} from "@/archived/lib/academy-studio/lesson-listen";
import type { AcademyLessonBlock } from "@/lib/academy/lesson-media";
import { academyLessonFlowFromBlocks } from "@/archived/lib/academy-studio/lesson-flow";

export type AcademyListenScriptCardKind =
  | "announcer"
  | "moderator"
  | "instructor"
  | "steps"
  | "params"
  | "code"
  | "diagram"
  | "micro-video"
  | "exercise";

export type AcademyListenTextSpokenPart = {
  speaker: "moderator" | "instructor";
  spokenText: string;
  stageBeat: 0 | 1;
};

export type AcademyListenScriptCard = {
  id: string;
  kind: AcademyListenScriptCardKind;
  blockIndex: number;
  speaker: AcademyStudioSpeechSpeaker | null;
  spokenText: string;
  durationWeight: number;
  stageBeat: 0 | 1 | null;
};

export type AcademyListenScriptCue = {
  cardIndex: number;
  blockIndex: number;
  start: number;
  end: number;
};

export type AcademyListenScript = {
  lessonKey: string;
  cards: AcademyListenScriptCard[];
  cues: AcademyListenScriptCue[];
};

export function academyListenTextSpokenParts(text: string): AcademyListenTextSpokenPart[] {
  const spoken = spokenAcademyLessonSegment({ kind: "text", text });
  if (!spoken) {
    return [];
  }
  return [{ speaker: "instructor", spokenText: spoken, stageBeat: 1 }];
}

function durationForSpoken(text: string, speaker: AcademyStudioSpeechSpeaker): number {
  return academyListenReadingDurationSec(text, academyListenPlaybackRateForSpeaker(speaker));
}

function pushCard(
  cards: AcademyListenScriptCard[],
  card: Omit<AcademyListenScriptCard, "durationWeight"> & { durationWeight?: number },
): void {
  const speaker = card.speaker;
  const durationWeight =
    card.durationWeight ??
    (card.spokenText && speaker ? durationForSpoken(card.spokenText, speaker) : 0);
  cards.push({ ...card, durationWeight });
}

function kindForSectionAct(act: AcademyLessonHeadingAct): AcademyListenScriptCardKind {
  if (act === "syntax" || act === "development") {
    return "code";
  }
  if (act === "uygulama" || act === "assessment") {
    return "exercise";
  }
  return "instructor";
}

function firstBlockIndex(
  blocks: readonly AcademyLessonBlock[],
  sectionBlocks: readonly AcademyLessonBlock[],
): number {
  const first = sectionBlocks[0];
  if (!first) {
    return 0;
  }
  const index = blocks.indexOf(first);
  return index >= 0 ? index : 0;
}

function cardsFromBlocks(blocks: readonly AcademyLessonBlock[]): AcademyListenScriptCard[] {
  const sections = academyLessonFlowFromBlocks(blocks);
  const cards: AcademyListenScriptCard[] = [];
  for (const section of sections) {
    pushCard(cards, {
      id: `section:${section.act}`,
      kind: kindForSectionAct(section.act),
      blockIndex: firstBlockIndex(blocks, section.blocks),
      speaker: "instructor",
      spokenText: section.spokenText,
      stageBeat: 1,
    });
  }
  return cards;
}

function applyVisualTails(cards: AcademyListenScriptCard[]): void {
  void cards;
}

function cuesFromCards(cards: readonly AcademyListenScriptCard[]): AcademyListenScriptCue[] {
  const cues: AcademyListenScriptCue[] = [];
  let offset = 0;
  for (let cardIndex = 0; cardIndex < cards.length; cardIndex += 1) {
    const card = cards[cardIndex]!;
    if (!(card.durationWeight > 0)) {
      continue;
    }
    const start = offset;
    const end = offset + card.durationWeight;
    const last = cues[cues.length - 1];
    if (last && last.cardIndex === cardIndex && last.end === start) {
      last.end = end;
    } else {
      cues.push({
        cardIndex,
        blockIndex: card.blockIndex,
        start,
        end,
      });
    }
    offset = end;
  }
  return cues;
}

export function buildAcademyLessonListenScript(input: {
  lessonKey: string;
  title: string;
  body: string;
  courseSlug?: string;
  blocks: readonly AcademyLessonBlock[];
}): AcademyListenScript {
  void input.title;
  void input.body;
  void input.courseSlug;
  const cards = cardsFromBlocks(input.blocks);
  applyVisualTails(cards);
  return {
    lessonKey: input.lessonKey,
    cards,
    cues: cuesFromCards(cards),
  };
}

export function academyListenScriptIdleCardIndex(script: AcademyListenScript): number {
  const firstContent = script.cards.findIndex((card) => card.kind !== "announcer");
  if (firstContent >= 0) {
    return firstContent;
  }
  return 0;
}

export function academyListenScriptDurationSec(script: AcademyListenScript): number {
  const end = script.cues[script.cues.length - 1]?.end ?? 0;
  return end > 0 ? end : 0;
}

export function activeAcademyListenScriptCardIndex(
  cues: readonly AcademyListenScriptCue[],
  progress: number,
): number | null {
  if (cues.length === 0) {
    return null;
  }
  const total = cues[cues.length - 1]!.end;
  if (!(total > 0)) {
    return cues[0]!.cardIndex;
  }
  const ratio = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  const offset = ratio >= 1 ? total - Number.EPSILON : ratio * total;
  for (const cue of cues) {
    if (offset >= cue.start && offset < cue.end) {
      return cue.cardIndex;
    }
  }
  return cues[cues.length - 1]!.cardIndex;
}

/** Mutlak saniye — kısa WAV süresine oranlanmaz; 11 sn'de tüm perdeleri yakmaz. */
export function activeAcademyListenScriptCardIndexAtElapsed(
  cues: readonly AcademyListenScriptCue[],
  elapsedSec: number,
): number | null {
  if (cues.length === 0) {
    return null;
  }
  const total = cues[cues.length - 1]!.end;
  if (!(total > 0)) {
    return cues[0]!.cardIndex;
  }
  if (!Number.isFinite(elapsedSec) || elapsedSec <= 0) {
    return cues[0]!.cardIndex;
  }
  const offset = elapsedSec >= total ? total - Number.EPSILON : elapsedSec;
  for (const cue of cues) {
    if (offset >= cue.start && offset < cue.end) {
      return cue.cardIndex;
    }
  }
  return cues[cues.length - 1]!.cardIndex;
}

/**
 * Pause / ended / hata — duvar saati donar.
 * Playing dışında currentTime artışları sahneyi ilerletmez.
 * Slider seek `seekGeneration` artırınca pause'ta da yeni saniye kabul edilir.
 */
export function academyListenFrozenElapsedSec(input: {
  phase: "idle" | "preparing" | "playing" | "paused" | "ended" | undefined;
  currentTime: number;
  previousFrozen: number;
  previousPhase: "idle" | "preparing" | "playing" | "paused" | "ended" | undefined;
  seekGeneration?: number;
  previousSeekGeneration?: number;
}): number {
  const phase = input.phase;
  if (!phase || phase === "idle" || phase === "preparing") {
    return 0;
  }
  const finiteTime = Number.isFinite(input.currentTime) ? Math.max(0, input.currentTime) : 0;
  if (phase === "playing") {
    return finiteTime;
  }
  const seeked =
    input.seekGeneration != null &&
    input.previousSeekGeneration != null &&
    input.seekGeneration !== input.previousSeekGeneration;
  if (seeked) {
    return Number.isFinite(input.currentTime) ? finiteTime : input.previousFrozen;
  }
  if (input.previousPhase === "playing") {
    return Number.isFinite(input.currentTime) ? finiteTime : input.previousFrozen;
  }
  return input.previousFrozen;
}
