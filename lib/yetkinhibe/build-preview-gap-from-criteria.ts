import { YETKINHIBE_COPY } from "@/lib/yetkinhibe/copy";
import type {
  GrantEligibilityGapItem,
  GrantMatchCriterionResult,
} from "@/lib/yetkinhibe/types";

/**
 * Vitrin / simülatör önizlemesi — uyum kriterlerini eksik analizi kartının beklediği
 * `GrantEligibilityGapItem` şekline çevirir. Mühürlü (ücretli) eksik analizinin yerine geçmez.
 */

const COPY = YETKINHIBE_COPY.gap;

export function buildPreviewGapItemsFromCriteria(
  criteria: readonly GrantMatchCriterionResult[],
): GrantEligibilityGapItem[] {
  return criteria.map((criterion): GrantEligibilityGapItem => ({
    criterionKey: String(criterion.key),
    label: criterion.label,
    status: criterion.satisfied ? "OK" : "MISSING",
    detail: criterion.satisfied
      ? COPY.criterionSatisfiedDetail(criterion.label)
      : COPY.criterionMissingDetail(criterion.label),
    bridgeModule: null,
    bridgeHref: null,
    bridgeCtaLabel: null,
  }));
}

export function computePreviewReadinessPct(
  gaps: readonly GrantEligibilityGapItem[],
): number {
  if (gaps.length === 0) {
    return 0;
  }
  const satisfied = gaps.filter((g) => g.status === "OK").length;
  return Math.round((satisfied / gaps.length) * 100);
}
