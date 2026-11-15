import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  mapGrantCallRow,
  type GrantCatalogRowInput,
} from "@/lib/yetkinhibe/grant-catalog-core";
import {
  matchGrantProgramsForBrief,
  type GrantBriefCall,
  type GrantProgramBrief,
} from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import { GRANT_CLOSED_WINDOW_NOTE, GRANT_UNVERIFIED_NOTE } from "@/lib/yetkinhibe/grant-project-notes";

/** 15 Kasım 2026, 12:00 Türkiye. Migrasyon saatleri bu ana göre mühürlendi. */
const NOW = new Date("2026-11-15T09:00:00.000Z");
const VERIFIED = new Date("2026-11-15T09:00:00.000Z");

const NEW_MIGRATION = resolve(
  "prisma/migrations/20261115120000_yetkinhibe_grant_calls_2026_11/migration.sql",
);
const OLD_MIGRATION = resolve(
  "prisma/migrations/20261109120000_yetkinhibe_grant_catalog_v2/migration.sql",
);

const OLD_IDS = [
  "kosgeb-arge-inovasyon-2026",
  "tubitak-1501-sanayi-arge",
  "ticaret-bakanligi-turquality-2026",
  "kalkinma-ajansi-mali-destek-2026",
  "kosgeb-kobigel-2026",
] as const;

function row(overrides: GrantCatalogRowInput): GrantCatalogRowInput {
  return overrides;
}

const IS_GELISTIRME = row({
  id: "kosgeb-is-gelistirme-2026-3",
  sourceKey: "KOSGEB",
  sourceLabel: "KOSGEB",
  title: "KOSGEB Girişimci Destek Programı İş Geliştirme Desteği 2026/3",
  summary: "Kapalı dönem.",
  poolAmountMinor: null,
  minSupportMinor: 0,
  maxSupportMinor: 225_000_000,
  supportRatioBps: 8000,
  applicationOpensAt: new Date("2026-10-11T21:00:00Z"),
  applicationDeadline: new Date("2026-10-31T20:59:00Z"),
  eligibilityJson: {
    eligibleSectorCodes: null,
    minEmployeeCount: null,
    maxEmployeeCount: null,
    minCompanyAgeYears: 0,
    maxCompanyAgeYears: 3,
    requiresRdActivity: false,
    requiresExportActivity: false,
    requiresKobiStatus: false,
    requiresPatentOrUtilityModel: false,
    eligibleRegionCodes: null,
    audiences: ["yeni_girisimci"],
    investmentFocus: ["makine_techizat", "yazilim_dijital"],
    nacePrefixes: ["10", "13", "25", "28", "62", "72"],
  },
  requiredDocuments: ["Proje başvuru formu"],
  tags: ["girisimci"],
  officialInfoUrl:
    "https://www.kosgeb.gov.tr/site/tr/genel/detay/9499/girisimci-destek-programi-yenilendi-girisimcilere-yeni-destek-modeli",
  sourceVerifiedAt: VERIFIED,
});

const KAPASITE = row({
  id: "kosgeb-kapasite-gelistirme-2026-3",
  sourceKey: "KOSGEB",
  sourceLabel: "KOSGEB",
  title: "KOSGEB Kapasite Geliştirme Destek Programı 2026/3",
  summary: "Kapalı dönem. Oran sütunu hibe yüzdesi değildir.",
  poolAmountMinor: null,
  minSupportMinor: 100_000_000,
  maxSupportMinor: 2_000_000_000,
  supportRatioBps: 0,
  applicationOpensAt: new Date("2026-08-21T21:00:00Z"),
  applicationDeadline: new Date("2026-09-15T20:59:00Z"),
  eligibilityJson: {
    eligibleSectorCodes: null,
    minEmployeeCount: 10,
    maxEmployeeCount: 250,
    minCompanyAgeYears: null,
    maxCompanyAgeYears: null,
    requiresRdActivity: false,
    requiresExportActivity: false,
    requiresKobiStatus: true,
    requiresPatentOrUtilityModel: false,
    eligibleRegionCodes: null,
    audiences: ["mevcut_kobi"],
    investmentFocus: ["makine_techizat", "yazilim_dijital"],
    nacePrefixes: ["10", "13", "25", "28", "62", "72"],
  },
  requiredDocuments: ["Proje başvuru formu"],
  tags: ["kredi"],
  officialInfoUrl: "https://www.kosgeb.gov.tr/site/tr/genel/detay/9200/kapasite-gelistirme-destek-programi",
  sourceVerifiedAt: VERIFIED,
});

