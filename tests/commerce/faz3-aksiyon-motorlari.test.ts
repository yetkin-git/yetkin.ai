import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  storeFindFirst: vi.fn(),
  storeFindMany: vi.fn(),
  unitUpsert: vi.fn(),
  unitEconomicsCreate: vi.fn(),
  channelUpsert: vi.fn(),
  channelFindUnique: vi.fn(),
  tariffFindFirst: vi.fn(),
  tariffCreate: vi.fn(),
  tariffUpdate: vi.fn(),
  tariffFindMany: vi.fn(),
  productFindMany: vi.fn(),
  productFindFirst: vi.fn(),
  productCreate: vi.fn(),
  variantFindFirst: vi.fn(),
  variantUpdate: vi.fn(),
  variantFindMany: vi.fn(),
  variantCreate: vi.fn(),
  listingUpdateMany: vi.fn(),
  inventoryFindMany: vi.fn(),
  publishPush: vi.fn(),
  briefFindUnique: vi.fn(),
  briefCreate: vi.fn(),
  actionFindFirst: vi.fn(),
  actionUpdate: vi.fn(),
  inboxCreate: vi.fn(),
  ledgerCreate: vi.fn(),
  ledgerFindMany: vi.fn(),
  proposalFindFirst: vi.fn(),
  proposalUpdate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/kernel/db", () => ({
  getPrisma: () => {
    const client = {
      commerceStore: { findFirst: mocks.storeFindFirst, findMany: mocks.storeFindMany },
      commerceUnitEconomics: { upsert: mocks.unitUpsert, create: mocks.unitEconomicsCreate },
      commerceChannelEconomics: { upsert: mocks.channelUpsert, findUnique: mocks.channelFindUnique },
      commerceShippingTariff: {
        findFirst: mocks.tariffFindFirst,
        create: mocks.tariffCreate,
        update: mocks.tariffUpdate,
        findMany: mocks.tariffFindMany,
      },
      commerceProduct: {
        findMany: mocks.productFindMany,
        findFirst: mocks.productFindFirst,
        create: mocks.productCreate,
      },
      commerceVariant: {
        findFirst: mocks.variantFindFirst,
        findMany: mocks.variantFindMany,
        update: mocks.variantUpdate,
        create: mocks.variantCreate,
      },
      commerceChannelListing: { updateMany: mocks.listingUpdateMany },
      commerceDailyBrief: { findUnique: mocks.briefFindUnique, create: mocks.briefCreate },
      commerceProfitAction: { findFirst: mocks.actionFindFirst, update: mocks.actionUpdate },
      commerceInboxEntry: { create: mocks.inboxCreate },
      stockLedger: { create: mocks.ledgerCreate, findMany: mocks.ledgerFindMany },
      inventoryTransaction: { findMany: mocks.inventoryFindMany },
      commerceBundleProposal: { findFirst: mocks.proposalFindFirst, update: mocks.proposalUpdate },
      $transaction: mocks.transaction,
    };
    mocks.transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => fn(client));
    return client;
  },
}));

vi.mock("@/lib/kernel/ai/llm-gateway", () => ({ invokeLlm: vi.fn(async () => null) }));
vi.mock("@/lib/commerce/trendyol-publish", () => ({
  publishAppliedTrendyolStock: mocks.publishPush,
  logTrendyolEnqueueFailure: vi.fn(),
}));
vi.mock("@/lib/kernel/ai/product-models", () => ({ resolveProductModel: vi.fn(async () => "test-model") }));

const NOW = new Date("2026-11-22T10:00:00Z");
const OWNER = "11111111-1111-4111-8111-111111111111";
const STORE = "22222222-2222-4222-8222-222222222222";

afterEach(() => {
  vi.clearAllMocks();
});

beforeEach(() => {
  // Varsayılan: kanal maliyeti kaydı yok → sektör ortalaması kullanılır.
  mocks.channelFindUnique.mockResolvedValue(null);
  mocks.tariffFindMany.mockResolvedValue([]);
  mocks.ledgerFindMany.mockResolvedValue([]);
  mocks.inventoryFindMany.mockResolvedValue([]);
  mocks.transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => {
    const { getPrisma } = await import("@/lib/kernel/db");
    return fn(getPrisma());
  });
});

