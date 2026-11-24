import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadOsCockpit } from "@/lib/commerce/os-load";

const mocks = vi.hoisted(() => ({
  storeFindMany: vi.fn(),
  productFindMany: vi.fn(),
  channelFindMany: vi.fn(),
  inboxFindMany: vi.fn(),
  receiptFindMany: vi.fn(),
  channelEconomicsFindUnique: vi.fn(),
}));

vi.mock("@/lib/kernel/db", () => ({
  getPrisma: () => ({
    commerceStore: { findMany: mocks.storeFindMany },
    commerceProduct: { findMany: mocks.productFindMany },
    salesChannel: { findMany: mocks.channelFindMany },
    commerceInboxEntry: { findMany: mocks.inboxFindMany },
    commerceMarketplaceWebhookReceipt: { findMany: mocks.receiptFindMany },
    commerceChannelEconomics: { findUnique: mocks.channelEconomicsFindUnique },
  }),
}));

vi.mock("@/lib/yetkinhibe/grant-catalog-live", () => ({
  loadYetkinhibeGrantCatalog: vi.fn(async () => []),
}));

const ROOT = process.cwd();
const OWNER = "55555555-5555-4555-8555-555555555555";
const CREATED = new Date("2026-11-20T10:00:00Z");

function variant(id: string, sku: string, onHandQty: number) {
  return {
    id,
    storeId: "store-pool",
    productId: "prod-1",
    sku,
    barcode: null,
    amountMinor: 1500,
    onHandQty,
    safetyBuffer: 0,
    status: "ACTIVE",
    createdAt: CREATED,
    updatedAt: CREATED,
    unitEconomics: null,
  };
}

/** Ürün kartı: onaylı alan 0, iki varyant. Kokpit eldeki toplamı gösterir. */
function productWithVariants() {
  return {
    id: "prod-1",
    storeId: "store-pool",
    title: "Kupa",
    description: "Seramik kupa",
    category: "Mutfak",
    attributes: [],
    otherNote: "",
    listingMarket: null,
    source: "MANUAL",
    status: "ACTIVE",
    sku: "",
    basePriceMinor: 0,
    approvedStockQty: 0,
    criticalStockQty: 5,
    createdAt: CREATED,
    updatedAt: CREATED,
    variants: [variant("v-1", "KUPA-A", 4), variant("v-2", "KUPA-B", 3)],
    stockLedgers: [],
  };
}

beforeEach(() => {
  mocks.storeFindMany.mockReset().mockResolvedValue([{ id: "store-pool", name: "E-Ticaret Havuzu", slug: "havuz" }]);
  mocks.productFindMany.mockReset().mockResolvedValue([productWithVariants()]);
  mocks.channelFindMany.mockReset().mockResolvedValue([]);
  mocks.inboxFindMany.mockReset().mockResolvedValue([]);
  mocks.receiptFindMany.mockReset().mockResolvedValue([]);
  mocks.channelEconomicsFindUnique.mockReset().mockResolvedValue(null);
});

describe("kokpit yükleme: varyant ve onaylı stok", () => {
  it("ürün sorgusu bütün varyantları ve birim maliyet işaretini getirir", async () => {
    await loadOsCockpit(OWNER);
    const args = mocks.productFindMany.mock.calls[0]?.[0] as {
      include: { variants: { orderBy: { createdAt: string }; include: { unitEconomics: unknown } } };
    };
    expect(args.include.variants.orderBy).toEqual({ createdAt: "asc" });
    expect(args.include.variants).not.toHaveProperty("take");
    expect(args.include.variants.include).toEqual({
      unitEconomics: { select: { costMinor: true, desiGrams: true, vatBps: true, costIncludesVat: true } },
    });
  });

  it("ürün görünümü varyant sayısını, eldeki toplamı ve tüm varyantları verir", async () => {
    const result = await loadOsCockpit(OWNER);
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") {
      return;
    }
    const [product] = result.view.products;
    expect(product?.variantCount).toBe(2);
    expect(product?.approvedStockQty).toBe(7);
    expect(product?.sku).toBe("KUPA-A");
    expect(product?.variantId).toBe("v-1");
    expect(product?.critical).toBe(false);
    expect(product?.highStock).toBe(true);
    // P1.6 — kâr motoru için tüm varyantlar listede; maliyet işareti taşınır.
    expect(product?.variants.map((row) => row.sku)).toEqual(["KUPA-A", "KUPA-B"]);
    expect(product?.variants.every((row) => row.hasEconomics === false)).toBe(true);
    expect(product?.variants[0]).toMatchObject({ costMinor: null, desiGrams: null, vatBps: null });
    expect(result.view.trendyolEconomics).toEqual({
      commissionBps: 2_100,
      cargoMinorPerOrder: 3_990,
      returnRateBps: 800,
      adCostMinorPerOrder: 0,
    });
    expect(result.view.exportSupport.approvedUnits).toBe(7);
  });

  it("onaylı alan doluysa varyant toplamına değil o alana bakılır", async () => {
    mocks.productFindMany.mockResolvedValue([{ ...productWithVariants(), sku: "KUPA-MAIN", approvedStockQty: 12 }]);
    const result = await loadOsCockpit(OWNER);
    if (result.kind !== "ok") {
      throw new Error("kokpit okunamadı");
    }
    const [product] = result.view.products;
    expect(product?.approvedStockQty).toBe(12);
    expect(product?.sku).toBe("KUPA-MAIN");
    expect(product?.critical).toBe(false);
    expect(product?.highStock).toBe(true);
  });

  it("kritik stok kararı da varyant toplamından okunur", async () => {
    mocks.productFindMany.mockResolvedValue([
      {
        ...productWithVariants(),
        variants: [variant("v-1", "KUPA-A", 2), variant("v-2", "KUPA-B", 1)],
      },
    ]);
    const result = await loadOsCockpit(OWNER);
    if (result.kind !== "ok") {
      throw new Error("kokpit okunamadı");
    }
    const [product] = result.view.products;
    expect(product?.approvedStockQty).toBe(3);
    expect(product?.critical).toBe(true);
  });

  it("kanal listesi yakında bayrağını taşır", async () => {
    const result = await loadOsCockpit(OWNER);
    if (result.kind !== "ok") {
      throw new Error("kokpit okunamadı");
    }
    const flags = Object.fromEntries(result.view.channels.map((row) => [row.kind, row.comingSoon]));
    expect(flags).toEqual({
      OWN_STORE: false,
      TRENDYOL: false,
      HEPSIBURADA: false,
      AMAZON: true,
      N11: true,
    });
  });

  it("os-load kaynağında varyant sınırı kalmamıştır", () => {
    const source = readFileSync(join(ROOT, "lib/commerce/os-load.ts"), "utf8");
    expect(source).not.toMatch(/variants:\s*\{[^}]*take:\s*1/);
    expect(source).toContain("variantCount: product.variants.length");
    expect(source).toContain("costIncludesVat: true");
  });
});
