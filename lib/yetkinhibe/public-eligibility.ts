import { formatAmountMinorAsWholeTry } from "@/lib/yetkinhibe/format-amount";
import {
  isGrantVerificationFresh,
  isMatchableGrantCall,
} from "@/lib/yetkinhibe/grant-catalog-core";
import {
  isGrantAudience,
  isGrantInvestmentFocus,
  isGrantNaceGroup,
  isProvinceCode,
  type GrantAudience,
  type GrantInvestmentFocus,
} from "@/lib/yetkinhibe/grant-brief-axes";
import {
  matchGrantProgramsForBrief,
  type GrantBriefCriterion,
  type GrantProgramBrief,
} from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import { rankGrantProgramFits } from "@/lib/yetkinhibe/program-fit";
import type { GrantCallWithMeta } from "@/lib/yetkinhibe/types";

/**
 * Anonim hibe ön uygunluğu. Ziyaretçinin NACE, il, ölçek, çalışan sayısı ve şirket yaşı
 * gerçek brief olur.
 *
 * Ş4 / B-05 dürüstlük kuralları:
 * 1. **Ar-Ge sinyali daraltıldı.** `"pazar araştırması"`, `"müşteri araştırması"` gibi
 *    genel iş ifadeleri Ar-Ge sayılmaz; yalnız açık Ar-Ge / prototip / yazılım geliştirme
 *    sinyali Ar-Ge odağına döner. Aksi halde mahalle kafesi TÜBİTAK 1507'ye düşüyordu.
 * 2. **Tek kısıtlı çağrının `%100`'ü kaldırıldı.** Yüzde yerine «Geçen Kısıt: X / Y» ve
 *    kısıt etiketleri basılır; tek kısıt geçmek "%100 uygunluk" demek değildir.
 * 3. Çalışan sayısı ve şirket yaşı ziyaretçiden gelir; uydurulmaz.
 */

export type PublicGrantEligibility = {
  /** Kısıtlı kriter varsa geçen oran. Kısıt yoksa `null` — yüzde uydurulmaz. */
  matchScorePct: number | null;
  openCallCount: number;
  supportBand: string;
  programLabel: string;
  scopeLabel: string | null;
  /** Geçen kısıtlı kriter sayısı. */
  passedConstrained: number;
  /** Kısıtlı kriter sayısı. Sıfırsa çağrı özel kısıt yazmıyor. */
  constrainedCount: number;
  /** «Geçen Kısıt: 1 / 2» biçiminde dürüst etiket. Kısıt yoksa `null`. */
  constraintLabel: string | null;
  /** Geçen kısıtların adı. Widget listede basar. */
  constraintLabels: readonly string[];
};

const NO_MATCH = "Bu profil için katalogda açık çağrı eşleşmedi.";

/** Varsayılan ölçek. Ziyaretçi yazmazsa **açıkça** yazılır; sessizce uydurulmaz. */
export const PUBLIC_GRANT_DEFAULT_EMPLOYEES = 15;
export const PUBLIC_GRANT_DEFAULT_AGE_YEARS = 5;
export const PUBLIC_GRANT_DEFAULTS_NOTE = "Çalışan ve yaş yazılmadıysa ölçek varsayılanı kullanılır.";

/**
 * Ar-Ge sinyali. Açık Ar-Ge / prototip / yazılım geliştirme ifadeleri sayılır.
 * "Araştırma" tek başına yetmez: "pazar araştırması" ve "müşteri araştırması" iş
 * ifadesidir, Ar-Ge kanıtı değildir.
 */
const RD_SIGNAL =
  /\bar-?\s?ge\b|\barastirma\s*ve\s*gelistirme\b|prototip|prototype|yazilim\s*gelistir|yazılım\s*geliştir|teknoloji\s*gelistir|teknoloji\s*hazirlik|\butr\b|\btrl\b/i;

/** Ar-Ge olmayan "araştırma" kalıpları. Bunlar görülürse Ar-Ge kapısı kapalı kalır. */
const RESEARCH_WITHOUT_RD =
  /(pazar|musteri|müşteri|piyasa|rakip|rekabet|fiyat|talep)\s*(arastirmasi|araştırması|arastirma|araştırma)/i;

export function detectGrantRdSignal(idea: string): boolean {
  const text = idea.replace(/\s+/g, " ").trim();
  if (text.length === 0) {
    return false;
  }
  if (RESEARCH_WITHOUT_RD.test(text)) {
    // "pazar araştırması" tek başına Ar-Ge değildir; açık Ar-Ge kelimesi varsa yine sayılır.
    return /\bar-?\s?ge\b|arastirma\s*ve\s*gelistirme|prototip|yazilim\s*gelistir|yazılım\s*geliştir/i.test(
      text,
    );
  }
  return RD_SIGNAL.test(text);
}

function readCount(value: unknown, max: number): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 0 && value <= max ? value : null;
  }
  if (typeof value !== "string" || !/^\d{1,6}$/.test(value.trim())) {
    return null;
  }
  const parsed = Number(value.trim());
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= max ? parsed : null;
}

