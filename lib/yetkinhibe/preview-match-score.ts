import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { matchGrantsForProfile } from "@/lib/yetkinhibe/match-grants-for-profile";
import type {
  CompanyGrantProfile,
  GrantCallWithMeta,
  GrantMatchCriterionResult,
} from "@/lib/yetkinhibe/types";

/** Sentinel şirket kimliği — bireysel/fikir simülasyonu ve vitrin önizlemesi. */
export const PREVIEW_GRANT_COMPANY_ID = "preview" as const;

/**
 * Vitrin ön izlemesi — tipik KOBİ profiliyle uyum skorları.
 * Canlı şirket eşleştirmesinden bağımsızdır; landing ve simülasyon için kullanılır.
 */
export const DEFAULT_PREVIEW_GRANT_PROFILE: CompanyGrantProfile = {
  companyId: PREVIEW_GRANT_COMPANY_ID,
  sectorCode: "uretim",
  employeeCount: 25,
  companyAgeYears: 3,
  annualRevenueMinor: toAmountMinor(5_000_000 * 100),
  rdMaturityLevel: "EARLY",
  exportActive: false,
  isKobi: true,
  hasPatentOrUtilityModel: false,
  region: "TR",
};

export type PreviewGrantMatchSnapshot = {
  matchScorePct: number;
  criteria: readonly GrantMatchCriterionResult[];
};

export function buildPreviewMatchesByGrantId(
  calls: readonly GrantCallWithMeta[],
): Readonly<Record<string, PreviewGrantMatchSnapshot>> {
  const matches = matchGrantsForProfile(DEFAULT_PREVIEW_GRANT_PROFILE, calls);
  return Object.fromEntries(
    matches.map((m): [string, PreviewGrantMatchSnapshot] => [
      m.grantId,
      { matchScorePct: m.matchScorePct, criteria: m.criteria },
    ]),
  );
}

export function buildPreviewMatchScoresByGrantId(
  calls: readonly GrantCallWithMeta[],
): Readonly<Record<string, number>> {
  const matches = buildPreviewMatchesByGrantId(calls);
  return Object.fromEntries(
    Object.entries(matches).map(([id, snap]): [string, number] => [id, snap.matchScorePct]),
  );
}

export function getPreviewMatchScoreForGrant(
  grantId: string,
  calls: readonly GrantCallWithMeta[],
): number {
  return buildPreviewMatchesByGrantId(calls)[grantId]?.matchScorePct ?? 0;
}

export function getPreviewMatchCriteriaForGrant(
  grantId: string,
  calls: readonly GrantCallWithMeta[],
): readonly GrantMatchCriterionResult[] {
  return buildPreviewMatchesByGrantId(calls)[grantId]?.criteria ?? [];
}
