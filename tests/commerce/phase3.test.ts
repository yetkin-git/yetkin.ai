import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { missingPublicSurfacePath } from "@/lib/academy/public-surface-gate";
import { CATALOG_OPENABLE_UNITS } from "@/lib/kernel/admin/catalog-write";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import { evaluateClearedLicenseGaps } from "@/lib/kernel/payments/license-gap";
import { REQUIRED_CATALOG_DEFINITIONS } from "@/lib/kernel/pricing/catalog-definitions";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { sealCommerceCredential, openCommerceCredential } from "@/lib/commerce/credential-seal";
import { hepsiburadaPricePath, hepsiburadaStockPath } from "@/lib/commerce/hepsiburada-client";
import { pullHepsiburadaOrders, pushHepsiburadaListingStock } from "@/lib/commerce/hepsiburada-sync";
import { createMemoryCommerceRepository } from "@/lib/commerce/memory-repository";
import { postHepsiburadaWebhook, putTrendyolCredentialRoute, putTrendyolListingRoute } from "@/lib/commerce/marketplace-handlers";
import { createMemoryMarketplaceRepository } from "@/lib/commerce/marketplace-memory";
import {
  COMMERCE_LICENSE_DEBIT_PURPOSE,
  COMMERCE_LICENSE_ORDER_PURPOSE,
  commerceLicenseDebitIdempotencyKey,
  fulfillCommerceLicenseFromClearedOrder,
  readCommerceMonthlyAmount,
} from "@/lib/commerce/paytr-license-bridge";
import type { CommerceRepository } from "@/lib/commerce/repository";
import { createCommerceProduct, createCommerceStore, patchCommerceStore } from "@/lib/commerce/service";
import { formatTryMinor, projectStorefront } from "@/lib/commerce/storefront";
import {
  addCommerceLicenseMonth,
  commerceLicenseMerchantOid,
  storeIdFromCommerceMerchantOid,
} from "@/lib/commerce/subscription";
import { createMemoryCommerceSubscriptionStore } from "@/lib/commerce/subscription-memory";
import { RLS_FORCE_TABLES, RLS_OWNERSHIP_COLUMNS } from "@/lib/kernel/security/rls-policy-registry";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";

const ROOT = process.cwd();
const OWNER = "11111111-1111-4111-8111-111111111111";
const MERCHANT = "HB00001234";
const API_KEY = "hb-api-key";
const API_SECRET = "hb-api-secret";
const KEY = Buffer.from(new Uint8Array(32).map((_, index) => index + 1)).toString("base64");
const ENV = { COMMERCE_CREDENTIAL_ENCRYPTION_KEY: KEY, NODE_ENV: "test" } as NodeJS.ProcessEnv;
const PRICE = 49_000;
const NOW = new Date("2026-05-01T00:00:00.000Z");

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function catalog(amount: number | null): PriceCatalogStore {
  return {
    async findActiveEntry(moduleKey, unitKey) {
      if (amount == null || moduleKey !== "commerce" || unitKey !== "monthly") {
        return null;
      }
      return {
        id: "pce_commerce_monthly",
        moduleKey: "commerce",
        unitKey: "monthly",
        unitType: "MINOR",
        amountMinor: toAmountMinor(amount),
        currencyCode: "TRY",
        isActive: true,
        minMinor: toAmountMinor(1),
        maxMinor: toAmountMinor(50_000_000),
      };
    },
    async listActiveEntries() {
      return [];
    },
  };
}

function order(storeId: string, overrides?: Partial<PaymentOrderSnapshot>): PaymentOrderSnapshot {
  const merchantOid = overrides?.merchantOid ?? commerceLicenseMerchantOid(storeId, "checkout-key")!;
  return {
    id: "po-commerce",
    userId: OWNER,
    amountMinor: PRICE,
    currencyCode: "TRY",
    status: "CLEARED",
    createdAt: NOW,
    purpose: COMMERCE_LICENSE_ORDER_PURPOSE,
    ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
    ...overrides,
    merchantOid,
  };
}

