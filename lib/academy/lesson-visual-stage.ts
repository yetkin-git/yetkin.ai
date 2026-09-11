/**
 * Ders göz katmanı — kayan eğitim metni + cue aralığında slayt kartı.
 * Punch 8 sn (Veo/Nano); sonrası cue `end`’e kadar hold/rest. Compact müfredat şişmez.
 * Veo bake yoksa Nano Banana plaka; izlemede VIDEO_GEN yok.
 */

import { resolveAcademyCinemaSource, type AcademyCinemaKind } from "@/lib/academy/lesson-cinema";
import { loadAcademyLessonPlaybackCues } from "@/lib/academy/lesson-cues";

/** Veo 3.1 sahne kartı punch — 8 sn; görünürlük cue aralığıdır. */
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

/** Ofis AI sinema plakası — Nano Banana yoksa aynı JPG placeholder. */
const OFFICE_AI_CINEMA_POSTER = "/academy/cinema/01_office_ai-1-eye.jpg";
/** E-ticaret AI sinema plakası — pazaryeri paneli, SEO arayüzü, müşteri soruları ve iade analiz kartı. */
const ECOMMERCE_AI_CINEMA_POSTER = "/academy/cinema/02_ecommerce_ai-1-eye.jpg";
/** Sosyal medya AI sinema plakası — Reels/görsel fabrika kartı. */
const SOCIAL_MEDIA_AI_CINEMA_POSTER = "/academy/cinema/03_social_media_ai-1-eye.jpg";
/** Kodsuz chatbot sinema plakası — Voiceflow tuvali, WhatsApp ve web asistan kartı. */
const CHATBOT_NOCODE_CINEMA_POSTER = "/academy/cinema/04_chatbot_nocode-1-eye.jpg";
/** Prompt üretkenlik sinema plakası — üç sohbet paneli, ofis masası, istem mimarisi kartı. */
const PROMPT_PRACTICE_CINEMA_POSTER = "/academy/cinema/05_prompt_practice-1-eye.jpg";

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
 * Varsayılan göz plakası — `{sku}-1-eye.jpg`.
 * Özel cue JPG yoksa kart ve backdrop buraya düşer.
 */
