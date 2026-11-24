import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { mapGrantCallRow, type GrantCatalogRowInput } from "@/lib/yetkinhibe/grant-catalog-core";
import { toGrantBriefMatchWire } from "@/lib/yetkinhibe/grant-brief-match";
import {
  grantBriefCriteria,
  matchGrantProgramsForBrief,
  type GrantBriefCall,
  type GrantProgramBrief,
} from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import { rankGrantProgramFits } from "@/lib/yetkinhibe/program-fit";
import { matchPublicGrantEligibility } from "@/lib/yetkinhibe/public-eligibility";
import type { GrantEligibilityCriteria } from "@/lib/yetkinhibe/types";

const NOW = new Date("2026-11-23T12:00:00.000Z");
const VERIFIED = "2026-11-23T09:00:00.000Z";

const OPEN: GrantEligibilityCriteria = {
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

const CAFE: GrantProgramBrief = {
  provinceCode: "34",
  audience: "mevcut_kobi",
  naceGroup: "47",
  investmentFocus: "makine_techizat",
  employeeCount: 4,
  companyAgeYears: 2,
  rdMaturityLevel: "NONE",
  exportActive: false,
  hasPatentOrUtilityModel: false,
};

function briefCall(id: string, eligibility: GrantEligibilityCriteria, title: string): GrantBriefCall {
  return {
    id,
    title,
    sourceLabel: "Katalog",
    officialInfoUrl: "https://www.kosgeb.gov.tr/",
    status: "ACTIVE",
    remainingDays: 40,
    poolAmountMinor: null,
    maxSupportMinor: 500_000_00,
    supportRatioBps: 6000,
    sourceVerifiedAt: VERIFIED,
    eligibility,
  };
}

function catalogRow(
  id: string,
  title: string,
  eligibility: GrantEligibilityCriteria,
  maxSupportMinor: number,
): GrantCatalogRowInput {
  return {
    id,
    sourceKey: "KOSGEB",
    sourceLabel: "KOSGEB",
    title,
    summary: "Katalog özeti yeterince uzun.",
    poolAmountMinor: null,
    minSupportMinor: 0,
    maxSupportMinor,
    supportRatioBps: 6000,
    applicationOpensAt: new Date("2026-11-20T21:00:00.000Z"),
    applicationDeadline: new Date("2027-06-30T20:59:00.000Z"),
    eligibilityJson: eligibility,
    requiredDocuments: [],
    tags: [],
    officialInfoUrl: "https://www.kosgeb.gov.tr/",
    publicationUrl: null,
    sourceVerifiedAt: new Date(VERIFIED),
  };
}

describe("YetkinHibe tek skor motoru", () => {
  it("ağırlıklı ikinci motor diskte yoktur; kriter listesi 11 satırdır", () => {
    expect(existsSync(join(process.cwd(), "lib", "yetkinhibe", "match-grants-for-profile.ts"))).toBe(false);
    expect(existsSync(join(process.cwd(), "lib", "yetkinhibe", "grant-match-api.ts"))).toBe(false);
    const criteria = grantBriefCriteria(CAFE, { ...OPEN, requiresRdActivity: true });
    expect(criteria.map((row) => row.key)).toEqual([
      "sector",
      "employeeCount",
      "companyAge",
      "requiresRdActivity",
      "requiresExportActivity",
      "requiresKobiStatus",
      "requiresPatentOrUtilityModel",
      "region",
      "audience",
      "nace",
      "investment",
    ]);
  });

  it("uygun çağrıda sıralama ve API teli aynı yüzdeyi verir", () => {
    const call = briefCall("rd-acik", { ...OPEN, requiresRdActivity: true }, "Ar-Ge çağrısı");
    const brief: GrantProgramBrief = { ...CAFE, rdMaturityLevel: "EARLY", investmentFocus: "arge" };
    const matched = matchGrantProgramsForBrief(brief, [call], NOW);
    const ranked = rankGrantProgramFits(brief, [call], NOW);
    expect(matched.eligible).toHaveLength(1);
    const wire = toGrantBriefMatchWire(matched.eligible[0]!);
    expect(wire.criteria).toHaveLength(11);
    expect(wire.fitPct).toBe(100);
    expect(ranked[0]?.fitPct).toBe(wire.fitPct);
  });

  it("kısıtsız çağrı yüzde 100 yazmaz; iki yüzey de null verir", () => {
    const call = briefCall("genel", OPEN, "Kısıtsız çağrı");
    const matched = matchGrantProgramsForBrief(CAFE, [call], NOW);
    const ranked = rankGrantProgramFits(CAFE, [call], NOW);
    const wire = toGrantBriefMatchWire(matched.eligible[0]!);
    expect(wire.fitPct).toBeNull();
    expect(wire.scopeLabel).toBe("Genel kapsam — özel kısıt yok");
    expect(ranked[0]?.fitPct).toBeNull();
    expect(ranked[0]?.scopeLabel).toBe(wire.scopeLabel);
  });
});

describe("YetkinHibe kamu widget NACE ve il", () => {
  it("kafe ve NACE 47 Ar-Ge çağrısını listelemez; tavan katalogdandır", () => {
    const retail = mapGrantCallRow(
      catalogRow(
        "perakende-2027",
        "Perakende destek",
        {
          ...OPEN,
          nacePrefixes: ["47"],
          audiences: ["mevcut_kobi"],
          investmentFocus: ["makine_techizat"],
          eligibleRegionCodes: ["34"],
        },
        250_000_00,
      ),
      NOW,
    );
    const tubitak = mapGrantCallRow(
      catalogRow(
        "tubitak-1507-2027-1",
        "TÜBİTAK 1507 KOBİ Ar-Ge",
        {
          ...OPEN,
          requiresRdActivity: true,
          audiences: ["yeni_girisimci", "mevcut_kobi"],
          investmentFocus: ["arge"],
        },
        262_500_000,
      ),
      NOW,
    );
    const result = matchPublicGrantEligibility({
      idea: "Mahallede kafe açacağım.",
      provinceCode: "34",
      sectorCode: "47",
      audience: "mevcut_kobi",
      calls: [tubitak, retail],
      now: NOW,
    });
    expect(result.programLabel).toBe("Perakende destek");
    expect(result.programLabel).not.toContain("1507");
    expect(result.supportBand.startsWith("Program üst limiti:")).toBe(true);
    expect(result.matchScorePct).toBe(100);
  });

  it("il kısıtı uymayan çağrı eşleşmez", () => {
    const ankara = mapGrantCallRow(
      catalogRow(
        "ankaraka-2027",
        "Ankara yatırım",
        { ...OPEN, eligibleRegionCodes: ["06"], nacePrefixes: ["47"] },
        100_000_00,
      ),
      NOW,
    );
    const result = matchPublicGrantEligibility({
      idea: "Mahallede kafe açacağım.",
      provinceCode: "34",
      sectorCode: "47",
      audience: "mevcut_kobi",
      calls: [ankara],
      now: NOW,
    });
    expect(result.programLabel).toBe("");
    // Ş4 — eşleşme yoksa yüzde basılmaz; `null` dürüst cevaptır.
    expect(result.matchScorePct).toBeNull();
    expect(result.constraintLabel).toBeNull();
    expect(result.supportBand).toBe("Bu profil için katalogda açık çağrı eşleşmedi.");
  });
});
