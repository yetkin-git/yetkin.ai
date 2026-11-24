import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseEconomicsCsv, renderEconomicsCsv } from "@/lib/commerce/economics-csv";
import { channelListingSaleMinor } from "@/lib/commerce/listing-price";
import { calculateUnitNet, vatIncludedMinor } from "@/lib/commerce/profit";
import {
  BELOW_FLOOR_ALERT,
  computeChannelFloorPrice,
  evaluateRepriceDecision,
  priceMinorFromMerchantNode,
  readIngestQuotes,
} from "@/lib/commerce/repricer";
import { classifyStockMovement, summarizeReturnImpact } from "@/lib/commerce/return-impact";
import { selectCockpitStore } from "@/lib/commerce/os-rules";

const ROOT = process.cwd();

describe("kanal taban fiyatı ve rekabet kararı", () => {
  it("girdi KDV'si net kâra mahsup edilir", () => {
    const base = {
      priceMinor: 10_000,
      quantity: 1,
      costMinor: 4_000,
      commissionBps: 2_000,
      cargoMinor: 1_000,
      returnRateBps: 500,
      adCostMinorPerOrder: 200,
      vatBps: 2_000,
    };
    const excluded = calculateUnitNet(base);
    const included = calculateUnitNet({ ...base, costIncludesVat: true });
    const credit = vatIncludedMinor(4_000, 2_000);
    expect(credit).toBe(667);
    expect(included.inputVatCreditMinor).toBe(667);
    expect(included.netMinor).toBe(excluded.netMinor + 667);
    expect(excluded.inputVatCreditMinor).toBe(0);
  });

  it("matematik tabanı ile manuel tabanın büyüğü kazanır", () => {
    const shared = {
      costMinor: 1_000,
      vatBps: 0,
      commissionBps: 0,
      cargoMinor: 0,
      returnRateBps: 0,
      adCostMinorPerOrder: 0,
      minMarginBps: 0,
    };
    expect(computeChannelFloorPrice(shared)).toBe(1_000);
    expect(computeChannelFloorPrice({ ...shared, manualFloorMinor: 1_500 })).toBe(1_500);
    expect(computeChannelFloorPrice({ ...shared, manualFloorMinor: 400 })).toBe(1_000);
    const withCredit = computeChannelFloorPrice({ ...shared, vatBps: 2_000, costIncludesVat: true, minMarginBps: 800 });
    const withoutCredit = computeChannelFloorPrice({ ...shared, vatBps: 2_000, minMarginBps: 800 });
    expect(withCredit).not.toBeNull();
    expect(withoutCredit).not.toBeNull();
    expect(withCredit!).toBeLessThan(withoutCredit!);
  });

  it("rakip bazın üstündeyse baz fiyata döner, tabanın altında uyarı üretir", () => {
    const above = evaluateRepriceDecision({
      basePriceMinor: 3_000,
      floorPriceMinor: 1_500,
      competitorPriceMinor: 4_000,
      strategy: "UNDERCUT_STEP",
      stepMinor: 100,
    });
    expect(above).toEqual({ decision: "REVERT_TO_BASE", newPriceMinor: 3_000, alert: null });

    const under = evaluateRepriceDecision({
      basePriceMinor: 3_000,
      floorPriceMinor: 1_500,
      competitorPriceMinor: 2_000,
      strategy: "UNDERCUT_STEP",
      stepMinor: 100,
    });
    expect(under).toEqual({ decision: "UNDERCUT", newPriceMinor: 1_900, alert: null });

    const matched = evaluateRepriceDecision({
      basePriceMinor: 3_000,
      floorPriceMinor: 1_500,
      competitorPriceMinor: 1_800,
      strategy: "MATCH_LOWEST",
      stepMinor: 100,
    });
    expect(matched.decision).toBe("MATCHED");
    expect(matched.newPriceMinor).toBe(1_800);

    const held = evaluateRepriceDecision({
      basePriceMinor: 3_000,
      floorPriceMinor: 1_500,
      competitorPriceMinor: 1_550,
      strategy: "UNDERCUT_STEP",
      stepMinor: 100,
    });
    expect(held).toEqual({ decision: "HOLD_AT_FLOOR", newPriceMinor: 1_500, alert: null });

    const alert = evaluateRepriceDecision({
      basePriceMinor: 3_000,
      floorPriceMinor: 1_500,
      competitorPriceMinor: 1_000,
      strategy: "MATCH_LOWEST",
      stepMinor: 100,
    });
    expect(alert.decision).toBe("COMPETITOR_BELOW_FLOOR_ALERT");
    expect(alert.newPriceMinor).toBe(1_500);
    expect(alert.alert).toBe(BELOW_FLOOR_ALERT);
  });

  it("JSON-LD fiyatı okur, adres çekmez", () => {
    expect(priceMinorFromMerchantNode({ "@type": "Offer", price: "19,90", priceCurrency: "TRY" })).toBe(1_990);
    const feed = readIngestQuotes({
      channel: "AKAKCE",
      jsonLd: { sku: "KUPA", price: "12.50", seller: { name: "Rakip" } },
    });
    expect(feed.ok).toBe(true);
    if (feed.ok) {
      expect(feed.quotes[0]).toMatchObject({
        sku: "KUPA",
        channel: "AKAKCE",
        competitorName: "Rakip",
        competitorPriceMinor: 1_250,
      });
    }
    const source = readFileSync(join(ROOT, "lib/commerce/repricer.ts"), "utf8");
    expect(source).not.toContain("fetch(");
  });
});

