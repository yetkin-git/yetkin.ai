import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { channelListingSaleMinor } from "@/lib/commerce/listing-price";
import { queueVariantListingPushes } from "@/lib/commerce/listing-queue";
import { economicsImportMessage } from "@/lib/commerce/economics-transfer";
import { calculateUnitNet } from "@/lib/commerce/profit";
import { syncPendingChannelListings } from "@/lib/commerce/pending-listing-sync";
import {
  activeChannelSaleMinor,
  selectRealizedCommerceMoves,
  summarizeRealizedSales,
} from "@/lib/commerce/daily-brief";
import { lowestObservedCompetitorMinor, nextComputedFloor } from "@/lib/commerce/repricer-service";
import { createMemoryCommerceRepository } from "@/lib/commerce/memory-repository";
import {
  createCommerceProduct,
  createCommerceStore,
  patchCommerceProduct,
  patchCommerceStore,
  postCommerceInventory,
} from "@/lib/commerce/service";
import { moveWithSetMembers } from "@/lib/commerce/set-stock";
import { bundleMembersAttribute } from "@/lib/commerce/set-catalog";
import { criticalRestockVariantId } from "@/lib/commerce/stock-sync";

const publishPush = vi.hoisted(() =>
  vi.fn(async (_input?: { variantId: string }) => undefined),
);

vi.mock("@/lib/commerce/trendyol-publish", () => ({
  publishAppliedTrendyolStock: publishPush,
  publishChannelListingPrice: vi.fn(),
  logTrendyolEnqueueFailure: vi.fn(),
}));

const ROOT = process.cwd();
const OWNER = "66666666-6666-4666-8666-666666666666";

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("K1 — ilan fiyatı itmenin kuruşudur", () => {
  it("15 dakikalık tarama dolu priceMinor ile varyant tutarını ezer", async () => {
    const pushed: number[] = [];
    const result = await syncPendingChannelListings({
      listPending: async () => [
        { id: "l-ty", storeId: "s", channel: "TRENDYOL", variantId: "v-1", priceMinor: 9_900 },
        { id: "l-hb", storeId: "s", channel: "HEPSIBURADA", variantId: "v-2", priceMinor: null },
      ],
      readVariant: async () => ({ onHandQty: 4, amountMinor: 12_000 }),
      push: async (_listing, variant) => {
        pushed.push(variant.amountMinor);
        return "SYNCED";
      },
    });
    expect(pushed).toEqual([9_900, 12_000]);
    expect(result).toEqual({ scanned: 2, synced: 2, pending: 0, failed: 0 });
    expect(channelListingSaleMinor({ priceMinor: 9_900 }, 12_000)).toBe(9_900);
  });

  it("işçi dönüş nesnesi priceMinor taşır; CSV itmeyi kurar", () => {
    const worker = read("lib/commerce/pending-listing-sync.ts");
    expect(worker).toContain("priceMinor: row.priceMinor");
    expect(worker).toContain("channelListingSaleMinor(listing, variant.amountMinor)");
    const csv = read("lib/commerce/economics-transfer.ts");
    expect(csv).toContain("publishAppliedTrendyolStock");
    expect(csv).toContain("channelListingSaleMinor({ priceMinor: active }, variant.amountMinor)");
    const publisher = read("lib/commerce/trendyol-publish.ts");
    expect(publisher).toContain("channelListingSaleMinor(listing, fallback)");
    const service = read("lib/commerce/service.ts");
    expect(service).toContain("for (const push of appliedPushes)");
    expect(service).not.toContain("appliedPushes[0]");
    expect(service).toContain("channelListingSaleMinor");
  });

  it("kuyruk ve yerel yazım ayrı cümle kurar", () => {
    expect(economicsImportMessage(2, 3, true)).toContain("pazaryeri eşitleme kuyruğuna alındı");
    expect(economicsImportMessage(2, 3, false)).toContain(
      "yerel fiyat güncellendi; periyodik eşitlemede pazaryerine aktarılacak",
    );
  });
});

