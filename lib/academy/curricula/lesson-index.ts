/**
 * Katalog / devam paneli — gövdesiz müfredat indeksi.
 * Taslak gövdeleri ve curriculum.ts bu dosyayı import etmez; bu dosya onları import etmez.
 * Anahtarlar taslak key dizisidir; ofis amiral 9 ders.
 * Faz 1 kilit sıra: Excel → KVKK → rapor → slayt → hata avı → e-posta ritüeli
 * → Gmail kapısı → Word → Cuma 30 capstone. Sınav yalnız son dersten sonra.
 */

export const CURRICULUM_LESSON_KEYS_BY_SLUG: Readonly<Record<string, readonly string[]>> = {
  "01_office_ai": [
    "01_office_ai-1",
    "01_office_ai-k1",
    "01_office_ai-2",
    "01_office_ai-3",
    "01_office_ai-5",
    "01_office_ai-4",
    "01_office_ai-g1",
    "01_office_ai-w1",
    "01_office_ai-6",
  ],
  "02_ecommerce_ai": [],
  "03_social_media_ai": [],
  "04_chatbot_nocode": [],
  "05_prompt_practice": [],
};

export const CURRICULUM_LESSON_COUNT_BY_SLUG: Readonly<Record<string, number>> = {
  "01_office_ai": 9,
  "02_ecommerce_ai": 0,
  "03_social_media_ai": 0,
  "04_chatbot_nocode": 0,
  "05_prompt_practice": 0,
};

export function curriculumLessonCountForSlug(slug: string): number {
  return CURRICULUM_LESSON_COUNT_BY_SLUG[slug] ?? 0;
}

export function curriculumLessonKeysForSlug(slug: string): readonly string[] {
  return CURRICULUM_LESSON_KEYS_BY_SLUG[slug] ?? [];
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
