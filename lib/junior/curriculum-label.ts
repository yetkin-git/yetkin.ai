/**
 * Müfredat saatinin vitrin etiketi.
 * `hoursBasis === "meb"` resmi saat karşılığıdır ve ayrı bir "Resmi MEB Saati" rozeti basmaz.
 * `plan` ve `unit-split` planlama payıdır. `FB.6.7` ve `T.6.6` kamu dizininde olmayan ek temadır.
 */

import { juniorCalendarBundle } from "@yetkin/junior-content/calendar";
import { JUNIOR_PILOT_SLUGS } from "@/lib/junior/limits";

export const JUNIOR_CURRICULUM_SUPPORT_LABEL = "Müfredat Destek";
export const JUNIOR_EXTRA_THEME_LABEL = "Ek Tema";

const EXTRA_THEME_CODES = new Set(["FB.6.7", "T.6.6"]);

export function juniorLessonCurriculumLabel(slug: string, lessonKey: string): string | null {
  if (!(JUNIOR_PILOT_SLUGS as readonly string[]).includes(slug)) {
    return null;
  }
  const bundle = juniorCalendarBundle(slug as (typeof JUNIOR_PILOT_SLUGS)[number]);
  const topic = bundle.topics.find((item) => item.lessonKey === lessonKey);
  if (!topic || topic.band !== "tymm" || topic.outcomeCodes.length === 0) {
    return null;
  }
  const outcomes = topic.outcomeCodes.flatMap((code) => {
    const outcome = bundle.outcomes.find((item) => item.outcomeCode === code);
    return outcome ? [outcome] : [];
  });
  if (outcomes.length === 0) {
    return null;
  }
  const extra = outcomes.some((outcome) => EXTRA_THEME_CODES.has(outcome.themeCode));
  const support = outcomes.some(
    (outcome) => outcome.hoursBasis === "plan" || outcome.hoursBasis === "unit-split",
  );
  if (extra && support) {
    return `${JUNIOR_CURRICULUM_SUPPORT_LABEL} · ${JUNIOR_EXTRA_THEME_LABEL}`;
  }
  if (extra) {
    return JUNIOR_EXTRA_THEME_LABEL;
  }
  if (support) {
    return JUNIOR_CURRICULUM_SUPPORT_LABEL;
  }
  return null;
}
