import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { INVENTORY_MOVE_SQL } from "@/lib/commerce/inventory-sql";
import { createMemoryCommerceRepository } from "@/lib/commerce/memory-repository";
import type { CommerceRepository } from "@/lib/commerce/repository";
import {
  createCommerceProduct,
  createCommerceStore,
  createCommerceVariant,
  patchCommerceStore,
  postCommerceInventory,
} from "@/lib/commerce/service";
import {
  distributeApprovedTarget,
  effectiveApprovedQty,
  effectiveSku,
  inboundTargetVariant,
  sumVariantOnHand,
} from "@/lib/commerce/stock-sync";

const ROOT = process.cwd();
const OWNER = "33333333-3333-4333-8333-333333333333";
const KEY_1 = "550e8400-e29b-41d4-a716-446655441001";
const KEY_2 = "550e8400-e29b-41d4-a716-446655441002";
const KEY_3 = "550e8400-e29b-41d4-a716-446655441003";
const KEY_4 = "550e8400-e29b-41d4-a716-446655441004";

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

async function openStore(repo: CommerceRepository): Promise<string> {
  const created = await createCommerceStore(repo, OWNER, { name: "Tezgâh" });
  if (!created.ok) {
    throw new Error(created.error);
  }
  const storeId = created.data.store.id as string;
  const opened = await patchCommerceStore(repo, OWNER, storeId, { status: "ACTIVE" });
  if (!opened.ok) {
    throw new Error(opened.error);
  }
  return storeId;
}

describe("stock-sync yardımcıları", () => {
  it("sumVariantOnHand eldeki adetlerin toplamını verir", () => {
    expect(sumVariantOnHand([{ onHandQty: 2 }, { onHandQty: 5 }])).toBe(7);
    expect(sumVariantOnHand([])).toBe(0);
  });

  it("effectiveSku ürün SKU'su boşsa ilk dolu varyant SKU'sunu seçer", () => {
    expect(effectiveSku(" KUPA ", [{ sku: "X" }])).toBe("KUPA");
    expect(effectiveSku("", [{ sku: " " }, { sku: "KUPA-2" }])).toBe("KUPA-2");
    expect(effectiveSku("", [])).toBe("");
  });

  it("effectiveApprovedQty onaylı alan sıfırsa varyant toplamını kullanır", () => {
    expect(effectiveApprovedQty(0, [{ onHandQty: 3 }, { onHandQty: 4 }])).toBe(7);
    expect(effectiveApprovedQty(5, [{ onHandQty: 3 }])).toBe(5);
    expect(effectiveApprovedQty(0, [])).toBe(0);
  });

  it("inboundTargetVariant ilk aktif varyantı, aktif yoksa ilk varyantı seçer", () => {
    const rows = [
      { id: "a", status: "DRAFT" },
      { id: "b", status: "ACTIVE" },
      { id: "c", status: "ACTIVE" },
    ];
    expect(inboundTargetVariant(rows)?.id).toBe("b");
    expect(inboundTargetVariant([{ id: "a", status: "DRAFT" }])?.id).toBe("a");
    expect(inboundTargetVariant([])).toBeUndefined();
  });

  it("distributeApprovedTarget azalışı ilk varyanttan düşer ve 0'ın altına indirmez", () => {
    expect(distributeApprovedTarget([{ onHandQty: 3 }, { onHandQty: 2 }], 1)).toEqual([0, 1]);
    expect(distributeApprovedTarget([{ onHandQty: 3 }, { onHandQty: 2 }], 0)).toEqual([0, 0]);
  });

  it("distributeApprovedTarget artışı ilk aktif varyanta ekler", () => {
    expect(
      distributeApprovedTarget(
        [
          { onHandQty: 3, status: "DRAFT" },
          { onHandQty: 2, status: "ACTIVE" },
        ],
        9,
      ),
    ).toEqual([3, 6]);
    expect(distributeApprovedTarget([{ onHandQty: 1 }], 4)).toEqual([4]);
  });

  it("distributeApprovedTarget varyant yoksa boş döner, negatif hedefi sıfırlar", () => {
    expect(distributeApprovedTarget([], 5)).toEqual([]);
    expect(distributeApprovedTarget([{ onHandQty: 2 }], -4)).toEqual([0]);
  });
});

