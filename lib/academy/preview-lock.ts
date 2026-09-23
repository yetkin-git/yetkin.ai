/**
 * Satın almamış oynatıcı — ders kabuğu.
 * Gövde, diyagram ve mikro video istemciye gitmez. Açık ders yoktur.
 * Ücretsiz kapı hazırlık şerididir (`01_office_ai-0`); bu listeye girmez.
 */

import { curriculumForCourseSlug } from "@/lib/academy/curriculum";

export type AcademyPaywallLockedLessonShell = {
  key: string;
  order: number;
  title: string;
  body: "";
  completed: false;
  open: false;
};

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
