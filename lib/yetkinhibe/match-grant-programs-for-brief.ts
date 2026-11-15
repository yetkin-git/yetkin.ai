import {
  isGrantAudience,
  isGrantInvestmentFocus,
  isGrantNaceGroup,
  isGrantRdLevel,
  isProvinceCode,
  sectorCodeForNace,
  type GrantAudience,
  type GrantInvestmentFocus,
  type GrantRdLevel,
} from "@/lib/yetkinhibe/grant-brief-axes";
import { isMatchableGrantCall } from "@/lib/yetkinhibe/match-grants-for-profile";
import {
  GRANT_CLOSED_WINDOW_NOTE,
  GRANT_UNVERIFIED_NOTE,
  GRANT_UPCOMING_WINDOW_NOTE,
} from "@/lib/yetkinhibe/grant-project-notes";
import type { GrantCallStatus, GrantEligibilityCriteria } from "@/lib/yetkinhibe/types";

/**
 * Proje dosyası uygunluk matrisi. Skor ve resmî onay oranı üretmez.
 * Uygun listeye yalnız açık pencere, doğrulanmış kaynak ve bütün kriterleri geçen çağrı girer.
 * Kapalı pencere ve doğrulanmamış açık çağrı ayrı notta durur; tutar alanları kopyalanmaz.
 * Bozuk brif hiçbir çağrıyı listelemez.
 */

export type GrantProgramBrief = {
  provinceCode: string;
  audience: GrantAudience;
  naceGroup: string;
  investmentFocus: GrantInvestmentFocus;
  employeeCount: number;
  companyAgeYears: number;
  rdMaturityLevel: GrantRdLevel;
  exportActive: boolean;
  hasPatentOrUtilityModel: boolean;
};

export type GrantBriefCall = {
  id: string;
  title: string;
  sourceLabel: string;
  officialInfoUrl: string;
  status: GrantCallStatus;
  remainingDays: number;
  poolAmountMinor: number | null;
  maxSupportMinor: number;
  supportRatioBps: number;
  sourceVerifiedAt: string | null;
  eligibility: GrantEligibilityCriteria;
};

export type GrantBriefCriterion = {
  key: string;
  label: string;
  passed: boolean;
  unconstrained: boolean;
};

export type GrantEligibleProgramMatch = {
  grantId: string;
  title: string;
  sourceLabel: string;
  officialInfoUrl: string;
  remainingDays: number;
  criteria: readonly GrantBriefCriterion[];
  poolAmountMinor: number | null;
  maxSupportMinor: number;
  supportRatioBps: number;
};

export type GrantWithheldProgramMatch = {
  grantId: string;
  title: string;
  sourceLabel: string;
  note: string;
};

export type GrantProgramMatch = {
  eligible: readonly GrantEligibleProgramMatch[];
  closed: readonly GrantWithheldProgramMatch[];
  unverified: readonly GrantWithheldProgramMatch[];
};

const EMPTY_MATCH: GrantProgramMatch = { eligible: [], closed: [], unverified: [] };

function briefClosed(brief: GrantProgramBrief): boolean {
  return (
    isProvinceCode(brief.provinceCode) &&
    isGrantAudience(brief.audience) &&
    isGrantNaceGroup(brief.naceGroup) &&
    isGrantInvestmentFocus(brief.investmentFocus) &&
    isGrantRdLevel(brief.rdMaturityLevel) &&
    Number.isInteger(brief.employeeCount) &&
    brief.employeeCount >= 0 &&
    brief.employeeCount <= 100_000 &&
    Number.isInteger(brief.companyAgeYears) &&
    brief.companyAgeYears >= 0 &&
    brief.companyAgeYears <= 150 &&
    typeof brief.exportActive === "boolean" &&
    typeof brief.hasPatentOrUtilityModel === "boolean"
  );
}

function inBand(value: number, min: number | null, max: number | null): boolean {
  return (min === null || value >= min) && (max === null || value <= max);
}

function poolAmountSafe(value: number | null): boolean {
  return value === null || (Number.isSafeInteger(value) && value >= 0);
}

function amountsSafe(call: GrantBriefCall): boolean {
  return (
    poolAmountSafe(call.poolAmountMinor) &&
    Number.isSafeInteger(call.maxSupportMinor) &&
    call.maxSupportMinor >= 0 &&
    Number.isInteger(call.supportRatioBps) &&
    call.supportRatioBps >= 0 &&
    call.supportRatioBps <= 10_000
  );
}