describe("CSV ve çoklu mağaza", () => {
  it("maliyet ve kanal fiyatı CSV'si gidip gelir", () => {
    const csv = renderEconomicsCsv([
      {
        sku: "KUPA-A",
        title: "Kupa",
        stockQty: 4,
        costMinor: 5_000,
        vatBps: 2_000,
        costIncludesVat: true,
        desiGrams: 800,
        channel: "TRENDYOL",
        basePriceMinor: 12_000,
        activePriceMinor: 11_900,
        minMarginBps: 800,
        manualFloorMinor: 10_000,
        strategy: "UNDERCUT_STEP",
        stepMinor: 100,
        autoApply: true,
      },
    ]);
    const parsed = parseEconomicsCsv(csv);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.rows[0]).toMatchObject({
        sku: "KUPA-A",
        costMinor: 5_000,
        costIncludesVat: true,
        channel: "TRENDYOL",
        basePriceMinor: 12_000,
        strategy: "UNDERCUT_STEP",
        autoApply: true,
      });
    }
  });

  it("magaza parametresi ikinci mağazayı özne yapar", () => {
    const stores = [
      { id: "pool", name: "E-Ticaret Havuzu" },
      { id: "second", name: "İkinci" },
    ];
    expect(selectCockpitStore(stores, null)?.id).toBe("pool");
    expect(selectCockpitStore(stores, "second")?.id).toBe("second");
    expect(selectCockpitStore(stores, "yok")?.id).toBe("pool");
    const cockpit = readFileSync(join(ROOT, "components/commerce/os-cockpit.tsx"), "utf8");
    expect(cockpit).toContain('url.searchParams.set("magaza"');
    const page = readFileSync(join(ROOT, "app/(kernel)/panel/e-ticaret/page.tsx"), "utf8");
    expect(page).toContain("params.magaza");
  });
});

describe("iade ve iptal kâr etkisi", () => {
  it("RETURN_RESTOCK notuna göre iade ve iptali ayırır", () => {
    expect(classifyStockMovement("RETURN_RESTOCK", "event=ORDER_RETURNED variant=v-1")).toBe("RETURN");
    expect(classifyStockMovement("RETURN_RESTOCK", "event=ORDER_CANCELLED variant=v-1")).toBe("CANCEL");
    expect(classifyStockMovement("RETURN", "")).toBe("RETURN");
    expect(classifyStockMovement("CANCEL", "")).toBe("CANCEL");
    const impact = summarizeReturnImpact({
      ledgers: [
        { type: "RETURN_RESTOCK", note: "event=ORDER_RETURNED variant=v-1", quantity: 2, productId: "p-1" },
        { type: "RETURN_RESTOCK", note: "event=ORDER_CANCELLED variant=v-2", quantity: 1, productId: "p-1" },
      ],
      netMinorByVariantId: { "v-1": 500, "v-2": -200 },
      variantIdsByProductId: { "p-1": ["v-1", "v-2"] },
    });
    expect(impact.returnedUnits).toBe(2);
    expect(impact.cancelledUnits).toBe(1);
    expect(impact.returnImpactMinor).toBe(800);
  });
});

describe("ilan fiyatı", () => {
  it("kanal fiyatı doluysa varyant fiyatının önüne geçer", () => {
    expect(channelListingSaleMinor({ priceMinor: 9_900 }, 12_000)).toBe(9_900);
    expect(channelListingSaleMinor({ priceMinor: null }, 12_000)).toBe(12_000);
  });

  it("periyodik rekabet işçisi kayıtlıdır", () => {
    const jobs = readFileSync(join(ROOT, "lib/kernel/jobs/inngest.ts"), "utf8");
    expect(jobs).toContain('id: "commerce-repricer-sweep"');
    expect(jobs).toContain("commerceRepricerSweep");
  });
});
