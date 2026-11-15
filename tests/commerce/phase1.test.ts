import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { postInventory } from "@/lib/commerce/handlers";
import { INVENTORY_MOVE_SQL } from "@/lib/commerce/inventory-sql";
import { createMemoryCommerceRepository } from "@/lib/commerce/memory-repository";
import { catalogTableToDraftImport, sealCommerceCsvCell } from "@/lib/commerce/pazaryeri-bridge";
import type { CommerceRepository } from "@/lib/commerce/repository";
import {
  createCommerceProduct,
  createCommerceStore,
  getCommerceStore,
  importPazaryeriCatalog,
  listCommerceInventory,
  listCommerceProducts,
  patchCommerceStore,
  patchCommerceVariant,
  postCommerceInventory,
} from "@/lib/commerce/service";
import { RLS_FORCE_TABLES, RLS_OWNERSHIP_COLUMNS } from "@/lib/kernel/security/rls-policy-registry";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";
import { createMemoryHttpIdempotencyStore } from "@/lib/kernel/http/memory-idempotency-store";

const ROOT = process.cwd();
const OWNER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const KEY = "550e8400-e29b-41d4-a716-446655440000";

const COMMERCE_ROUTES = [
  ["GET", "/api/commerce/stores", false],
  ["POST", "/api/commerce/stores", true],
  ["GET", "/api/commerce/stores/[storeId]", false],
  ["PATCH", "/api/commerce/stores/[storeId]", true],
  ["GET", "/api/commerce/stores/[storeId]/products", false],
  ["POST", "/api/commerce/stores/[storeId]/products", true],
  ["GET", "/api/commerce/stores/[storeId]/products/[productId]", false],
  ["PATCH", "/api/commerce/stores/[storeId]/products/[productId]", true],
  ["POST", "/api/commerce/stores/[storeId]/products/[productId]/variants", true],
  ["PATCH", "/api/commerce/stores/[storeId]/variants/[variantId]", true],
  ["GET", "/api/commerce/stores/[storeId]/inventory", false],
  ["POST", "/api/commerce/stores/[storeId]/inventory", true],
  ["POST", "/api/commerce/stores/[storeId]/imports/pazaryeri", true],
  ["POST", "/api/commerce/stores/[storeId]/imports/csv", true],
] as const;

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

async function openStore(repo: CommerceRepository, userId: string) {
  const created = await createCommerceStore(repo, userId, { name: "Tezgâh" });
  expect(created.ok).toBe(true);
  if (!created.ok) {
    throw new Error(created.error);
  }
  const storeId = created.data.store.id as string;
  const opened = await patchCommerceStore(repo, userId, storeId, { status: "ACTIVE" });
  expect(opened.ok).toBe(true);
  return storeId;
}

async function stockedVariant(
  repo: CommerceRepository,
  userId: string,
  input: { onHandQty: number; safetyBuffer: number; httpKey?: string },
) {
  const storeId = await openStore(repo, userId);
  const created = await createCommerceProduct(
    repo,
    userId,
    storeId,
    {
      mode: "active",
      title: "Kupa",
      description: "Seramik kupa",
      category: "Mutfak",
      attributes: [{ column: "Renk", value: "Lacivert" }],
      other: "",
      sku: "KUPA1",
      barcode: "8680000000001",
      amountMinor: 1500,
      onHandQty: input.onHandQty,
      safetyBuffer: input.safetyBuffer,
    },
    input.httpKey ?? "550e8400-e29b-41d4-a716-446655440010",
  );
  expect(created.ok).toBe(true);
  if (!created.ok) {
    throw new Error(created.error);
  }
  const variants = created.data.product.variants as Array<{ id: string; status: string; onHandQty: number }>;
  const variant = variants[0];
  if (!variant) {
    throw new Error("Varyant yok.");
  }
  return { storeId, variantId: variant.id, product: created.data.product };
}

