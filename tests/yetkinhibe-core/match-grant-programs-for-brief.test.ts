import { describe, expect, it } from "vitest";
import {
  GRANT_INVESTMENT_SKELETON,
  GRANT_SCHEDULE_STEPS,
} from "@/lib/yetkinhibe/grant-investment-skeleton";
import { GRANT_PROVINCES } from "@/lib/yetkinhibe/grant-brief-axes";
import {
  GrantCatalogRowError,
  mapGrantCallRow,
  type GrantCatalogRowInput,
} from "@/lib/yetkinhibe/grant-catalog-core";
import {
  matchGrantProgramsForBrief,
  type GrantBriefCall,
  type GrantProgramBrief,
} from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import {
  GRANT_CLOSED_WINDOW_NOTE,
  GRANT_UNVERIFIED_NOTE,
  GRANT_UPCOMING_WINDOW_NOTE,
} from "@/lib/yetkinhibe/grant-project-notes";
import type { GrantEligibilityCriteria } from "@/lib/yetkinhibe/types";

const NOW = new Date("2026-11-15T09:00:00.000Z");
const OPEN_ELIGIBILITY: GrantEligibilityCriteria = {
  eligibleSectorCodes: null,
  minEmployeeCount: null,
  maxEmployeeCount: null,
  minCompanyAgeYears: null,
  maxCompanyAgeYears: null,
  requiresRdActivity: false,
  requiresExportActivity: false,
  requiresKobiStatus: false,
  requiresPatentOrUtilityModel: false,
};

const BRIEF: GrantProgramBrief = {
  provinceCode: "34",
  audience: "mevcut_kobi",
  naceGroup: "10",
  investmentFocus: "makine_techizat",
  employeeCount: 10,
  companyAgeYears: 3,
  rdMaturityLevel: "EARLY",
  exportActive: false,
  hasPatentOrUtilityModel: false,
};

function makeCall(overrides: Partial<GrantBriefCall> = {}): GrantBriefCall {
  return {
    id: "cagri",
    title: "Test çağrısı",
    sourceLabel: "KOSGEB",
    officialInfoUrl: "https://www.kosgeb.gov.tr/",
    status: "ACTIVE",
    remainingDays: 30,
    poolAmountMinor: 100,
    maxSupportMinor: 50,
    supportRatioBps: 5000,
    sourceVerifiedAt: "2026-11-01T00:00:00.000Z",
    eligibility: { ...OPEN_ELIGIBILITY },
    ...overrides,
  };
}

function catalogRow(eligibilityJson: unknown): GrantCatalogRowInput {
  return {
    id: "satir",
    sourceKey: "KOSGEB",
    sourceLabel: "KOSGEB",
    title: "Satır",
    summary: "Özet",
    poolAmountMinor: 1000,
    minSupportMinor: 100,
    maxSupportMinor: 500,
    supportRatioBps: 5000,
    applicationOpensAt: new Date("2026-01-01T00:00:00.000Z"),
    applicationDeadline: new Date("2026-12-31T00:00:00.000Z"),
    eligibilityJson,
    requiredDocuments: ["Form"],
    tags: [],
    officialInfoUrl: "https://www.kosgeb.gov.tr/",
    sourceVerifiedAt: null,
  };
}

