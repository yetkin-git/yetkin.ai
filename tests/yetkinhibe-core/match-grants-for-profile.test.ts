import { describe, expect, it } from "vitest";

import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { YETKINHIBE_COPY } from "@/lib/yetkinhibe/copy";
import { matchGrantsForProfile } from "@/lib/yetkinhibe/match-grants-for-profile";
import {
  buildPreviewMatchesByGrantId,
  buildPreviewMatchScoresByGrantId,
  DEFAULT_PREVIEW_GRANT_PROFILE,
  getPreviewMatchCriteriaForGrant,
  getPreviewMatchScoreForGrant,
  PREVIEW_GRANT_COMPANY_ID,
} from "@/lib/yetkinhibe/preview-match-score";
import type {
  CompanyGrantProfile,
  GrantEligibilityCriteria,
} from "@/lib/yetkinhibe/types";

import { makeGrantCall, makeProfile, OPEN_CRITERIA } from "./fixtures";

/** Her kriterin sağlandığı çağrı gereksinimleri. */
const FULL_REQUIREMENTS: GrantEligibilityCriteria = {
  ...OPEN_CRITERIA,
  eligibleSectorCodes: ["uretim"],
  minEmployeeCount: 10,
  maxEmployeeCount: 50,
  minCompanyAgeYears: 1,
  maxCompanyAgeYears: 10,
  requiresRdActivity: true,
  requiresExportActivity: true,
  requiresKobiStatus: true,
  requiresPatentOrUtilityModel: true,
};

const SATISFYING_PROFILE: CompanyGrantProfile = makeProfile({
  sectorCode: "uretim",
  employeeCount: 25,
  companyAgeYears: 3,
  rdMaturityLevel: "EARLY",
  exportActive: true,
  isKobi: true,
  hasPatentOrUtilityModel: true,
});

const REJECTING_PROFILE: CompanyGrantProfile = makeProfile({
  sectorCode: "hizmet",
  employeeCount: 500,
  companyAgeYears: 30,
  rdMaturityLevel: "NONE",
  exportActive: false,
  isKobi: false,
  hasPatentOrUtilityModel: false,
});

function scoreOf(profile: CompanyGrantProfile, eligibility: GrantEligibilityCriteria) {
  const [result] = matchGrantsForProfile(profile, [makeGrantCall({ eligibility })]);
  return result;
}