async function stocked(repo: CommerceRepository, onHandQty = 4, safetyBuffer = 1) {
  const created = await createCommerceStore(repo, OWNER, { name: "Tezgâh" });
  if (!created.ok) {
    throw new Error(created.error);
  }
  const storeId = created.data.store.id as string;
  const opened = await patchCommerceStore(repo, OWNER, storeId, { status: "ACTIVE", slug: "tezgah-vitrin" });
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
  const variant = (product.data.product.variants as Array<{ id: string }>)[0];
  if (!variant) {
    throw new Error("Varyant yok.");
  }
  return { storeId, variantId: variant.id, slug: "tezgah-vitrin" };
}

function deps(repo: CommerceRepository, market = createMemoryMarketplaceRepository()) {
  return {
    requireSession: async () => ({ id: OWNER, email: "owner@yetkin.ai" }),
    commerce: () => repo,
    marketplace: () => market,
    env: ENV,
    // P0.4 — kimlik masası lisans ister; bu suite lisanslı satıcıyı taklit eder.
    license: { allowsOutgoing: async () => true },
  };
}

async function sealAndList(repo: CommerceRepository, market: ReturnType<typeof createMemoryMarketplaceRepository>, storeId: string, variantId: string) {
  const credential = await putTrendyolCredentialRoute(
    deps(repo, market),
    new Request("https://yetkin.ai/api/commerce/stores/x/credentials/hepsiburada", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ supplierId: MERCHANT, apiKey: API_KEY, apiSecret: API_SECRET }),
    }),
    storeId,
    "HEPSIBURADA",
  );
  expect(credential.status).toBe(200);
  const body = await credential.json();
  expect(JSON.stringify(body)).not.toContain(API_SECRET);
  const listing = await putTrendyolListingRoute(
    deps(repo, market),
    new Request("https://yetkin.ai/api/commerce/stores/x/listings/hepsiburada", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variantId, remoteBarcode: "8680000000001" }),
    }),
    storeId,
    "HEPSIBURADA",
  );
  expect(listing.status).toBe(200);
  const listed = (await listing.json()) as { data: { listing: { id: string } } };
  return listed.data.listing.id;
}