describe("matchGrantProgramsForBrief", () => {
  it("kapalı çağrıyı uygun listeden ayırır ve tutarını kopyalamaz", () => {
    const closedPool = 111_111_111_00;
    const upcomingPool = 333_333_333_00;
    const result = matchGrantProgramsForBrief(BRIEF, [
      makeCall({
        id: "kapali",
        title: "Kapalı çağrı",
        status: "CLOSED",
        remainingDays: 0,
        sourceVerifiedAt: "2026-08-01T00:00:00.000Z",
        poolAmountMinor: closedPool,
        supportRatioBps: 1111,
      }),
      makeCall({
        id: "gelecek",
        title: "Gelecek çağrı",
        status: "UPCOMING",
        poolAmountMinor: upcomingPool,
        supportRatioBps: 3333,
      }),
      makeCall({
        id: "acik",
        title: "Açık doğrulanmış",
        status: "ACTIVE",
        poolAmountMinor: 300_000,
        supportRatioBps: 5000,
      }),
      makeCall({
        id: "uymaz",
        title: "İhracat şartlı kapalı",
        status: "CLOSED",
        poolAmountMinor: 444_444_444_00,
        eligibility: { ...OPEN_ELIGIBILITY, requiresExportActivity: true },
      }),
    ]);

    expect(result.eligible.map((row) => row.grantId)).toEqual(["acik"]);
    expect(result.closed.map((row) => row.grantId)).toEqual(["kapali", "gelecek"]);
    expect(result.closed[0]?.note).toBe(GRANT_CLOSED_WINDOW_NOTE);
    expect(result.closed[1]?.note).toBe(GRANT_UPCOMING_WINDOW_NOTE);
    expect(result.eligible[0]?.criteria.some((row) => row.label === "İl kısıtı yok" && row.unconstrained)).toBe(
      true,
    );
    expect(Object.keys(result.closed[0] ?? {}).sort()).toEqual(["grantId", "note", "sourceLabel", "title"]);
    const withheld = JSON.stringify(result.closed);
    expect(withheld).not.toContain(String(closedPool));
    expect(withheld).not.toContain(String(upcomingPool));
    expect(withheld).not.toContain("1111");
    expect(withheld).not.toContain("3333");
    expect(withheld).not.toContain("poolAmountMinor");
    expect(withheld).not.toContain("supportRatioBps");
  });

  it("doğrulanmamış açık çağrının tutarını ve oranını sızdırmaz", () => {
    const pool = 222_222_222_00;
    const result = matchGrantProgramsForBrief(BRIEF, [
      makeCall({
        id: "dogrulanmamis",
        title: "Doğrulanmamış açık",
        status: "CLOSING_SOON",
        sourceVerifiedAt: null,
        poolAmountMinor: pool,
        maxSupportMinor: 888_888_888_00,
        supportRatioBps: 4321,
      }),
    ]);

    expect(result.eligible).toEqual([]);
    expect(result.unverified).toEqual([
      {
        grantId: "dogrulanmamis",
        title: "Doğrulanmamış açık",
        sourceLabel: "KOSGEB",
        note: GRANT_UNVERIFIED_NOTE,
      },
    ]);
    const dumped = JSON.stringify(result);
    expect(dumped).not.toContain(String(pool));
    expect(dumped).not.toContain("888888888");
    expect(dumped).not.toContain("4321");
    expect(dumped).not.toContain("poolAmountMinor");
    expect(dumped).not.toContain("supportRatioBps");
  });

  it("il veya NACE anahtarı bozuksa katalog satırını reddeder", () => {
    expect(() => mapGrantCallRow(catalogRow({ eligibleRegionCodes: ["İstanbul"] }), NOW)).toThrow(
      GrantCatalogRowError,
    );
    expect(() => mapGrantCallRow(catalogRow({ eligibleRegionCodes: "06" }), NOW)).toThrow(GrantCatalogRowError);
    expect(() => mapGrantCallRow(catalogRow({ eligibleRegionCodes: [] }), NOW)).toThrow(GrantCatalogRowError);
    expect(() => mapGrantCallRow(catalogRow({ eligibleRegionCodes: ["06", "06"] }), NOW)).toThrow(
      GrantCatalogRowError,
    );
    expect(() => mapGrantCallRow(catalogRow({ nacePrefixes: ["yazilim"] }), NOW)).toThrow(GrantCatalogRowError);
    expect(() => mapGrantCallRow(catalogRow({ nacePrefixes: [62] }), NOW)).toThrow(GrantCatalogRowError);
    expect(() => mapGrantCallRow(catalogRow({ audiences: ["KOBI"] }), NOW)).toThrow(GrantCatalogRowError);
    expect(() => mapGrantCallRow(catalogRow({ investmentFocus: ["makine"] }), NOW)).toThrow(GrantCatalogRowError);

    const row = mapGrantCallRow(catalogRow({ eligibleRegionCodes: ["06", "34"], nacePrefixes: ["10"] }), NOW);
    expect(row.eligibility.eligibleRegionCodes).toEqual(["06", "34"]);
    expect(row.eligibility.nacePrefixes).toEqual(["10"]);

    const plain = mapGrantCallRow(catalogRow({}), NOW);
    expect(plain.eligibility.eligibleRegionCodes).toBeNull();
    expect(plain.eligibility.nacePrefixes).toBeNull();
    expect(plain.eligibility.audiences).toBeNull();
    expect(plain.eligibility.investmentFocus).toBeNull();
  });

  it("bozuk il brifini ve uymayan ili listelemez", () => {
    const call = makeCall({ eligibility: { ...OPEN_ELIGIBILITY, eligibleRegionCodes: ["06"] } });
    expect(matchGrantProgramsForBrief(BRIEF, [call])).toEqual({ eligible: [], closed: [], unverified: [] });
    expect(matchGrantProgramsForBrief({ ...BRIEF, provinceCode: "99" }, [makeCall()])).toEqual({
      eligible: [],
      closed: [],
      unverified: [],
    });
  });

  it("yatırım ve adım iskeletinde tutar ve süre yoktur", () => {
    expect(GRANT_INVESTMENT_SKELETON.map((row) => row.category)).toEqual([
      "PERSONEL",
      "ALET_TECHIZAT",
      "HIZMET_ALIMI",
      "SEYAHAT",
      "GENEL_GIDER",
    ]);
    expect(JSON.stringify(GRANT_INVESTMENT_SKELETON)).not.toMatch(/\d/u);
    expect(GRANT_SCHEDULE_STEPS.map((row) => row.id)).toEqual(["hazirlik", "uygulama", "dogrulama", "teslim"]);
    expect(JSON.stringify(GRANT_SCHEDULE_STEPS)).not.toMatch(/\d/u);
    expect(GRANT_PROVINCES).toHaveLength(81);
    for (let index = 1; index <= 81; index += 1) {
      expect(GRANT_PROVINCES.map((row) => row.code)).toContain(String(index).padStart(2, "0"));
    }
  });
});
