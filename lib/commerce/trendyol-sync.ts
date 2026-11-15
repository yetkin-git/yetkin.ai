import { randomUUID } from "node:crypto";
import type { CommerceRepository } from "@/lib/commerce/repository";
import { openCommerceCredential } from "@/lib/commerce/credential-seal";
import type { MarketplaceRepository } from "@/lib/commerce/marketplace-repository";
import { COMMERCE_CHANNEL, type WebhookReceiptRow } from "@/lib/commerce/marketplace-types";
import {
  TRENDYOL_ORDER_MAX_PAGES,
  TRENDYOL_ORDER_PAGE_SIZE,
  TrendyolRemoteError,
  amountMinorToTry,
  pullTrendyolOrderPage,
  pushTrendyolPriceAndStock,
  trendyolLineConsumesStock,
  trendyolOrderWindow,
  trendyolPackageConsumesStock,
  trendyolPushQuantity,
  type TrendyolFetch,
  type TrendyolOrderPackage,
} from "@/lib/commerce/trendyol-client";

export type TrendyolPorts = {
  commerce: CommerceRepository;
  marketplace: MarketplaceRepository;
  env: NodeJS.ProcessEnv;
  fetchImpl?: TrendyolFetch;
  now?: () => Date;
  baseUrl?: string;
};

export type TrendyolStockPushEvent = {
  listingId: string;
  storeId: string;
  onHandAfter: number;
  amountMinor: number;
};

export type TrendyolLineIntake =
  | { outcome: "applied" | "replay"; status: "APPLIED" }
  | { outcome: "stock-short" | "replay"; status: "STOCK_SHORT" }
  | { outcome: "skipped"; reason: "unmapped" | "closed" | "foreign-currency" | "missing" };

export function trendyolSaleIdempotencyKey(storeId: string, packageId: string, lineId: string): string {
  return `trendyol:${storeId}:${packageId}:${lineId}`;
}

export function trendyolStockEventId(listingId: string, onHandAfter: number, amountMinor: number): string {
  return `trendyol-stock:${listingId}:${onHandAfter}:${amountMinor}`;
}

export function trendyolMovementNote(orderNumber: string): string {
  return `Trendyol ${orderNumber}`.slice(0, 500);
}

function openStored(row: {
  storeId: string;
  supplierSeal: string;
  apiKeySeal: string;
  apiSecretSeal: string;
}, env: NodeJS.ProcessEnv) {
  return {
    supplierId: openCommerceCredential(row.supplierSeal, "supplier", row.storeId, env),
    apiKey: openCommerceCredential(row.apiKeySeal, "apiKey", row.storeId, env),
    apiSecret: openCommerceCredential(row.apiSecretSeal, "apiSecret", row.storeId, env),
  };
}

function recorded(status: "APPLIED" | "STOCK_SHORT"): TrendyolLineIntake {
  return status === "STOCK_SHORT"
    ? { outcome: "replay", status: "STOCK_SHORT" }
    : { outcome: "replay", status: "APPLIED" };
}

async function intakeLine(
  ports: TrendyolPorts,
  input: {
    storeId: string;
    ownerUserId: string;
    orderNumber: string;
    packageId: string;
    lineId: string;
    barcode: string;
    quantity: number;
    consumes: boolean;
  },
): Promise<TrendyolLineIntake> {
  const existing = await ports.marketplace.findReceipt(input.storeId, input.packageId, input.lineId);
  if (existing) {
    return recorded(existing.status);
  }
  if (!input.consumes) {
    return { outcome: "skipped", reason: "closed" };
  }
  const listing = await ports.marketplace.findListingByRemoteBarcode(input.storeId, input.barcode);
  if (!listing) {
    return { outcome: "skipped", reason: "unmapped" };
  }
  const variant = await ports.commerce.findVariant(input.storeId, listing.variantId);
  if (!variant) {
    return { outcome: "skipped", reason: "missing" };
  }
  const note = trendyolMovementNote(input.orderNumber);
  const moved = await ports.commerce.applyMovement({
    id: randomUUID(),
    storeId: input.storeId,
    variantId: variant.id,
    actorUserId: input.ownerUserId,
    type: "SALE",
    direction: "OUT",
    quantity: input.quantity,
    note,
    idempotencyKey: trendyolSaleIdempotencyKey(input.storeId, input.packageId, input.lineId),
  });
  if (moved.outcome === "missing") {
    return { outcome: "skipped", reason: "missing" };
  }
  const status = moved.outcome === "rejected" ? "STOCK_SHORT" : "APPLIED";
  const receipt: WebhookReceiptRow = {
    id: randomUUID(),
    storeId: input.storeId,
    variantId: variant.id,
    channel: COMMERCE_CHANNEL,
    externalOrderId: input.packageId,
    lineId: input.lineId,
    status,
    quantity: input.quantity,
    note,
    createdAt: new Date(),
  };
  const inserted = await ports.marketplace.insertReceipt(receipt);
  if (inserted === "conflict") {
    const again = await ports.marketplace.findReceipt(input.storeId, input.packageId, input.lineId);
    if (!again) {
      throw new TrendyolRemoteError("Trendyol fişi okunamadı.");
    }
    return recorded(again.status);
  }
  if (status === "STOCK_SHORT") {
    return { outcome: "stock-short", status: "STOCK_SHORT" };
  }
  return { outcome: moved.outcome === "replay" ? "replay" : "applied", status: "APPLIED" };
}