describe("matchGrantsForProfile — uyum skoru", () => {
  it("yalnız ACTIVE ve CLOSING_SOON çağrılarını eşleştirir", () => {
    const calls = [
      makeGrantCall({ id: "aktif", status: "ACTIVE" }),
      makeGrantCall({ id: "kapanmak-uzere", status: "CLOSING_SOON" }),
      makeGrantCall({ id: "yakinda", status: "UPCOMING" }),
      makeGrantCall({ id: "kapali", status: "CLOSED" }),
    ];

    const ids = matchGrantsForProfile(makeProfile(), calls)
      .map((result) => result.grantId)
      .sort();

    expect(ids).toEqual(["aktif", "kapanmak-uzere"]);
  });

  it("tüm kriterler sağlanırsa skor 100 olur", () => {
    expect(scoreOf(SATISFYING_PROFILE, FULL_REQUIREMENTS)?.matchScorePct).toBe(100);
  });

  it("hiçbir kriter sağlanmazsa skor 0 olur", () => {
    expect(scoreOf(REJECTING_PROFILE, FULL_REQUIREMENTS)?.matchScorePct).toBe(0);
  });

  it("kısıtsız çağrıda eksik profil skoru düşürmez", () => {
    expect(scoreOf(REJECTING_PROFILE, OPEN_CRITERIA)?.matchScorePct).toBe(100);
  });

  it("karşılanmayan Ar-Ge şartı 25 puan düşürür", () => {
    const result = scoreOf(makeProfile({ rdMaturityLevel: "NONE" }), {
      ...OPEN_CRITERIA,
      requiresRdActivity: true,
    });
    expect(result?.matchScorePct).toBe(75);
  });

  it.each([
    {
      skor: 100,
      profil: makeProfile(),
      kriter: OPEN_CRITERIA,
      oneri: YETKINHIBE_COPY.match.nextStepReady,
    },
    {
      skor: 80,
      profil: makeProfile(),
      kriter: { ...OPEN_CRITERIA, requiresExportActivity: true },
      oneri: YETKINHIBE_COPY.match.nextStepReady,
    },
    {
      skor: 75,
      profil: makeProfile({ rdMaturityLevel: "NONE" }),
      kriter: { ...OPEN_CRITERIA, requiresRdActivity: true },
      oneri: YETKINHIBE_COPY.match.nextStepGapAnalysis,
    },
    {
      skor: 50,
      profil: makeProfile({ rdMaturityLevel: "NONE" }),
      kriter: {
        ...OPEN_CRITERIA,
        requiresRdActivity: true,
        eligibleSectorCodes: ["hizmet"],
        minCompanyAgeYears: 10,
      },
      oneri: YETKINHIBE_COPY.match.nextStepGapAnalysis,
    },
    {
      skor: 0,
      profil: REJECTING_PROFILE,
      kriter: FULL_REQUIREMENTS,
      oneri: YETKINHIBE_COPY.match.nextStepNotReady,
    },
  ])("skor $skor için doğru öneri metnini seçer", ({ skor, profil, kriter, oneri }) => {
    const result = scoreOf(profil, kriter);
    expect(result?.matchScorePct).toBe(skor);
    expect(result?.recommendedNextStep).toBe(oneri);
  });

  it("sonuçları skora göre azalan sırada döndürür", () => {
    const calls = [
      makeGrantCall({ id: "dusuk", eligibility: FULL_REQUIREMENTS }),
      makeGrantCall({ id: "yuksek", eligibility: OPEN_CRITERIA }),
      makeGrantCall({ id: "orta", eligibility: { ...OPEN_CRITERIA, requiresRdActivity: true } }),
    ];

    const results = matchGrantsForProfile(makeProfile({ rdMaturityLevel: "NONE" }), calls);

    expect(results.map((result) => result.grantId)).toEqual(["yuksek", "orta", "dusuk"]);
  });

  it("süre, havuz ve destek tutarlarını olduğu gibi taşır", () => {
    const [result] = matchGrantsForProfile(makeProfile(), [
      makeGrantCall({
        id: "x",
        title: "Örnek Çağrı",
        source: "TUBITAK",
        remainingDays: 12,
        poolAmountMinor: toAmountMinor(1_000),
        maxSupportMinor: toAmountMinor(500),
      }),
    ]);

    expect(result).toMatchObject({
      grantId: "x",
      grantTitle: "Örnek Çağrı",
      source: "TUBITAK",
      remainingDays: 12,
      poolAmountMinor: 1_000,
      maxSupportMinor: 500,
    });
  });
});

describe("önizleme skorları — preview-match-score", () => {
  it("varsayılan önizleme profili sabit kimlik ve tam sayı minor ciro taşır", () => {
    expect(PREVIEW_GRANT_COMPANY_ID).toBe("preview");
    expect(DEFAULT_PREVIEW_GRANT_PROFILE.companyId).toBe(PREVIEW_GRANT_COMPANY_ID);
    expect(DEFAULT_PREVIEW_GRANT_PROFILE.annualRevenueMinor).toBe(500_000_000);
  });

  it("yalnız aktif çağrılar için skor üretir ve skorlar 0–100 aralığındadır", () => {
    const calls = [makeGrantCall({ id: "a" }), makeGrantCall({ id: "b", status: "CLOSED" })];

    const scores = buildPreviewMatchScoresByGrantId(calls);

    expect(Object.keys(scores)).toEqual(["a"]);
    expect(scores["a"]).toBeGreaterThanOrEqual(0);
    expect(scores["a"]).toBeLessThanOrEqual(100);
  });

  it("bilinmeyen çağrı için skor 0 ve kriter listesi boştur", () => {
    const calls = [makeGrantCall({ id: "a" })];

    expect(getPreviewMatchScoreForGrant("yok", calls)).toBe(0);
    expect(getPreviewMatchCriteriaForGrant("yok", calls)).toEqual([]);
  });

  it("önizleme skoru doğrudan eşleştirmeyle aynı sonucu verir", () => {
    const calls = [
      makeGrantCall({ id: "a", eligibility: { ...OPEN_CRITERIA, requiresExportActivity: true } }),
    ];

    const direct = matchGrantsForProfile(DEFAULT_PREVIEW_GRANT_PROFILE, calls);

    expect(getPreviewMatchScoreForGrant("a", calls)).toBe(direct[0]?.matchScorePct);
    expect(buildPreviewMatchesByGrantId(calls)["a"]?.matchScorePct).toBe(80);
  });
});
