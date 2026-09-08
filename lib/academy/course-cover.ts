/**
 * Kurs kapak görseli — ilk ders poster’ı. OG `og:image` ve sitemap `images` aynı yolu basar.
 * Müfredat gövdesi / curriculum.ts bu dosyaya girmez.
 */

import { academyMicroVideoPublicSources } from "@/lib/academy/lesson-media";

/** Büyüme görsel sicilinde olmayan amiral SKU’ların 1. ders diyagramı. */
const FIRST_LESSON_COVER_DIAGRAM: Readonly<Record<string, string>> = {};

export const ACADEMY_BRAND_FALLBACK_COVER = "/icon.svg" as const;

export function academyCourseCoverDiagramKey(slug: string): string | null {
  return FIRST_LESSON_COVER_DIAGRAM[slug] ?? null;
}

/** Kamuya açık kapak yolu — yoksa marka mührü. */
export function academyCourseCoverPath(slug: string): string {
  const diagramKey = academyCourseCoverDiagramKey(slug);
  if (!diagramKey) {
    return ACADEMY_BRAND_FALLBACK_COVER;
  }
  return academyMicroVideoPublicSources(diagramKey).poster;
}

export function isAcademyBrandFallbackCover(path: string): boolean {
  return path === ACADEMY_BRAND_FALLBACK_COVER;
}
