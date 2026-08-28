/**
 * Amiral Ders storyboard — kart/adım tabanlı, saniye kaseti yok.
 * İlerleme = mevcut kart / toplam kart.
 * Konuşmacı kilidi: bir kartta tek speaker; Kart N bitmeden Kart N+1 başlamaz.
 */

import { ACADEMY_PILOT_SKU_SLUG } from "@/lib/academy/pilot-sku";
import type { AcademyListenScriptCard } from "@/archived/lib/academy-studio/lesson-listen-script";

export type StoryboardAdvanceReason = "ended" | "click";

export type AcademyStoryboardCard = {
  id: string;
  index: number;
  kind: AcademyListenScriptCard["kind"];
  speaker: AcademyListenScriptCard["speaker"];
  spokenText: string;
  stageBeat: AcademyListenScriptCard["stageBeat"];
  blockIndex: number;
};

export type AcademyStoryboardState = {
  index: number;
  total: number;
  status: "idle" | "playing" | "awaiting-advance" | "complete";
};

export type AcademyStoryboardProgress = {
  /** 1 tabanlı gösterim — «Kart 3 / 12». */
  current: number;
  total: number;
  ratio: number;
};

export function storyboardFromListenCards(
  cards: readonly AcademyListenScriptCard[],
): AcademyStoryboardCard[] {
  return cards.map((card, index) => ({
    id: card.id,
    index,
    kind: card.kind,
    speaker: card.speaker,
    spokenText: card.spokenText,
    stageBeat: card.stageBeat,
    blockIndex: card.blockIndex,
  }));
}

export function createStoryboardState(total: number): AcademyStoryboardState {
  if (!(total > 0)) {
    return { index: 0, total: 0, status: "complete" };
  }
  return { index: 0, total, status: "idle" };
}

export function storyboardProgress(state: AcademyStoryboardState): AcademyStoryboardProgress {
  if (!(state.total > 0)) {
    return { current: 0, total: 0, ratio: 0 };
  }
  const current = Math.min(state.index + 1, state.total);
  return {
    current,
    total: state.total,
    ratio: current / state.total,
  };
}

export function storyboardCardHasSpeech(card: AcademyStoryboardCard | undefined): boolean {
  return Boolean(card?.speaker && card.spokenText.trim());
}

/**
 * Koray / Maya aynı kartta durmaz. Her kartın speaker alanı en fazla bir cast üyesidir.
 */
export function storyboardSpeakersAreLocked(cards: readonly AcademyStoryboardCard[]): boolean {
  if (cards.length === 0) {
    return false;
  }
  return cards.every((card) => {
    const speakers = new Set<"moderator" | "instructor" | "announcer">();
    if (card.kind === "moderator" || card.speaker === "moderator") {
      speakers.add("moderator");
    }
    if (card.kind === "instructor" || card.speaker === "instructor") {
      speakers.add("instructor");
    }
    if (card.kind === "announcer" || card.speaker === "announcer") {
      speakers.add("announcer");
    }
    if (speakers.size > 1) {
      return false;
    }
    if (card.kind === "moderator" && card.speaker !== "moderator") {
      return false;
    }
    if (card.kind === "instructor" && card.speaker !== "instructor") {
      return false;
    }
    if (card.kind === "announcer" && card.speaker !== "announcer") {
      return false;
    }
    return true;
  });
}

export function storyboardAdjacentSpeakersDoNotOverlap(
  cards: readonly AcademyStoryboardCard[],
): boolean {
  for (let index = 0; index < cards.length - 1; index += 1) {
    const current = cards[index]!;
    const next = cards[index + 1]!;
    if (!storyboardCardHasSpeech(current) || !storyboardCardHasSpeech(next)) {
      continue;
    }
    if (current.speaker === next.speaker) {
      continue;
    }
    if (current.speaker === "moderator" && next.speaker === "instructor") {
      continue;
    }
    if (current.speaker === "instructor" && next.speaker === "moderator") {
      continue;
    }
    if (current.speaker === "announcer" || next.speaker === "announcer") {
      continue;
    }
  }
  return true;
}

