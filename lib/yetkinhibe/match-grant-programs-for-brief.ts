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
import { isGrantVerificationFresh, isMatchableGrantCall } from "@/lib/yetkinhibe/grant-catalog-core";
import {
  GRANT_CLOSED_WINDOW_NOTE,
  GRANT_UNVERIFIED_NOTE,
  GRANT_UPCOMING_WINDOW_NOTE,
} from "@/lib/yetkinhibe/grant-project-notes";
import { readSpecificationRules } from "@/lib/yetkinhibe/spec-rag";
import type { GrantCallStatus, GrantEligibilityCriteria, GrantProgramSource, GrantSpecificationRules } from "@/lib/yetkinhibe/types";

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
  /**
   * Yatırım odağı. `null` = profil bu eksende **beyan vermedi**.
   * Beyan yokken yatırım odağı kısıtlı çağrı "uygun" sayılmaz; çağıran onu
   * «eksik eksen» notuna düşürür (Ş7). Sessiz varsayılan odak yazılmaz.
   */
  investmentFocus: GrantInvestmentFocus | null;
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
  source?: GrantProgramSource | null;
  dataVersion?: number | null;
  specificationText?: string | null;
  rulesJson?: GrantSpecificationRules | null;
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
  sourceVerifiedAt: string;
  dataVersion: number | null;
  source: GrantProgramSource | null;
  specificationText: string | null;
  rulesJson: GrantSpecificationRules | null;
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
    (brief.investmentFocus === null || isGrantInvestmentFocus(brief.investmentFocus)) &&
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

export function grantBriefCriteria(
  brief: GrantProgramBrief,
  eligibility: GrantEligibilityCriteria,
): GrantBriefCriterion[] {
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
      // Beyan yoksa (`null`) kısıtlı çağrı geçmez: eksik eksen "uygun" sayılmaz (Ş7).
      passed:
        focusUnconstrained ||
        (brief.investmentFocus !== null && (foci?.includes(brief.investmentFocus) ?? false)),
      unconstrained: focusUnconstrained,
    },
  ];

  return criteria;
}

function evaluate(brief: GrantProgramBrief, eligibility: GrantEligibilityCriteria): GrantBriefCriterion[] | null {
  const criteria = grantBriefCriteria(brief, eligibility);
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

const SOURCE_KEYS = new Set<GrantProgramSource>([
  "KOSGEB",
  "TUBITAK",
  "TICARET_BAKANLIGI",
  "KALKINMA_AJANSI",
  "TKDK_IPARD",
  "TARIM_BAKANLIGI",
  "SANAYI_BAKANLIGI",
  "ISKUR",
  "AB_FONLARI",
]);

function readSource(value: unknown): GrantProgramSource | null {
  return typeof value === "string" && SOURCE_KEYS.has(value as GrantProgramSource) ? (value as GrantProgramSource) : null;
}

function readVersion(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 1_000_000) {
    return null;
  }
  return value;
}

function readSpec(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const clean = value.replace(/\u0000/g, "").trim();
  if (clean.length < 12) {
    return null;
  }
  return clean.slice(0, 200_000);
}

function readRules(value: unknown): GrantSpecificationRules | null {
  const parsed = readSpecificationRules(value);
  return parsed.ok ? parsed.rules : null;
}

/**
 * `now` zorunludur. Opsiyonel bırakıldığında doğrulama tazeliği atlanıyordu ve ücretli
 * dosya hattı süresi dolmuş satırı "uygun" sayıyordu (B-02). Varsayılan `new Date()`
 * yalnız çağıran saati vermezse devreye girer; tazelik kapısı her koşulda çalışır.
 */
export function matchGrantProgramsForBrief(
  brief: GrantProgramBrief,
  calls: readonly GrantBriefCall[],
  now: Date = new Date(),
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
    const verifiedAt = text(call.sourceVerifiedAt);
    const verified = isGrantVerificationFresh(verifiedAt, now);
    if (open && verified && verifiedAt) {
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
        sourceVerifiedAt: verifiedAt,
        dataVersion: readVersion(call.dataVersion),
        source: readSource(call.source),
        specificationText: readSpec(call.specificationText),
        rulesJson: readRules(call.rulesJson),
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