describe("K2 — taban yenilenir, en düşük rakip okunur", () => {
  it("bayat taban güncel hesapla değişir", () => {
    expect(nextComputedFloor(10_000, 11_200)).toEqual({ floorMinor: 11_200, changed: true });
    expect(nextComputedFloor(11_200, 11_200)).toEqual({ floorMinor: 11_200, changed: false });
    expect(nextComputedFloor(10_000, null)).toEqual({ floorMinor: null, changed: false });
  });

  it("son 24 saatin en düşük rakibi son kaydın önüne geçer", () => {
    const since = new Date("2026-11-22T12:00:00Z");
    const lowest = lowestObservedCompetitorMinor(
      [
        { competitorPriceMinor: 13_000, observedAt: new Date("2026-11-22T18:00:00Z") },
        { competitorPriceMinor: 9_400, observedAt: new Date("2026-11-22T13:00:00Z") },
        { competitorPriceMinor: 8_000, observedAt: new Date("2026-11-21T11:00:00Z") },
      ],
      since,
    );
    expect(lowest).toBe(9_400);
  });

  it("tarama en eski kuralı önce alır ve tabanı yeniden kurar", () => {
    const source = read("lib/commerce/repricer-service.ts");
    expect(source).toContain('lastRepricedAt: { sort: "asc", nulls: "first" }');
    expect(source).toContain("resolveFloor(");
    expect(source).toContain("lowestObservedCompetitorMinor");
    expect(source).toContain("lastRepricedAt: now");
  });
});

describe("K3 — taslak beden kritik stok hedefi olmaz", () => {
  it("DRAFT elde 0 olsa da ACTIVE beden seçilir", () => {
    const variantId = criticalRestockVariantId([
      { id: "taslak", onHandQty: 0, safetyBuffer: 0, status: "DRAFT" },
      { id: "aktif", onHandQty: 2, safetyBuffer: 0, status: "ACTIVE" },
      { id: "pasif", onHandQty: 1, safetyBuffer: 0, status: "PASSIVE" },
    ]);
    expect(variantId).toBe("pasif");
    expect(
      criticalRestockVariantId([
        { id: "taslak", onHandQty: 0, status: "DRAFT" },
        { id: "aktif", onHandQty: 4, status: "ACTIVE" },
      ]),
    ).toBe("aktif");
    expect(criticalRestockVariantId([{ id: "taslak", onHandQty: 0, status: "DRAFT" }])).toBeNull();
  });
});