describe("tek stok gerçeği: SQL ve depo sözleşmesi", () => {
  it("INVENTORY_MOVE_SQL varyant güncellenince onaylı stoğu kardeş toplamına eşitler", () => {
    expect(INVENTORY_MOVE_SQL).toContain("v.product_id");
    expect(INVENTORY_MOVE_SQL).toContain("synced AS (");
    expect(INVENTORY_MOVE_SQL).toContain("UPDATE commerce_products p");
    expect(INVENTORY_MOVE_SQL).toContain("SUM(sib.on_hand_qty)");
    expect(INVENTORY_MOVE_SQL).toContain("sib.id <> g.id");
    expect(INVENTORY_MOVE_SQL).toContain("INNER JOIN updated u ON u.id = g.id");
  });

  it("INVENTORY_MOVE_SQL sonuç satırlarını ve varyant kilidini korur", () => {
    for (const outcome of ["'replay'::text", "'applied'::text", "'rejected'::text", "'missing'::text"]) {
      expect(INVENTORY_MOVE_SQL).toContain(outcome);
    }
    expect(INVENTORY_MOVE_SQL).toContain("FOR UPDATE OF v");
  });

  it("prisma deposu hareketten önce ürün satırını kilitler ve tek işlem açar", () => {
    const repo = read("lib/commerce/prisma-repository.ts");
    expect(repo).toContain("FOR UPDATE OF p");
    expect(repo).toContain("await db.$queryRawUnsafe(PRODUCT_LOCK_SQL, command.variantId);");
    expect(repo).toContain('if (nested || typeof db.$transaction !== "function") {');
  });

  it("kanal yazımı varyantı kilitler ve ürün toplamını varyant toplamına çeker", () => {
    const channel = read("lib/commerce/channel-stock-prisma.ts");
    // P0.2 — ilk varyanta dağıtım kaldırıldı; stok spesifik varyanta yazılır.
    expect(channel).not.toContain("distributeApprovedTarget");
    expect(channel).toContain("syncApprovedTotal");
    expect(channel).toContain("applyVariantMovement");
    expect(channel).toContain("FROM commerce_variants");
    expect(channel).toContain("FOR UPDATE");
    expect(channel).toContain("commerceVariant.aggregate");
  });

  it("idempotent migration yalnız farklı ürünleri günceller", () => {
    const sql = read("prisma/migrations/20261122220000_faz1_sync_approved_stock/migration.sql");
    expect(sql).toContain("SUM(on_hand_qty)::int");
    expect(sql).toContain("IS DISTINCT FROM COALESCE(v.total, 0)");
  });
});

describe("tek stok gerçeği: bellek deposu davranışı", () => {
  it("taslak varyant onaylı stoğu değiştirmez; aktif giriş onaylı stoğu toplama çeker", async () => {
    const repo = createMemoryCommerceRepository();
    const storeId = await openStore(repo);
    const drafted = await createCommerceProduct(
      repo,
      OWNER,
      storeId,
      {
        mode: "draft",
        title: "Taslak kupa",
        description: "Henüz fiyat yok",
        category: "Mutfak",
        attributes: [],
        other: "",
        sku: "KUPA0",
        barcode: null,
        amountMinor: null,
        onHandQty: 0,
        safetyBuffer: 0,
      },
      KEY_1,
    );
    expect(drafted.ok).toBe(true);
    if (!drafted.ok) {
      return;
    }
    const productId = drafted.data.product.id as string;
    const before = await repo.findProduct(storeId, productId);
    expect(before?.product.approvedStockQty).toBe(0);
  });

  it("iki varyantın hareketleri ürün onaylı stoğunu her seferinde toplam olarak günceller", async () => {
    const repo = createMemoryCommerceRepository();
    const storeId = await openStore(repo);
    const created = await createCommerceProduct(
      repo,
      OWNER,
      storeId,
      {
        mode: "active",
        title: "Kupa",
        description: "Seramik kupa",
        category: "Mutfak",
        attributes: [],
        other: "",
        sku: "KUPA1",
        barcode: "8680000000001",
        amountMinor: 1500,
        onHandQty: 4,
        safetyBuffer: 0,
      },
      KEY_1,
    );
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    const productId = created.data.product.id as string;
    const firstVariant = (created.data.product.variants as Array<{ id: string }>)[0]?.id as string;
    expect((await repo.findProduct(storeId, productId))?.product.approvedStockQty).toBe(4);

    const second = await createCommerceVariant(
      repo,
      OWNER,
      storeId,
      productId,
      {
        mode: "active",
        sku: "KUPA1-B",
        barcode: "8680000000002",
        amountMinor: 1600,
        onHandQty: 3,
        safetyBuffer: 0,
      },
      KEY_2,
    );
    expect(second.ok).toBe(true);
    expect((await repo.findProduct(storeId, productId))?.product.approvedStockQty).toBe(7);

    const sold = await postCommerceInventory(
      repo,
      OWNER,
      storeId,
      { variantId: firstVariant, type: "SALE", direction: "OUT", quantity: 2, note: "" },
      KEY_3,
    );
    expect(sold.ok).toBe(true);
    expect((await repo.findProduct(storeId, productId))?.product.approvedStockQty).toBe(5);

    const restocked = await postCommerceInventory(
      repo,
      OWNER,
      storeId,
      { variantId: firstVariant, type: "INBOUND", direction: "IN", quantity: 4, note: "" },
      KEY_4,
    );
    expect(restocked.ok).toBe(true);
    const found = await repo.findProduct(storeId, productId);
    expect(found?.product.approvedStockQty).toBe(9);
    expect(found?.variants.reduce((sum, row) => sum + row.onHandQty, 0)).toBe(9);
  });

  it("reddedilen satış onaylı stoğu değiştirmez", async () => {
    const repo = createMemoryCommerceRepository();
    const storeId = await openStore(repo);
    const created = await createCommerceProduct(
      repo,
      OWNER,
      storeId,
      {
        mode: "active",
        title: "Kupa",
        description: "Seramik kupa",
        category: "Mutfak",
        attributes: [],
        other: "",
        sku: "KUPA9",
        barcode: "8680000000009",
        amountMinor: 1500,
        onHandQty: 2,
        safetyBuffer: 0,
      },
      KEY_1,
    );
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    const productId = created.data.product.id as string;
    const variantId = (created.data.product.variants as Array<{ id: string }>)[0]?.id as string;
    const rejected = await postCommerceInventory(
      repo,
      OWNER,
      storeId,
      { variantId, type: "SALE", direction: "OUT", quantity: 5, note: "" },
      KEY_2,
    );
    expect(rejected.ok).toBe(false);
    expect((await repo.findProduct(storeId, productId))?.product.approvedStockQty).toBe(2);
  });
});
