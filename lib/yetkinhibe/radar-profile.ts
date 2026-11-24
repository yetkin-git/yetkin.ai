/**
 * Haftalık radar çağrı seçimi. Genel ilk üç çağrı yoktur.
 * Kayıtlı firma profilinin il, NACE, kitle ve ölçek eksenleri AND kapısından geçer.
 */

import type { YetkinhibeGrantCatalogEntry } from "@/lib/yetkinhibe/grant-catalog-core";
import {
  isGrantAudience,
  isGrantInvestmentFocus,
  isGrantNaceGroup,
  isGrantRdLevel,
  isProvinceCode,
} from "@/lib/yetkinhibe/grant-brief-axes";
import {
  matchGrantProgramsForBrief,
  type GrantBriefCall,
  type GrantEligibleProgramMatch,
  type GrantProgramBrief,
} from "@/lib/yetkinhibe/match-grant-programs-for-brief";

export const HIBE_PANEL_PATH = "/panel/hibe";

export type RadarCompanyProfile = {
  provinceCode: string;
  audience: string;
  naceGroup: string;
  investmentFocus: string;
  employeeCount: number;
  companyAgeYears: number;
  rdMaturityLevel: string;
  exportActive: boolean;
  hasPatentOrUtilityModel: boolean;
};

export function catalogEntryToBriefCall(entry: YetkinhibeGrantCatalogEntry): GrantBriefCall {
  return {
    id: entry.id,
    title: entry.title,
    sourceLabel: entry.sourceLabel,
    officialInfoUrl: entry.officialInfoUrl,
    status: entry.status,
    remainingDays: entry.remainingDays,
    poolAmountMinor: entry.poolAmountMinor,
    maxSupportMinor: entry.maxSupportMinor,
    supportRatioBps: entry.supportRatioBps,
    sourceVerifiedAt: entry.sourceVerifiedAt,
    eligibility: entry.eligibility,
    source: entry.source,
    dataVersion: entry.dataVersion ?? null,
    specificationText: entry.specificationText ?? null,
    rulesJson: entry.rulesJson ?? null,
  };
}

export function companyProfileBrief(profile: RadarCompanyProfile): GrantProgramBrief | null {
  if (
    !isProvinceCode(profile.provinceCode) ||
    !isGrantAudience(profile.audience) ||
    !isGrantNaceGroup(profile.naceGroup) ||
    !isGrantInvestmentFocus(profile.investmentFocus) ||
    !isGrantRdLevel(profile.rdMaturityLevel)
  ) {
    return null;
  }
  if (
    !Number.isInteger(profile.employeeCount) ||
    profile.employeeCount < 0 ||
    profile.employeeCount > 100_000 ||
    !Number.isInteger(profile.companyAgeYears) ||
    profile.companyAgeYears < 0 ||
    profile.companyAgeYears > 150
  ) {
    return null;
  }
  return {
    provinceCode: profile.provinceCode,
    audience: profile.audience,
    naceGroup: profile.naceGroup,
    investmentFocus: profile.investmentFocus,
    employeeCount: profile.employeeCount,
    companyAgeYears: profile.companyAgeYears,
    rdMaturityLevel: profile.rdMaturityLevel,
    exportActive: profile.exportActive,
    hasPatentOrUtilityModel: profile.hasPatentOrUtilityModel,
  };
}

export function openCallsForCompanyProfile(
  profile: RadarCompanyProfile | null,
  calls: readonly GrantBriefCall[],
  now: Date,
): readonly GrantEligibleProgramMatch[] {
  if (!profile) {
    return [];
  }
  const brief = companyProfileBrief(profile);
  if (!brief) {
    return [];
  }
  return matchGrantProgramsForBrief(brief, calls, now).eligible;
}

export function radarGrantText(
  profile: RadarCompanyProfile | null,
  profilePresent: boolean,
  calls: readonly GrantBriefCall[],
  now: Date,
): string {
  if (!profilePresent) {
    return "Firma profilin kayıtlı değil. Profili hibe masasında sen doldurursun.";
  }
  if (!profile || !companyProfileBrief(profile)) {
    return "Kayıtlı firma profili okunamadı. Uydurma çağrı yazılmaz.";
  }
  const rows = openCallsForCompanyProfile(profile, calls, now);
  if (rows.length === 0) {
    return "Kayıtlı profiline uyan doğrulanmış açık çağrı yok.";
  }
  const shown = rows.slice(0, 8);
  const lines = shown
    .map((row) => `- ${row.title} — kalan gün ${row.remainingDays} — ${row.officialInfoUrl}`)
    .join("\n");
  const extra = rows.length - shown.length;
  return extra > 0 ? `${lines}\nve ${extra} çağrı daha.` : lines;
}