describe("Yetkin Commerce Aşama 1", () => {
  it("atomik satış ikinci düşümü 409 bırakır ve satılabilir adet bitince pasife alır", async () => {
    const repo = createMemoryCommerceRepository();
    const { storeId, variantId } = await stockedVariant(repo, OWNER, { onHandQty: 1, safetyBuffer: 0 });
    const sale = {
      variantId,
      type: "SALE",
      direction: "OUT",
      quantity: 1,
      note: "",
    };
    const [first, second] = await Promise.all([
      postCommerceInventory(repo, OWNER, storeId, sale, "550e8400-e29b-41d4-a716-446655440021"),
      postCommerceInventory(repo, OWNER, storeId, sale, "550e8400-e29b-41d4-a716-446655440022"),
    ]);
    const results = [first, second];
    expect(results.filter((row) => row.ok)).toHaveLength(1);
    expect(results.filter((row) => !row.ok && row.status === 409)).toHaveLength(1);
    const products = await listCommerceProducts(repo, OWNER, storeId);
    expect(products.ok).toBe(true);
    if (!products.ok) {
      return;
    }
    const variant = (products.data.products[0] as { variants: Array<Record<string, unknown>> }).variants[0];
    expect(variant?.onHandQty).toBe(0);
    expect(variant?.status).toBe("PASSIVE");
    expect(variant?.sellableQty).toBe(0);
    const ledger = await listCommerceInventory(repo, OWNER, storeId);
    expect(ledger.ok && ledger.data.movements).toHaveLength(2);
  });

  it("emniyet tamponu satış kapısını değiştirir, defter satırı açmaz, pasif varyant girişle açılır", async () => {
    const repo = createMemoryCommerceRepository();
    const { storeId, variantId } = await stockedVariant(repo, OWNER, { onHandQty: 5, safetyBuffer: 0 });
    const patched = await patchCommerceVariant(repo, OWNER, storeId, variantId, { safetyBuffer: 4 });
    expect(patched.ok).toBe(true);
    if (!patched.ok) {
      return;
    }
    expect(patched.data.variant.status).toBe("ACTIVE");
    expect(patched.data.variant.sellableQty).toBe(1);
    const afterBuffer = await listCommerceInventory(repo, OWNER, storeId);
    expect(afterBuffer.ok && afterBuffer.data.movements).toHaveLength(1);

    const blocked = await postCommerceInventory(
      repo,
      OWNER,
      storeId,
      { variantId, type: "SALE", direction: "OUT", quantity: 2, note: "" },
      "550e8400-e29b-41d4-a716-446655440031",
    );
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.status).toBe(409);
    }

    const sold = await postCommerceInventory(
      repo,
      OWNER,
      storeId,
      { variantId, type: "SALE", direction: "OUT", quantity: 1, note: "" },
      "550e8400-e29b-41d4-a716-446655440032",
    );
    expect(sold.ok).toBe(true);
    if (sold.ok) {
      const variant = sold.data.movement.variant as { status: string; onHandQty: number };
      expect(variant.onHandQty).toBe(4);
      expect(variant.status).toBe("PASSIVE");
    }

    const adjusted = await postCommerceInventory(
      repo,
      OWNER,
      storeId,
      { variantId, type: "ADJUSTMENT", direction: "OUT", quantity: 1, note: "Sayım eksiği" },
      "550e8400-e29b-41d4-a716-446655440033",
    );
    expect(adjusted.ok).toBe(true);

    const restored = await postCommerceInventory(
      repo,
      OWNER,
      storeId,
      { variantId, type: "INBOUND", direction: "IN", quantity: 2, note: "" },
      "550e8400-e29b-41d4-a716-446655440034",
    );
    expect(restored.ok).toBe(true);
    if (restored.ok) {
      const variant = restored.data.movement.variant as { status: string; sellableQty: number };
      expect(variant.status).toBe("ACTIVE");
      expect(variant.sellableQty).toBeGreaterThan(0);
    }
  });

  it("taslak varyant girişle kendiliğinden açılmaz", async () => {
    const repo = createMemoryCommerceRepository();
    const storeId = await openStore(repo, OWNER);
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
        sku: null,
        barcode: null,
        amountMinor: null,
        onHandQty: 0,
        safetyBuffer: 0,
      },
      "550e8400-e29b-41d4-a716-446655440041",
    );
    expect(drafted.ok).toBe(true);
    if (!drafted.ok) {
      return;
    }
    const variant = (drafted.data.product.variants as Array<{ id: string; sku: string; status: string }>)[0];
    expect(variant?.status).toBe("DRAFT");
    expect(variant?.sku.startsWith("TASLAK-")).toBe(true);
    const moved = await postCommerceInventory(
      repo,
      OWNER,
      storeId,
      { variantId: variant?.id, type: "INBOUND", direction: "IN", quantity: 3, note: "" },
      "550e8400-e29b-41d4-a716-446655440042",
    );
    expect(moved.ok).toBe(true);
    if (moved.ok) {
      expect((moved.data.movement.variant as { status: string }).status).toBe("DRAFT");
    }
  });

  it("Idempotency-Key çakışması ikinci satışı çalıştırmaz", async () => {
    const repo = createMemoryCommerceRepository();
    const idempotency = createMemoryHttpIdempotencyStore();
    const { storeId, variantId } = await stockedVariant(repo, OWNER, { onHandQty: 5, safetyBuffer: 0 });
    const deps = {
      requireSession: async () => ({ id: OWNER, email: "owner@example.com" }),
      repository: () => repo,
      idempotency: () => idempotency,
    };
    const first = await postInventory(
      deps,
      new Request(`http://localhost/api/commerce/stores/${storeId}/inventory`, {
        method: "POST",
        headers: { "content-type": "application/json", "Idempotency-Key": KEY },
        body: JSON.stringify({ variantId, type: "SALE", direction: "OUT", quantity: 1, note: "" }),
      }),
      storeId,
    );
    expect(first.status).toBe(200);
    const missing = await postInventory(
      deps,
      new Request(`http://localhost/api/commerce/stores/${storeId}/inventory`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ variantId, type: "SALE", direction: "OUT", quantity: 1, note: "" }),
      }),
      storeId,
    );
    expect(missing.status).toBe(400);
    const conflict = await postInventory(
      deps,
      new Request(`http://localhost/api/commerce/stores/${storeId}/inventory`, {
        method: "POST",
        headers: { "content-type": "application/json", "Idempotency-Key": KEY },
        body: JSON.stringify({ variantId, type: "SALE", direction: "OUT", quantity: 2, note: "" }),
      }),
      storeId,
    );
    expect(conflict.status).toBe(409);
    const products = await listCommerceProducts(repo, OWNER, storeId);
    expect(products.ok).toBe(true);
    if (products.ok) {
      const variant = (products.data.products[0] as { variants: Array<{ onHandQty: number }> }).variants[0];
      expect(variant?.onHandQty).toBe(4);
    }
  });

  it("başkasının mağazası 404 döner", async () => {
    const repo = createMemoryCommerceRepository();
    const storeId = await openStore(repo, OWNER);
    const hidden = await getCommerceStore(repo, OTHER, storeId);
    expect(hidden.ok).toBe(false);
    if (!hidden.ok) {
      expect(hidden.status).toBe(404);
    }
    const imported = await importPazaryeriCatalog(
      repo,
      OTHER,
      storeId,
      {
        mode: "draft",
        market: "trendyol",
        rows: [
          {
            title: "Kupa",
            description: "Seramik",
            category: "Mutfak",
            attributes: [],
            other: "",
            sku: null,
            barcode: null,
            amountMinor: null,
            onHandQty: 0,
            safetyBuffer: 0,
          },
        ],
      },
      "550e8400-e29b-41d4-a716-446655440051",
    );
    expect(imported.ok).toBe(false);
    if (!imported.ok) {
      expect(imported.status).toBe(404);
    }
  });

  it("Tezgâh tablosu taslak Master SKU olur, stok fişi açılmaz", async () => {
    const table = catalogTableToDraftImport({
      market: "trendyol",
      columns: ["Pazaryeri", "Urun Adi", "Aciklama", "Kategori", "Renk", "Barkod", "Fiyat", "Stok"],
      rows: [["Trendyol", "Lacivert Kupa", "Günlük kupa", "Mutfak", "Lacivert", "", "", ""]],
    });
    expect(table.ok).toBe(true);
    if (!table.ok) {
      return;
    }
    expect(table.body.rows[0]?.sku).toBeNull();
    expect(table.body.rows[0]?.onHandQty).toBe(0);
    const repo = createMemoryCommerceRepository();
    const storeId = await openStore(repo, OWNER);
    const imported = await importPazaryeriCatalog(
      repo,
      OWNER,
      storeId,
      table.body,
      "550e8400-e29b-41d4-a716-446655440061",
    );
    expect(imported.ok).toBe(true);
    if (!imported.ok) {
      return;
    }
    const product = imported.data.products[0] as {
      source: string;
      listingMarket: string;
      variants: Array<{ sku: string; onHandQty: number; status: string; barcode: string | null }>;
    };
    expect(imported.data.source).toBe("TEZGAH_PAZARYERI");
    expect(product.source).toBe("TEZGAH_PAZARYERI");
    expect(product.listingMarket).toBe("trendyol");
    expect(product.variants[0]?.sku.startsWith("TASLAK-")).toBe(true);
    expect(product.variants[0]?.onHandQty).toBe(0);
    expect(product.variants[0]?.barcode).toBeNull();
    expect(product.variants[0]?.status).toBe("DRAFT");
    const ledger = await listCommerceInventory(repo, OWNER, storeId);
    expect(ledger.ok && ledger.data.movements).toHaveLength(0);
    expect(sealCommerceCsvCell("=1+1").startsWith("'")).toBe(true);
  });

  it("aktif aktarma satılabilir adet sıfırsa 422 verir", async () => {
    const repo = createMemoryCommerceRepository();
    const storeId = await openStore(repo, OWNER);
    const rejected = await importPazaryeriCatalog(
      repo,
      OWNER,
      storeId,
      {
        mode: "active",
        market: "hepsiburada",
        rows: [
          {
            title: "Kupa",
            description: "Seramik",
            category: "Mutfak",
            attributes: [],
            other: "",
            sku: "KUPA2",
            barcode: "8680000000001",
            amountMinor: 1000,
            onHandQty: 1,
            safetyBuffer: 1,
          },
        ],
      },
      "550e8400-e29b-41d4-a716-446655440071",
    );
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) {
      expect(rejected.status).toBe(422);
    }
    const products = await listCommerceProducts(repo, OWNER, storeId);
    expect(products.ok && products.data.products).toHaveLength(0);
  });

  it("rota ve RLS sicili ondört yolu ve dört tabloyu taşır", () => {
    expect(COMMERCE_ROUTES).toHaveLength(14);
    for (const [method, path, write] of COMMERCE_ROUTES) {
      expect(ROUTE_AUTH_MAP[path]).toBe("session");
      const row = WEB_ONLY_WRITE_ROUTES.find((item) => item.method === method && item.path === path);
      if (write) {
        expect(row?.status).toBe("product-write");
        expect(row?.note).toContain("Cüzdan yazılmaz");
        expect(row?.note).toContain("v1 hop satırı yoktur");
      } else {
        expect(row).toBeUndefined();
      }
    }
    for (const table of ["commerce_stores", "commerce_products", "commerce_variants", "inventory_transactions"]) {
      expect(RLS_FORCE_TABLES).toContain(table);
    }
    expect(RLS_OWNERSHIP_COLUMNS).not.toContain("owner_user_id");
    const sql = read("prisma/migrations/20261115143000_commerce_catalog_inventory/migration.sql");
    expect(sql).toContain("commerce_variants_store_barcode_uidx");
    expect(sql).toContain("WHERE \"barcode\" IS NOT NULL");
    expect(sql).toContain("inventory_transactions is append-only");
    expect(sql).toContain("BEFORE UPDATE OR DELETE");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).toContain("USING (false)");
    expect(sql).not.toContain("FOR INSERT");
    expect(sql).toContain("currency_code\" = 'TRY'");
    const schema = read("prisma/schema/commerce.prisma");
    expect(schema).toContain('@@map("commerce_stores")');
    expect(schema).toContain('@@map("inventory_transactions")');
    const ledgerStart = schema.indexOf("model InventoryTransaction");
    const ledgerEnd = schema.indexOf("\nmodel ", ledgerStart + 1);
    const ledgerModel = schema.slice(ledgerStart, ledgerEnd === -1 ? undefined : ledgerEnd);
    expect(ledgerModel).not.toContain("updatedAt");
    expect(INVENTORY_MOVE_SQL).toContain("FOR UPDATE OF v");
    expect(INVENTORY_MOVE_SQL).toContain("on_hand_qty - l.safety_buffer");
    expect(INVENTORY_MOVE_SQL).toContain("'PASSIVE'");
    expect(INVENTORY_MOVE_SQL).toContain("'ACTIVE'");
    const handlers = read("lib/commerce/handlers.ts");
    expect(handlers).toContain("requireRailV1IdempotencyKey");
    expect(handlers).toContain("settleHttpIdempotency");
    const preview = read("components/tezgah/pazaryeri-preview.tsx");
    expect(preview).toContain("MasterSkuTransfer");
    expect(preview).toContain("signedIn");
  });
});
