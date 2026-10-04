/**
 * Sınav yolu anahtarları. Kenar bu tabloyu okur; akademi motorunu import etmez.
 * Sıra fonksiyonları `lib/academy/curricula/lesson-index.ts` içindedir.
 * Boş dizi kabuktur: ilk ders yoktur, ücretsiz kapı açılmaz.
 * Mühür listesi `ACADEMY_MEDIA_SEALED_AUDIO` bu tablonun dolu satırlarından türer.
 * Anahtarlar `course-registry.ts` kartındaki `lessonKeys` alanından okunur.
 * Yalnız `audience === "adult"` kartlar girer. Junior kendi odasındadır; bu deftere yazılmaz.
 */

import { COURSE_REGISTRY } from "@yetkin/kernel/catalog-ids/course-registry";

export const CURRICULUM_LESSON_KEYS_BY_SLUG: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  COURSE_REGISTRY.filter((row) => row.audience === "adult" && row.lessonKeys.length > 0).map((row) => [
    row.slug,
    row.lessonKeys,
  ]),
);

export const CURRICULUM_LESSON_COUNT_BY_SLUG: Readonly<Record<string, number>> = Object.fromEntries(
  Object.entries(CURRICULUM_LESSON_KEYS_BY_SLUG).map(([slug, keys]) => [slug, keys.length]),
);

export function curriculumExamPathKeys(courseSlug: string): readonly string[] {
  return CURRICULUM_LESSON_KEYS_BY_SLUG[courseSlug.trim()] ?? [];
}

/** Sınav yolunun ilk anahtarı. Boş kabukta `null`. */
export function curriculumExamPathFirstLessonKey(courseSlug: string): string | null {
  return curriculumExamPathKeys(courseSlug)[0] ?? null;
}

export function curriculumExamPathHasOpeningLesson(courseSlug: string): boolean {
  return curriculumExamPathFirstLessonKey(courseSlug) !== null;
}

/** Anahtar, herhangi bir kursun sınav yolundaki ilk ders midir. */
export function isCurriculumExamPathFirstLessonKey(lessonKey: string): boolean {
  const key = lessonKey.trim();
  if (!key) {
    return false;
  }
  for (const keys of Object.values(CURRICULUM_LESSON_KEYS_BY_SLUG)) {
    if (keys[0] === key) {
      return true;
    }
  }
  return false;
}