export function canAdvanceStoryboard(
  state: AcademyStoryboardState,
  reason: StoryboardAdvanceReason,
): boolean {
  if (!(state.total > 0) || state.index >= state.total - 1) {
    return false;
  }
  return reason === "ended" || reason === "click";
}

export function completeStoryboard(state: AcademyStoryboardState): AcademyStoryboardState {
  if (!(state.total > 0)) {
    return { ...state, status: "complete" };
  }
  return {
    index: state.total - 1,
    total: state.total,
    status: "complete",
  };
}

/**
 * Ses (`ended`) veya kart süresi bitince +1. Son kartta storyboard kapanır.
 * Atlama yok — `advanceStoryboard` ile aynı kilit.
 */
export function handleStoryboardMediaEnded(state: AcademyStoryboardState): AcademyStoryboardState {
  if (canAdvanceStoryboard(state, "ended")) {
    return advanceStoryboard(state, "ended");
  }
  return completeStoryboard(state);
}

/** Konuşması olmayan kart (şema / kod / mikro-video) dinlerken bekler. Egzersiz tıklama bekler. */
export const ACADEMY_STORYBOARD_VISUAL_DWELL_MS = 4_000;

export function storyboardVisualDwellMs(
  card: AcademyStoryboardCard | null | undefined,
  opts?: { videoDurationSec?: number },
): number | null {
  if (!card || storyboardCardHasSpeech(card) || card.kind === "exercise") {
    return null;
  }
  if (card.kind === "micro-video") {
    const sec = opts?.videoDurationSec;
    if (typeof sec === "number" && Number.isFinite(sec) && sec > 0) {
      return Math.round(sec * 1000);
    }
  }
  return ACADEMY_STORYBOARD_VISUAL_DWELL_MS;
}

/**
 * Yalnız +1. Kart 1 (Koray) bitmeden / tıklanmadan Kart 2 (Maya) açılmaz.
 * Atlama (0→2) reddedilir.
 */
export function advanceStoryboard(
  state: AcademyStoryboardState,
  reason: StoryboardAdvanceReason,
): AcademyStoryboardState {
  if (!canAdvanceStoryboard(state, reason)) {
    if (state.total > 0 && state.index >= state.total - 1) {
      return completeStoryboard(state);
    }
    return state;
  }
  const index = state.index + 1;
  return {
    index,
    total: state.total,
    status: "playing",
  };
}

export function skipAheadIsForbidden(fromIndex: number, toIndex: number): boolean {
  return toIndex !== fromIndex && toIndex !== fromIndex + 1;
}

export function applyStoryboardTargetIndex(
  state: AcademyStoryboardState,
  toIndex: number,
  reason: StoryboardAdvanceReason,
): AcademyStoryboardState {
  if (toIndex === state.index) {
    return state;
  }
  if (skipAheadIsForbidden(state.index, toIndex)) {
    return state;
  }
  if (toIndex !== state.index + 1) {
    return state;
  }
  return advanceStoryboard(state, reason);
}

/** Konuşulan kartların TTS parça dizisindeki sırası. Görsel kart parça tüketmez. */
export function storyboardSpokenPartIndex(
  cards: readonly AcademyStoryboardCard[],
  cardIndex: number,
): number | null {
  const card = cards[cardIndex];
  if (!storyboardCardHasSpeech(card)) {
    return null;
  }
  let part = -1;
  for (let index = 0; index <= cardIndex; index += 1) {
    if (storyboardCardHasSpeech(cards[index])) {
      part += 1;
    }
  }
  return part;
}

export function activeStoryboardSpeaker(
  cards: readonly AcademyStoryboardCard[],
  index: number,
): AcademyStoryboardCard["speaker"] {
  return cards[index]?.speaker ?? null;
}

export function isAcademyPilotSku(slug: string): boolean {
  return slug === ACADEMY_PILOT_SKU_SLUG;
}