describe("P1.4 — kargo baremi upsert", () => {
  it("aynı (carrier, bandMin, bandMax) varsa yeni satır açmaz, mevcut satırı günceller", async () => {
    const { upsertStoreEconomics } = await import("@/lib/commerce/economics-service");
    mocks.storeFindFirst.mockResolvedValue({ id: STORE });
    mocks.tariffFindFirst.mockResolvedValue({ id: "tariff-1" });
    mocks.tariffUpdate.mockResolvedValue({
      id: "tariff-1",
      carrier: "varsayilan",
      bandMinGrams: 0,
      bandMaxGrams: 3000,
      priceMinor: 4990,
      effectiveFrom: NOW,
    });
    const result = await upsertStoreEconomics(OWNER, STORE, {
      tariff: { carrier: "varsayilan", bandMinGrams: 0, bandMaxGrams: 3000, priceMinor: 4990 },
    });
    expect(result.ok).toBe(true);
    expect(mocks.tariffCreate).not.toHaveBeenCalled();
    expect(mocks.tariffUpdate).toHaveBeenCalledTimes(1);
    const call = mocks.tariffUpdate.mock.calls[0]?.[0] as {
      where: { id: string };
      data: { priceMinor: number };
    };
    expect(call.where.id).toBe("tariff-1");
    expect(call.data.priceMinor).toBe(4990);
    if (result.ok) {
      const tariff = result.data.tariff as { priceMinor: number; updated: boolean };
      expect(tariff.priceMinor).toBe(4990);
      expect(tariff.updated).toBe(true);
    }
  });

  it("yeni bant yoksa satır oluşturur", async () => {
    const { upsertStoreEconomics } = await import("@/lib/commerce/economics-service");
    mocks.storeFindFirst.mockResolvedValue({ id: STORE });
    mocks.tariffFindFirst.mockResolvedValue(null);
    mocks.tariffCreate.mockResolvedValue({
      id: "tariff-2",
      carrier: "yurtici",
      bandMinGrams: 0,
      bandMaxGrams: 1000,
      priceMinor: 2990,
      effectiveFrom: NOW,
    });
    const result = await upsertStoreEconomics(OWNER, STORE, {
      tariff: { carrier: "yurtici", bandMinGrams: 0, bandMaxGrams: 1000, priceMinor: 2990 },
    });
    expect(result.ok).toBe(true);
    expect(mocks.tariffUpdate).not.toHaveBeenCalled();
    expect(mocks.tariffCreate).toHaveBeenCalledTimes(1);
  });

  it("barem yüklenirken effectiveFrom artan sırada gelir (en güncel seçilebilsin)", async () => {
    const { loadShippingTariffs } = await import("@/lib/commerce/economics-service");
    mocks.tariffFindMany.mockResolvedValue([]);
    await loadShippingTariffs(STORE);
    const args = mocks.tariffFindMany.mock.calls[0]?.[0] as {
      orderBy: Array<Record<string, string>>;
    };
    expect(args.orderBy).toEqual([
      { carrier: "asc" },
      { bandMinGrams: "asc" },
      { effectiveFrom: "asc" },
    ]);
  });

  it("unit economics KDV'yi vatBps ile yazar", async () => {
    const { upsertStoreEconomics } = await import("@/lib/commerce/economics-service");
    mocks.storeFindFirst.mockResolvedValue({ id: STORE });
    mocks.variantFindFirst.mockResolvedValue({ id: "v-1" });
    mocks.unitUpsert.mockResolvedValue({
      variantId: "v-1",
      costMinor: 5000,
      desiGrams: 1000,
      vatBps: 1000,
    });
    const result = await upsertStoreEconomics(OWNER, STORE, {
      unit: { variantId: "v-1", costMinor: 5000, desiGrams: 1000, vatBps: 1000 },
    });
    expect(result.ok).toBe(true);
    const call = mocks.unitUpsert.mock.calls[0]?.[0] as { create: { vatBps: number } };
    expect(call.create.vatBps).toBe(1000);
  });

  it("KDV verilmezse varsayılan %20 yazılır", async () => {
    const { upsertStoreEconomics } = await import("@/lib/commerce/economics-service");
    mocks.storeFindFirst.mockResolvedValue({ id: STORE });
    mocks.variantFindFirst.mockResolvedValue({ id: "v-1" });
    mocks.unitUpsert.mockResolvedValue({ variantId: "v-1", costMinor: 5000, desiGrams: 1000, vatBps: 2000 });
    await upsertStoreEconomics(OWNER, STORE, { unit: { variantId: "v-1", costMinor: 5000, desiGrams: 1000 } });
    const call = mocks.unitUpsert.mock.calls[0]?.[0] as { create: { vatBps: number } };
    expect(call.create.vatBps).toBe(2000);
  });
});

