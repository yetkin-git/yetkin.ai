import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";
import type { JuniorLessonScenario } from "@/lib/junior/scenario";
import type { JuniorCourseSlug, MebOutcome, SchoolWeek, TopicCalendar } from "@yetkin/junior-content";

export type { JuniorCourseSlug, MebOutcome, SchoolWeek, TopicCalendar };

/** Müfredat dışı arşiv rafının etiketi. 2018 kaynaklı ve ücretsiz olmayan dersler bu rafa girer. */
export const JUNIOR_LEGACY_ARCHIVE_LABEL = "Müfredat dışı / Arşiv";
/** Ücretsiz ilk ders kapısının etiketi. Güncel haftanın dersinde (ve ücretsiz arşiv dışı açılışlarda) görünür. */
export const JUNIOR_FREE_STARTER_LABEL = "Ücretsiz ilk ders";

export interface JuniorContentSource {
  course(slug: JuniorCourseSlug): {
    outcomes: readonly MebOutcome[];
    topics: readonly TopicCalendar[];
    weeks: readonly SchoolWeek[];
  };
  scenario(lessonKey: string): JuniorLessonScenario;
  quiz(lessonKey: string): JuniorLessonQuizPack;
}
