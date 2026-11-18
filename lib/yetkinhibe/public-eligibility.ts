import { grantNaceLabel, grantProvinceLabel } from "@/lib/yetkinhibe/grant-brief-axes";
import { isMatchableGrantCall } from "@/lib/yetkinhibe/match-grants-for-profile";
import { validatePreviewIdea } from "@/lib/yetkinhibe/preview-idea-validator";
import type { GrantCallWithMeta } from "@/lib/yetkinhibe/types";

/**
 * Anonim hibe ön uygunluğu. Deterministik katalog eşlemesi.
 * LLM çağırmaz, profil yazmaz, onay vaat etmez.
 */
export type PublicGrantEligibility = {
  matchScorePct: number;
  openCallCount: number;
  supportBand: string;
  programLabel: string;
};

export function matchPublicGrantEligibility(input: {
  idea: string;
  provinceCode: string;
  sectorCode: string;
  calls: readonly GrantCallWithMeta[];
}): PublicGrantEligibility {
  const openCallCount = input.calls.filter(isMatchableGrantCall).length;
  const text = [input.idea.trim(), grantNaceLabel(input.sectorCode), grantProvinceLabel(input.provinceCode)]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(" ");
  const preview = validatePreviewIdea(text, input.calls);
  if (!preview) {
    return {
      matchScorePct: 0,
      openCallCount,
      supportBand: "Bu fikir için katalogda açık çağrı eşleşmedi.",
      programLabel: "",
    };
  }
  return {
    matchScorePct: preview.matchScorePct,
    openCallCount,
    supportBand: preview.estimatedSupportLabel,
    programLabel: preview.programLabel,
  };
}
