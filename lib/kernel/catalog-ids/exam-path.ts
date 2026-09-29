/**
 * Sınav yolu anahtarları. Kenar bu tabloyu okur; akademi motorunu import etmez.
 * Sıra fonksiyonları `lib/academy/curricula/lesson-index.ts` içindedir.
 * Boş dizi kabuktur: ilk ders yoktur, ücretsiz kapı açılmaz.
 * Mühür listesi `ACADEMY_MEDIA_SEALED_AUDIO` bu tablonun dolu satırlarından türer.
 */

export const CURRICULUM_LESSON_KEYS_BY_SLUG: Readonly<Record<string, readonly string[]>> = {
  "01_office_ai": [
    "01_office_ai-1",
    "01_office_ai-k1",
    "01_office_ai-2",
    "01_office_ai-3",
    "01_office_ai-5",
    "01_office_ai-g1",
    "01_office_ai-w1",
    "01_office_ai-6",
  ],
  "01_office_ai_ileri": [
    "01_office_ai_ileri-1",
    "01_office_ai_ileri-2",
    "01_office_ai_ileri-3",
    "01_office_ai_ileri-4",
    "01_office_ai_ileri-5",
    "01_office_ai_ileri-6",
  ],
  "02_ecommerce_ai": [
    "02_ecommerce_ai-1",
    "02_ecommerce_ai-2",
    "02_ecommerce_ai-3",
    "02_ecommerce_ai-4",
    "02_ecommerce_ai-5",
    "02_ecommerce_ai-6",
  ],
  "03_social_media_ai": [],
  "04_chatbot_nocode": [],
  "05_prompt_practice": [],
};

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
