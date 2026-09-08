/**
 * Ders göz katmanı — kayan eğitim metni + cue geçişinde 8 sn medya kartı.
 * Compact müfredat şişmez. Veo bake yoksa Nano Banana plaka; izlemede VIDEO_GEN yok.
 */

import { resolveAcademyCinemaSource, type AcademyCinemaKind } from "@/lib/academy/lesson-cinema";
import { loadAcademyLessonCues, loadAcademyLessonPlaybackCues } from "@/lib/academy/lesson-cues";

/** Veo 3.1 sahne kartı — 8 sn. */
export const ACADEMY_VEO_SCENE_DURATION_SEC = 8 as const;
export const ACADEMY_VEO_SCENE_DURATION_MIN_SEC = ACADEMY_VEO_SCENE_DURATION_SEC;
export const ACADEMY_VEO_SCENE_DURATION_MAX_SEC = ACADEMY_VEO_SCENE_DURATION_SEC;

export type AcademyVisualStageMotion = "idle" | "punch" | "hold" | "rest";
export type AcademyVisualMediaKind = "veo" | "nano";

export type AcademyLessonVisualCard = {
  cueId: string;
  kind: AcademyVisualMediaKind;
  startSec: number;
  durationSec: number;
  src: string;
  posterSrc: string;
};

export type AcademyLessonVisualStage = {
  lessonKey: string;
  posterSrc: string;
  cards: readonly AcademyLessonVisualCard[];
};

/** Ofis AI sinema plakası — Nano Banana yoksa aynı JPG placeholder. */
const OFFICE_AI_CINEMA_POSTER = "/academy/cinema/01_office_ai-1-eye.jpg";

function nanoCard(cueId: string, startSec: number, posterSrc: string): AcademyLessonVisualCard {
  return {
    cueId,
    kind: "nano",
    startSec,
    durationSec: ACADEMY_VEO_SCENE_DURATION_SEC,
    src: posterSrc,
    posterSrc,
  };
}

function officeAiNanoStage(lessonKey: string, posterSrc: string): AcademyLessonVisualStage {
  return {
    lessonKey,
    posterSrc,
    cards: loadAcademyLessonPlaybackCues(lessonKey).map((cue) => nanoCard(cue.id, cue.start, posterSrc)),
  };
}

const STAGE_BY_LESSON_KEY: Readonly<Record<string, AcademyLessonVisualStage>> = {
  "01_office_ai-1": officeAiNanoStage("01_office_ai-1", OFFICE_AI_CINEMA_POSTER),
  "01_office_ai-2": officeAiNanoStage("01_office_ai-2", OFFICE_AI_CINEMA_POSTER),
  "01_office_ai-3": officeAiNanoStage("01_office_ai-3", OFFICE_AI_CINEMA_POSTER),
  "01_office_ai-4": officeAiNanoStage("01_office_ai-4", OFFICE_AI_CINEMA_POSTER),
  "01_office_ai-5": officeAiNanoStage("01_office_ai-5", OFFICE_AI_CINEMA_POSTER),
  "01_office_ai-6": officeAiNanoStage("01_office_ai-6", OFFICE_AI_CINEMA_POSTER),
};

export function isAcademyVeoSceneDurationSec(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= ACADEMY_VEO_SCENE_DURATION_MIN_SEC &&
    value <= ACADEMY_VEO_SCENE_DURATION_MAX_SEC
  );
}

export function loadAcademyLessonVisualStage(lessonKey: string): AcademyLessonVisualStage | null {
  return STAGE_BY_LESSON_KEY[lessonKey.trim()] ?? null;
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

export function academyVisualCardWindowEnd(card: Pick<AcademyLessonVisualCard, "startSec" | "durationSec">): number {
  return card.startSec + card.durationSec;
}

export function academyVisualStageActiveCard(
  stage: Pick<AcademyLessonVisualStage, "cards">,
  currentTime: number,
): AcademyLessonVisualCard | null {
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  for (const card of stage.cards) {
    if (t >= card.startSec && t < academyVisualCardWindowEnd(card)) {
      return card;
    }
  }
  return null;
}

export function academyVisualStageIsInWindow(
  stage: Pick<AcademyLessonVisualStage, "cards"> | Pick<AcademyLessonVisualCard, "startSec" | "durationSec">,
  currentTime: number,
): boolean {
  if ("cards" in stage) {
    return academyVisualStageActiveCard(stage, currentTime) != null;
  }
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  return t >= stage.startSec && t < academyVisualCardWindowEnd(stage);
}

export function academyVisualStageMotion(
  stage: Pick<AcademyLessonVisualStage, "cards"> | Pick<AcademyLessonVisualCard, "startSec" | "durationSec">,
  currentTime: number,
  playing: boolean,
): AcademyVisualStageMotion {
  const card =
    "cards" in stage
      ? academyVisualStageActiveCard(stage, currentTime)
      : academyVisualStageIsInWindow(stage, currentTime)
        ? stage
        : null;
  if (!card) {
    const t = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
    return t > 0.05 ? "rest" : "idle";
  }
  const t = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
  if (t >= card.startSec && t < academyVisualCardWindowEnd(card)) {
    return playing || t > card.startSec + 0.05 ? "punch" : "idle";
  }
  return "rest";
}

/** Cue başlangıçları kart SSOT ile kilitli kalsın. */
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
    return cue != null && card.cueId === cue.id && card.startSec === cue.start;
  });
}
