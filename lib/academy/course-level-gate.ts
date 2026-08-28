/**
 * Seviye vurgu sorgusu — serbest etiket. Kart gizlemez; yol haritası halkasını öne çıkarır. Client-safe.
 */

import {
  academyCourseLevelBySlug,
  isAcademyCourseLevel,
  type AcademyCourseLevel,
} from "@/lib/academy/course-level";

export const ACADEMY_LEVEL_GATE_QUERY = "level";

export function parseAcademyLevelGateParam(value: string | null | undefined): AcademyCourseLevel | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || !isAcademyCourseLevel(trimmed)) {
    return null;
  }
  return trimmed;
}

export function academyLevelGateHref(level: AcademyCourseLevel | null): string {
  if (!level) {
    return "/academy";
  }
  return `/academy?${ACADEMY_LEVEL_GATE_QUERY}=${encodeURIComponent(level)}`;
}

export function academyCourseMatchesLevelGate(
  slug: string,
  gate: AcademyCourseLevel | null,
): boolean {
  if (!gate) {
    return true;
  }
  return academyCourseLevelBySlug(slug) === gate;
}
