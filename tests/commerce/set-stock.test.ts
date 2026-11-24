import { describe, expect, it } from "vitest";
import { createMemoryCommerceRepository } from "@/lib/commerce/memory-repository";
import type { CommerceRepository } from "@/lib/commerce/repository";
import {
  createCommerceProduct,
  createCommerceStore,
  createCommerceVariant,
  patchCommerceStore,
} from "@/lib/commerce/service";
import { drawSetMembers, isSetProduct } from "@/lib/commerce/set-stock";
import { bundleMembersAttribute } from "@/lib/commerce/set-catalog";
import { calculateUnitNet } from "@/lib/commerce/profit";

const OWNER = "66666666-6666-4666-8666-666666666666";
const K1 = "550e8400-e29b-41d4-a716-446655442001";
const K2 = "550e8400-e29b-41d4-a716-446655442002";

async function openStore(repo: CommerceRepository): Promise<string> {
  const created = await createCommerceStore(repo, OWNER, { name: "Havuz" });
  if (!created.ok) {
    throw new Error(created.error);
  }
  const storeId = created.data.store.id as string;
  await patchCommerceStore(repo, OWNER, storeId, { status: "ACTIVE" });
  return storeId;
}

/** Kupa + tabak: iki üye varyantlı tek ürün gibi davranır (set malzemeleri). */
async function twoMembers(repo: CommerceRepository, storeId: string) {
  const product = await createCommerceProduct(
    repo,
    OWNER,
    storeId,
    {
      mode: "active",
      title: "Kupa",
      description: "Seramik",
      category: "Mutfak",
      attributes: [],
      other: "",
      sku: "KUPA",
      barcode: "8680000001001",
      amountMinor: 15_000,
      onHandQty: 4,
      safetyBuffer: 1,
    },
    K1,
  );
  if (!product.ok) {
    throw new Error(product.error);
  }
  const productId = product.data.product.id as string;
  const kupaVariantId = (product.data.product.variants as Array<{ id: string }>)[0]?.id as string;
  const tabak = await createCommerceVariant(
    repo,
    OWNER,
    storeId,
    productId,
    {
      mode: "active",
      sku: "TABAK",
      barcode: "8680000001002",
      amountMinor: 18_000,
      onHandQty: 3,
      safetyBuffer: 0,
    },
    K2,
  );
  if (!tabak.ok) {
    throw new Error(tabak.error);
  }
  const tabakVariantId = (tabak.data.variant as { id: string }).id;
  return { productId, kupaVariantId, tabakVariantId };
}

