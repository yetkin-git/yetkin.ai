/**
 * Ajans portföyü × açık çağrı matrisi.
 *
 * Ş7 / F2.6 — kart **yatırım odağını** taşır. `investmentFocus` boşsa ("genel")
 * o eksende `null` kabul edilir ve yatırım odağı kısıtlı çağrı uyum listesine girmez;
 * doluysa müşterinin gerçek odağı kullanılır, sabit `"ihracat"` yazılmaz.
 * Skor ve resmî onay üretmez.
 */

import {
  isGrantAudience,
  isGrantInvestmentFocus,
  isGrantNaceGroup,
  isGrantRdLevel,
  isProvinceCode,
  type GrantAudience,
  type GrantInvestmentFocus,
  type GrantRdLevel,
} from "@/lib/yetkinhibe/grant-brief-axes";
import { isGrantVerificationFresh, isMatchableGrantCall } from "@/lib/yetkinhibe/grant-catalog-core";
import {
  matchGrantProgramsForBrief,
  type GrantBriefCall,
  type GrantProgramBrief,
} from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import type { GrantEligibilityCriteria } from "@/lib/yetkinhibe/types";

/** Kart bu eksende beyan vermedi. Hiçbir kapalı listeye girmez. */
export const AGENCY_FOCUS_UNSET = "genel" as const;

export type AgencyClientCard = {
  id: string;
  companyName: string;
  naceGroup: string;
  provinceCode: string;
  audience: string;
  employeeCount: number;
  companyAgeYears: number;
  rdMaturityLevel: string;
  exportActive: boolean;
  /** Müşterinin gerçek yatırım odağı. `"genel"` = beyan yok. */
  investmentFocus?: string | null;
  hasPatentOrUtilityModel?: boolean;
};

export type AgencyCatalogMatch = {
  clientId: string;
  companyName: string;
  eligible: { grantId: string; title: string }[];
  incomplete: { grantId: string; title: string; note: string }[];
};

const INCOMPLETE_CAP = 8;

/**
 * Kartın brief'i. Yatırım odağı `"genel"` ise `null` gönderilir: o eksende kısıt yok.
 * Ar-Ge olgunluğu `NONE` iken Ar-Ge şartlı çağrı zaten kapıdan döner.
 */
function cardBrief(card: AgencyClientCard): GrantProgramBrief | null {
  if (
    !isProvinceCode(card.provinceCode) ||
    !isGrantAudience(card.audience) ||
    !isGrantNaceGroup(card.naceGroup) ||
    !isGrantRdLevel(card.rdMaturityLevel)
  ) {
    return null;
  }
  if (
    !Number.isInteger(card.employeeCount) ||
    card.employeeCount < 0 ||
    card.employeeCount > 100_000 ||
    !Number.isInteger(card.companyAgeYears) ||
    card.companyAgeYears < 0 ||
    card.companyAgeYears > 150 ||
    typeof card.exportActive !== "boolean"
  ) {
    return null;
  }
  const focus = card.investmentFocus?.trim() ?? "";
  return {
    provinceCode: card.provinceCode,
    audience: card.audience,
    naceGroup: card.naceGroup,
    // Beyan yoksa `null` → yatırım odağı ekseninde kısıt yok. Sabit odak yazılmaz.
    investmentFocus: isGrantInvestmentFocus(focus) ? focus : null,
    employeeCount: card.employeeCount,
    companyAgeYears: card.companyAgeYears,
    rdMaturityLevel: card.rdMaturityLevel,
    exportActive: card.exportActive,
    hasPatentOrUtilityModel: card.hasPatentOrUtilityModel === true,
  };
}

/**
 * Kartın eksik bıraktığı eksen.
 *
 * - `investment`: kart odak **belirtmedi** ama çağrı odak kısıtlıyor. Çağrı uyum
 *   listesine girmez; "eksik" kovasında tek tek gösterilir ki ajans odağı seçip
 *   satırı açabilsin (Ş7). Odak belirtildiğinde bu kova kendiliğinden kapanır.
 * - `patent`: kart patent beyanı taşımıyor ama çağrı patent istiyor.
 */
function missingAxis(
  card: AgencyClientCard,
  eligibility: GrantEligibilityCriteria,
): "investment" | "patent" | null {
  if (eligibility.requiresPatentOrUtilityModel && card.hasPatentOrUtilityModel !== true) {
    return "patent";
  }
  const focus = card.investmentFocus?.trim() ?? "";
  if (!isGrantInvestmentFocus(focus) && eligibility.investmentFocus != null) {
    return "investment";
  }
  return null;
}

function openVerified(call: GrantBriefCall, now: Date): boolean {
  return isMatchableGrantCall(call) && isGrantVerificationFresh(call.sourceVerifiedAt, now);
}

export function matchAgencyClientsToCatalog(
  clients: readonly AgencyClientCard[],
  calls: readonly GrantBriefCall[],
  now: Date,
): AgencyCatalogMatch[] {
  return clients.map((card) => {
    const brief = cardBrief(card);
    if (!brief) {
      return {
        clientId: card.id,
        companyName: card.companyName,
        eligible: [],
        incomplete: [],
      };
    }
    const eligible: { grantId: string; title: string }[] = [];
    const incomplete: { grantId: string; title: string; note: string }[] = [];
    for (const call of calls) {
      const gap = call.eligibility ? missingAxis(card, call.eligibility) : null;
      if (gap) {
        if (openVerified(call, now) && incomplete.length < INCOMPLETE_CAP) {
          incomplete.push({
            grantId: call.id,
            title: call.title,
            note:
              gap === "patent"
                ? "Patent bilgisi bu kartta yok."
                : "Yatırım odağı bu kartta belirtilmedi.",
          });
        }
        continue;
      }
      const matched = matchGrantProgramsForBrief(brief, [call], now);
      for (const row of matched.eligible) {
        eligible.push({ grantId: row.grantId, title: row.title });
      }
    }
    return {
      clientId: card.id,
      companyName: card.companyName,
      eligible,
      incomplete,
    };
  });
}

export function isAgencyAudience(value: string): value is GrantAudience {
  return isGrantAudience(value);
}

export function isAgencyRdLevel(value: string): value is GrantRdLevel {
  return isGrantRdLevel(value);
}

/** Kart yatırım odağı → arayüz etiketi. `"genel"` beyan yok demektir. */
export function agencyFocusLabel(value: string | null | undefined): string {
  if (!value || value === AGENCY_FOCUS_UNSET) {
    return "Odak belirtilmedi";
  }
  return value === "makine_techizat"
    ? "Makine ve teçhizat"
    : value === "yazilim_dijital"
      ? "Yazılım / dijitalleşme"
      : value === "arge"
        ? "Ar-Ge"
        : value === "ihracat"
          ? "İhracat"
          : "Odak belirtilmedi";
}

/** Kart odak seçenekleri. Form ve API aynı listeyi okur. */
export const AGENCY_FOCUS_OPTIONS: readonly { id: string; label: string }[] = [
  { id: AGENCY_FOCUS_UNSET, label: "Odak belirtilmedi" },
  { id: "makine_techizat", label: "Makine ve teçhizat" },
  { id: "yazilim_dijital", label: "Yazılım / dijitalleşme" },
  { id: "arge", label: "Ar-Ge" },
  { id: "ihracat", label: "İhracat" },
];

export type AgencyFocusValue = GrantInvestmentFocus | typeof AGENCY_FOCUS_UNSET;

export function isAgencyFocusValue(value: string): value is AgencyFocusValue {
  return value === AGENCY_FOCUS_UNSET || isGrantInvestmentFocus(value);
}