describe("K4 — set üyesi ilanı da kuyruğa girer", () => {
  it("set satışı üye itmelerini döner", async () => {
    const repo = createMemoryCommerceRepository();
    const created = await createCommerceStore(repo, OWNER, { name: "Set" });
    if (!created.ok) {
      throw new Error(created.error);
    }
    const storeId = created.data.store.id as string;
    await patchCommerceStore(repo, OWNER, storeId, { status: "ACTIVE" });
    const member = async (key: string, sku: string, barcode: string) => {
      const product = await createCommerceProduct(
        repo,
        OWNER,
        storeId,
        {
          mode: "active",
          title: sku,
          description: "Üye",
          category: "Mutfak",
          attributes: [],
          other: "",
          sku,
          barcode,
          amountMinor: 10_000,
          onHandQty: 5,
          safetyBuffer: 0,
        },
        key,
      );
      if (!product.ok) {
        throw new Error(product.error);
      }
      return (product.data.product.variants as Array<{ id: string }>)[0]?.id as string;
    };
    const kupa = await member("550e8400-e29b-41d4-a716-446655440201", "KUPA-U", "8680000002001");
    const tabak = await member("550e8400-e29b-41d4-a716-446655440202", "TABAK-U", "8680000002002");
    const set = await createCommerceProduct(
      repo,
      OWNER,
      storeId,
      {
        mode: "active",
        title: "Set",
        description: "İkili",
        category: "Mutfak",
        attributes: [],
        other: "",
        sku: "SET-U",
        barcode: "8680000002003",
        amountMinor: 18_000,
        onHandQty: 4,
        safetyBuffer: 0,
      },
      "550e8400-e29b-41d4-a716-446655440203",
    );
    if (!set.ok) {
      throw new Error(set.error);
    }
    const setProductId = set.data.product.id as string;
    const setVariantId = (set.data.product.variants as Array<{ id: string }>)[0]?.id as string;
    const patched = await patchCommerceProduct(repo, OWNER, storeId, setProductId, {
      attributes: [bundleMembersAttribute([kupa, tabak])],
    });
    expect(patched.ok).toBe(true);
    const moved = await moveWithSetMembers(repo, {
      id: "set-move-1",
      storeId,
      variantId: setVariantId,
      actorUserId: OWNER,
      type: "SALE",
      direction: "OUT",
      quantity: 1,
      note: "Set satışı",
      idempotencyKey: "set-move-1",
    });
    expect(moved.outcome).toBe("applied");
    if (moved.outcome !== "applied") {
      return;
    }
    expect(moved.memberPushes?.map((row) => row.variantId)).toEqual([kupa, tabak]);
    expect((await repo.findVariant(storeId, kupa))?.onHandQty).toBe(4);
    expect((await repo.findVariant(storeId, tabak))?.onHandQty).toBe(4);
  });

  it("envanter satışı her üye için itme kurar", async () => {
    publishPush.mockClear();
    const repo = createMemoryCommerceRepository();
    const created = await createCommerceStore(repo, OWNER, { name: "Set itme" });
    if (!created.ok) {
      throw new Error(created.error);
    }
    const storeId = created.data.store.id as string;
    await patchCommerceStore(repo, OWNER, storeId, { status: "ACTIVE" });
    const cup = await createCommerceProduct(
      repo,
      OWNER,
      storeId,
      {
        mode: "active",
        title: "Kupa",
        description: "Üye",
        category: "Mutfak",
        attributes: [],
        other: "",
        sku: "KUPA-P",
        barcode: "8680000002101",
        amountMinor: 11_000,
        onHandQty: 6,
        safetyBuffer: 0,
      },
      "550e8400-e29b-41d4-a716-446655440211",
    );
    const plate = await createCommerceProduct(
      repo,
      OWNER,
      storeId,
      {
        mode: "active",
        title: "Tabak",
        description: "Üye",
        category: "Mutfak",
        attributes: [],
        other: "",
        sku: "TABAK-P",
        barcode: "8680000002102",
        amountMinor: 12_000,
        onHandQty: 6,
        safetyBuffer: 0,
      },
      "550e8400-e29b-41d4-a716-446655440212",
    );
    const set = await createCommerceProduct(
      repo,
      OWNER,
      storeId,
      {
        mode: "active",
        title: "Set",
        description: "İkili",
        category: "Mutfak",
        attributes: [],
        other: "",
        sku: "SET-P",
        barcode: "8680000002103",
        amountMinor: 20_000,
        onHandQty: 3,
        safetyBuffer: 0,
      },
      "550e8400-e29b-41d4-a716-446655440213",
    );
    if (!cup.ok || !plate.ok || !set.ok) {
      throw new Error("kart açılmadı");
    }
    const cupId = (cup.data.product.variants as Array<{ id: string }>)[0]?.id as string;
    const plateId = (plate.data.product.variants as Array<{ id: string }>)[0]?.id as string;
    const setId = (set.data.product.variants as Array<{ id: string }>)[0]?.id as string;
    await patchCommerceProduct(repo, OWNER, storeId, set.data.product.id as string, {
      attributes: [bundleMembersAttribute([cupId, plateId])],
    });
    const sold = await postCommerceInventory(
      repo,
      OWNER,
      storeId,
      { variantId: setId, type: "SALE", direction: "OUT", quantity: 1, note: "Set" },
      "550e8400-e29b-41d4-a716-446655440214",
    );
    expect(sold.ok).toBe(true);
    const ids = publishPush.mock.calls.map((call) => call[0]?.variantId);
    expect(ids).toEqual([setId, cupId, plateId]);
  });

  it("üye ilanı PENDING olur ve satış kuruşu ilan fiyatıdır", async () => {
    const marked: string[] = [];
    const published: Array<{ variantId: string; amountMinor: number | null; variantAmountMinor: number | null }> = [];
    const queued = await queueVariantListingPushes({
      storeId: "s",
      pushes: [
        { variantId: "v-set", onHandAfter: 2, amountMinor: 18_000, variantAmountMinor: 18_000 },
        { variantId: "v-uye", onHandAfter: 4, amountMinor: 10_000, variantAmountMinor: 10_000 },
      ],
      listVariantListings: async (_storeId, variantId) =>
        variantId === "v-uye"
          ? [
              {
                id: "list-uye",
                storeId: "s",
                variantId,
                channel: "TRENDYOL" as const,
                sku: "U",
                barcode: "8680000000001",
                remoteBarcode: "U",
                remoteProductId: null,
                priceMinor: 15_000,
                syncStatus: "SYNCED" as const,
                lastError: "",
                lastSyncedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]
          : [],
      markListing: async (listingId) => {
        marked.push(listingId);
        return null;
      },
      publish: async (push) => {
        published.push(push);
      },
    });
    expect(marked).toEqual(["list-uye"]);
    expect(queued).toEqual(["v-uye"]);
    expect(published).toEqual([
      { variantId: "v-uye", onHandAfter: 4, amountMinor: 15_000, variantAmountMinor: 10_000 },
    ]);
    const trendyol = read("lib/commerce/trendyol-sync.ts");
    const hepsi = read("lib/commerce/hepsiburada-sync.ts");
    const channel = read("lib/commerce/channel-stock-prisma.ts");
    expect(trendyol).toContain("moved.memberPushes");
    expect(hepsi).toContain("moved.memberPushes");
    expect(channel).toContain('syncStatus: "PENDING"');
    expect(channel).toContain("pendingListingPush");
  });
});

describe("K5 — gerçekleşen net ve iade etkisi", () => {
  const economics = {
    TRENDYOL: { commissionBps: 2_000, cargoMinorPerOrder: 1_000, returnRateBps: 500, adCostMinorPerOrder: 200 },
    OWN_STORE: { commissionBps: 0, cargoMinorPerOrder: 0, returnRateBps: 0, adCostMinorPerOrder: 0 },
  };
  const variant = {
    id: "v-1",
    productId: "p-1",
    amountMinor: 10_000,
    costMinor: 4_000,
    desiGrams: 500,
    vatBps: 2_000,
    costIncludesVat: false,
    listings: [{ channel: "TRENDYOL", priceMinor: 15_000 }],
  };

  it("satış ve iade ilan fiyatından kurulur; kanal ikizi iki kez sayılmaz", () => {
    const moves = selectRealizedCommerceMoves([
      {
        source: "LEDGER",
        type: "CHANNEL_SALE",
        note: "event=ORDER_CREATED requested=2 applied=2 variant=v-1",
        quantity: -2,
        variantId: "",
        productId: "p-1",
        channel: "TRENDYOL",
      },
      {
        source: "INVENTORY",
        type: "SALE",
        note: "event=ORDER_CREATED requested=2 applied=2 variant=v-1",
        quantity: 2,
        variantId: "v-1",
        productId: "p-1",
        channel: null,
      },
      {
        source: "INVENTORY",
        type: "SALE",
        note: "Set üyesi: Set",
        quantity: 2,
        variantId: "v-uye",
        productId: "p-uye",
        channel: null,
      },
      {
        source: "LEDGER",
        type: "RETURN_RESTOCK",
        note: "event=ORDER_RETURNED requested=1 applied=1 variant=v-1",
        quantity: 1,
        variantId: "",
        productId: "p-1",
        channel: "TRENDYOL",
      },
    ]);
    expect(moves.map((row) => row.kind)).toEqual(["SALE", "RETURN"]);
    expect(activeChannelSaleMinor(variant, "TRENDYOL")).toBe(15_000);
    const atListing = calculateUnitNet({
      priceMinor: 15_000,
      quantity: 2,
      costMinor: 4_000,
      commissionBps: 2_000,
      cargoMinor: 1_000,
      returnRateBps: 500,
      adCostMinorPerOrder: 200,
      vatBps: 2_000,
    });
    const atVariant = calculateUnitNet({
      priceMinor: 10_000,
      quantity: 2,
      costMinor: 4_000,
      commissionBps: 2_000,
      cargoMinor: 1_000,
      returnRateBps: 500,
      adCostMinorPerOrder: 200,
      vatBps: 2_000,
    });
    const oneReturn = calculateUnitNet({
      priceMinor: 15_000,
      quantity: 1,
      costMinor: 4_000,
      commissionBps: 2_000,
      cargoMinor: 1_000,
      returnRateBps: 500,
      adCostMinorPerOrder: 200,
      vatBps: 2_000,
    });
    const realized = summarizeRealizedSales({
      moves,
      variants: [variant],
      economicsByChannel: economics,
      cargoMinor: () => 1_000,
    });
    expect(realized.realizedNetMinor).toBe(atListing.netMinor);
    expect(realized.realizedNetMinor).not.toBe(atVariant.netMinor);
    expect(realized.returnImpactMinor).toBe(oneReturn.netMinor);
    expect(realized.soldUnits).toBe(2);
    expect(realized.returnedUnits).toBe(1);
  });
});

describe("K6 — ekran kuyruğu yayınlanmış saymaz", () => {
  it("kokpit ve fiyat aksiyonu kuyruk cümlesini kullanır", () => {
    const cockpit = read("components/commerce/os-cockpit.tsx");
    expect(cockpit).toContain("pazaryeri eşitleme kuyruğuna alındı");
    expect(cockpit).not.toContain("ilan fiyatını yayınlar");
    const brief = read("lib/commerce/daily-brief.ts");
    expect(brief).toContain("pazaryeri eşitleme kuyruğuna alındı");
    expect(brief).toContain("yerel fiyat güncellendi; periyodik eşitlemede pazaryerine aktarılacak");
    expect(brief).toContain("Gerçekleşen net satış");
    expect(brief).not.toContain("pazaryerine gönderildi");
  });
});
