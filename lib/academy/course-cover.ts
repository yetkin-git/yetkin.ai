/**
 * Kurs kapak görseli — Tur 3 sinema plakası (`{sku}-1-eye.jpg`).
 * OG `og:image` ve sitemap `images` aynı yolu basar.
 * Müfredat gövdesi / curriculum.ts bu dosyaya girmez.
 */

import { academyMicroVideoPublicSources } from "@/lib/academy/lesson-media";
import { isAcademyGrowthSkuSlug } from "@/lib/academy/pilot-sku";

/** Büyüme görsel sicilinde olmayan amiral SKU’ların 1. ders diyagramı. */
const FIRST_LESSON_COVER_DIAGRAM: Readonly<Record<string, string>> = {};

export const ACADEMY_BRAND_FALLBACK_COVER = "/icon.svg" as const;

export function academyCourseCoverDiagramKey(slug: string): string | null {
  return FIRST_LESSON_COVER_DIAGRAM[slug] ?? null;
}

/** Kamuya açık kapak yolu — vitrin SKU’su Tur 3 eye JPG; yoksa marka mührü. */
export function academyCourseCoverPath(slug: string): string {
  if (isAcademyGrowthSkuSlug(slug)) {
    return `/academy/cinema/${slug}-1-eye.jpg`;
  }
  const diagramKey = academyCourseCoverDiagramKey(slug);
  if (!diagramKey) {
    return ACADEMY_BRAND_FALLBACK_COVER;
  }
  return academyMicroVideoPublicSources(diagramKey).poster;
}

export function isAcademyBrandFallbackCover(path: string): boolean {
  return path === ACADEMY_BRAND_FALLBACK_COVER;
}

export function isAcademyCinemaCoverPath(path: string): boolean {
  return /^\/academy\/cinema\/.+-1-eye\.jpg$/u.test(path);
}
