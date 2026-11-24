import { describe, expect, it } from "vitest";
import {
  BREAK_EVEN_NEAR_BPS,
  DEFAULT_VAT_BPS,
  applyDiscount,
  breakEvenDiscountBps,
  breakEvenPriceMinor,
  bpsOf,
  calculateUnitNet,
  cargoForWeight,
  evaluateBundleOpportunity,
  netRevenueMinorOf,
  profitablePriceMinor,
  sameShippingBand,
  simulateCampaign,
  verdictOf,
  vatIncludedMinor,
} from "@/lib/commerce/profit";
import {
  buildAllowanceIndex,
  scrubInventedNumbers,
  textStaysOnNumbers,
} from "@/lib/commerce/profit-text";
import {
  PRICE_BAND_STEP_MINOR,
  RADAR_MIN_ACTIVE_PRODUCTS,
  collectOwnCatalogGaps,
  poolSeedHref,
  suggestionsFromSignals,
} from "@/lib/commerce/radar-signals";

describe("profit.ts saf kâr matematiği", () => {
  it("birim net: gelir − KDV − komisyon − kargo − cogs − iade − reklam", () => {
    const net = calculateUnitNet({
      priceMinor: 10_000,
      quantity: 1,
      costMinor: 4_000,
      commissionBps: 2_000,
      cargoMinor: 1_000,
      returnRateBps: 500,
      adCostMinorPerOrder: 200,
      vatBps: 2_000,
    });
    // KDV dahil 10.000 → matrah 8.333, KDV 1.667.
    expect(net.revenueMinor).toBe(10_000);
    expect(net.vatMinor).toBe(1_667);
    expect(net.netRevenueMinor).toBe(8_333);
    expect(net.commissionMinor).toBe(2_000);
    expect(net.returnMinor).toBe(500);
    // 10000 − 1667 − 2000 − 1000 − 4000 − 500 − 200
    expect(net.netMinor).toBe(633);
    expect(net.marginBps).toBe(633);
  });

  it("P0.1 — KDV kâra girer: aynı fiyat KDV'siz hesapla 2333, KDV'li 633", () => {
    const base = {
      priceMinor: 10_000,
      quantity: 1,
      costMinor: 4_000,
      commissionBps: 2_000,
      cargoMinor: 1_000,
      returnRateBps: 500,
      adCostMinorPerOrder: 200,
    };
    const withVat = calculateUnitNet({ ...base, vatBps: 2_000 });
    const withoutVat = calculateUnitNet({ ...base, vatBps: 0 });
    expect(withoutVat.netMinor).toBe(2_300);
    expect(withVat.netMinor).toBe(633);
    expect(withoutVat.netMinor - withVat.netMinor).toBe(1_667);
  });

  it("varsayılan KDV %20'dir; vatBps verilmezse kâr KDV'yi düşer", () => {
    expect(DEFAULT_VAT_BPS).toBe(2_000);
    const implicit = calculateUnitNet({
      priceMinor: 12_000,
      quantity: 1,
      costMinor: 5_000,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnRateBps: 800,
      adCostMinorPerOrder: 0,
    });
    const explicit = calculateUnitNet({
      priceMinor: 12_000,
      quantity: 1,
      costMinor: 5_000,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnRateBps: 800,
      adCostMinorPerOrder: 0,
      vatBps: 2_000,
    });
    expect(implicit.netMinor).toBe(explicit.netMinor);
    expect(implicit.vatMinor).toBeGreaterThan(0);
  });

  it("KDV matrahı tam sayı yuvarlamasıyla ayrışır; çok adette de tutarlı", () => {
    expect(vatIncludedMinor(10_000, 2_000)).toBe(1_667);
    expect(vatIncludedMinor(10_000, 0)).toBe(0);
    expect(vatIncludedMinor(10_000, 1_000)).toBe(909);
    expect(netRevenueMinorOf(10_000, 2_000)).toBe(8_333);
    const three = calculateUnitNet({
      priceMinor: 3_333,
      quantity: 3,
      costMinor: 1_000,
      commissionBps: 0,
      cargoMinor: 0,
      returnRateBps: 0,
      adCostMinorPerOrder: 0,
      vatBps: 2_000,
    });
    expect(three.revenueMinor).toBe(9_999);
    expect(three.vatMinor).toBe(vatIncludedMinor(9_999, 2_000));
    expect(three.netMinor).toBe(9_999 - three.vatMinor - 3_000);
  });

  it("indirim floor ile uygulanır", () => {
    expect(applyDiscount(10_000, 1_500)).toBe(8_500);
    expect(bpsOf(999, 2_100)).toBe(209);
  });

  it("kampanya simülasyonu SAFE / THIN / LOSS üretir", () => {
    const safe = simulateCampaign({
      priceMinor: 30_000,
      discountBps: 500,
      cogsMinor: 5_000,
      commissionBps: 2_000,
      cargoMinor: 1_000,
      returnBps: 0,
      adCostMinor: 0,
    });
    expect(safe.verdict).toBe("SAFE");
    expect(safe.netMinor).toBeGreaterThan(0);

    const loss = simulateCampaign({
      priceMinor: 10_000,
      discountBps: 0,
      cogsMinor: 9_000,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnBps: 800,
      adCostMinor: 0,
    });
    expect(loss.verdict).toBe("LOSS");
    expect(loss.netMinor).toBeLessThan(0);
  });

  it("başabaş indirimi kapalı formdur ve KDV sonrası net≥0 sınırını korur", () => {
    const be = breakEvenDiscountBps({
      priceMinor: 20_000,
      cogsMinor: 5_000,
      commissionBps: 2_000,
      cargoMinor: 1_000,
      returnBps: 0,
      adCostMinor: 0,
    });
    expect(be).toBeGreaterThan(0);
    const atBreak = simulateCampaign({
      priceMinor: 20_000,
      discountBps: be,
      cogsMinor: 5_000,
      commissionBps: 2_000,
      cargoMinor: 1_000,
      returnBps: 0,
      adCostMinor: 0,
    });
    expect(atBreak.netMinor).toBeGreaterThanOrEqual(0);
    const over = simulateCampaign({
      priceMinor: 20_000,
      discountBps: Math.min(10_000, be + 500),
      cogsMinor: 5_000,
      commissionBps: 2_000,
      cargoMinor: 1_000,
      returnBps: 0,
      adCostMinor: 0,
    });
    expect(over.netMinor).toBeLessThanOrEqual(atBreak.netMinor);
  });

  it("zarar fiyatında başabaş 0 döner (KDV dahil)", () => {
    const be = breakEvenDiscountBps({
      priceMinor: 5_000,
      cogsMinor: 8_000,
      commissionBps: 2_000,
      cargoMinor: 1_000,
      returnBps: 0,
      adCostMinor: 0,
    });
    expect(be).toBe(0);
  });

  it("P1.1 — breakEvenPriceMinor KDV'yi ve hedef marjı kapalı formda çözer", () => {
    const breakEven = breakEvenPriceMinor({
      cogsMinor: 5_000,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnBps: 800,
      adCostMinor: 0,
      vatBps: 2_000,
      targetMarginBps: 0,
    });
    expect(breakEven).not.toBeNull();
    const atBreak = calculateUnitNet({
      priceMinor: breakEven!,
      quantity: 1,
      costMinor: 5_000,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnRateBps: 800,
      adCostMinorPerOrder: 0,
      vatBps: 2_000,
    });
    expect(atBreak.netMinor).toBeGreaterThanOrEqual(0);
    // Hedef marj 0 iken tam başabaş noktası: formül ceil olduğu için sınır kâr
    // üretmez, birkaç kuruş altı zarara düşer.
    const below = calculateUnitNet({
      priceMinor: breakEven! - 20,
      quantity: 1,
      costMinor: 5_000,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnRateBps: 800,
      adCostMinorPerOrder: 0,
      vatBps: 2_000,
    });
    expect(below.netMinor).toBeLessThan(0);
  });

  it("P1.1 — hedef +500 bps net marj fiilen garanti edilir", () => {
    const priceMinor = profitablePriceMinor({
      cogsMinor: 5_000,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnBps: 800,
      adCostMinor: 0,
      vatBps: 2_000,
      targetMarginBps: 500,
    });
    expect(priceMinor).not.toBeNull();
    const unit = calculateUnitNet({
      priceMinor: priceMinor!,
      quantity: 1,
      costMinor: 5_000,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnRateBps: 800,
      adCostMinorPerOrder: 0,
      vatBps: 2_000,
    });
    expect(unit.netMinor).toBeGreaterThanOrEqual(bpsOf(priceMinor!, 500));
    expect(unit.marginBps).toBeGreaterThanOrEqual(500);
  });

  it("hedef marj imkânsızsa fiyat uydurulmaz (null)", () => {
    // Komisyon + iade + hedef = 10600 bps > 10000: payda negatif.
    expect(
      profitablePriceMinor({
        cogsMinor: 1_000,
        commissionBps: 9_000,
        cargoMinor: 1_000,
        returnBps: 1_000,
        adCostMinor: 0,
        targetMarginBps: 600,
      }),
    ).toBeNull();
  });

  it("verdictOf eşikleri tutarlıdır", () => {
    expect(verdictOf(-1, 0)).toBe("LOSS");
    expect(verdictOf(100, 500)).toBe("THIN");
    expect(verdictOf(1000, 1_500)).toBe("SAFE");
    expect(BREAK_EVEN_NEAR_BPS).toBe(500);
  });
});

