/**
 * Katalog / devam paneli — gövdesiz müfredat indeksi.
 * Taslak gövdeleri ve curriculum.ts bu dosyayı import etmez; bu dosya onları import etmez.
 * Anahtar kuralı: ${slug}-${1..n}. Sapma testte kırılır.
 */

import {
  ACADEMY_GROWTH_LESSON_COUNT,
  ACADEMY_GROWTH_SKU_SLUGS,
} from "@/lib/academy/pilot-sku";

export const CURRICULUM_LESSON_COUNT_BY_SLUG: Readonly<Record<string, number>> = Object.fromEntries(
  ACADEMY_GROWTH_SKU_SLUGS.map((slug) => [slug, ACADEMY_GROWTH_LESSON_COUNT]),
);

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
