/**
 * Vitrin kart özeti — client-safe SSOT.
 * Cümle `course-registry.ts` kartındaki `summary` alanından okunur.
 * T-02 — amiral özeti mührü 8 ders + 10 soru / 70 olarak tanımlar; sunucu dosya kontrolü yoktur.
 */

import { COURSE_REGISTRY } from "@yetkin/kernel/catalog-ids/course-registry";
import { PROMPT_PRACTICE_SUBTITLE, type AcademyCourseTitleSlug } from "@/lib/academy/course-titles";
import { OFFICE_AI_SEAL_PROOF_SHORT } from "@/lib/copy/sem-keywords";

const shellSummary = COURSE_REGISTRY.find((row) => row.slug === "06_n8n_automation")?.summary;
if (!shellSummary) {
  throw new Error("Hazırlanıyor özeti kartta yok.");
}

export const ACADEMY_COMING_SOON_SUMMARY = shellSummary;

export const ACADEMY_CATALOG_SUMMARIES = Object.fromEntries(
  COURSE_REGISTRY.filter((row) => row.canon).map((row) => [row.slug, row.summary]),
) as Record<AcademyCourseTitleSlug, string>;

if (!ACADEMY_CATALOG_SUMMARIES["01_office_ai"].includes(OFFICE_AI_SEAL_PROOF_SHORT)) {
  throw new Error("Amiral özeti mühür cümlesini taşımıyor.");
}

if (!ACADEMY_CATALOG_SUMMARIES["05_prompt_practice"].startsWith(PROMPT_PRACTICE_SUBTITLE)) {
  throw new Error("PR-105 özeti alt tanımla açılmıyor.");
}

export function academyCatalogSummaryBySlug(slug: string): string | undefined {
  return ACADEMY_CATALOG_SUMMARIES[slug as AcademyCourseTitleSlug];
}