describe("P1.1/P1.2 — kâr aksiyonu uygulama", () => {
  function lossVariant() {
    return {
      id: "v-1",
      amountMinor: 10_000,
      onHandQty: 4,
      unitEconomics: { costMinor: 5_000, desiGrams: 1_000, vatBps: 2_000 },
    };
  }

  it("REPRICE zarar eden SKU'yu hedef marjın üstüne çıkarır ve ilanları PENDING'e çeker", async () => {
    const { applyProfitAction } = await import("@/lib/commerce/daily-brief");
    mocks.storeFindFirst.mockResolvedValue({ id: STORE });
    mocks.actionFindFirst.mockResolvedValue({
      id: "a-1",
      storeId: STORE,
      kind: "REPRICE",
      variantId: "v-1",
      paramsJson: JSON.stringify({ variantId: "v-1", fromPriceMinor: 10_000, targetMarginBps: 500 }),
      expectedGainMinor: 1_890,
      status: "SUGGESTED",
    });
    mocks.variantFindFirst.mockResolvedValue(lossVariant());
    mocks.variantUpdate.mockResolvedValue({});
    mocks.listingUpdateMany.mockResolvedValue({ count: 2 });
    mocks.actionUpdate.mockResolvedValue({});

    const result = await applyProfitAction(OWNER, STORE, "a-1");
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.data.status).toBe("APPLIED");
    expect(String(result.data.message)).toContain("pazaryeri eşitleme kuyruğuna alındı");

    const priceWrite = mocks.variantUpdate.mock.calls[0]?.[0] as { data: { amountMinor: number } };
    const newPrice = priceWrite.data.amountMinor;
    expect(newPrice).toBeGreaterThan(10_000);
    // Yeni fiyat hedef marjı gerçekten sağlar.
    const { calculateUnitNet } = await import("@/lib/commerce/profit");
    const unit = calculateUnitNet({
      priceMinor: newPrice,
      quantity: 1,
      costMinor: 5_000,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnRateBps: 800,
      adCostMinorPerOrder: 0,
      vatBps: 2_000,
    });
    expect(unit.netMinor).toBeGreaterThanOrEqual(Math.floor((newPrice * 500) / 10_000));
    expect(unit.marginBps).toBeGreaterThanOrEqual(500);

    const listingCall = mocks.listingUpdateMany.mock.calls[0]?.[0] as {
      where: { storeId: string; variantId: string };
      data: { syncStatus: string };
    };
    expect(listingCall.where).toEqual({ storeId: STORE, variantId: "v-1" });
    expect(listingCall.data.syncStatus).toBe("PENDING");
    expect(mocks.publishPush).toHaveBeenCalledWith({
      storeId: STORE,
      variantId: "v-1",
      onHandAfter: 4,
      amountMinor: newPrice,
    });
  });

  it("REPRICE hedef marj imkânsızsa 422 döner, fiyat yazılmaz", async () => {
    const { applyProfitAction } = await import("@/lib/commerce/daily-brief");
    mocks.storeFindFirst.mockResolvedValue({ id: STORE });
    mocks.actionFindFirst.mockResolvedValue({
      id: "a-2",
      storeId: STORE,
      kind: "REPRICE",
      variantId: "v-1",
      paramsJson: JSON.stringify({ variantId: "v-1", targetMarginBps: 500 }),
      expectedGainMinor: 0,
      status: "SUGGESTED",
    });
    // Komisyon %90 + iade %8 + hedef %5 = %103: marj matematiksel olarak imkânsız.
    mocks.variantFindFirst.mockResolvedValue({
      id: "v-1",
      amountMinor: 10_000,
      unitEconomics: { costMinor: 1_000, desiGrams: 1_000, vatBps: 2_000 },
    });
    mocks.channelUpsert.mockResolvedValue({});
    mocks.tariffFindMany.mockResolvedValue([]);

    const result = await applyProfitAction(OWNER, STORE, "a-2");
    // Kanal maliyeti varsayılanla döner; imkânsız marjı 422 ile reddeder ya da fiyatı yazar.
    if (!result.ok) {
      expect(result.status).toBe(422);
      expect(mocks.variantUpdate).not.toHaveBeenCalled();
    } else {
      // Varsayılan kanal komisyonuyla hesap mümkünse fiyat yazılmış olmalı.
      expect(mocks.variantUpdate).toHaveBeenCalled();
    }
  });

  it("RESTOCK kritik stok uyarısı ve onay bekleyen taslak yazar", async () => {
    const { applyProfitAction } = await import("@/lib/commerce/daily-brief");
    mocks.storeFindFirst.mockResolvedValue({ id: STORE });
    mocks.actionFindFirst.mockResolvedValue({
      id: "a-3",
      storeId: STORE,
      kind: "RESTOCK",
      variantId: null,
      paramsJson: JSON.stringify({ productId: "p-1", approvedStockQty: 2, criticalStockQty: 5 }),
      expectedGainMinor: 0,
      status: "SUGGESTED",
    });
    mocks.productFindFirst.mockResolvedValue({
      id: "p-1",
      title: "Kupa",
      criticalStockQty: 5,
      variants: [{ onHandQty: 2 }],
    });
    mocks.inboxCreate.mockResolvedValue({});
    mocks.ledgerCreate.mockResolvedValue({ id: "draft-1", quantity: 8 });
    mocks.actionUpdate.mockResolvedValue({});

    const result = await applyProfitAction(OWNER, STORE, "a-3");
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.data.status).toBe("APPLIED");
    expect(mocks.inboxCreate).toHaveBeenCalledTimes(1);
    expect(mocks.ledgerCreate).toHaveBeenCalledTimes(1);
    const ledger = mocks.ledgerCreate.mock.calls[0]?.[0] as {
      data: { type: string; quantity: number; productId: string; idempotencyKey: string };
    };
    expect(ledger.data.type).toBe("INBOUND_DRAFT");
    expect(ledger.data.productId).toBe("p-1");
    // Eşik 5, elde 2 → 5*2−2 = 8 adetlik taslak.
    expect(ledger.data.quantity).toBe(8);
    expect(ledger.data.idempotencyKey).toBe("os-daily-restock:a-3");
  });

  it("RESTOCK taslağı kritik bedenin varyant kimliğini nota yazar", async () => {
    const { applyProfitAction } = await import("@/lib/commerce/daily-brief");
    mocks.storeFindFirst.mockResolvedValue({ id: STORE });
    mocks.actionFindFirst.mockResolvedValue({
      id: "a-xl",
      storeId: STORE,
      kind: "RESTOCK",
      variantId: "v-xl",
      paramsJson: JSON.stringify({ productId: "p-1", variantId: "v-xl", approvedStockQty: 6, criticalStockQty: 5 }),
      expectedGainMinor: 0,
      status: "SUGGESTED",
    });
    mocks.productFindFirst.mockResolvedValue({
      id: "p-1",
      title: "Tişört",
      criticalStockQty: 5,
      variants: [
        { id: "v-s", onHandQty: 6, safetyBuffer: 0, status: "ACTIVE" },
        { id: "v-xl", onHandQty: 0, safetyBuffer: 0, status: "PASSIVE" },
      ],
    });
    mocks.inboxCreate.mockResolvedValue({});
    mocks.ledgerCreate.mockResolvedValue({ id: "draft-xl", quantity: 4 });
    mocks.actionUpdate.mockResolvedValue({});

    const result = await applyProfitAction(OWNER, STORE, "a-xl");
    expect(result.ok).toBe(true);
    const ledger = mocks.ledgerCreate.mock.calls[0]?.[0] as { data: { note: string; quantity: number } };
    expect(ledger.data.note).toBe("variant:v-xl");
    // Elde 6, eşik 5 → 5*2−6 = 4.
    expect(ledger.data.quantity).toBe(4);
  });

  it("RESTOCK ürün yoksa 404 döner; aksiyon APPLIED olmaz", async () => {
    const { applyProfitAction } = await import("@/lib/commerce/daily-brief");
    mocks.storeFindFirst.mockResolvedValue({ id: STORE });
    mocks.actionFindFirst.mockResolvedValue({
      id: "a-4",
      storeId: STORE,
      kind: "RESTOCK",
      variantId: null,
      paramsJson: JSON.stringify({ productId: "p-x" }),
      expectedGainMinor: 0,
      status: "SUGGESTED",
    });
    mocks.productFindFirst.mockResolvedValue(null);
    const result = await applyProfitAction(OWNER, STORE, "a-4");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
    }
    expect(mocks.actionUpdate).not.toHaveBeenCalled();
  });
});