export function publicGrantBrief(input: {
  idea: string;
  provinceCode: string;
  naceGroup: string;
  audience: GrantAudience;
  /** Ziyaretçinin yazdığı çalışan sayısı. Yoksa ölçek varsayılanı kullanılır. */
  employeeCount?: number | string | null;
  /** Ziyaretçinin yazdığı şirket yaşı. Yoksa ölçek varsayılanı kullanılır. */
  companyAgeYears?: number | string | null;
}): GrantProgramBrief | null {
  if (!isProvinceCode(input.provinceCode) || !isGrantNaceGroup(input.naceGroup) || !isGrantAudience(input.audience)) {
    return null;
  }
  const idea = input.idea.toLocaleLowerCase("tr-TR");
  const rd = detectGrantRdSignal(input.idea);
  const exportActive = /ihracat|e-ihracat/.test(idea);
  let investmentFocus: GrantInvestmentFocus = "makine_techizat";
  if (rd) {
    investmentFocus = "arge";
  } else if (exportActive) {
    investmentFocus = "ihracat";
  } else if (/yazılım|yazilim|dijital/.test(idea)) {
    investmentFocus = "yazilim_dijital";
  }
  if (!isGrantInvestmentFocus(investmentFocus)) {
    return null;
  }
  const employeeCount =
    readCount(input.employeeCount, 100_000) ??
    (input.audience === "yeni_girisimci" ? 3 : PUBLIC_GRANT_DEFAULT_EMPLOYEES);
  const companyAgeYears =
    readCount(input.companyAgeYears, 150) ??
    (input.audience === "yeni_girisimci" ? 1 : PUBLIC_GRANT_DEFAULT_AGE_YEARS);
  return {
    provinceCode: input.provinceCode,
    audience: input.audience,
    naceGroup: input.naceGroup,
    investmentFocus,
    employeeCount,
    companyAgeYears,
    rdMaturityLevel: rd ? "EARLY" : "NONE",
    exportActive,
    hasPatentOrUtilityModel: false,
  };
}

/** Kısıtlı kriterlerin dürüst özeti. Tek kısıt geçmek "%100 uygunluk" değildir. */
export function constraintSummary(criteria: readonly GrantBriefCriterion[]): {
  passedConstrained: number;
  constrainedCount: number;
  constraintLabel: string | null;
  constraintLabels: readonly string[];
} {
  const constrained = criteria.filter((row) => !row.unconstrained);
  const passed = constrained.filter((row) => row.passed);
  return {
    passedConstrained: passed.length,
    constrainedCount: constrained.length,
    constraintLabel:
      constrained.length === 0 ? null : `Geçen Kısıt: ${passed.length} / ${constrained.length}`,
    constraintLabels: constrained.map((row) => row.label),
  };
}

const EMPTY_CONSTRAINTS = {
  passedConstrained: 0,
  constrainedCount: 0,
  constraintLabel: null,
  constraintLabels: [] as readonly string[],
};

export function matchPublicGrantEligibility(input: {
  idea: string;
  provinceCode: string;
  sectorCode: string;
  audience: GrantAudience;
  calls: readonly GrantCallWithMeta[];
  now?: Date;
  employeeCount?: number | string | null;
  companyAgeYears?: number | string | null;
}): PublicGrantEligibility {
  const now = input.now ?? new Date();
  const openCallCount = input.calls.filter(
    (call) => isMatchableGrantCall(call) && isGrantVerificationFresh(call.sourceVerifiedAt ?? null, now),
  ).length;
  const brief = publicGrantBrief({
    idea: input.idea,
    provinceCode: input.provinceCode,
    naceGroup: input.sectorCode,
    audience: input.audience,
    employeeCount: input.employeeCount,
    companyAgeYears: input.companyAgeYears,
  });
  if (!brief) {
    return {
      matchScorePct: null,
      openCallCount,
      supportBand: NO_MATCH,
      programLabel: "",
      scopeLabel: null,
      ...EMPTY_CONSTRAINTS,
    };
  }
  const briefCalls = input.calls.map((call) => ({
    id: call.id,
    title: call.title,
    sourceLabel: call.sourceLabel,
    officialInfoUrl: call.officialInfoUrl,
    status: call.status,
    remainingDays: call.remainingDays,
    poolAmountMinor: call.poolAmountMinor,
    maxSupportMinor: call.maxSupportMinor,
    supportRatioBps: call.supportRatioBps,
    sourceVerifiedAt: call.sourceVerifiedAt ?? null,
    eligibility: call.eligibility,
    source: call.source ?? null,
    specificationText: call.specificationText ?? null,
    rulesJson: call.rulesJson ?? null,
  }));
  const matched = matchGrantProgramsForBrief(brief, briefCalls, now);
  const ranked = rankGrantProgramFits(brief, briefCalls, now);
  const best = ranked.find((row) => matched.eligible.some((item) => item.grantId === row.grantId));
  if (!best || best.maxSupportMinor === null) {
    return {
      matchScorePct: null,
      openCallCount,
      supportBand: NO_MATCH,
      programLabel: "",
      scopeLabel: best?.scopeLabel ?? null,
      ...EMPTY_CONSTRAINTS,
    };
  }
  const eligibleCall = matched.eligible.find((row) => row.grantId === best.grantId);
  const summary = constraintSummary(eligibleCall?.criteria ?? []);
  const ceiling = formatAmountMinorAsWholeTry(best.maxSupportMinor);
  return {
    // Tek kısıt geçmek "%100 uygunluk" değildir. Yüzde yalnız iki ve daha fazla kısıt
    // geçildiğinde basılır; aksi hâlde `null` döner ve arayüz «Geçen Kısıt» gösterir.
    matchScorePct: summary.constrainedCount >= 2 ? (best.fitPct ?? null) : null,
    openCallCount,
    supportBand: `Program üst limiti: ${ceiling}`,
    programLabel: best.title,
    scopeLabel: best.scopeLabel,
    ...summary,
  };
}
