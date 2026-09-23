/**
 * Satın almamış oynatıcı — ders kabuğu.
 * Gövde, diyagram ve mikro video istemciye gitmez.
 * Ücretsiz kapı hazırlık şerididir (`01_office_ai-0`); ana ders bu listeye açık girmez.
 * `isPreviewAllowed: true` ana dersi açamaz. `01_office_ai-1` ve `01_office_ai-k1` kilitlidir.
 */

import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  isAcademyFreePreviewLessonKey,
  isAcademyLessonPaywalled,
} from "@/lib/academy/purchase-path";

export type AcademyPaywallLockedLessonShell = {
  key: string;
  order: number;
  title: string;
  body: "";
  completed: false;
  open: false;
};

/** Müfredat bayrağı önizlemeye yetmez. Anahtar hazırlık şeridi değilse kapalıdır. */
export function academySectionAllowsFreePreview(section: {
  lessonKey?: string;
  isPreviewAllowed?: boolean;
  isLocked?: boolean;
}): boolean {
  const key = section.lessonKey?.trim() ?? "";
  if (!key || section.isLocked === true || section.isPreviewAllowed !== true) {
    return false;
  }
  return isAcademyFreePreviewLessonKey(key);
}

/**
 * Oynatıcı satırı. Ödeme duvarında `lesson.open` yok sayılır.
 * `01_office_ai-1` ve `01_office_ai-k1` dahil 1–8 kilitlidir.
 */
export function isAcademyPlayerPaywallLessonLocked(
  courseSlug: string,
  lessonKey: string,
  paywallLocked: boolean,
): boolean {
  if (!paywallLocked) {
    return false;
  }
  return isAcademyLessonPaywalled(courseSlug, lessonKey, false);
}

export function academyPaywallLockedLessonShells(
  courseSlug: string,
): AcademyPaywallLockedLessonShell[] {
  return curriculumForCourseSlug(courseSlug).map((lesson) => ({
    key: lesson.key,
    order: lesson.order,
    title: lesson.title,
    body: "",
    completed: false,
    open: false,
  }));
}