describe("set üyesinden stok düşümü (P1.3)", () => {
  it("set satılınca her üyeden birer adet düşer", async () => {
    const repo = createMemoryCommerceRepository();
    const storeId = await openStore(repo);
    const members = await twoMembers(repo, storeId);
    const attributes = [
      bundleMembersAttribute([members.kupaVariantId, members.tabakVariantId]),
      { column: "Paket tipi", value: "2'li set" },
    ];
    expect(isSetProduct(attributes)).toBe(true);
    expect(isSetProduct([])).toBe(false);

    const result = await drawSetMembers(repo, {
      storeId,
      actorUserId: OWNER,
      attributes,
      quantity: 1,
      idempotencyKey: "set-sale:1",
      note: "Set satışı",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.drawn).toHaveLength(2);
    // Kupa 4→3, tabak 3→2. Ürün onaylı stoğu varyant toplamına çekilir.
    expect((await repo.findVariant(storeId, members.kupaVariantId))?.onHandQty).toBe(3);
    expect((await repo.findVariant(storeId, members.tabakVariantId))?.onHandQty).toBe(2);
    expect((await repo.findProduct(storeId, members.productId))?.product.approvedStockQty).toBe(5);
  });

  it("mükerrer set satışı ikinci kez düşmez", async () => {
    const repo = createMemoryCommerceRepository();
    const storeId = await openStore(repo);
    const members = await twoMembers(repo, storeId);
    const attributes = [bundleMembersAttribute([members.kupaVariantId, members.tabakVariantId])];
    await drawSetMembers(repo, {
      storeId,
      actorUserId: OWNER,
      attributes,
      quantity: 1,
      idempotencyKey: "set-sale:dup",
      note: "Set satışı",
    });
    const replay = await drawSetMembers(repo, {
      storeId,
      actorUserId: OWNER,
      attributes,
      quantity: 1,
      idempotencyKey: "set-sale:dup",
      note: "Set satışı",
    });
    expect(replay.ok).toBe(true);
    expect((await repo.findVariant(storeId, members.kupaVariantId))?.onHandQty).toBe(3);
    expect((await repo.findVariant(storeId, members.tabakVariantId))?.onHandQty).toBe(2);
  });

  it("bir üyede stok yetmiyorsa 409 döner (set satılamaz)", async () => {
    const repo = createMemoryCommerceRepository();
    const storeId = await openStore(repo);
    const members = await twoMembers(repo, storeId);
    // Tabakta 3 adet var; 4 set isteği reddedilir.
    const result = await drawSetMembers(repo, {
      storeId,
      actorUserId: OWNER,
      attributes: [bundleMembersAttribute([members.kupaVariantId, members.tabakVariantId])],
      quantity: 4,
      idempotencyKey: "set-sale:short",
      note: "Set satışı",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(409);
    }
  });

  it("ilk üye düştükten sonra ikincisi yetmezse hiçbiri yazılmaz", async () => {
    const repo = createMemoryCommerceRepository();
    const storeId = await openStore(repo);
    const members = await twoMembers(repo, storeId);
    const drained = await repo.applyMovement({
      id: "drain-tabak",
      storeId,
      variantId: members.tabakVariantId,
      actorUserId: OWNER,
      type: "SALE",
      direction: "OUT",
      quantity: 3,
      note: "boşalt",
      idempotencyKey: "drain-tabak",
    });
    expect(drained.outcome).toBe("applied");
    const result = await drawSetMembers(repo, {
      storeId,
      actorUserId: OWNER,
      attributes: [bundleMembersAttribute([members.kupaVariantId, members.tabakVariantId])],
      quantity: 1,
      idempotencyKey: "set-sale:rollback",
      note: "Set satışı",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(409);
    }
    expect((await repo.findVariant(storeId, members.kupaVariantId))?.onHandQty).toBe(4);
    expect((await repo.findVariant(storeId, members.tabakVariantId))?.onHandQty).toBe(0);
  });

  it("üye bağı olmayan kart set sayılmaz; 422 döner", async () => {
    const repo = createMemoryCommerceRepository();
    const storeId = await openStore(repo);
    const result = await drawSetMembers(repo, {
      storeId,
      actorUserId: OWNER,
      attributes: [],
      quantity: 1,
      idempotencyKey: "set-sale:none",
      note: "x",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(422);
    }
  });
});

describe("set ürününün kâr motorundaki yeri", () => {
  it("set COGS'u üyelerin toplamı olduğunda net kâr negatife düşmez", () => {
    // Set fiyatı 285,00 TL; üyelerin COGS'u 75,00 TL; desi 1700 gr → 2. bandın altı.
    const unit = calculateUnitNet({
      priceMinor: 28_500,
      quantity: 1,
      costMinor: 7_500,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnRateBps: 800,
      adCostMinorPerOrder: 0,
      vatBps: 2_000,
    });
    expect(unit.vatMinor).toBeGreaterThan(0);
    // 28500 − KDV(4750) − komisyon(5985) − kargo(3990) − cogs(7500) − iade(2280)
    expect(unit.netMinor).toBe(3_995);
    expect(unit.marginBps).toBeGreaterThan(1_000);
  });

  it("set COGS'u devredilmezse (0) kâr olduğundan yüksek görünür — bu yüzden accept zorunlu kılar", () => {
    const withCost = calculateUnitNet({
      priceMinor: 28_500,
      quantity: 1,
      costMinor: 7_500,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnRateBps: 800,
      adCostMinorPerOrder: 0,
      vatBps: 2_000,
    });
    const withoutCost = calculateUnitNet({
      priceMinor: 28_500,
      quantity: 1,
      costMinor: 0,
      commissionBps: 2_100,
      cargoMinor: 3_990,
      returnRateBps: 800,
      adCostMinorPerOrder: 0,
      vatBps: 2_000,
    });
    expect(withoutCost.netMinor - withCost.netMinor).toBe(7_500);
  });
});
