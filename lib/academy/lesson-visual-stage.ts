/**
 * Ders göz katmanı — tam boy canlı ekran + beat punchcard rozeti.
 * Punch 8 sn (Veo Lite / Nano). Veo Warm-up: 8.00’de donmuş kare yok — canlı Excel masasına kes.
 * Nano: sonrası cue `end`’e kadar hold/rest. Compact müfredat şişmez.
 * Yerel MP4 yoksa Nano Banana 2 plaka + CSS Ken Burns; izlemede VIDEO_GEN yok. Pahalı Veo 3.1 yok.
 */

import { academyVisualCinematicFrameSrc } from "@/lib/academy/excel-workspace";
import { resolveAcademyCinemaSource, type AcademyCinemaKind } from "@/lib/academy/lesson-cinema";
import { loadAcademyLessonPlaybackCues } from "@/lib/academy/lesson-cues";
import { academyLessonWarmupVeoAssetKey, academyLessonWarmupVeoCueId } from "@/lib/academy/lesson-veo";

/** Veo 3.1 Lite sahne kartı punch — 8 sn; görünürlük cue aralığıdır. */
export const ACADEMY_VEO_SCENE_DURATION_SEC = 8 as const;
export const ACADEMY_VEO_SCENE_DURATION_MIN_SEC = ACADEMY_VEO_SCENE_DURATION_SEC;
export const ACADEMY_VEO_SCENE_DURATION_MAX_SEC = ACADEMY_VEO_SCENE_DURATION_SEC;

export type AcademyVisualStageMotion = "idle" | "punch" | "hold" | "rest";
export type AcademyVisualMediaKind = "veo" | "nano";

export type AcademyLessonVisualCard = {
  cueId: string;
  kind: AcademyVisualMediaKind;
  startSec: number;
  /** Punch / Ken Burns penceresi — Veo sahne süresi. */
  durationSec: number;
  /** Cue aralığı sonu — kart hold/rest ile burada iner. */
  endSec: number;
  src: string;
  posterSrc: string;
};

export type AcademyLessonVisualStage = {
  lessonKey: string;
  posterSrc: string;
  cards: readonly AcademyLessonVisualCard[];
};

type AcademyVisualCardWindow = Pick<AcademyLessonVisualCard, "startSec" | "durationSec"> &
  Partial<Pick<AcademyLessonVisualCard, "endSec">>;

/** `cue-01` → `cue-1` — slayt dosya anahtarı. */
export function academyCinemaCueSlideId(cueId: string): string {
  const match = /^cue-0*([0-9]+)$/iu.exec(cueId.trim());
  return match ? `cue-${match[1]}` : cueId.trim();
}

/** Cue slaytı — `{lessonKey}-{cueId}.jpg`. */
export function academyCinemaCueSlidePublicPath(lessonKey: string, cueId: string): string {
  return `/academy/cinema/${lessonKey.trim()}-${academyCinemaCueSlideId(cueId)}.jpg`;
}

/**
 * Varsayılan göz plakası — taze ingest yokken marka mührü.
 * Cue JPG gelince kart `academyCinemaCueSlidePublicPath` kullanır.
 */
export function academyCinemaEyeFallbackPublicPath(lessonKey: string): string {
  return academyVisualCinematicFrameSrc(lessonKey.trim()) ?? "/icon.svg";
}

export function academyCinemaCueSlideSrcOrFallback(
  lessonKey: string,
  cueId: string,
  fallbackSrc: string,
  cueFileExists: boolean,
): string {
  return cueFileExists ? academyCinemaCueSlidePublicPath(lessonKey, cueId) : fallbackSrc;
}

function nanoCard(
  lessonKey: string,
  cue: { id: string; start: number; end: number },
  fallbackPoster: string,
): AcademyLessonVisualCard {
  const cueSrc = academyCinemaCueSlidePublicPath(lessonKey, cue.id);
  return {
    cueId: cue.id,
    kind: "nano",
    startSec: cue.start,
    durationSec: ACADEMY_VEO_SCENE_DURATION_SEC,
    endSec: cue.end,
    src: cueSrc,
    posterSrc: fallbackPoster,
  };
}

function veoWarmupCard(
  lessonKey: string,
  cue: { id: string; start: number; end: number },
  fallbackPoster: string,
): AcademyLessonVisualCard {
  return {
    cueId: cue.id,
    kind: "veo",
    startSec: cue.start,
    durationSec: ACADEMY_VEO_SCENE_DURATION_SEC,
    endSec: cue.end,
    src: academyLessonWarmupVeoAssetKey(lessonKey) ?? cue.id,
    posterSrc: fallbackPoster,
  };
}

function nanoStageFromCues(lessonKey: string): AcademyLessonVisualStage | null {
  const cues = loadAcademyLessonPlaybackCues(lessonKey);
  if (cues.length === 0) {
    return null;
  }
  const posterSrc = academyCinemaEyeFallbackPublicPath(lessonKey);
  const veoCueId = academyLessonWarmupVeoCueId(lessonKey);
  return {
    lessonKey,
    posterSrc,
    cards: cues.map((cue) =>
      veoCueId != null && cue.id === veoCueId
        ? veoWarmupCard(lessonKey, cue, posterSrc)
        : nanoCard(lessonKey, cue, posterSrc),
    ),
  };
}