const CALL_1501 = row({
  id: "tubitak-1501-2026-2",
  sourceKey: "TUBITAK",
  sourceLabel: "TÜBİTAK",
  title: "TÜBİTAK 1501 Sanayi Ar-Ge Destek Programı 2026/2",
  summary: "Kapalı çağrı. Oran ilk beş proje içindir.",
  poolAmountMinor: null,
  minSupportMinor: 0,
  maxSupportMinor: 2_000_000_000,
  supportRatioBps: 7500,
  applicationOpensAt: new Date("2026-07-19T21:00:00Z"),
  applicationDeadline: new Date("2026-10-26T20:59:00Z"),
  eligibilityJson: {
    eligibleSectorCodes: null,
    minEmployeeCount: null,
    maxEmployeeCount: null,
    minCompanyAgeYears: null,
    maxCompanyAgeYears: null,
    requiresRdActivity: true,
    requiresExportActivity: false,
    requiresKobiStatus: false,
    requiresPatentOrUtilityModel: false,
    eligibleRegionCodes: null,
    audiences: null,
    investmentFocus: ["arge"],
    nacePrefixes: null,
  },
  requiredDocuments: ["PRODİS proje önerisi"],
  tags: ["ar-ge"],
  officialInfoUrl:
    "https://tubitak.gov.tr/tr/duyuru/1501-sanayi-ar-ge-destek-programi-ve-1507-kobi-ar-ge-baslangic-destek-programi-2026-yili-2-cagrilari-acildi",
  sourceVerifiedAt: VERIFIED,
});

const CALL_1507 = row({
  id: "tubitak-1507-2026-2",
  sourceKey: "TUBITAK",
  sourceLabel: "TÜBİTAK",
  title: "TÜBİTAK 1507 KOBİ Ar-Ge Başlangıç Destek Programı 2026/2",
  summary: "Açık çağrı. Havuz ilan edilmedi.",
  poolAmountMinor: null,
  minSupportMinor: 0,
  maxSupportMinor: 262_500_000,
  supportRatioBps: 7500,
  applicationOpensAt: new Date("2026-07-19T21:00:00Z"),
  applicationDeadline: new Date("2026-11-25T20:59:00Z"),
  eligibilityJson: {
    eligibleSectorCodes: null,
    minEmployeeCount: null,
    maxEmployeeCount: null,
    minCompanyAgeYears: null,
    maxCompanyAgeYears: null,
    requiresRdActivity: true,
    requiresExportActivity: false,
    requiresKobiStatus: false,
    requiresPatentOrUtilityModel: false,
    eligibleRegionCodes: null,
    audiences: ["yeni_girisimci", "mevcut_kobi"],
    investmentFocus: ["arge"],
    nacePrefixes: null,
  },
  requiredDocuments: ["PRODİS proje önerisi"],
  tags: ["ar-ge"],
  officialInfoUrl:
    "https://tubitak.gov.tr/tr/duyuru/1507-kobi-ar-ge-baslangic-destek-programi-ve-1707-siparise-dayali-ar-ge-projeleri-icin-kobi-destekleme-programi-2026-yili-cagrilarinin-suresi-uzatildi",
  sourceVerifiedAt: VERIFIED,
});

const NOVEMBER_ROWS = [IS_GELISTIRME, KAPASITE, CALL_1501, CALL_1507];

function asBrief(entry: ReturnType<typeof mapGrantCallRow>): GrantBriefCall {
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
  };
}

const ARGE_KOBI: GrantProgramBrief = {
  provinceCode: "06",
  audience: "mevcut_kobi",
  naceGroup: "62",
  investmentFocus: "arge",
  employeeCount: 12,
  companyAgeYears: 4,
  rdMaturityLevel: "EARLY",
  exportActive: false,
  hasPatentOrUtilityModel: false,
};

