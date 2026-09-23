/**
 * 01_office_ai punchcard rozetleri — saat web timings JSON'dan türetilir.
 * Native TTS hop'u yoktur; elle kopyalanan saniye dizisi SSOT değildir.
 */

import officeAi1Cues from "../../../../lib/academy/lesson-cues/01_office_ai-1.json" with { type: "json" };
import officeAi2Cues from "../../../../lib/academy/lesson-cues/01_office_ai-2.json" with { type: "json" };
import officeAi3Cues from "../../../../lib/academy/lesson-cues/01_office_ai-3.json" with { type: "json" };
import officeAi4Cues from "../../../../lib/academy/lesson-cues/01_office_ai-4.json" with { type: "json" };
import officeAi5Cues from "../../../../lib/academy/lesson-cues/01_office_ai-5.json" with { type: "json" };
import officeAi6Cues from "../../../../lib/academy/lesson-cues/01_office_ai-6.json" with { type: "json" };
import officeAiG1Cues from "../../../../lib/academy/lesson-cues/01_office_ai-g1.json" with { type: "json" };
import officeAiW1Cues from "../../../../lib/academy/lesson-cues/01_office_ai-w1.json" with { type: "json" };
import officeAiK1Cues from "../../../../lib/academy/lesson-cues/01_office_ai-k1.json" with { type: "json" };
import officeAi1Timings from "../../../../lib/academy/lesson-audio-timings/01_office_ai-1.json" with { type: "json" };
import officeAi2Timings from "../../../../lib/academy/lesson-audio-timings/01_office_ai-2.json" with { type: "json" };
import officeAi3Timings from "../../../../lib/academy/lesson-audio-timings/01_office_ai-3.json" with { type: "json" };
import officeAi4Timings from "../../../../lib/academy/lesson-audio-timings/01_office_ai-4.json" with { type: "json" };
import officeAi5Timings from "../../../../lib/academy/lesson-audio-timings/01_office_ai-5.json" with { type: "json" };
import officeAi6Timings from "../../../../lib/academy/lesson-audio-timings/01_office_ai-6.json" with { type: "json" };
import officeAiG1Timings from "../../../../lib/academy/lesson-audio-timings/01_office_ai-g1.json" with { type: "json" };
import officeAiW1Timings from "../../../../lib/academy/lesson-audio-timings/01_office_ai-w1.json" with { type: "json" };
import officeAiK1Timings from "../../../../lib/academy/lesson-audio-timings/01_office_ai-k1.json" with { type: "json" };
import {
  ACADEMY_PUNCHCARD_MAX_WORDS,
  ACADEMY_WELCOME_PUNCHCARD_MAX_SEC,
  academyCitizenPunchcardLabel,
  punchcardLabelFromText,
  punchcardsFromSealedJson,
  type SealedPunchcard,
} from "../../../../lib/academy/punchcard-from-sealed-json";

export const DRON_PUNCHCARD_MAX_WORDS = ACADEMY_PUNCHCARD_MAX_WORDS;
export const DRON_WELCOME_PUNCHCARD_MAX_SEC = ACADEMY_WELCOME_PUNCHCARD_MAX_SEC;

export type DronAcademyPunchcard = SealedPunchcard;

export const DRON_OFFICE_AI_1_PUNCHCARDS: readonly DronAcademyPunchcard[] = punchcardsFromSealedJson(
  officeAi1Timings,
  officeAi1Cues,
);
export const DRON_OFFICE_AI_2_PUNCHCARDS: readonly DronAcademyPunchcard[] = punchcardsFromSealedJson(
  officeAi2Timings,
  officeAi2Cues,
);
export const DRON_OFFICE_AI_3_PUNCHCARDS: readonly DronAcademyPunchcard[] = punchcardsFromSealedJson(
  officeAi3Timings,
  officeAi3Cues,
);
export const DRON_OFFICE_AI_4_PUNCHCARDS: readonly DronAcademyPunchcard[] = punchcardsFromSealedJson(
  officeAi4Timings,
  officeAi4Cues,
);
export const DRON_OFFICE_AI_5_PUNCHCARDS: readonly DronAcademyPunchcard[] = punchcardsFromSealedJson(
  officeAi5Timings,
  officeAi5Cues,
);
export const DRON_OFFICE_AI_6_PUNCHCARDS: readonly DronAcademyPunchcard[] = punchcardsFromSealedJson(
  officeAi6Timings,
  officeAi6Cues,
);
export const DRON_OFFICE_AI_G1_PUNCHCARDS: readonly DronAcademyPunchcard[] = punchcardsFromSealedJson(
  officeAiG1Timings,
  officeAiG1Cues,
);
export const DRON_OFFICE_AI_W1_PUNCHCARDS: readonly DronAcademyPunchcard[] = punchcardsFromSealedJson(
  officeAiW1Timings,
  officeAiW1Cues,
);
export const DRON_OFFICE_AI_K1_PUNCHCARDS: readonly DronAcademyPunchcard[] = punchcardsFromSealedJson(
  officeAiK1Timings,
  officeAiK1Cues,
);

const PUNCHCARDS_BY_LESSON: Readonly<Record<string, readonly DronAcademyPunchcard[]>> = {
  "01_office_ai-1": DRON_OFFICE_AI_1_PUNCHCARDS,
  "01_office_ai-2": DRON_OFFICE_AI_2_PUNCHCARDS,
  "01_office_ai-3": DRON_OFFICE_AI_3_PUNCHCARDS,
  "01_office_ai-4": DRON_OFFICE_AI_4_PUNCHCARDS,
  "01_office_ai-5": DRON_OFFICE_AI_5_PUNCHCARDS,
  "01_office_ai-6": DRON_OFFICE_AI_6_PUNCHCARDS,
  "01_office_ai-g1": DRON_OFFICE_AI_G1_PUNCHCARDS,
  "01_office_ai-w1": DRON_OFFICE_AI_W1_PUNCHCARDS,
  "01_office_ai-k1": DRON_OFFICE_AI_K1_PUNCHCARDS,
};

export function dronPunchcardLabel(text: string): string {
  return academyCitizenPunchcardLabel(punchcardLabelFromText(text, DRON_PUNCHCARD_MAX_WORDS));
}

export function dronAcademyPunchcardsForLesson(lessonKey: string): readonly DronAcademyPunchcard[] {
  return PUNCHCARDS_BY_LESSON[lessonKey.trim()] ?? [];
}

export function dronLessonDeliveryLabel(lessonKey: string): "Sesli anlatım" | "Makale / Okuma Metni" {
  return dronAcademyPunchcardsForLesson(lessonKey.trim()).length > 0 ? "Sesli anlatım" : "Makale / Okuma Metni";
}

export function dronActivePunchcard(
  cards: readonly DronAcademyPunchcard[],
  currentTime: number,
): DronAcademyPunchcard | null {
  if (cards.length === 0) {
    return null;
  }
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  for (const card of cards) {
    if (t >= card.start && t < card.end) {
      return card;
    }
  }
  return null;
}
