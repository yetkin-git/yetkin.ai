import { describe, expect, it } from "vitest";
import { istanbulDayKey } from "@/lib/commerce/day-key";
import {
  collectOwnCatalogGaps,
  RADAR_MIN_ACTIVE_PRODUCTS,
} from "@/lib/commerce/radar-signals";
import { simulateCampaign } from "@/lib/commerce/profit";

describe("günlük brief yardımcısı", () => {
  it("Europe/Istanbul dayKey YYYY-MM-DD üretir", () => {
    const key = istanbulDayKey(new Date("2026-11-22T10:00:00.000Z"));
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // UTC 10:00 → İstanbul 13:00 aynı gün
    expect(key).toBe("2026-11-22");
  });

  it("zarar SKU'su LOSS verdict üretir (brief tarama formülü)", () => {
    const sim = simulateCampaign({
      priceMinor: 8_000,
      discountBps: 0,
      cogsMinor: 7_000,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnBps: 800,
      adCostMinor: 0,
    });
    expect(sim.verdict).toBe("LOSS");
  });
});

describe("fırsat radarı dürüstlük kapısı", () => {
  it("yetersiz katalogda sinyal basmaz", () => {
    const gaps = collectOwnCatalogGaps(
      Array.from({ length: RADAR_MIN_ACTIVE_PRODUCTS - 1 }, (_, i) => ({
        category: "X",
        basePriceMinor: 10_000 + i * 100,
        status: "ACTIVE",
      })),
    );
    expect(gaps).toEqual([]);
  });

  it("yeterli ve bant boşluğunda sinyal basar", () => {
    const gaps = collectOwnCatalogGaps([
      { category: "Çanta", basePriceMinor: 20_000, status: "ACTIVE" },
      { category: "Çanta", basePriceMinor: 21_000, status: "ACTIVE" },
      { category: "Çanta", basePriceMinor: 40_000, status: "ACTIVE" },
      { category: "Çanta", basePriceMinor: 41_000, status: "ACTIVE" },
    ]);
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps[0]?.supplyGap).toBeGreaterThan(0);
  });
});
