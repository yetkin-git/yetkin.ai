import { describe, expect, it } from "vitest";

import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  GRANT_MATCH_MAX_BODY_BYTES,
  grantMatchRequestSchema,
  readGrantMatchBodyText,
  toGrantMatchWire,
} from "@/lib/yetkinhibe/grant-match-api";
import {
  matchBandForScore,
  matchGrantsForProfile,
} from "@/lib/yetkinhibe/match-grants-for-profile";
import type { GrantMatchProfile } from "@/lib/yetkinhibe/types";

import { makeGrantCall, OPEN_CRITERIA } from "./fixtures";

const VALID_BODY = {
  sectorCode: "uretim",
  employeeCount: 25,
  companyAgeYears: 3,
  rdMaturityLevel: "EARLY",
  exportActive: false,
  isKobi: true,
  hasPatentOrUtilityModel: false,
} as const;

describe("grantMatchRequestSchema — istek sözleşmesi", () => {
  it("geçerli profili kabul eder ve eşleştirme profili tipine uyar", () => {
    const parsed = grantMatchRequestSchema.parse(VALID_BODY);
    const profile: GrantMatchProfile = parsed;
    expect(profile.sectorCode).toBe("uretim");
  });

  it("sektör kodunu kırpar ve Türkçe küçük harfe çevirir", () => {
    const parsed = grantMatchRequestSchema.parse({ ...VALID_BODY, sectorCode: "  ÜRETİM  " });
    expect(parsed.sectorCode).toBe("üretim");
  });

  it("gelir, bölge ve şirket kimliği gibi sözleşme dışı alanları reddeder", () => {
    for (const extra of [{ annualRevenueMinor: 500 }, { region: "TR" }, { companyId: "x" }]) {
      expect(grantMatchRequestSchema.safeParse({ ...VALID_BODY, ...extra }).success).toBe(false);
    }
  });

  it("eksik alanı reddeder", () => {
    const withoutKobi: Record<string, unknown> = { ...VALID_BODY };
    delete withoutKobi.isKobi;
    expect(grantMatchRequestSchema.safeParse(withoutKobi).success).toBe(false);
  });

  it.each([
    ["negatif çalışan sayısı", { employeeCount: -1 }],
    ["ondalıklı çalışan sayısı", { employeeCount: 2.5 }],
    ["üst sınırı aşan çalışan sayısı", { employeeCount: 100_001 }],
    ["negatif şirket yaşı", { companyAgeYears: -1 }],
    ["üst sınırı aşan şirket yaşı", { companyAgeYears: 201 }],
    ["bilinmeyen Ar-Ge düzeyi", { rdMaturityLevel: "HIGH" }],
    ["metin olarak boolean", { isKobi: "true" }],
    ["yalnız boşluk içeren sektör", { sectorCode: "   " }],
    ["boşluk içeren sektör", { sectorCode: "uretim tarim" }],
    ["41 karakterlik sektör", { sectorCode: "a".repeat(41) }],
  ])("%s reddedilir", (_label, override) => {
    expect(grantMatchRequestSchema.safeParse({ ...VALID_BODY, ...override }).success).toBe(false);
  });

  it("gövde üst sınırı geçerli profilin çok üstündedir ama sınırlıdır", () => {
    expect(GRANT_MATCH_MAX_BODY_BYTES).toBeGreaterThan(JSON.stringify(VALID_BODY).length * 5);
    expect(GRANT_MATCH_MAX_BODY_BYTES).toBeLessThan(64 * 1024);
  });
});

describe("readGrantMatchBodyText — akış üzerinde gövde sınırı", () => {
  const url = "http://localhost/api/yetkinhibe/grant/match";

  it("sınır içindeki gövdeyi metin olarak döner", async () => {
    const request = new Request(url, { method: "POST", body: "abc" });
    await expect(readGrantMatchBodyText(request, 10)).resolves.toBe("abc");
  });

  it("sınırı aşan gövdede null döner", async () => {
    const request = new Request(url, { method: "POST", body: "0123456789A" });
    await expect(readGrantMatchBodyText(request, 10)).resolves.toBeNull();
  });

  it("sınırı karakter değil bayt cinsinden sayar", async () => {
    // "ğüşıöç": 6 karakter, UTF-8'de 12 bayt.
    const fits = new Request(url, { method: "POST", body: "ğüşıöç" });
    await expect(readGrantMatchBodyText(fits, 12)).resolves.toBe("ğüşıöç");

    const tooBig = new Request(url, { method: "POST", body: "ğüşıöç" });
    await expect(readGrantMatchBodyText(tooBig, 11)).resolves.toBeNull();
  });

  it("gövdesiz istekte boş metin döner", async () => {
    const request = new Request(url, { method: "GET" });
    await expect(readGrantMatchBodyText(request)).resolves.toBe("");
  });
});

describe("matchBandForScore — uyum bandı eşikleri", () => {
  it.each([
    [100, "READY"],
    [80, "READY"],
    [79, "GAP"],
    [50, "GAP"],
    [49, "NOT_READY"],
    [0, "NOT_READY"],
  ])("skor %i için bant %s", (score, band) => {
    expect(matchBandForScore(score)).toBe(band);
  });
});

describe("toGrantMatchWire — yanıt haritası", () => {
  const profile: GrantMatchProfile = grantMatchRequestSchema.parse(VALID_BODY);

  it("öneri metni taşımaz ve uyum bandını döner", () => {
    const wire = matchGrantsForProfile(profile, [makeGrantCall({ id: "a" })]).map(toGrantMatchWire);

    expect(wire).toHaveLength(1);
    expect(wire[0]).not.toHaveProperty("recommendedNextStep");
    expect(wire[0]?.band).toBe("READY");
  });

  it("tutar, süre ve kriter alanlarını olduğu gibi taşır", () => {
    const requiresRd = { ...OPEN_CRITERIA, requiresRdActivity: true };
    const wire = matchGrantsForProfile(
      { ...profile, rdMaturityLevel: "NONE" },
      [
        makeGrantCall({
          id: "x",
          title: "Örnek Çağrı",
          source: "TUBITAK",
          remainingDays: 12,
          poolAmountMinor: toAmountMinor(1_000),
          maxSupportMinor: toAmountMinor(500),
          eligibility: requiresRd,
        }),
      ],
    ).map(toGrantMatchWire);

    expect(wire[0]).toMatchObject({
      grantId: "x",
      grantTitle: "Örnek Çağrı",
      source: "TUBITAK",
      matchScorePct: 75,
      band: "GAP",
      remainingDays: 12,
      poolAmountMinor: 1_000,
      maxSupportMinor: 500,
    });
    expect(wire[0]?.criteria).toHaveLength(7);
    expect(wire[0]?.criteria.find((c) => c.key === "requiresRdActivity")?.satisfied).toBe(false);
  });

  it("JSON'a dönüşümde tutarlar tam sayı kalır", () => {
    const wire = matchGrantsForProfile(profile, [makeGrantCall({ id: "j" })]).map(toGrantMatchWire);
    const roundTrip = JSON.parse(JSON.stringify(wire)) as typeof wire;

    expect(roundTrip).toEqual(wire);
    expect(Number.isSafeInteger(roundTrip[0]?.poolAmountMinor)).toBe(true);
  });
});