describe("Yetkin Commerce Aşama 3", () => {
  it("vitrin yalnız satılabilir aktif rafı gösterir ve lisans sormaz", async () => {
    const repo = createMemoryCommerceRepository();
    const { storeId } = await stocked(repo, 3, 1);
    const patched = await patchCommerceStore(repo, OWNER, storeId, { whatsappE164: "0532 123 45 67" });
    expect(patched.ok).toBe(true);
    if (patched.ok) {
      expect(patched.data.store.whatsappE164).toBe("905321234567");
    }
    const invalid = await patchCommerceStore(repo, OWNER, storeId, { whatsappE164: "02121234567" });
    expect(invalid.ok).toBe(false);
    const store = await repo.findStoreById(storeId);
    const products = await repo.listProducts(storeId);
    const view = projectStorefront({
      store: store!,
      products: products.map((row) => row.product),
      variants: products.flatMap((row) => row.variants),
    });
    expect(view?.lines).toHaveLength(1);
    expect(view?.lines[0]?.sellableQty).toBe(2);
    expect(view?.lines[0]?.orderUrl).toContain("https://wa.me/905321234567?text=");
    expect(view?.lines[0]?.orderUrl).toContain(encodeURIComponent("Kupa KUPA1"));
    expect(formatTryMinor(2500)).toBe("₺25");
    expect(formatTryMinor(2590)).toBe("₺25,90");
    expect(JSON.stringify(view)).not.toContain("safetyBuffer");
    expect(JSON.stringify(view)).not.toContain(OWNER);
    const hidden = projectStorefront({
      store: { ...store!, status: "DRAFT" },
      products: products.map((row) => row.product),
      variants: products.flatMap((row) => row.variants),
    });
    expect(hidden).toBeNull();
    const empty = projectStorefront({
      store: { ...store!, whatsappE164: null },
      products: products.map((row) => row.product),
      variants: products.flatMap((row) =>
        row.variants.map((variant) => ({ ...variant, status: "PASSIVE" as const })),
      ),
    });
    expect(empty?.lines).toEqual([]);
    expect(missingPublicSurfacePath("/magaza/BOZUK")).toBe("/magaza/BOZUK");
    expect(missingPublicSurfacePath("/magaza/tezgah-vitrin")).toBeNull();
  });

  it("Hepsiburada mührü Trendyol mührünü açmaz; lisanssız itme susar, satış stoka iner", async () => {
    const storeId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const trendyol = sealCommerceCredential("27380001", "supplier", storeId, ENV);
    expect(openCommerceCredential(trendyol, "supplier", storeId, ENV)).toBe("27380001");
    const hb = sealCommerceCredential(MERCHANT, "supplier", storeId, ENV, "HEPSIBURADA");
    expect(() => openCommerceCredential(hb, "supplier", storeId, ENV)).toThrow();
    expect(openCommerceCredential(hb, "supplier", storeId, ENV, "HEPSIBURADA")).toBe(MERCHANT);

    const repo = createMemoryCommerceRepository();
    const market = createMemoryMarketplaceRepository();
    const stock = await stocked(repo, 4, 1);
    const listingId = await sealAndList(repo, market, stock.storeId, stock.variantId);
    const calls: Array<{ url: string; body: string }> = [];
    const fetchImpl = async (url: string, init?: RequestInit) => {
      calls.push({ url, body: typeof init?.body === "string" ? init.body : "" });
      return new Response("{}", { status: 200 });
    };
    const silent = await pushHepsiburadaListingStock(
      { commerce: repo, marketplace: market, env: ENV, fetchImpl, license: { allowsOutgoing: async () => false } },
      { listingId, storeId: stock.storeId, onHandAfter: 4, amountMinor: 2500 },
    );
    expect(silent.syncStatus).toBe("PENDING");
    expect(calls).toEqual([]);
    expect((await market.findListingById(listingId))?.lastError).toBe("Abonelik yok.");

    const pushed = await pushHepsiburadaListingStock(
      { commerce: repo, marketplace: market, env: ENV, fetchImpl, license: { allowsOutgoing: async () => true } },
      { listingId, storeId: stock.storeId, onHandAfter: 4, amountMinor: 2500 },
    );
    expect(pushed.syncStatus).toBe("SYNCED");
    expect(calls.some((call) => call.url.includes(hepsiburadaStockPath(MERCHANT)))).toBe(true);
    expect(calls.some((call) => call.url.includes(hepsiburadaPricePath(MERCHANT)))).toBe(true);
    const stockBody = calls.find((call) => call.url.includes("stock-uploads"))?.body ?? "";
    expect(stockBody).toContain('"availableStock":3');
    expect(calls.find((call) => call.url.includes("price-uploads"))?.body).toContain('"price":25');

    const ports = {
      commerce: repo,
      marketplace: market,
      env: ENV,
      license: { allowsOutgoing: async () => false },
    };
    const sale = await postHepsiburadaWebhook(
      ports,
      new Request("https://yetkin.ai/api/commerce/webhooks/hepsiburada", {
        method: "POST",
        headers: { "x-api-key": API_KEY, "content-type": "application/json" },
        body: JSON.stringify({
          packageId: "9001",
          orderNumber: "HB1",
          merchantId: MERCHANT,
          status: "Open",
          currencyCode: "TRY",
          lines: [{ lineId: "11", barcode: "8680000000001", quantity: 1, status: "Open" }],
        }),
      }),
    );
    expect(sale.status).toBe(200);
    const after = await repo.findVariant(stock.storeId, stock.variantId);
    expect(after?.onHandQty).toBe(3);
    const again = await postHepsiburadaWebhook(
      ports,
      new Request("https://yetkin.ai/api/commerce/webhooks/hepsiburada", {
        method: "POST",
        headers: { authorization: `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64")}`, "content-type": "application/json" },
        body: JSON.stringify({
          packageId: "9001",
          orderNumber: "HB1",
          merchantId: MERCHANT,
          status: "Open",
          currencyCode: "TRY",
          lines: [{ lineId: "11", barcode: "8680000000001", quantity: 1, status: "Open" }],
        }),
      }),
    );
    expect(again.status).toBe(200);
    expect((await repo.findVariant(stock.storeId, stock.variantId))?.onHandQty).toBe(3);

    const foreign = await postHepsiburadaWebhook(
      ports,
      new Request("https://yetkin.ai/api/commerce/webhooks/hepsiburada", {
        method: "POST",
        headers: { "x-api-key": API_KEY, "content-type": "application/json" },
        body: JSON.stringify({
          packageId: "9002",
          orderNumber: "HB2",
          merchantId: MERCHANT,
          status: "Open",
          currencyCode: "USD",
          lines: [{ lineId: "12", barcode: "8680000000001", quantity: 1, status: "Open" }],
        }),
      }),
    );
    expect(foreign.status).toBe(200);
    expect((await repo.findVariant(stock.storeId, stock.variantId))?.onHandQty).toBe(3);

    const short = await postHepsiburadaWebhook(
      ports,
      new Request("https://yetkin.ai/api/commerce/webhooks/hepsiburada", {
        method: "POST",
        headers: { "x-api-key": API_KEY, "content-type": "application/json" },
        body: JSON.stringify({
          packageId: "9003",
          orderNumber: "HB3",
          merchantId: MERCHANT,
          status: "Open",
          currencyCode: "TRY",
          lines: [{ lineId: "13", barcode: "8680000000001", quantity: 9, status: "Open" }],
        }),
      }),
    );
    expect(short.status).toBe(409);

    const pulled = await pullHepsiburadaOrders({
      commerce: repo,
      marketplace: market,
      env: ENV,
      fetchImpl,
      license: { allowsOutgoing: async () => false },
    });
    expect(pulled.stores).toBe(0);
    expect(read("lib/commerce/hepsiburada-sync.ts")).not.toContain("appendLedgerEntry");
    expect(read("lib/commerce/trendyol-sync.ts")).not.toContain("appendLedgerEntry");
  });

  it("aylık lisans katalogdan okunur, cüzdandan düşer ve giden senkronu açar", async () => {
    expect(await readCommerceMonthlyAmount(catalog(null))).toBeNull();
    expect(REQUIRED_CATALOG_DEFINITIONS.some((row) => row.moduleKey === "commerce")).toBe(false);
    expect(CATALOG_OPENABLE_UNITS.some((row) => row.moduleKey === "commerce" && row.unitKey === "monthly")).toBe(true);

    const repo = createMemoryCommerceRepository();
    const { storeId } = await stocked(repo);
    const subscriptions = createMemoryCommerceSubscriptionStore();
    const ledger = createMemoryLedgerStore([{ userId: OWNER, amountMinor: PRICE }]);
    const first = await fulfillCommerceLicenseFromClearedOrder(
      repo,
      subscriptions,
      catalog(PRICE),
      order(storeId),
      ledger,
      NOW,
    );
    expect(first.applied).toBe(true);
    expect(first.expiresAt).toBe(addCommerceLicenseMonth(NOW).toISOString());
    const debit = await ledger.findByIdempotencyKey(commerceLicenseDebitIdempotencyKey(order(storeId).merchantOid));
    expect(debit?.purpose).toBe(COMMERCE_LICENSE_DEBIT_PURPOSE);
    expect(debit?.direction).toBe("DEBIT");
    expect((await subscriptions.findByStoreId(storeId))?.status).toBe("ACTIVE");
    const replay = await fulfillCommerceLicenseFromClearedOrder(
      repo,
      subscriptions,
      catalog(PRICE),
      order(storeId),
      ledger,
      NOW,
    );
    expect(replay.reason).toBe("already_settled");
    expect(replay.expiresAt).toBe(first.expiresAt);
    expect((await ledger.findByIdempotencyKey(commerceLicenseDebitIdempotencyKey(order(storeId).merchantOid)))?.amountMinor).toBe(PRICE);

    const wallet = await fulfillCommerceLicenseFromClearedOrder(
      repo,
      subscriptions,
      catalog(PRICE),
      order(storeId, { purpose: "wallet-top-up", merchantOid: "WL-1" }),
      ledger,
      NOW,
    );
    expect(wallet.reason).toBe("not_commerce");

    const mismatch = await fulfillCommerceLicenseFromClearedOrder(
      repo,
      createMemoryCommerceSubscriptionStore(),
      catalog(PRICE),
      order(storeId, { amountMinor: PRICE - 1, merchantOid: commerceLicenseMerchantOid(storeId, "other")! }),
      createMemoryLedgerStore([{ userId: OWNER, amountMinor: PRICE }]),
      NOW,
    );
    expect(mismatch.reason).toBe("amount");

    await subscriptions.save({
      id: "pending",
      storeId,
      ownerUserId: OWNER,
      status: "PENDING",
      listPriceMinor: PRICE - 1,
      appliedMerchantOids: [],
      expiresAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
    const quoted = await fulfillCommerceLicenseFromClearedOrder(
      repo,
      subscriptions,
      catalog(PRICE),
      order(storeId, { merchantOid: commerceLicenseMerchantOid(storeId, "fresh")! }),
      createMemoryLedgerStore([{ userId: OWNER, amountMinor: PRICE }]),
      NOW,
    );
    expect(quoted.reason).toBe("amount");
    expect((await subscriptions.findByStoreId(storeId))?.status).toBe("PENDING");
    expect(storeIdFromCommerceMerchantOid(order(storeId).merchantOid)).toBe(storeId);

    const gap = evaluateClearedLicenseGaps({
      orders: [
        {
          id: "po",
          userId: OWNER,
          merchantOid: "CMGAP",
          purpose: COMMERCE_LICENSE_ORDER_PURPOSE,
          amountMinor: PRICE,
        },
      ],
      academySeats: [],
      juniorSeats: [],
      commerceSeats: [],
      refundedMerchantOids: [],
    });
    expect(gap.gaps[0]?.product).toBe("commerce");
    expect(gap.gaps[0]?.reason).toBe("missing_subscription");
    const seated = evaluateClearedLicenseGaps({
      orders: [
        {
          id: "po",
          userId: OWNER,
          merchantOid: "CMGAP",
          purpose: COMMERCE_LICENSE_ORDER_PURPOSE,
          amountMinor: PRICE,
        },
      ],
      academySeats: [],
      juniorSeats: [],
      commerceSeats: [{ ownerUserId: OWNER, status: "ACTIVE", appliedMerchantOids: ["CMGAP"] }],
      refundedMerchantOids: [],
    });
    expect(seated.gaps).toEqual([]);
  });

  it("rota, RLS ve PayTR kancası sicildedir", () => {
    expect(ROUTE_AUTH_MAP["/api/commerce/stores/[storeId]/credentials/hepsiburada"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/commerce/stores/[storeId]/listings/hepsiburada"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/commerce/stores/[storeId]/subscription"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/commerce/webhooks/hepsiburada"]).toBe("webhook");
    expect(
      WEB_ONLY_WRITE_ROUTES.some(
        (row) => row.method === "POST" && row.path === "/api/commerce/stores/[storeId]/subscription" && row.status === "product-write",
      ),
    ).toBe(true);
    expect(
      WEB_ONLY_WRITE_ROUTES.some(
        (row) => row.method === "POST" && row.path === "/api/commerce/webhooks/hepsiburada" && row.status === "hmac",
      ),
    ).toBe(true);
    expect(RLS_FORCE_TABLES).toContain("commerce_subscriptions");
    expect(RLS_OWNERSHIP_COLUMNS).not.toContain("owner_user_id");
    const sql = read("prisma/migrations/20261115200000_commerce_storefront_subscription/migration.sql");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).toContain("USING (false)");
    expect(sql).not.toContain("FOR INSERT");
    expect(sql).toContain("HEPSIBURADA");
    expect(sql).toContain("whatsapp_e164");
    const jobs = read("lib/kernel/jobs/inngest.ts");
    expect(jobs).toContain('HEPSIBURADA_STOCK_PUSH_REQUESTED: "commerce/hepsiburada.stock-push-requested"');
    expect(jobs).toContain('id: "hepsiburada-order-pull"');
    expect(jobs).toContain("retries: 4");
    expect(read("lib/kernel/payments/paytr/webhook-settle.ts")).toContain("notifyCommerceLicenseHook");
    expect(read("lib/kernel/payments/paytr/reconcile.ts")).toContain("notifyCommerceLicenseHook");
    expect(read("lib/commerce/paytr-license-bridge.ts")).toContain('COMMERCE_LICENSE_ORDER_PURPOSE = "commerce-license:monthly"');
    expect(read("lib/kernel/payments/license-gap.ts")).toContain('COMMERCE_LICENSE_PURPOSE = "commerce-license:monthly"');
  });
});
