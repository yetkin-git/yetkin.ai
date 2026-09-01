/**
 * Katalog / devam paneli — gövdesiz müfredat indeksi.
 * Taslak gövdeleri ve curriculum.ts bu dosyayı import etmez; bu dosya onları import etmez.
 * Anahtar kuralı: ${slug}-${1..n}. Sapma testte kırılır.
 */

import {
  ACADEMY_GROWTH_LESSON_COUNT,
  ACADEMY_PILOT_SKU_LESSON_COUNT,
} from "@/lib/academy/pilot-sku";

/** Müfredat dosyası uzunluğu — vitrin SKU listesinden bağımsızdır. */
export const CURRICULUM_LESSON_COUNT_BY_SLUG: Readonly<Record<string, number>> = {
  "ai-agent-temel": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "ai-agent-orta": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "ai-agent-ileri": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "python-temel": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "python-orta": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "python-ileri": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "fullstack-temel": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "fullstack-orta": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "fullstack-ileri": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "security-temel": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "security-orta": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "security-ileri": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "ai-temel": ACADEMY_GROWTH_LESSON_COUNT,
  "ux-temel": ACADEMY_GROWTH_LESSON_COUNT,
  "excel-masterclass": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "google-ads-masterclass": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "meta-ads-masterclass": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "eticaret-masterclass": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "canva-masterclass": ACADEMY_PILOT_SKU_LESSON_COUNT,
  "linkedin-masterclass": ACADEMY_PILOT_SKU_LESSON_COUNT,
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
