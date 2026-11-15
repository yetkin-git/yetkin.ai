import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CommerceCredentialSealError, openCommerceCredential, sealCommerceCredential } from "@/lib/commerce/credential-seal";
import { createMemoryCommerceRepository } from "@/lib/commerce/memory-repository";
import { createMemoryMarketplaceRepository } from "@/lib/commerce/marketplace-memory";
import {
  getTrendyolCredentialRoute,
  postTrendyolWebhook,
  putTrendyolCredentialRoute,
  putTrendyolListingRoute,
} from "@/lib/commerce/marketplace-handlers";
import type { CommerceRepository } from "@/lib/commerce/repository";
import { createCommerceProduct, createCommerceStore, listCommerceInventory, patchCommerceStore } from "@/lib/commerce/service";
import {
  markTrendyolListingFailed,
  pushTrendyolListingStock,
  trendyolStockEventId,
  type TrendyolPorts,
} from "@/lib/commerce/trendyol-sync";
import { trendyolOrdersPath, trendyolPriceStockPath } from "@/lib/commerce/trendyol-client";
import { WEB_BFF_NON_HOP_ROUTES, WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";
import { RLS_FORCE_TABLES, RLS_OWNERSHIP_COLUMNS } from "@/lib/kernel/security/rls-policy-registry";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";

const ROOT = process.cwd();
const OWNER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const SUPPLIER = "27380001";
const API_KEY = "api-key-value-1";
const API_SECRET = "super-secret-value";
const KEY = Buffer.from(new Uint8Array(32).map((_, index) => index + 1)).toString("base64");
const ENV = { COMMERCE_CREDENTIAL_ENCRYPTION_KEY: KEY, NODE_ENV: "test" } as NodeJS.ProcessEnv;

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

async function stocked(repo: CommerceRepository, onHandQty: number, safetyBuffer = 0) {
  const created = await createCommerceStore(repo, OWNER, { name: "Tezgâh" });
  if (!created.ok) {
    throw new Error(created.error);
  }
  const storeId = created.data.store.id as string;
  const opened = await patchCommerceStore(repo, OWNER, storeId, { status: "ACTIVE" });
  if (!opened.ok) {
    throw new Error(opened.error);
  }
  const product = await createCommerceProduct(
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
      amountMinor: 2500,
      onHandQty,
      safetyBuffer,
    },
    "550e8400-e29b-41d4-a716-446655440010",
  );
  if (!product.ok) {
    throw new Error(product.error);
  }
  const variant = (product.data.product.variants as Array<{ id: string; onHandQty: number }>)[0];
  if (!variant) {
    throw new Error("Varyant yok.");
  }
  return { storeId, variantId: variant.id };
}

function deps(repo: CommerceRepository, market = createMemoryMarketplaceRepository()) {
  return {
    requireSession: async () => ({ id: OWNER, email: "owner@yetkin.ai" }),
    commerce: () => repo,
    marketplace: () => market,
    env: ENV,
  };
}

function ports(repo: CommerceRepository, market: ReturnType<typeof createMemoryMarketplaceRepository>, fetchImpl?: TrendyolPorts["fetchImpl"]): TrendyolPorts {
  return { commerce: repo, marketplace: market, env: ENV, fetchImpl };
}

async function sealStore(repo: CommerceRepository, market: ReturnType<typeof createMemoryMarketplaceRepository>, storeId: string) {
  const response = await putTrendyolCredentialRoute(
    deps(repo, market),
    new Request("https://yetkin.ai/api/commerce/stores/x/credentials/trendyol", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ supplierId: SUPPLIER, apiKey: API_KEY, apiSecret: API_SECRET }),
    }),
    storeId,
  );
  expect(response.status).toBe(200);
}

function orderBody(input: { packageId: number; lines: Array<{ lineId: number; quantity: number }> }) {
  return {
    shipmentPackageId: input.packageId,
    orderNumber: "10654411111",
    supplierId: Number(SUPPLIER),
    status: "Created",
    currencyCode: "TRY",
    lines: input.lines.map((line) => ({
      lineId: line.lineId,
      barcode: "8680000000001",
      quantity: line.quantity,
      orderLineItemStatusName: "Created",
    })),
  };
}

