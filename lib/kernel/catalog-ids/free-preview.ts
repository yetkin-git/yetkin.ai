/**
 * Ücretsiz kapı. Slug listesi yoktur.
 * Bir kursun sınav yolunun ilk anahtarı herkese açıktır.
 * Tablo `exam-path.ts` içindedir. Kenar akademi motorunu import etmez.
 * Boş kabuk (0 ders) kapalıdır.
 */

import {
  curriculumExamPathFirstLessonKey,
  curriculumExamPathHasOpeningLesson,
  isCurriculumExamPathFirstLessonKey,
} from "@/lib/kernel/catalog-ids/exam-path";

export function academyCourseOffersFreePreview(courseSlug: string): boolean {
  return curriculumExamPathHasOpeningLesson(courseSlug);
}

export function academyExamPathFirstLessonKey(courseSlug: string): string | null {
  return curriculumExamPathFirstLessonKey(courseSlug);
}

export function isAcademyExamPathFirstLessonKey(lessonKey: string): boolean {
  return isCurriculumExamPathFirstLessonKey(lessonKey);
}
