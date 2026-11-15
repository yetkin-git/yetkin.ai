import { describe, expect, it } from "vitest";
import {
  GRANT_CLOSING_SOON_DAYS,
  GrantCatalogRowError,
  computeGrantCallStatus,
  computeRemainingDays,
  mapGrantCallRow,
  type GrantCatalogRowInput,
} from "@/lib/yetkinhibe/grant-catalog-core";

const NOW = new Date("2026-11-09T09:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;
const OPENS_AT = new Date("2026-06-01T00:00:00.000Z");

function daysFromNow(days: number): Date {
  return new Date(NOW.getTime() + days * DAY_MS);
}

function makeRow(overrides: Partial<GrantCatalogRowInput> = {}): GrantCatalogRowInput {
  return {
    id: "test-cagri-2027",
    sourceKey: "KOSGEB",
    sourceLabel: "KOSGEB",
    title: "Test çağrısı",
    summary: "Test özeti.",
    poolAmountMinor: 250000000000,
    minSupportMinor: 5000000,
    maxSupportMinor: 75000000,
    supportRatioBps: 7500,
    applicationOpensAt: OPENS_AT,
    applicationDeadline: daysFromNow(60),
    eligibilityJson: {
      eligibleSectorCodes: null,
      minEmployeeCount: 1,
      maxEmployeeCount: 250,
      minCompanyAgeYears: null,
      maxCompanyAgeYears: null,
      requiresRdActivity: true,
      requiresExportActivity: false,
      requiresKobiStatus: true,
      requiresPatentOrUtilityModel: false,
    },
    requiredDocuments: ["Proje başvuru formu"],
    tags: ["kobi"],
    officialInfoUrl: "https://www.kosgeb.gov.tr/",
    sourceVerifiedAt: null,
    ...overrides,
  };
}

describe("YetkinHibe katalog durumu", () => {
  it("açılıştan önce UPCOMING", () => {
    expect(
      computeGrantCallStatus(OPENS_AT, daysFromNow(60), new Date("2026-05-01T00:00:00.000Z")),
    ).toBe("UPCOMING");
  });

  it("son tarihten sonra CLOSED", () => {
    expect(computeGrantCallStatus(OPENS_AT, daysFromNow(-1), NOW)).toBe("CLOSED");
  });

  it(`son ${GRANT_CLOSING_SOON_DAYS} gün içinde CLOSING_SOON`, () => {
    expect(computeGrantCallStatus(OPENS_AT, daysFromNow(10), NOW)).toBe("CLOSING_SOON");
  });

  it("son 14 günden uzaktaysa ACTIVE", () => {
    expect(computeGrantCallStatus(OPENS_AT, daysFromNow(30), NOW)).toBe("ACTIVE");
  });
});

describe("YetkinHibe kalan gün", () => {
  it("kesirli günü yukarı yuvarlar", () => {
    expect(computeRemainingDays(new Date(NOW.getTime() + 1.2 * DAY_MS), NOW)).toBe(2);
  });

  it("geçmiş son tarihte 0 döner, negatif sızdırmaz", () => {
    expect(computeRemainingDays(daysFromNow(-5), NOW)).toBe(0);
  });
});

describe("YetkinHibe satır eşleme", () => {
  it("geçerli satırı API biçimine çevirir; kuruş tutarını sayıya taşır", () => {
    const entry = mapGrantCallRow(makeRow({ poolAmountMinor: BigInt(250000000000) }), NOW);
    expect(entry.poolAmountMinor).toBe(250000000000);
    expect(entry.minSupportMinor).toBe(5000000);
    expect(entry.maxSupportMinor).toBe(75000000);
    expect(entry.status).toBe("ACTIVE");
    expect(entry.remainingDays).toBe(60);
    expect(entry.applicationOpensAt).toBe(OPENS_AT.toISOString());
    expect(entry.applicationDeadline).toBe(daysFromNow(60).toISOString());
    expect(entry.source).toBe("KOSGEB");
    expect(entry.eligibility.requiresRdActivity).toBe(true);
    expect(entry.sourceVerifiedAt).toBeNull();
  });

  it("süresi dolmuş tohum çağrısını CLOSED ve kalan gün 0 olarak işaretler", () => {
    const entry = mapGrantCallRow(
      makeRow({
        id: "kosgeb-arge-inovasyon-2026",
        applicationDeadline: new Date("2026-09-30T23:59:59.000Z"),
      }),
      NOW,
    );
    expect(entry.status).toBe("CLOSED");
    expect(entry.remainingDays).toBe(0);
    expect(entry.sourceVerifiedAt).toBeNull();
  });

  it("doğrulanmış kaynak zamanını ISO metni olarak taşır", () => {
    const entry = mapGrantCallRow(
      makeRow({ sourceVerifiedAt: new Date("2026-11-01T00:00:00.000Z") }),
      NOW,
    );
    expect(entry.sourceVerifiedAt).toBe("2026-11-01T00:00:00.000Z");
  });

  it("bilinmeyen kaynak anahtarını reddeder", () => {
    expect(() => mapGrantCallRow(makeRow({ sourceKey: "BILINMEYEN" }), NOW)).toThrow(
      GrantCatalogRowError,
    );
  });

  it("ilan edilmemiş havuzu null bırakır", () => {
    const entry = mapGrantCallRow(makeRow({ poolAmountMinor: null }), NOW);
    expect(entry.poolAmountMinor).toBeNull();
  });

  it("negatif tutarı reddeder", () => {
    expect(() => mapGrantCallRow(makeRow({ poolAmountMinor: -1 }), NOW)).toThrow(GrantCatalogRowError);
  });

  it("güvenli tamsayı sınırını aşan havuz tutarını reddeder", () => {
    const huge = BigInt(Number.MAX_SAFE_INTEGER) * BigInt(10);
    expect(() => mapGrantCallRow(makeRow({ poolAmountMinor: huge }), NOW)).toThrow(GrantCatalogRowError);
  });

  it("destek alt sınırı üst sınırdan büyükse reddeder", () => {
    expect(() =>
      mapGrantCallRow(makeRow({ minSupportMinor: 80000000, maxSupportMinor: 75000000 }), NOW),
    ).toThrow(GrantCatalogRowError);
  });

  it("destek oranı 0-10000 dışındaysa reddeder", () => {
    expect(() => mapGrantCallRow(makeRow({ supportRatioBps: 10001 }), NOW)).toThrow(GrantCatalogRowError);
  });

  it("son başvuru açılıştan önceyse reddeder", () => {
    expect(() =>
      mapGrantCallRow(makeRow({ applicationDeadline: new Date("2026-01-01T00:00:00.000Z") }), NOW),
    ).toThrow(GrantCatalogRowError);
  });

  it("https dışı resmî bağlantıyı reddeder", () => {
    expect(() =>
      mapGrantCallRow(makeRow({ officialInfoUrl: "http://www.kosgeb.gov.tr/" }), NOW),
    ).toThrow(GrantCatalogRowError);
  });

  it("bozuk uygunluk JSON'unu reddeder", () => {
    expect(() => mapGrantCallRow(makeRow({ eligibilityJson: "metin" }), NOW)).toThrow(GrantCatalogRowError);
    expect(() =>
      mapGrantCallRow(makeRow({ eligibilityJson: { requiresRdActivity: "evet" } }), NOW),
    ).toThrow(GrantCatalogRowError);
    expect(() =>
      mapGrantCallRow(makeRow({ eligibilityJson: { eligibleSectorCodes: [1, 2] } }), NOW),
    ).toThrow(GrantCatalogRowError);
  });

  it("geçersiz tarihi reddeder", () => {
    expect(() =>
      mapGrantCallRow(makeRow({ applicationDeadline: new Date("gecersiz") }), NOW),
    ).toThrow(GrantCatalogRowError);
  });
});