export function isAcademyVeoSceneDurationSec(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= ACADEMY_VEO_SCENE_DURATION_MIN_SEC &&
    value <= ACADEMY_VEO_SCENE_DURATION_MAX_SEC
  );
}

export function loadAcademyLessonVisualStage(lessonKey: string): AcademyLessonVisualStage | null {
  return nanoStageFromCues(lessonKey.trim());
}

export function hasAcademyLessonVisualStage(lessonKey: string): boolean {
  return loadAcademyLessonVisualStage(lessonKey) != null;
}

export function academyVisualStageCinemaKind(stage: AcademyLessonVisualStage): AcademyCinemaKind {
  const veo = stage.cards.find((card) => card.kind === "veo");
  if (veo) {
    return resolveAcademyCinemaSource(veo.src).kind;
  }
  return "canvas";
}

export function academyVisualCardWindowEnd(card: AcademyVisualCardWindow): number {
  if (typeof card.endSec === "number" && Number.isFinite(card.endSec) && card.endSec > card.startSec) {
    return card.endSec;
  }
  return card.startSec + card.durationSec;
}

export function academyVisualCardPunchEnd(card: AcademyVisualCardWindow): number {
  const windowEnd = academyVisualCardWindowEnd(card);
  const punchEnd = card.startSec + card.durationSec;
  return punchEnd < windowEnd ? punchEnd : windowEnd;
}

/** Veo 3.1 Lite kaseti 8.00’de biter; hold/freeze yok, canlı masaya el değiştirir. */
export function academyVisualVeoPunchHasEnded(
  card: Pick<AcademyLessonVisualCard, "kind" | "startSec" | "durationSec" | "endSec">,
  currentTime: number,
): boolean {
  if (card.kind !== "veo") {
    return false;
  }
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  return t >= academyVisualCardPunchEnd(card);
}

/** Cue aralığının punch sonrası hold/rest süresi. */
export function academyVisualCardHoldSec(card: AcademyVisualCardWindow): number {
  return Math.max(0, academyVisualCardWindowEnd(card) - academyVisualCardPunchEnd(card));
}

export function academyVisualStageActiveCard(
  stage: Pick<AcademyLessonVisualStage, "cards">,
  currentTime: number,
): AcademyLessonVisualCard | null {
  const cards = stage.cards;
  if (cards.length === 0) {
    return null;
  }
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  const first = cards[0]!;
  const lastEnd = academyVisualCardWindowEnd(cards[cards.length - 1]!);
  if (t < first.startSec || t >= lastEnd) {
    return null;
  }
  let held = first;
  for (const card of cards) {
    if (t >= card.startSec) {
      held = card;
      continue;
    }
    break;
  }
  return held;
}

/** Sıradaki cue slaytı — tarayıcı preload; aktif yoksa ilk kart. */
export function academyVisualStageNextCard(
  stage: Pick<AcademyLessonVisualStage, "cards">,
  currentTime: number,
): AcademyLessonVisualCard | null {
  const cards = stage.cards;
  if (cards.length === 0) {
    return null;
  }
  const active = academyVisualStageActiveCard(stage, currentTime);
  if (!active) {
    return cards[0] ?? null;
  }
  const index = cards.findIndex((card) => card.cueId === active.cueId);
  if (index < 0 || index + 1 >= cards.length) {
    return null;
  }
  return cards[index + 1] ?? null;
}

export function academyVisualStageIsInWindow(
  stage: Pick<AcademyLessonVisualStage, "cards"> | AcademyVisualCardWindow,
  currentTime: number,
): boolean {
  if ("cards" in stage) {
    return academyVisualStageActiveCard(stage, currentTime) != null;
  }
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  return t >= stage.startSec && t < academyVisualCardWindowEnd(stage);
}

export function academyVisualStageMotion(
  stage: Pick<AcademyLessonVisualStage, "cards"> | AcademyVisualCardWindow,
  currentTime: number,
  playing: boolean,
): AcademyVisualStageMotion {
  const card =
    "cards" in stage
      ? academyVisualStageActiveCard(stage, currentTime)
      : academyVisualStageIsInWindow(stage, currentTime)
        ? stage
        : null;
  const t = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
  if (!card) {
    return t > 0.05 ? "rest" : "idle";
  }
  const punchEnd = academyVisualCardPunchEnd(card);
  const windowEnd = academyVisualCardWindowEnd(card);
  if (t >= card.startSec && t < punchEnd) {
    return playing || t > card.startSec + 0.05 ? "punch" : "idle";
  }
  if (t >= punchEnd && t < windowEnd) {
    return playing ? "hold" : "rest";
  }
  return "rest";
}

/** Cue başlangıç ve bitişleri kart SSOT ile kilitli kalsın. */
export function academyVisualStageCardsMatchCues(lessonKey: string): boolean {
  const stage = loadAcademyLessonVisualStage(lessonKey);
  if (!stage) {
    return true;
  }
  const cues = loadAcademyLessonPlaybackCues(lessonKey);
  if (stage.cards.length !== cues.length) {
    return false;
  }
  return stage.cards.every((card, index) => {
    const cue = cues[index];
    if (cue == null || card.cueId !== cue.id || card.startSec !== cue.start || card.endSec !== cue.end) {
      return false;
    }
    if (card.kind === "veo") {
      return card.src === (academyLessonWarmupVeoAssetKey(lessonKey) ?? card.src);
    }
    return card.src === academyCinemaCueSlidePublicPath(lessonKey, cue.id);
  });
}