describe("Yetkin Commerce Aşama 2 Trendyol", () => {
  it("AES-GCM AAD başka mağazanın ve başka alanın mührünü açmaz", () => {
    const sealed = sealCommerceCredential(SUPPLIER, "supplier", "store-a", ENV);
    expect(sealed.startsWith("ccred1:")).toBe(true);
    expect(openCommerceCredential(sealed, "supplier", "store-a", ENV)).toBe(SUPPLIER);
    expect(() => openCommerceCredential(sealed, "supplier", "store-b", ENV)).toThrow(CommerceCredentialSealError);
    expect(() => openCommerceCredential(sealed, "apiKey", "store-a", ENV)).toThrow(CommerceCredentialSealError);
    expect(() =>
      sealCommerceCredential(SUPPLIER, "supplier", "store-a", { ...ENV, COMMERCE_CREDENTIAL_ENCRYPTION_KEY: "" }),
    ).toThrow(CommerceCredentialSealError);
  });

  it("kimlik yanıtı mühürlü ve maskelidir", async () => {
    const repo = createMemoryCommerceRepository();
    const market = createMemoryMarketplaceRepository();
    const { storeId } = await stocked(repo, 4);
    await sealStore(repo, market, storeId);
    const response = await getTrendyolCredentialRoute(
      deps(repo, market),
      new Request("https://yetkin.ai/api/commerce/stores/x/credentials/trendyol"),
      storeId,
    );
    expect(response.status).toBe(200);
    const wire = JSON.stringify(await response.json());
    expect(wire).toContain('"sealed":true');
    expect(wire).toContain('"supplierHint":"0001"');
    expect(wire).not.toContain(SUPPLIER);
    expect(wire).not.toContain(API_KEY);
    expect(wire).not.toContain(API_SECRET);
    expect(wire).not.toContain("ccred1:");
    const foreign = await getTrendyolCredentialRoute(
      {
        ...deps(repo, market),
        requireSession: async () => ({ id: OTHER, email: "other@yetkin.ai" }),
      },
      new Request("https://yetkin.ai/api/commerce/stores/x/credentials/trendyol"),
      storeId,
    );
    expect(foreign.status).toBe(404);
  });

  it("başarısız stok itmede uzak yazıdan önce SYNCED olmaz, deneme bitince FAILED olur", async () => {
    const repo = createMemoryCommerceRepository();
    const market = createMemoryMarketplaceRepository();
    const { storeId, variantId } = await stocked(repo, 8, 1);
    await sealStore(repo, market, storeId);
    const mapped = await putTrendyolListingRoute(
      deps(repo, market),
      new Request("https://yetkin.ai/api/commerce/stores/x/listings/trendyol", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ variantId, remoteBarcode: "8680000000001" }),
      }),
      storeId,
    );
    expect(mapped.status).toBe(200);
    const listing = ((await mapped.json()) as { data: { listing: { id: string } } }).data.listing;
    const failing = ports(repo, market, async () => new Response("nope", { status: 500 }));
    await expect(
      pushTrendyolListingStock(failing, {
        listingId: listing.id,
        storeId,
        onHandAfter: 8,
        amountMinor: 2500,
      }),
    ).rejects.toThrow("Trendyol stok itme 500");
    expect((await market.findListingById(listing.id))?.syncStatus).toBe("PENDING");
    const marked = await markTrendyolListingFailed(failing, {
      listingId: listing.id,
      onHandAfter: 8,
      amountMinor: 2500,
      message: "Trendyol stok itme 500",
    });
    expect(marked).toBe("FAILED");
    expect((await market.findListingById(listing.id))?.syncStatus).toBe("FAILED");
    expect((await market.findListingById(listing.id))?.lastError).toContain("500");
    const variant = await repo.findVariant(storeId, variantId);
    expect(variant?.onHandQty).toBe(8);
  });

  it("başarılı itme satılabilir adedi ve TL fiyatı gönderir, yerel adedi değiştirmez", async () => {
    const repo = createMemoryCommerceRepository();
    const market = createMemoryMarketplaceRepository();
    const { storeId, variantId } = await stocked(repo, 8, 1);
    await sealStore(repo, market, storeId);
    const mapped = await putTrendyolListingRoute(
      deps(repo, market),
      new Request("https://yetkin.ai/api/commerce/stores/x/listings/trendyol", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ variantId, remoteBarcode: "8680000000001" }),
      }),
      storeId,
    );
    const listingId = ((await mapped.json()) as { data: { listing: { id: string } } }).data.listing.id;
    let seenUrl = "";
    let seenBody = "";
    let seenAgent = "";
    const ok = ports(repo, market, async (url, init) => {
      seenUrl = url;
      seenBody = String(init.body ?? "");
      seenAgent = new Headers(init.headers).get("user-agent") ?? "";
      return new Response(JSON.stringify({ batchRequestId: "batch-1" }), { status: 200 });
    });
    const result = await pushTrendyolListingStock(ok, {
      listingId,
      storeId,
      onHandAfter: 8,
      amountMinor: 2500,
    });
    expect(result.syncStatus).toBe("SYNCED");
    expect(seenUrl).toContain(trendyolPriceStockPath(SUPPLIER));
    expect(seenAgent).toBe(`${SUPPLIER} - SelfIntegration`);
    expect(JSON.parse(seenBody)).toEqual({
      items: [{ barcode: "8680000000001", quantity: 7, salePrice: 25, listPrice: 25 }],
    });
    expect(seenBody).not.toContain(API_SECRET);
    expect((await repo.findVariant(storeId, variantId))?.onHandQty).toBe(8);
    expect(trendyolStockEventId(listingId, 8, 2500)).toBe(`trendyol-stock:${listingId}:8:2500`);
    expect(trendyolOrdersPath(SUPPLIER)).toBe(`/integration/order/sellers/${SUPPLIER}/v2/orders`);
  });

  it("mükerrer pakette tek SALE yazar, iki satır iki SALE olur", async () => {
    const repo = createMemoryCommerceRepository();
    const market = createMemoryMarketplaceRepository();
    const { storeId, variantId } = await stocked(repo, 5);
    await sealStore(repo, market, storeId);
    await putTrendyolListingRoute(
      deps(repo, market),
      new Request("https://yetkin.ai/api/commerce/stores/x/listings/trendyol", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ variantId, remoteBarcode: "8680000000001" }),
      }),
      storeId,
    );
    const hook = ports(repo, market);
    const first = await postTrendyolWebhook(
      hook,
      new Request("https://yetkin.ai/api/commerce/webhooks/trendyol", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify(orderBody({ packageId: 3330111111, lines: [{ lineId: 11, quantity: 1 }] })),
      }),
    );
    const replay = await postTrendyolWebhook(
      hook,
      new Request("https://yetkin.ai/api/commerce/webhooks/trendyol", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify(orderBody({ packageId: 3330111111, lines: [{ lineId: 11, quantity: 1 }] })),
      }),
    );
    const secondLine = await postTrendyolWebhook(
      hook,
      new Request("https://yetkin.ai/api/commerce/webhooks/trendyol", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify(
          orderBody({
            packageId: 3330111111,
            lines: [
              { lineId: 11, quantity: 1 },
              { lineId: 22, quantity: 1 },
            ],
          }),
        ),
      }),
    );
    expect(first.status).toBe(200);
    expect(replay.status).toBe(200);
    expect(secondLine.status).toBe(200);
    const ledger = await listCommerceInventory(repo, OWNER, storeId);
    expect(ledger.ok).toBe(true);
    if (!ledger.ok) {
      return;
    }
    const sales = ledger.data.movements.filter((row) => row.type === "SALE");
    expect(sales).toHaveLength(2);
    expect(sales.map((row) => row.idempotencyKey).sort()).toEqual(
      [`trendyol:${storeId}:3330111111:11`, `trendyol:${storeId}:3330111111:22`].sort(),
    );
    expect((await repo.findVariant(storeId, variantId))?.onHandQty).toBe(3);
  });

  it("kısa stokta stok yazmaz ve webhook STOCK_SHORT 409 döner", async () => {
    const repo = createMemoryCommerceRepository();
    const market = createMemoryMarketplaceRepository();
    const { storeId, variantId } = await stocked(repo, 1);
    await sealStore(repo, market, storeId);
    await putTrendyolListingRoute(
      deps(repo, market),
      new Request("https://yetkin.ai/api/commerce/stores/x/listings/trendyol", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ variantId, remoteBarcode: "8680000000001" }),
      }),
      storeId,
    );
    const hook = ports(repo, market);
    const denied = await postTrendyolWebhook(
      hook,
      new Request("https://yetkin.ai/api/commerce/webhooks/trendyol", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": "wrong-key" },
        body: JSON.stringify(orderBody({ packageId: 3330111111, lines: [{ lineId: 11, quantity: 2 }] })),
      }),
    );
    expect(denied.status).toBe(401);
    const response = await postTrendyolWebhook(
      hook,
      new Request("https://yetkin.ai/api/commerce/webhooks/trendyol", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify(orderBody({ packageId: 444, lines: [{ lineId: 99, quantity: 2 }] })),
      }),
    );
    expect(response.status).toBe(409);
    expect(((await response.json()) as { error: string }).error).toBe("STOCK_SHORT");
    const again = await postTrendyolWebhook(
      hook,
      new Request("https://yetkin.ai/api/commerce/webhooks/trendyol", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify(orderBody({ packageId: 444, lines: [{ lineId: 99, quantity: 2 }] })),
      }),
    );
    expect(again.status).toBe(409);
    const ledger = await listCommerceInventory(repo, OWNER, storeId);
    expect(ledger.ok && ledger.data.movements.filter((row) => row.type === "SALE")).toHaveLength(0);
    expect((await repo.findVariant(storeId, variantId))?.onHandQty).toBe(1);
    const handlers = read("lib/commerce/marketplace-handlers.ts");
    expect(handlers).toContain("timingSafeEqual");
  });

  it("rota, Inngest ve RLS sicili üç tabloyu taşır", () => {
    expect(ROUTE_AUTH_MAP["/api/commerce/stores/[storeId]/credentials/trendyol"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/commerce/stores/[storeId]/listings/trendyol"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/commerce/webhooks/trendyol"]).toBe("webhook");
    for (const method of ["PUT", "DELETE"] as const) {
      for (const path of [
        "/api/commerce/stores/[storeId]/credentials/trendyol",
        "/api/commerce/stores/[storeId]/listings/trendyol",
      ]) {
        expect(WEB_ONLY_WRITE_ROUTES.some((row) => row.method === method && row.path === path && row.status === "product-write")).toBe(true);
      }
    }
    expect(
      WEB_ONLY_WRITE_ROUTES.some(
        (row) => row.method === "POST" && row.path === "/api/commerce/webhooks/trendyol" && row.status === "hmac",
      ),
    ).toBe(true);
    expect(
      WEB_BFF_NON_HOP_ROUTES.some(
        (row) => row.method === "GET" && row.path === "/api/commerce/stores/[storeId]/credentials/trendyol" && !row.write,
      ),
    ).toBe(true);
    for (const table of [
      "commerce_marketplace_credentials",
      "commerce_channel_listings",
      "commerce_marketplace_webhook_receipts",
    ]) {
      expect(RLS_FORCE_TABLES).toContain(table);
    }
    expect(RLS_OWNERSHIP_COLUMNS).not.toContain("owner_user_id");
    const sql = read("prisma/migrations/20261115180000_commerce_trendyol_channel/migration.sql");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).toContain("USING (false)");
    expect(sql).not.toContain("FOR INSERT");
    expect(sql).toContain("ccred1:%");
    const jobs = read("lib/kernel/jobs/inngest.ts");
    expect(jobs).toContain('TRENDYOL_STOCK_PUSH_REQUESTED: "commerce/trendyol.stock-push-requested"');
    expect(jobs).toContain("retries: 4");
    expect(jobs).toContain("onFailure");
    expect(jobs).toContain('id: "trendyol-order-pull"');
    expect(jobs).toContain("TZ=Europe/Istanbul */30 * * * *");
    expect(read(".env.example")).toContain("COMMERCE_CREDENTIAL_ENCRYPTION_KEY=");
  });
});
