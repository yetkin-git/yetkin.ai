/**
 * Katalog / devam paneli — gövdesiz müfredat indeksi.
 * Taslak gövdeleri ve curriculum.ts bu dosyayı import etmez; bu dosya onları import etmez.
 * Anahtar kuralı: ${slug}-${1..n}. Sapma testte kırılır.
 */

export const CURRICULUM_LESSON_COUNT_BY_SLUG: Readonly<Record<string, number>> = {
  "01_office_ai": 6,
  "02_ecommerce_ai": 6,
  "03_social_media_ai": 6,
  "04_chatbot_nocode": 6,
  "05_prompt_practice": 6,
};

export function curriculumLessonCountForSlug(slug: string): number {
  return CURRICULUM_LESSON_COUNT_BY_SLUG[slug] ?? 0;
}

export function curriculumLessonKeysForSlug(slug: string): readonly string[] {
  const count = curriculumLessonCountForSlug(slug);
  if (count === 0) {
    return [];
  }
  return Array.from({ length: count }, (_, i) => `${slug}-${i + 1}`);
}

export function isAcademyCurriculumCompleteFromIndex(
  slug: string,
  completedKeys: readonly string[],
): boolean {
  const keys = curriculumLessonKeysForSlug(slug);
  if (keys.length === 0) {
    return false;
  }
  const done = new Set(completedKeys);
  return keys.every((key) => done.has(key));
}

export function nextAcademyLessonKeyFromIndex(
  slug: string,
  completedKeys: readonly string[],
): string | null {
  const done = new Set(completedKeys);
  return curriculumLessonKeysForSlug(slug).find((key) => !done.has(key)) ?? null;
}