describe("Kasım 2026 katalog ekleri", () => {
  const entries = NOVEMBER_ROWS.map((item) => mapGrantCallRow(item, NOW));
  const byId = new Map(entries.map((entry) => [entry.id, entry]));

  it("1507 çağrısını kapanışa yakın, havuzu boş ve doğrulanmış okur", () => {
    const call = byId.get("tubitak-1507-2026-2");
    expect(call?.status).toBe("CLOSING_SOON");
    expect(call?.remainingDays).toBe(11);
    expect(call?.poolAmountMinor).toBeNull();
    expect(call?.maxSupportMinor).toBe(262_500_000);
    expect(call?.supportRatioBps).toBe(7500);
    expect(call?.sourceVerifiedAt).toBe("2026-11-15T09:00:00.000Z");
  });

  it("üç kapanmış dönemi doğrulanmış CLOSED okur", () => {
    for (const id of [
      "kosgeb-is-gelistirme-2026-3",
      "kosgeb-kapasite-gelistirme-2026-3",
      "tubitak-1501-2026-2",
    ]) {
      const call = byId.get(id);
      expect(call?.status).toBe("CLOSED");
      expect(call?.remainingDays).toBe(0);
      expect(call?.poolAmountMinor).toBeNull();
      expect(call?.sourceVerifiedAt).toBe("2026-11-15T09:00:00.000Z");
    }
  });

  it("açık doğrulanmış 1507 eşleşir; kapalı doğrulanmış satır tutar taşımaz", () => {
    const oldClosed: GrantBriefCall = {
      ...asBrief(byId.get("tubitak-1507-2026-2")!),
      id: "tubitak-1501-sanayi-arge",
      title: "Eski doğrulanmamış 1501",
      status: "CLOSED",
      remainingDays: 0,
      sourceVerifiedAt: null,
      poolAmountMinor: 600_000_000_000,
      supportRatioBps: 6000,
    };
    const unverifiedOpen: GrantBriefCall = {
      ...oldClosed,
      id: "acik-ham",
      title: "Doğrulanmamış açık",
      status: "ACTIVE",
      remainingDays: 40,
      poolAmountMinor: 444_444_444_00,
      supportRatioBps: 1111,
    };
    const match = matchGrantProgramsForBrief(ARGE_KOBI, [
      ...entries.map(asBrief),
      oldClosed,
      unverifiedOpen,
    ]);

    expect(match.eligible.map((item) => item.grantId)).toEqual(["tubitak-1507-2026-2"]);
    expect(match.eligible[0]?.poolAmountMinor).toBeNull();
    expect(match.eligible[0]?.maxSupportMinor).toBe(262_500_000);
    expect(match.closed.map((item) => item.grantId).sort()).toEqual(
      ["tubitak-1501-2026-2", "tubitak-1501-sanayi-arge"].sort(),
    );
    expect(match.closed.every((item) => item.note === GRANT_CLOSED_WINDOW_NOTE)).toBe(true);
    expect(match.unverified.map((item) => item.grantId)).toEqual(["acik-ham"]);
    expect(match.unverified[0]?.note).toBe(GRANT_UNVERIFIED_NOTE);
    const withheld = JSON.stringify({ closed: match.closed, unverified: match.unverified });
    expect(withheld).not.toContain("poolAmountMinor");
    expect(withheld).not.toContain("supportRatioBps");
    expect(withheld).not.toContain("600000000000");
  });

  it("genç girişimcinin makine briefi iş geliştirmeyi kapalı notta tutar", () => {
    const match = matchGrantProgramsForBrief(
      {
        ...ARGE_KOBI,
        audience: "yeni_girisimci",
        naceGroup: "10",
        investmentFocus: "makine_techizat",
        employeeCount: 2,
        companyAgeYears: 1,
        rdMaturityLevel: "NONE",
      },
      entries.map(asBrief),
    );
    expect(match.eligible).toEqual([]);
    expect(match.closed.map((item) => item.grantId)).toEqual(["kosgeb-is-gelistirme-2026-3"]);
  });

  it("genç girişimcinin Ar-Ge briefi 1507 ile eşleşir", () => {
    const match = matchGrantProgramsForBrief(
      { ...ARGE_KOBI, audience: "yeni_girisimci", companyAgeYears: 1 },
      entries.map(asBrief),
    );
    expect(match.eligible.map((item) => item.grantId)).toEqual(["tubitak-1507-2026-2"]);
    expect(match.closed.map((item) => item.grantId)).toEqual(["tubitak-1501-2026-2"]);
  });

  it("on çalışanın altındaki işletme kapasite satırına düşmez", () => {
    const small = matchGrantProgramsForBrief(
      {
        ...ARGE_KOBI,
        naceGroup: "28",
        investmentFocus: "yazilim_dijital",
        employeeCount: 5,
        rdMaturityLevel: "NONE",
      },
      entries.map(asBrief),
    );
    expect(small.eligible).toEqual([]);
    expect(small.closed.map((item) => item.grantId)).not.toContain("kosgeb-kapasite-gelistirme-2026-3");

    const grown = matchGrantProgramsForBrief(
      {
        ...ARGE_KOBI,
        naceGroup: "28",
        investmentFocus: "yazilim_dijital",
        employeeCount: 20,
        rdMaturityLevel: "NONE",
      },
      entries.map(asBrief),
    );
    expect(grown.closed.map((item) => item.grantId)).toEqual(["kosgeb-kapasite-gelistirme-2026-3"]);
  });

  it("yeni migrasyon eski çağrıları silmez ve havuzu boş mühürler", () => {
    const sql = readFileSync(NEW_MIGRATION, "utf8");
    const previous = readFileSync(OLD_MIGRATION, "utf8");
    expect(sql).not.toMatch(/DELETE\s+FROM/i);
    expect(sql).not.toMatch(/UPDATE\s+"yetkinhibe_grant_calls"/i);
    for (const id of [
      "kosgeb-is-gelistirme-2026-3",
      "kosgeb-kapasite-gelistirme-2026-3",
      "tubitak-1501-2026-2",
      "tubitak-1507-2026-2",
    ]) {
      expect(sql).toContain(`'${id}'`);
    }
    expect(sql.match(/'2026-11-15T09:00:00Z'/g)?.length).toBe(4);
    expect(sql.match(/NULL, /g)?.length).toBeGreaterThanOrEqual(4);
    for (const id of OLD_IDS) {
      expect(previous).toContain(`'${id}'`);
      expect(sql).not.toContain(id);
    }
  });
});
