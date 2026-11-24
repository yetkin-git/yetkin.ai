import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveHibeCompanyProfile } from "@/lib/yetkinhibe/company-profile";
import { mapGrantCallRow } from "@/lib/yetkinhibe/grant-catalog-core";
import { loadHibeCockpit } from "@/lib/yetkinhibe/os-load";
import { parseHibeAnalysis } from "@/lib/yetkinhibe/os-brief";

const NOW = new Date("2026-11-23T12:00:00.000Z");

const mocks = vi.hoisted(() => ({
  profileFind: vi.fn(),
  profileUpsert: vi.fn(),
  dossierCount: vi.fn(),
  dossierFind: vi.fn(),
  subscriptionFind: vi.fn(),
  catalog: vi.fn(),
}));

vi.mock("@/lib/kernel/db", () => ({
  getPrisma: () => ({
    hibeCompanyProfile: { findUnique: mocks.profileFind, upsert: mocks.profileUpsert },
    hibeDossier: { count: mocks.dossierCount, findMany: mocks.dossierFind },
    tezgahSubscription: { findUnique: mocks.subscriptionFind },
  }),
}));

vi.mock("@/lib/yetkinhibe/grant-catalog-live", () => ({
  loadYetkinhibeGrantCatalog: (...args: unknown[]) => mocks.catalog(...args),
}));

const RETAIL = mapGrantCallRow(
  {
    id: "perakende-2027",
    sourceKey: "KOSGEB",
    sourceLabel: "KOSGEB",
    title: "Perakende destek",
    summary: "NACE 47 için açık çağrı.",
    poolAmountMinor: null,
    minSupportMinor: 0,
    maxSupportMinor: 250_000_00,
    supportRatioBps: 6000,
    applicationOpensAt: new Date("2026-11-20T21:00:00.000Z"),
    applicationDeadline: new Date("2027-06-30T20:59:00.000Z"),
    eligibilityJson: {
      eligibleSectorCodes: null,
      minEmployeeCount: null,
      maxEmployeeCount: null,
      minCompanyAgeYears: null,
      maxCompanyAgeYears: null,
      requiresRdActivity: false,
      requiresExportActivity: false,
      requiresKobiStatus: false,
      requiresPatentOrUtilityModel: false,
      nacePrefixes: ["47"],
      audiences: ["mevcut_kobi"],
      investmentFocus: ["makine_techizat"],
      eligibleRegionCodes: ["34"],
    },
    requiredDocuments: [],
    tags: [],
    officialInfoUrl: "https://www.kosgeb.gov.tr/",
    publicationUrl: null,
    sourceVerifiedAt: new Date("2026-11-23T09:00:00.000Z"),
  },
  NOW,
);

const PROFILE = {
  businessName: "Kahve Dükkanı",
  audience: "mevcut_kobi",
  provinceCode: "34",
  naceGroup: "47",
  investmentFocus: "makine_techizat",
  employeeCount: 4,
  companyAgeYears: 2,
  rdMaturityLevel: "NONE",
  exportActive: false,
  hasPatentOrUtilityModel: false,
};

describe("YetkinHibe kalıcı profil ve arşiv", () => {
  beforeEach(() => {
    mocks.profileFind.mockReset();
    mocks.profileUpsert.mockReset();
    mocks.dossierCount.mockReset();
    mocks.dossierFind.mockReset();
    mocks.subscriptionFind.mockReset();
    mocks.catalog.mockReset();
    mocks.subscriptionFind.mockResolvedValue(null);
    mocks.catalog.mockResolvedValue([RETAIL]);
    mocks.profileUpsert.mockResolvedValue({ id: "profil" });
  });

  it("boş kokpit kayıtlı profili okur ve dosya gövdesini yeniden açar", async () => {
    mocks.profileFind.mockResolvedValue(PROFILE);
    mocks.dossierCount.mockResolvedValue(1);
    mocks.dossierFind.mockResolvedValue([
      {
        id: "dosya-1",
        title: "Kahve Dükkanı",
        markdown: "Tam dosya gövdesi yeniden açılır.",
        grantId: "perakende-2027",
        createdAt: new Date("2026-11-23T10:00:00.000Z"),
      },
    ]);

    const data = await loadHibeCockpit("user-1", {});

    expect(data.savedProfile).toMatchObject({ naceGroup: "47", provinceCode: "34", businessName: "Kahve Dükkanı" });
    expect(data.analysis?.some((row) => row.grantId === "perakende-2027" && row.eligible)).toBe(true);
    expect(data.archive).toEqual([
      expect.objectContaining({
        id: "dosya-1",
        markdown: "Tam dosya gövdesi yeniden açılır.",
        grantId: "perakende-2027",
      }),
    ]);
    const cockpit = readFileSync(join(process.cwd(), "components", "hibe", "os-cockpit.tsx"), "utf8");
    expect(cockpit).toContain("Tam dosyayı aç");
    expect(cockpit).toContain("{row.markdown}");
  });

  it("hesap sorgusu kayıtlı NACE'nin önüne geçer", async () => {
    mocks.profileFind.mockResolvedValue(PROFILE);
    mocks.dossierCount.mockResolvedValue(0);
    mocks.dossierFind.mockResolvedValue([]);
    const data = await loadHibeCockpit("user-1", {
      hesap: "1",
      isletme: "kobi",
      nace: "62",
      il: "34",
      yatirim: "yazilim_dijital",
      calisan: "4",
      yas: "2",
      arge: "NONE",
      ihracat: "hayir",
      patent: "hayir",
      ad: "Yazılım Evi",
    });
    expect(data.savedProfile?.naceGroup).toBe("47");
    expect(data.analysis?.every((row) => !row.eligible)).toBe(true);
  });

  it("analiz gönderimi tek satırı kullanıcıya yazar", async () => {
    const input = parseHibeAnalysis({
      hesap: "1",
      isletme: "kobi",
      nace: "47",
      il: "34",
      yatirim: "makine_techizat",
      calisan: "4",
      yas: "2",
      arge: "NONE",
      ihracat: "hayir",
      patent: "hayir",
      ad: "Kahve Dükkanı",
    });
    expect(input).not.toBeNull();
    await expect(saveHibeCompanyProfile("user-1", input!)).resolves.toBe(true);
    expect(mocks.profileUpsert).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      create: expect.objectContaining({ userId: "user-1", naceGroup: "47", provinceCode: "34" }),
      update: expect.objectContaining({ naceGroup: "47", businessName: "Kahve Dükkanı" }),
    });
    await expect(saveHibeCompanyProfile("  ", input!)).resolves.toBe(false);
    expect(mocks.profileUpsert).toHaveBeenCalledTimes(1);
  });
});