export async function intakeTrendyolPackages(
  ports: TrendyolPorts,
  storeId: string,
  ownerUserId: string,
  packages: readonly TrendyolOrderPackage[],
): Promise<TrendyolLineIntake[]> {
  const results: TrendyolLineIntake[] = [];
  for (const pkg of packages) {
    const foreign = Boolean(pkg.currencyCode && pkg.currencyCode.toUpperCase() !== "TRY");
    const consumesPackage = !foreign && trendyolPackageConsumesStock(pkg);
    for (const line of pkg.lines) {
      if (foreign) {
        const existing = await ports.marketplace.findReceipt(storeId, pkg.shipmentPackageId, line.lineId);
        results.push(existing ? recorded(existing.status) : { outcome: "skipped", reason: "foreign-currency" });
        continue;
      }
      results.push(
        await intakeLine(ports, {
          storeId,
          ownerUserId,
          orderNumber: pkg.orderNumber,
          packageId: pkg.shipmentPackageId,
          lineId: line.lineId,
          barcode: line.barcode,
          quantity: line.quantity,
          consumes: consumesPackage && trendyolLineConsumesStock(line),
        }),
      );
    }
  }
  return results;
}

export async function pushTrendyolListingStock(
  ports: TrendyolPorts,
  data: TrendyolStockPushEvent,
): Promise<{ syncStatus: "SYNCED" | "PENDING" }> {
  const listing = await ports.marketplace.findListingById(data.listingId);
  if (!listing || listing.storeId !== data.storeId) {
    throw new TrendyolRemoteError("Trendyol ilanı yok.");
  }
  const variant = await ports.commerce.findVariant(listing.storeId, listing.variantId);
  if (!variant || variant.amountMinor == null) {
    throw new TrendyolRemoteError("Trendyol ilan fiyatı yok.");
  }
  if (variant.onHandQty !== data.onHandAfter || variant.amountMinor !== data.amountMinor) {
    return { syncStatus: "PENDING" };
  }
  const credential = await ports.marketplace.findCredential(listing.storeId);
  if (!credential) {
    throw new TrendyolRemoteError("Trendyol kimliği yok.");
  }
  const opened = openStored(credential, ports.env);
  const quantity = trendyolPushQuantity(variant.onHandQty, variant.safetyBuffer);
  const price = amountMinorToTry(variant.amountMinor);
  await pushTrendyolPriceAndStock({
    supplierId: opened.supplierId,
    apiKey: opened.apiKey,
    apiSecret: opened.apiSecret,
    barcode: listing.remoteBarcode,
    quantity,
    salePrice: price,
    listPrice: price,
    fetchImpl: ports.fetchImpl,
    baseUrl: ports.baseUrl,
  });
  const fresh = await ports.commerce.findVariant(listing.storeId, listing.variantId);
  if (!fresh || fresh.onHandQty !== data.onHandAfter || fresh.amountMinor !== data.amountMinor) {
    return { syncStatus: "PENDING" };
  }
  await ports.marketplace.markListing(listing.id, {
    syncStatus: "SYNCED",
    lastError: "",
    lastSyncedAt: ports.now?.() ?? new Date(),
  });
  return { syncStatus: "SYNCED" };
}

export async function markTrendyolListingFailed(
  ports: Pick<TrendyolPorts, "commerce" | "marketplace">,
  input: { listingId: string; onHandAfter: number; amountMinor: number; message: string },
): Promise<"FAILED" | "skipped"> {
  const listing = await ports.marketplace.findListingById(input.listingId);
  if (!listing || listing.syncStatus === "SYNCED") {
    return "skipped";
  }
  const variant = await ports.commerce.findVariant(listing.storeId, listing.variantId);
  if (!variant || variant.onHandQty !== input.onHandAfter || variant.amountMinor !== input.amountMinor) {
    return "skipped";
  }
  const lastError = input.message.replace(/\s+/g, " ").trim().slice(0, 500) || "Trendyol stok itme başarısız.";
  await ports.marketplace.markListing(listing.id, {
    syncStatus: "FAILED",
    lastError,
    lastSyncedAt: listing.lastSyncedAt,
  });
  return "FAILED";
}

export async function pullTrendyolOrders(
  ports: TrendyolPorts,
): Promise<{ stores: number; lines: number; stockShort: number }> {
  const rows = await ports.marketplace.listTrendyolCredentials();
  if (rows.length === 0) {
    return { stores: 0, lines: 0, stockShort: 0 };
  }
  const window = trendyolOrderWindow(ports.now?.() ?? new Date());
  let lines = 0;
  let stockShort = 0;
  for (const row of rows) {
    const opened = openStored(row, ports.env);
    const store = await ports.commerce.findStoreById(row.storeId);
    if (!store) {
      continue;
    }
    let page = 0;
    for (;;) {
      const packages = await pullTrendyolOrderPage({
        supplierId: opened.supplierId,
        apiKey: opened.apiKey,
        apiSecret: opened.apiSecret,
        startDate: window.startDate,
        endDate: window.endDate,
        page,
        fetchImpl: ports.fetchImpl,
        baseUrl: ports.baseUrl,
      });
      const own = packages.filter((pkg) => pkg.supplierId === opened.supplierId);
      const intakes = await intakeTrendyolPackages(ports, store.id, store.ownerUserId, own);
      lines += intakes.filter((item) => item.outcome !== "skipped").length;
      stockShort += intakes.filter((item) => item.outcome !== "skipped" && item.status === "STOCK_SHORT").length;
      if (packages.length < TRENDYOL_ORDER_PAGE_SIZE) {
        break;
      }
      page += 1;
      if (page >= TRENDYOL_ORDER_MAX_PAGES) {
        throw new TrendyolRemoteError("Trendyol sipariş penceresi sayfa tavanında.");
      }
    }
  }
  return { stores: rows.length, lines, stockShort };
}