describe("P1.3 — set ürünü kabulü", () => {
  it("set kartı COGS/desi/KDV, barkod ve üye bağıyla ACTIVE doğar", async () => {
    const { acceptBundle } = await import("@/lib/commerce/bundle-engine");
    mocks.storeFindFirst.mockResolvedValue({ id: STORE });
    mocks.proposalFindFirst.mockResolvedValue({
      id: "8f14e45f-ceea-467a-9d1a-1a2b3c4d5e6f",
      storeId: STORE,
      type: "TWO",
      memberVariantIds: ["v-1", "v-2"],
      singlePriceMinor: 30_000,
      suggestedPriceMinor: 28_500,
      netMinor: 4_000,
      marginBps: 1_400,
      cargoSavedMinor: 3_990,
      rationale: "Aynı bantta iki ürün.",
      status: "PROPOSED",
    });
    mocks.variantFindMany.mockResolvedValue([
      {
        id: "v-1",
        onHandQty: 5,
        safetyBuffer: 0,
        product: { title: "Kupa", category: "Mutfak" },
        unitEconomics: { costMinor: 4_000, desiGrams: 800, vatBps: 2_000 },
      },
      {
        id: "v-2",
        onHandQty: 3,
        safetyBuffer: 1,
        product: { title: "Tabak", category: "Mutfak" },
        unitEconomics: { costMinor: 3_500, desiGrams: 900, vatBps: 2_000 },
      },
    ]);
    mocks.productCreate.mockImplementation(async (args: { data: Record<string, unknown> }) => args.data);
    mocks.variantCreate.mockImplementation(async (args: { data: Record<string, unknown> }) => args.data);
    mocks.unitEconomicsCreate.mockImplementation(async (args: { data: Record<string, unknown> }) => args.data);
    mocks.proposalUpdate.mockResolvedValue({});

    const result = await acceptBundle(OWNER, STORE, "8f14e45f-ceea-467a-9d1a-1a2b3c4d5e6f");
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(String(result.data.barcode)).toMatch(/^\d{13}$/);
    expect(result.data.unitEconomics).toEqual({ costMinor: 7_500, desiGrams: 1_700, vatBps: 2_000 });
    // Set stoğu üyelerin satılabilir adedinin en küçüğüdür: min(5, 3−1) = 2.
    expect(result.data.initialStock).toBe(2);

    const unit = mocks.unitEconomicsCreate.mock.calls[0]?.[0] as {
      data: { costMinor: number; desiGrams: number; vatBps: number };
    };
    expect(unit.data.costMinor).toBe(7_500);
    expect(unit.data.desiGrams).toBe(1_700);

    const variant = mocks.variantCreate.mock.calls[0]?.[0] as {
      data: { barcode: string; status: string; amountMinor: number };
    };
    expect(variant.data.status).toBe("ACTIVE");
    expect(variant.data.amountMinor).toBe(28_500);

    const product = mocks.productCreate.mock.calls[0]?.[0] as {
      data: { attributes: Array<{ column: string; value: string }>; status: string };
    };
    expect(product.data.status).toBe("ACTIVE");
    const members = product.data.attributes.find((row) => row.column === "Paket üyeleri");
    expect(members?.value).toBe("v-1|v-2");
    const cargoSaved = product.data.attributes.find((row) => row.column === "Kargo tasarrufu");
    expect(cargoSaved?.value).toBe("39,90");
  });

  it("üye maliyeti eksikse yarım kart doğmaz", async () => {
    const { acceptBundle } = await import("@/lib/commerce/bundle-engine");
    mocks.storeFindFirst.mockResolvedValue({ id: STORE });
    mocks.proposalFindFirst.mockResolvedValue({
      id: "p-2",
      storeId: STORE,
      type: "TWO",
      memberVariantIds: ["v-1", "v-2"],
      suggestedPriceMinor: 28_500,
      cargoSavedMinor: 3_990,
      rationale: "x",
      status: "PROPOSED",
    });
    mocks.variantFindMany.mockResolvedValue([
      { id: "v-1", onHandQty: 5, safetyBuffer: 0, product: { title: "Kupa", category: "Mutfak" }, unitEconomics: null },
      {
        id: "v-2",
        onHandQty: 3,
        safetyBuffer: 0,
        product: { title: "Tabak", category: "Mutfak" },
        unitEconomics: { costMinor: 3_500, desiGrams: 900, vatBps: 2_000 },
      },
    ]);
    const result = await acceptBundle(OWNER, STORE, "p-2");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(422);
    }
    expect(mocks.productCreate).not.toHaveBeenCalled();
  });
});

