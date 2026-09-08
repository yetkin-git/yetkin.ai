/**
 * Akademi nabzı — yarım kalan kursun slug'ı ve sıradaki ders anahtarı.
 * Müfredat gövdesi yok; yalnız lesson-index.
 */

import { nextAcademyLessonKeyFromIndex } from "@/lib/academy/curricula/lesson-index";

export type AcademyPulseContinue = {
  lastCourseSlug: string | null;
  nextLessonKey: string | null;
};

const EMPTY_CONTINUE: AcademyPulseContinue = {
  lastCourseSlug: null,
  nextLessonKey: null,
};

export function pickLastIncompleteAcademyPurchase<
  T extends { id: string; settledAt: Date },
>(purchases: readonly T[], certifiedPurchaseIds: ReadonlySet<string>): T | null {
  return (
    [...purchases]
      .sort((a, b) => b.settledAt.getTime() - a.settledAt.getTime())
      .find((row) => !certifiedPurchaseIds.has(row.id)) ?? null
  );
}

export function academyPulseContinueFields(input: {
  courseSlug: string | null | undefined;
  completedLessonKeys: readonly string[];
}): AcademyPulseContinue {
  const lastCourseSlug = input.courseSlug?.trim() || null;
  if (!lastCourseSlug) {
    return EMPTY_CONTINUE;
  }
  return {
    lastCourseSlug,
    nextLessonKey: nextAcademyLessonKeyFromIndex(lastCourseSlug, input.completedLessonKeys),
  };
}