export function academyCinemaEyeFallbackPublicPath(lessonKey: string): string {
  const sku = lessonKey.trim().replace(/-\d+$/u, "");
  return `/academy/cinema/${sku}-1-eye.jpg`;
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

function officeAiNanoStage(lessonKey: string, posterSrc: string): AcademyLessonVisualStage {
  return {
    lessonKey,
    posterSrc,
    cards: loadAcademyLessonPlaybackCues(lessonKey).map((cue) => nanoCard(lessonKey, cue, posterSrc)),
  };
}

const STAGE_BY_LESSON_KEY: Readonly<Record<string, AcademyLessonVisualStage>> = {
  "01_office_ai-1": officeAiNanoStage("01_office_ai-1", OFFICE_AI_CINEMA_POSTER),
  "01_office_ai-2": officeAiNanoStage("01_office_ai-2", OFFICE_AI_CINEMA_POSTER),
  "01_office_ai-3": officeAiNanoStage("01_office_ai-3", OFFICE_AI_CINEMA_POSTER),
  "01_office_ai-4": officeAiNanoStage("01_office_ai-4", OFFICE_AI_CINEMA_POSTER),
  "01_office_ai-5": officeAiNanoStage("01_office_ai-5", OFFICE_AI_CINEMA_POSTER),
  "01_office_ai-6": officeAiNanoStage("01_office_ai-6", OFFICE_AI_CINEMA_POSTER),
  "02_ecommerce_ai-1": officeAiNanoStage("02_ecommerce_ai-1", ECOMMERCE_AI_CINEMA_POSTER),
  "02_ecommerce_ai-2": officeAiNanoStage("02_ecommerce_ai-2", ECOMMERCE_AI_CINEMA_POSTER),
  /** Müşteri soruları ve iade analiz paneli — Q&A / Sentiment kartları; aynı e-ticaret plakası. */
  "02_ecommerce_ai-3": officeAiNanoStage("02_ecommerce_ai-3", ECOMMERCE_AI_CINEMA_POSTER),
  /** Rakip fiyat, Buybox ve kârlılık kalkanı — aynı e-ticaret plakası. */
  "02_ecommerce_ai-4": officeAiNanoStage("02_ecommerce_ai-4", ECOMMERCE_AI_CINEMA_POSTER),
  /** Pazaryeri görsel konsepti, infografik ve sosyal vitrin — aynı e-ticaret plakası. */
  "02_ecommerce_ai-5": officeAiNanoStage("02_ecommerce_ai-5", ECOMMERCE_AI_CINEMA_POSTER),
  /** Kriz, iade ve masterclass kapanışı — aynı e-ticaret plakası. */
  "02_ecommerce_ai-6": officeAiNanoStage("02_ecommerce_ai-6", ECOMMERCE_AI_CINEMA_POSTER),
  "03_social_media_ai-1": officeAiNanoStage("03_social_media_ai-1", SOCIAL_MEDIA_AI_CINEMA_POSTER),
  "03_social_media_ai-2": officeAiNanoStage("03_social_media_ai-2", SOCIAL_MEDIA_AI_CINEMA_POSTER),
  "03_social_media_ai-3": officeAiNanoStage("03_social_media_ai-3", SOCIAL_MEDIA_AI_CINEMA_POSTER),
  "03_social_media_ai-4": officeAiNanoStage("03_social_media_ai-4", SOCIAL_MEDIA_AI_CINEMA_POSTER),
  "03_social_media_ai-5": officeAiNanoStage("03_social_media_ai-5", SOCIAL_MEDIA_AI_CINEMA_POSTER),
  "03_social_media_ai-6": officeAiNanoStage("03_social_media_ai-6", SOCIAL_MEDIA_AI_CINEMA_POSTER),
  "04_chatbot_nocode-1": officeAiNanoStage("04_chatbot_nocode-1", CHATBOT_NOCODE_CINEMA_POSTER),
  "04_chatbot_nocode-2": officeAiNanoStage("04_chatbot_nocode-2", CHATBOT_NOCODE_CINEMA_POSTER),
  "04_chatbot_nocode-3": officeAiNanoStage("04_chatbot_nocode-3", CHATBOT_NOCODE_CINEMA_POSTER),
  "04_chatbot_nocode-4": officeAiNanoStage("04_chatbot_nocode-4", CHATBOT_NOCODE_CINEMA_POSTER),
  "04_chatbot_nocode-5": officeAiNanoStage("04_chatbot_nocode-5", CHATBOT_NOCODE_CINEMA_POSTER),
  "04_chatbot_nocode-6": officeAiNanoStage("04_chatbot_nocode-6", CHATBOT_NOCODE_CINEMA_POSTER),
  "05_prompt_practice-1": officeAiNanoStage("05_prompt_practice-1", PROMPT_PRACTICE_CINEMA_POSTER),
  "05_prompt_practice-2": officeAiNanoStage("05_prompt_practice-2", PROMPT_PRACTICE_CINEMA_POSTER),
  "05_prompt_practice-3": officeAiNanoStage("05_prompt_practice-3", PROMPT_PRACTICE_CINEMA_POSTER),
  "05_prompt_practice-4": officeAiNanoStage("05_prompt_practice-4", PROMPT_PRACTICE_CINEMA_POSTER),
  "05_prompt_practice-5": officeAiNanoStage("05_prompt_practice-5", PROMPT_PRACTICE_CINEMA_POSTER),
  "05_prompt_practice-6": officeAiNanoStage("05_prompt_practice-6", PROMPT_PRACTICE_CINEMA_POSTER),
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

/** Cue aralığının punch sonrası hold/rest süresi. */
export function academyVisualCardHoldSec(card: AcademyVisualCardWindow): number {
  return Math.max(0, academyVisualCardWindowEnd(card) - academyVisualCardPunchEnd(card));
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
    return (
      cue != null &&
      card.cueId === cue.id &&
      card.startSec === cue.start &&
      card.endSec === cue.end &&
      card.src === academyCinemaCueSlidePublicPath(lessonKey, cue.id)
    );
  });
}
