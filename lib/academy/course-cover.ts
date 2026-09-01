/**
 * Kurs kapak görseli — ilk ders poster’ı. OG `og:image` ve sitemap `images` aynı yolu basar.
 * Müfredat gövdesi / curriculum.ts bu dosyaya girmez.
 */

import { ACADEMY_GROWTH_LESSON_VISUALS } from "@/lib/academy/growth-visuals";
import { academyMicroVideoPublicSources } from "@/lib/academy/lesson-media";

/** Büyüme görsel sicilinde olmayan amiral SKU’ların 1. ders diyagramı. */
const FIRST_LESSON_COVER_DIAGRAM: Readonly<Record<string, string>> = {
  "ai-agent-temel": "agt-llm-vs-agent",
  "ai-agent-orta": "ai-embed-space",
  "ai-agent-ileri": "ai-langgraph",
  "python-temel": "py-vars-types",
  "python-orta": "py-oop-class",
  "python-ileri": "py-decorator-wrap",
};

const BRAND_FALLBACK_COVER = "/icon.svg" as const;

export function academyCourseCoverDiagramKey(slug: string): string | null {
  const fromGrowth = ACADEMY_GROWTH_LESSON_VISUALS[`${slug}-1`]?.diagramKey;
  return fromGrowth ?? FIRST_LESSON_COVER_DIAGRAM[slug] ?? null;
}

/** Kamuya açık kapak yolu — yoksa marka mührü. */
export function academyCourseCoverPath(slug: string): string {
  const diagramKey = academyCourseCoverDiagramKey(slug);
  if (!diagramKey) {
    return BRAND_FALLBACK_COVER;
  }
  return academyMicroVideoPublicSources(diagramKey).poster;
}
