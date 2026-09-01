import { describe, expect, it } from "vitest";
import {
  ACADEMY_CATALOG_PRICE_MINOR,
  ACADEMY_CATALOG_PRICE_WINDOW,
  academyCatalogPriceFitsPaytrBand,
  academyPaytrTopUpMinor,
} from "@/lib/academy/catalog-pricing";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { resolveAcademyCatalogCardCta } from "@/lib/academy/storefront-cta";
import { overlaySeedCatalogPrice, publishedCoursesFromSeed } from "@/lib/academy/published-catalog";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { formatMinor, formatMinorCompact } from "@/lib/kernel/money/format";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { paytrBasketMatchesPayment } from "@/lib/kernel/payments/paytr/checkout";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";

describe("akademi katalog fiyat haritası — KDV dahil, PayTR hizası", () => {
  it("20 SKU tohum tutarı harita ile birebir; seviye bandı sıkıştırmaz", () => {
    expect(Object.keys(ACADEMY_CATALOG_PRICE_MINOR)).toHaveLength(20);
    expect(ACADEMY_GROWTH_SKU_SLUGS).toHaveLength(20);
    for (const slug of ACADEMY_GROWTH_SKU_SLUGS) {
      expect(ACADEMY_CATALOG_PRICE_MINOR[slug]).toBeGreaterThan(0);
    }
    expect(ACADEMY_COURSE_SEEDS).toHaveLength(20);
    for (const row of ACADEMY_COURSE_SEEDS) {
      expect(row.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR[row.slug]);
      expect(row.seedMinMinor).toBe(ACADEMY_CATALOG_PRICE_WINDOW.minMinor);
      expect(row.seedMaxMinor).toBe(ACADEMY_CATALOG_PRICE_WINDOW.maxMinor);
      expect(academyCatalogPriceFitsPaytrBand(row.seedAmountMinor)).toBe(true);
    }
  });

  it("boş cüzdanda PayTR yüklemesi kart tutarına eşittir; sepet Σ = payment", () => {
    for (const row of ACADEMY_COURSE_SEEDS) {
      const catalog = row.seedAmountMinor;
      const paytrMinor = academyPaytrTopUpMinor(catalog, 0);
      expect(paytrMinor).toBe(catalog);
      expect(
        paytrBasketMatchesPayment(
          [{ name: row.title, amountMinor: catalog, quantity: 1 }],
          paytrMinor,
        ),
      ).toBe(true);
    }
  });

  it("satın alınmamış kart Erişim Açık basmaz; fiyat solda, KDV ipucu ayrı, CTA yalnız Satın Al", () => {
    for (const row of ACADEMY_COURSE_SEEDS) {
      const money = formatMinor(row.seedAmountMinor, SETTLEMENT_CURRENCY);
      const compact = formatMinorCompact(row.seedAmountMinor, SETTLEMENT_CURRENCY);
      const locked = resolveAcademyCatalogCardCta({
        slug: row.slug,
        owned: false,
        priceLabel: money,
      });
      expect(locked.priceLabel).toBe(compact);
      expect(locked.priceLabel).not.toContain(",00");
      expect(locked.priceCaption).toBe(ACADEMY_SEN.catalog.vatInclusiveHint);
      expect(locked.priceLabel).not.toContain("KDV dahil");
      expect(locked.priceLabel).not.toBe(ACADEMY_SEN.course.accessOpen);
      expect(locked.cta).toBe(ACADEMY_SEN.catalog.cardCtaBuy);
      expect(locked.cta).toBe("Satın Al");
      expect(locked.cta).not.toMatch(/₺/);
      expect(locked.href).toBe(`/academy/${row.slug}`);

      const owned = resolveAcademyCatalogCardCta({
        slug: row.slug,
        owned: true,
        priceLabel: money,
      });
      expect(owned.priceLabel).toBe(ACADEMY_SEN.course.accessOpen);
      expect(owned.priceCaption).toBeNull();
      expect(owned.cta).toBe(ACADEMY_SEN.player.openCta);
    }
  });

  it("canlı PriceCatalogEntry tutarı tohum haritasıyla ezilmez", () => {
    const seed = publishedCoursesFromSeed().find((row) => row.slug === "python-temel");
    expect(seed?.priceMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["python-temel"]);
    const live = overlaySeedCatalogPrice({
      ...seed!,
      priceMinor: toAmountMinor(49_000),
    });
    expect(live.priceMinor).toBe(49_000);
  });
});