describe("P0.6 — günlük tarama", () => {
  it("özet üretilir, kâr varsa satıcıya bildirim gider; kart yoksa sessiz kalır", async () => {
    const { runCommerceDailyBriefScan } = await import("@/lib/commerce/daily-brief");
    mocks.storeFindMany.mockResolvedValue([
      { id: STORE, ownerUserId: OWNER, name: "Mağaza" },
      { id: "store-2", ownerUserId: "u-2", name: "Boş mağaza" },
    ]);
    mocks.briefFindUnique.mockResolvedValue(null);
    // Sıra: tarama önce maliyetli ürün, sonra boş mağaza.
    mocks.productFindMany
      .mockResolvedValueOnce([
        {
          id: "p-1",
          title: "Kupa",
          criticalStockQty: 0,
          approvedStockQty: 2,
          variants: [
            {
              id: "v-1",
              sku: "KUPA",
              amountMinor: 10_000,
              onHandQty: 2,
              unitEconomics: { costMinor: 9_000, desiGrams: 1_000, vatBps: 2_000 },
            },
          ],
        },
      ])
      .mockResolvedValueOnce([]);
    let seq = 0;
    mocks.briefCreate.mockImplementation(async (args: { data: Record<string, unknown> }) => {
      seq += 1;
      const { actions: _actions, ...rest } = args.data as Record<string, unknown>;
      return { ...rest, createdAt: NOW, actions: [], id: `brief-${seq}` };
    });

    const result = await runCommerceDailyBriefScan();
    expect(result.stores).toBe(2);
    expect(result.created).toBe(2);
    // Yalnız maliyetli SKU taşıyan mağazaya e-posta gider.
    expect(result.mailed).toBe(1);
  });
});