function evaluate(brief: GrantProgramBrief, eligibility: GrantEligibilityCriteria): GrantBriefCriterion[] | null {
  const sectorCodes = eligibility.eligibleSectorCodes;
  const sectorUnconstrained = sectorCodes == null;
  const sectorCode = sectorCodeForNace(brief.naceGroup);

  const employeeUnconstrained =
    eligibility.minEmployeeCount == null && eligibility.maxEmployeeCount == null;
  const ageUnconstrained =
    eligibility.minCompanyAgeYears == null && eligibility.maxCompanyAgeYears == null;
  const regions = eligibility.eligibleRegionCodes;
  const regionUnconstrained = regions == null;
  const audiences = eligibility.audiences;
  const audienceUnconstrained = audiences == null;
  const prefixes = eligibility.nacePrefixes;
  const naceUnconstrained = prefixes == null;
  const foci = eligibility.investmentFocus;
  const focusUnconstrained = foci == null;

  const criteria: GrantBriefCriterion[] = [
    {
      key: "sector",
      label: sectorUnconstrained ? "Sektör kısıtı yok" : "Sektör uyumu",
      passed: sectorUnconstrained || (sectorCodes?.includes(sectorCode ?? "") ?? false),
      unconstrained: sectorUnconstrained,
    },
    {
      key: "employeeCount",
      label: employeeUnconstrained ? "Çalışan bandı kısıtı yok" : "Çalışan sayısı bandı",
      passed:
        employeeUnconstrained ||
        inBand(brief.employeeCount, eligibility.minEmployeeCount, eligibility.maxEmployeeCount),
      unconstrained: employeeUnconstrained,
    },
    {
      key: "companyAge",
      label: ageUnconstrained ? "Şirket yaşı kısıtı yok" : "Şirket yaşı",
      passed:
        ageUnconstrained ||
        inBand(brief.companyAgeYears, eligibility.minCompanyAgeYears, eligibility.maxCompanyAgeYears),
      unconstrained: ageUnconstrained,
    },
    {
      key: "requiresRdActivity",
      label: eligibility.requiresRdActivity ? "Ar-Ge faaliyeti" : "Ar-Ge kısıtı yok",
      passed: !eligibility.requiresRdActivity || brief.rdMaturityLevel !== "NONE",
      unconstrained: !eligibility.requiresRdActivity,
    },
    {
      key: "requiresExportActivity",
      label: eligibility.requiresExportActivity ? "İhracat faaliyeti" : "İhracat kısıtı yok",
      passed: !eligibility.requiresExportActivity || brief.exportActive,
      unconstrained: !eligibility.requiresExportActivity,
    },
    {
      key: "requiresKobiStatus",
      label: eligibility.requiresKobiStatus ? "KOBİ statüsü" : "KOBİ kısıtı yok",
      passed: !eligibility.requiresKobiStatus || brief.audience === "mevcut_kobi",
      unconstrained: !eligibility.requiresKobiStatus,
    },
    {
      key: "requiresPatentOrUtilityModel",
      label: eligibility.requiresPatentOrUtilityModel ? "Patent / faydalı model" : "Patent kısıtı yok",
      passed: !eligibility.requiresPatentOrUtilityModel || brief.hasPatentOrUtilityModel,
      unconstrained: !eligibility.requiresPatentOrUtilityModel,
    },
    {
      key: "region",
      label: regionUnconstrained ? "İl kısıtı yok" : "İl uyumu",
      passed: regionUnconstrained || (regions?.includes(brief.provinceCode) ?? false),
      unconstrained: regionUnconstrained,
    },
    {
      key: "audience",
      label: audienceUnconstrained ? "Kitle kısıtı yok" : "İşletme türü",
      passed: audienceUnconstrained || (audiences?.includes(brief.audience) ?? false),
      unconstrained: audienceUnconstrained,
    },
    {
      key: "nace",
      label: naceUnconstrained ? "NACE kısıtı yok" : "NACE grubu",
      passed: naceUnconstrained || (prefixes?.includes(brief.naceGroup) ?? false),
      unconstrained: naceUnconstrained,
    },
    {
      key: "investment",
      label: focusUnconstrained ? "Yatırım odağı kısıtı yok" : "Yatırım odağı",
      passed: focusUnconstrained || (foci?.includes(brief.investmentFocus) ?? false),
      unconstrained: focusUnconstrained,
    },
  ];

  if (criteria.some((row) => !row.passed)) {
    return null;
  }
  return criteria;
}

function withheld(call: GrantBriefCall, note: string): GrantWithheldProgramMatch {
  return {
    grantId: call.id,
    title: call.title,
    sourceLabel: call.sourceLabel,
    note,
  };
}

function text(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function matchGrantProgramsForBrief(
  brief: GrantProgramBrief,
  calls: readonly GrantBriefCall[],
): GrantProgramMatch {
  if (!briefClosed(brief)) {
    return EMPTY_MATCH;
  }

  const eligible: GrantEligibleProgramMatch[] = [];
  const closed: GrantWithheldProgramMatch[] = [];
  const unverified: GrantWithheldProgramMatch[] = [];

  for (const call of calls) {
    const id = text(call.id);
    const title = text(call.title);
    const sourceLabel = text(call.sourceLabel);
    if (!id || !title || !sourceLabel || !call.eligibility) {
      continue;
    }
    const criteria = evaluate(brief, call.eligibility);
    if (!criteria) {
      continue;
    }
    const open = isMatchableGrantCall(call);
    const verified = text(call.sourceVerifiedAt) !== null;
    if (open && verified) {
      const url = text(call.officialInfoUrl);
      if (
        !url ||
        !url.startsWith("https://") ||
        !amountsSafe(call) ||
        !Number.isInteger(call.remainingDays) ||
        call.remainingDays < 0
      ) {
        continue;
      }
      eligible.push({
        grantId: id,
        title,
        sourceLabel,
        officialInfoUrl: url,
        remainingDays: call.remainingDays,
        criteria,
        poolAmountMinor: call.poolAmountMinor,
        maxSupportMinor: call.maxSupportMinor,
        supportRatioBps: call.supportRatioBps,
      });
      continue;
    }
    if (open) {
      unverified.push(withheld({ ...call, id, title, sourceLabel }, GRANT_UNVERIFIED_NOTE));
      continue;
    }
    const note = call.status === "UPCOMING" ? GRANT_UPCOMING_WINDOW_NOTE : GRANT_CLOSED_WINDOW_NOTE;
    closed.push(withheld({ ...call, id, title, sourceLabel }, note));
  }

  return { eligible, closed, unverified };
}
