import { YETKINHIBE_COPY } from "@/lib/yetkinhibe/copy";
import type {
  GrantCallWithMeta,
  GrantEligibilityCriteria,
  GrantMatchCriterionResult,
  GrantMatchProfile,
  GrantMatchResult,
} from "@/lib/yetkinhibe/types";

/**
 * Yön 1 (Reaktif/Keşif) — şirket profilinden yola çıkarak uyumlu hibe çağrılarını oranlar.
 * Skor 0–100; her kriter ağırlıklı katkı verir.
 *
 * Saf fonksiyon: katalog parametre olarak gelir, saat okunmaz. Fail-closed değildir
 * (keşif katmanı): eksik veri düşük skora yansır, servisi durdurmaz.
 */

type CriterionWeightKey =
  | "sector"
  | "employeeCount"
  | "companyAge"
  | "requiresRdActivity"
  | "requiresExportActivity"
  | "requiresKobiStatus"
  | "requiresPatentOrUtilityModel";

/** Ağırlıkların toplamı 100'dür; skor = karşılanan ağırlık / toplam ağırlık. */
const CRITERION_WEIGHTS: Record<CriterionWeightKey, number> = {
  sector: 15,
  employeeCount: 15,
  companyAge: 10,
  requiresRdActivity: 25,
  requiresExportActivity: 20,
  requiresKobiStatus: 10,
  requiresPatentOrUtilityModel: 5,
};

/** Yalnız ACTIVE ve CLOSING_SOON çağrılar eşleşmeye girer; UPCOMING ve CLOSED dışarıda kalır. */
export function isMatchableGrantCall(call: Pick<GrantCallWithMeta, "status">): boolean {
  return call.status === "ACTIVE" || call.status === "CLOSING_SOON";
}

function evaluateCriteria(
  profile: GrantMatchProfile,
  eligibility: GrantEligibilityCriteria,
): GrantMatchCriterionResult[] {
  const sectorOk =
    !eligibility.eligibleSectorCodes ||
    eligibility.eligibleSectorCodes.includes(profile.sectorCode);
  const employeeCountOk =
    (eligibility.minEmployeeCount === null ||
      profile.employeeCount >= eligibility.minEmployeeCount) &&
    (eligibility.maxEmployeeCount === null ||
      profile.employeeCount <= eligibility.maxEmployeeCount);
  const companyAgeOk =
    (eligibility.minCompanyAgeYears === null ||
      profile.companyAgeYears >= eligibility.minCompanyAgeYears) &&
    (eligibility.maxCompanyAgeYears === null ||
      profile.companyAgeYears <= eligibility.maxCompanyAgeYears);

  return [
    {
      key: "sector",
      label: "Sektör uyumu",
      satisfied: sectorOk,
      weightPct: CRITERION_WEIGHTS.sector,
    },
    {
      key: "employeeCount",
      label: "Çalışan sayısı bandı",
      satisfied: employeeCountOk,
      weightPct: CRITERION_WEIGHTS.employeeCount,
    },
    {
      key: "companyAge",
      label: "Şirket yaşı",
      satisfied: companyAgeOk,
      weightPct: CRITERION_WEIGHTS.companyAge,
    },
    {
      key: "requiresRdActivity",
      label: "Ar-Ge faaliyeti",
      satisfied: !eligibility.requiresRdActivity || profile.rdMaturityLevel !== "NONE",
      weightPct: CRITERION_WEIGHTS.requiresRdActivity,
    },
    {
      key: "requiresExportActivity",
      label: "İhracat faaliyeti",
      satisfied: !eligibility.requiresExportActivity || profile.exportActive,
      weightPct: CRITERION_WEIGHTS.requiresExportActivity,
    },
    {
      key: "requiresKobiStatus",
      label: "KOBİ statüsü",
      satisfied: !eligibility.requiresKobiStatus || profile.isKobi,
      weightPct: CRITERION_WEIGHTS.requiresKobiStatus,
    },
    {
      key: "requiresPatentOrUtilityModel",
      label: "Patent / faydalı model",
      satisfied:
        !eligibility.requiresPatentOrUtilityModel || profile.hasPatentOrUtilityModel,
      weightPct: CRITERION_WEIGHTS.requiresPatentOrUtilityModel,
    },
  ];
}

function computeScorePct(criteria: readonly GrantMatchCriterionResult[]): number {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weightPct, 0);
  if (totalWeight <= 0) {
    return 0;
  }
  const earnedWeight = criteria
    .filter((c) => c.satisfied)
    .reduce((sum, c) => sum + c.weightPct, 0);
  return Math.round((earnedWeight / totalWeight) * 100);
}

/** Uyum bandı. Öneri metni ve API bandı aynı eşiklerden türer (A1: tam sayı). */
export type GrantMatchBand = "READY" | "GAP" | "NOT_READY";

const READY_MIN_SCORE_PCT = 80;
const GAP_MIN_SCORE_PCT = 50;

export function matchBandForScore(matchScorePct: number): GrantMatchBand {
  if (matchScorePct >= READY_MIN_SCORE_PCT) {
    return "READY";
  }
  if (matchScorePct >= GAP_MIN_SCORE_PCT) {
    return "GAP";
  }
  return "NOT_READY";
}

function buildRecommendedNextStep(matchScorePct: number): string {
  const band = matchBandForScore(matchScorePct);
  if (band === "READY") {
    return YETKINHIBE_COPY.match.nextStepReady;
  }
  if (band === "GAP") {
    return YETKINHIBE_COPY.match.nextStepGapAnalysis;
  }
  return YETKINHIBE_COPY.match.nextStepNotReady;
}

export function matchGrantsForProfile(
  profile: GrantMatchProfile,
  calls: readonly GrantCallWithMeta[],
): readonly GrantMatchResult[] {
  return calls
    .filter(isMatchableGrantCall)
    .map((call): GrantMatchResult => {
      const criteria = evaluateCriteria(profile, call.eligibility);
      const matchScorePct = computeScorePct(criteria);

      return {
        grantId: call.id,
        grantTitle: call.title,
        source: call.source,
        matchScorePct,
        remainingDays: call.remainingDays,
        poolAmountMinor: call.poolAmountMinor,
        maxSupportMinor: call.maxSupportMinor,
        criteria,
        recommendedNextStep: buildRecommendedNextStep(matchScorePct),
      };
    })
    .sort((a, b) => b.matchScorePct - a.matchScorePct);
}