describe("barem ve paket fırsatı", () => {
  const tariffs = [
    { bandMinGrams: 0, bandMaxGrams: 2_000, priceMinor: 3_990 },
    { bandMinGrams: 2_001, bandMaxGrams: 5_000, priceMinor: 5_990 },
  ];

  it("aynı bandaki iki ürün tek kargo ile kâr artırır", () => {
    expect(cargoForWeight(tariffs, 800)).toBe(3_990);
    expect(sameShippingBand(tariffs, 800, 1_500)).toBe(true);
    const result = evaluateBundleOpportunity({
      members: [
        { variantId: "a", priceMinor: 20_000, costMinor: 4_000, desiGrams: 800 },
        { variantId: "b", priceMinor: 18_000, costMinor: 3_500, desiGrams: 900 },
      ],
      tariffs,
      commissionBps: 2_000,
      returnRateBps: 0,
      adCostMinorPerOrder: 0,
      bundleDiscountBps: 500,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.sameBand).toBe(true);
    expect(result.rationale).not.toContain("kuruş");
    expect(result.rationale).toContain("TL");
    expect(result.cargoSavedMinor).toBe(3_990);
    expect(result.cargoBundleMinor).toBe(3_990);
    expect(result.netLiftMinor).toBeGreaterThan(0);
    // Paket net'i KDV düşülmüş değerdir.
    expect(result.bundleNetMinor).toBeLessThan(result.suggestedPriceMinor);
  });

  it("sameBand ilk üye değil, bütün üyelerin bandını ister", () => {
    const result = evaluateBundleOpportunity({
      members: [
        { variantId: "xl", priceMinor: 20_000, costMinor: 4_000, desiGrams: 2_500 },
        { variantId: "s", priceMinor: 8_000, costMinor: 2_000, desiGrams: 400 },
      ],
      tariffs,
      commissionBps: 2_000,
      returnRateBps: 0,
      adCostMinorPerOrder: 0,
      bundleDiscountBps: 500,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    // 2500 g ve paket 2900 g aynı üst banttadır; 400 g alt banttır. İlk üye tek başına yetmez.
    expect(sameShippingBand(tariffs, 2_500, 2_900)).toBe(true);
    expect(result.sameBand).toBe(false);
    expect(result.rationale).not.toContain("kuruş");
    expect(result.rationale).toContain("TL");
  });

  it("barem dışına taşan paket reddedilir veya kârsızsa ok:false", () => {
    const result = evaluateBundleOpportunity({
      members: [
        { variantId: "a", priceMinor: 5_000, costMinor: 4_500, desiGrams: 1_800 },
        { variantId: "b", priceMinor: 5_000, costMinor: 4_500, desiGrams: 1_800 },
      ],
      tariffs,
      commissionBps: 2_100,
      returnRateBps: 800,
      adCostMinorPerOrder: 500,
      bundleDiscountBps: 2_000,
    });
    if (result.ok) {
      expect(result.cargoBundleMinor).toBe(5_990);
    } else {
      expect(result.reason.length).toBeGreaterThan(0);
    }
  });

  it("P1.4 — aynı bantta en güncel effectiveFrom kazanır", () => {
    const stale = [
      { bandMinGrams: 0, bandMaxGrams: 3_000, priceMinor: 3_990, effectiveFrom: "2026-01-01T00:00:00.000Z" },
      { bandMinGrams: 0, bandMaxGrams: 3_000, priceMinor: 4_990, effectiveFrom: "2026-11-01T00:00:00.000Z" },
    ];
    // Zam sonrası hesap 49,90 ile yapılır; eski 39,90 satırı sessizce kazanmaz.
    expect(cargoForWeight(stale, 1_000)).toBe(4_990);
    expect(
      cargoForWeight(
        [
          { bandMinGrams: 0, bandMaxGrams: 3_000, priceMinor: 4_990, effectiveFrom: new Date("2026-11-01T00:00:00Z") },
          { bandMinGrams: 0, bandMaxGrams: 3_000, priceMinor: 3_990, effectiveFrom: new Date("2026-01-01T00:00:00Z") },
        ],
        1_000,
      ),
    ).toBe(4_990);
  });

  it("tek üye paket değildir", () => {
    const result = evaluateBundleOpportunity({
      members: [{ variantId: "a", priceMinor: 10_000, costMinor: 2_000, desiGrams: 500 }],
      tariffs,
      commissionBps: 0,
      returnRateBps: 0,
      adCostMinorPerOrder: 0,
    });
    expect(result.ok).toBe(false);
  });
});

describe("AI sayı mühürü — birim kalkanı (P2)", () => {
  it("izinli sayılar geçer; uydurma reddedilir", () => {
    expect(textStaysOnNumbers("Net 2300 kuruş", [{ kind: "rawMinor", value: 2300 }])).toBe(true);
    expect(textStaysOnNumbers("%50 kâr", [{ kind: "rawMinor", value: 2300 }])).toBe(false);
    expect(scrubInventedNumbers("Satış 100 TL", [{ kind: "rawMinor", value: 8500 }])).toBe("");
  });

  it("kuruş değeri TL gibi yazılamaz: 8500 kuruş iken '8500 TL' reddedilir", () => {
    const allowed = [{ kind: "rawMinor" as const, value: 8_500 }, { kind: "percent" as const, value: 15 }];
    expect(scrubInventedNumbers("Bu ürün 8500 TL, indirim %15.", allowed)).toBe("");
    // Doğru birim: 85,00 TL geçer.
    expect(scrubInventedNumbers("Bu ürün 85,00 TL, indirim %15.", allowed)).not.toBe("");
  });

  it("TL değeri kuruş gibi yazılamaz; kuruş eki kuruş iznini ister", () => {
    const allowed = [{ kind: "formattedTry" as const, value: "85,00" }];
    expect(textStaysOnNumbers("85,00 TL", allowed)).toBe(true);
    expect(textStaysOnNumbers("85,00 kuruş", allowed)).toBe(false);
    expect(textStaysOnNumbers("8500 kuruş", allowed)).toBe(false);
    // Kuruş izni varken kuruş eki geçerlidir, TL eki değil.
    const minorOnly = [{ kind: "rawMinor" as const, value: 8_500 }];
    expect(textStaysOnNumbers("8500 kuruş", minorOnly)).toBe(true);
    expect(textStaysOnNumbers("8500 TL", minorOnly)).toBe(false);
    // Ondalık ayraç kuruş iznine sızamaz: "85,00 kuruş" 8500 kuruş değildir.
    expect(textStaysOnNumbers("85,00 kuruş", minorOnly)).toBe(false);
    expect(textStaysOnNumbers("85.00 kuruş", minorOnly)).toBe(false);
    expect(scrubInventedNumbers("Fiyat 85,00 kuruş.", minorOnly)).toBe("");
  });

  it("yüzde ile kuruş aynı torbada değildir: %15 ve 15 kuruş ayrı izin ister", () => {
    const onlyPercent = [{ kind: "percent" as const, value: 15 }];
    expect(textStaysOnNumbers("indirim %15", onlyPercent)).toBe(true);
    expect(textStaysOnNumbers("15 kuruş", onlyPercent)).toBe(false);
    const onlyMinor = [{ kind: "rawMinor" as const, value: 15 }];
    expect(textStaysOnNumbers("15 kuruş", onlyMinor)).toBe(true);
    expect(textStaysOnNumbers("indirim %15", onlyMinor)).toBe(false);
  });

  it("birimsiz sayı kuruş izninden ya da doğru TL karşılığından gelebilir", () => {
    const index = buildAllowanceIndex([{ kind: "rawMinor", value: 8_500 }]);
    expect(index.minor.has("8500")).toBe(true);
    expect(index.tryText.has("85,00")).toBe(true);
    expect(textStaysOnNumbers("net 8500", [{ kind: "rawMinor", value: 8_500 }])).toBe(true);
    // "85,00" birimsiz yazılsa da 8500 kuruşun doğru TL karşılığıdır: 100 katı hata değil.
    expect(textStaysOnNumbers("net 85,00", [{ kind: "rawMinor", value: 8_500 }])).toBe(true);
    expect(textStaysOnNumbers("net 9500", [{ kind: "rawMinor", value: 8_500 }])).toBe(false);
  });

  it("eski imza (sayı / TL metni) geriye dönük çalışır", () => {
    expect(textStaysOnNumbers("Satış 85,00 TL", ["85,00", 8500])).toBe(true);
    expect(scrubInventedNumbers("Satış 85,00 TL", ["85,00", 8500])).not.toBe("");
    expect(scrubInventedNumbers("Satış 100 TL", [8500])).toBe("");
  });
});

describe("fırsat radarı deterministik sinyal", () => {
  it("3'ten az üründe boş döner", () => {
    expect(RADAR_MIN_ACTIVE_PRODUCTS).toBe(3);
    expect(
      collectOwnCatalogGaps([
        { category: "A", basePriceMinor: 10_000, status: "ACTIVE" },
        { category: "A", basePriceMinor: 20_000, status: "ACTIVE" },
      ]),
    ).toEqual([]);
  });

  it("kategori içinde boş fiyat bandını bulur", () => {
    const gaps = collectOwnCatalogGaps([
      { category: "Mum", basePriceMinor: 10_000, status: "ACTIVE" },
      { category: "Mum", basePriceMinor: 10_500, status: "ACTIVE" },
      { category: "Mum", basePriceMinor: 25_000, status: "ACTIVE" },
      { category: "Mum", basePriceMinor: 25_500, status: "ACTIVE" },
    ]);
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps.every((row) => row.category === "Mum")).toBe(true);
    const mid = bandMid(gaps);
    expect(mid).toBeGreaterThan(10_000);
    expect(mid).toBeLessThan(25_000);

    const suggestions = suggestionsFromSignals(gaps.slice(0, 2).map((row, i) => ({ ...row, id: `s${i}` })));
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]?.signalIds.length).toBe(1);
    const firstTarget = suggestions[0]?.targetPriceMinor ?? 0;
    expect(Number.isFinite(firstTarget % PRICE_BAND_STEP_MINOR)).toBe(true);
  });

  it("P1.5 — metinler TL basar, ham kuruş sızdırmaz", () => {
    const gaps = collectOwnCatalogGaps([
      { category: "Mutfak", basePriceMinor: 5_000, status: "ACTIVE" },
      { category: "Mutfak", basePriceMinor: 5_200, status: "ACTIVE" },
      { category: "Mutfak", basePriceMinor: 25_000, status: "ACTIVE" },
      { category: "Mutfak", basePriceMinor: 25_200, status: "ACTIVE" },
    ]);
    const [suggestion] = suggestionsFromSignals(gaps.map((row, i) => ({ ...row, id: `s${i}` })));
    expect(suggestion).toBeDefined();
    expect(suggestion!.title).not.toContain("kuruş");
    expect(suggestion!.rationale).not.toContain("kuruş");
    expect(suggestion!.title).toContain("₺");
    expect(suggestion!.targetPriceLabel).toBe(suggestion!.title.split("— ")[1]?.replace(" bandı", ""));
  });

  it("P1.5 — öneri doğrudan havuza ön-doldurmalı gider, /tezgah'a değil", () => {
    const href = poolSeedHref({ title: "Mutfak — ₺150 bandı", category: "Mutfak", targetPriceMinor: 15_000 });
    expect(href.startsWith("/panel/e-ticaret?")).toBe(true);
    expect(href).not.toContain("/tezgah");
    expect(href).toContain("sekme=havuz");
    expect(href).toContain("taslakBaslik=");
    expect(href).toContain("taslakKategori=Mutfak");
    expect(href).toContain("hedefFiyat=15000");
    const parsed = new URL(href, "https://yetkin.ai");
    expect(parsed.searchParams.get("taslakBaslik")).toBe("Mutfak — ₺150 bandı");
    expect(parsed.searchParams.get("hedefFiyat")).toBe("15000");
  });
});

function bandMid(gaps: { priceBandMinor: number }[]): number {
  return gaps[0]?.priceBandMinor ?? 0;
}
