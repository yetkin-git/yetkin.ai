import { randomUUID } from "node:crypto";
import { openCommerceCredential } from "@/lib/commerce/credential-seal";
import { channelListingSaleMinor } from "@/lib/commerce/listing-price";
import { enqueueMovedStock } from "@/lib/commerce/listing-queue";
import { moveWithSetMembers } from "@/lib/commerce/set-stock";
import { draftFromMarketplacePackage, type FulfillmentDraft } from "@/lib/commerce/fulfillment-rules";
import type { MarketplaceRepository } from "@/lib/commerce/marketplace-repository";
import type { WebhookReceiptRow } from "@/lib/commerce/marketplace-types";
import type { CommerceRepository } from "@/lib/commerce/repository";
import { COMMERCE_LICENSE_ABSENT, outgoingSyncAllowed, type CommerceOutgoingLicense } from "@/lib/commerce/sync-license";
import {
  HEPSIBURADA_ORDER_MAX_PAGES,
  HEPSIBURADA_ORDER_PAGE_SIZE,
  HepsiburadaRemoteError,
  hepsiburadaLineConsumesStock,
  hepsiburadaOrderWindow,
  hepsiburadaPackageConsumesStock,
  hepsiburadaPushQuantity,
  pullHepsiburadaOrderPage,
  pushHepsiburadaPriceAndStock,
  type HepsiburadaFetch,
  type HepsiburadaOrderPackage,
} from "@/lib/commerce/hepsiburada-client";

const CHANNEL = "HEPSIBURADA" as const;

export type HepsiburadaPorts = {
  commerce: CommerceRepository;
  marketplace: MarketplaceRepository;
  env: NodeJS.ProcessEnv;
  fetchImpl?: HepsiburadaFetch;
  now?: () => Date;
  listingBaseUrl?: string;
  orderBaseUrl?: string;
  license?: CommerceOutgoingLicense;
  /** Sipariş masası. Yoksa stok çekimi yalnız deftere yazar. */
  recordFulfillment?: (draft: FulfillmentDraft) => Promise<void>;
};

export type HepsiburadaStockPushEvent = {
  listingId: string;
  storeId: string;
  onHandAfter: number;
  amountMinor: number;
};

export type HepsiburadaLineIntake =
  | { outcome: "applied" | "replay"; status: "APPLIED" }
  | { outcome: "stock-short" | "replay"; status: "STOCK_SHORT" }
  | { outcome: "skipped"; reason: "unmapped" | "closed" | "foreign-currency" | "missing" };

export function hepsiburadaSaleIdempotencyKey(storeId: string, packageId: string, lineId: string): string {
  return `hepsiburada:${storeId}:${packageId}:${lineId}`;
}

export function hepsiburadaStockEventId(listingId: string, onHandAfter: number, amountMinor: number): string {
  return `hepsiburada-stock:${listingId}:${onHandAfter}:${amountMinor}`;
}

export function hepsiburadaMovementNote(orderNumber: string): string {
  return `Hepsiburada ${orderNumber}`.slice(0, 500);
}

function openStored(row: {
  storeId: string;
  supplierSeal: string;
  apiKeySeal: string;
  apiSecretSeal: string;
}, env: NodeJS.ProcessEnv) {
  return {
    merchantId: openCommerceCredential(row.supplierSeal, "supplier", row.storeId, env, CHANNEL),
    apiKey: openCommerceCredential(row.apiKeySeal, "apiKey", row.storeId, env, CHANNEL),
    apiSecret: openCommerceCredential(row.apiSecretSeal, "apiSecret", row.storeId, env, CHANNEL),
  };
}

function recorded(status: "APPLIED" | "STOCK_SHORT"): HepsiburadaLineIntake {
  return status === "STOCK_SHORT" ? { outcome: "replay", status: "STOCK_SHORT" } : { outcome: "replay", status: "APPLIED" };
}

async function intakeLine(
  ports: HepsiburadaPorts,
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
): Promise<HepsiburadaLineIntake> {
  const existing = await ports.marketplace.findReceipt(input.storeId, input.packageId, input.lineId, CHANNEL);
  if (existing) {
    return recorded(existing.status);
  }
  if (!input.consumes) {
    return { outcome: "skipped", reason: "closed" };
  }
  const listing = await ports.marketplace.findListingByRemoteBarcode(input.storeId, input.barcode, CHANNEL);
  if (!listing) {
    return { outcome: "skipped", reason: "unmapped" };
  }
  const variant = await ports.commerce.findVariant(input.storeId, listing.variantId);
  if (!variant) {
    return { outcome: "skipped", reason: "missing" };
  }
  const note = hepsiburadaMovementNote(input.orderNumber);
  const moved = await moveWithSetMembers(ports.commerce, {
    id: randomUUID(),
    storeId: input.storeId,
    variantId: variant.id,
    actorUserId: input.ownerUserId,
    type: "SALE",
    direction: "OUT",
    quantity: input.quantity,
    note,
    idempotencyKey: hepsiburadaSaleIdempotencyKey(input.storeId, input.packageId, input.lineId),
  });
  if (moved.outcome === "missing") {
    return { outcome: "skipped", reason: "missing" };
  }
  if (moved.outcome === "applied") {
    const salePriceMinor = channelListingSaleMinor(listing, moved.variant.amountMinor);
    await enqueueMovedStock(ports.marketplace, input.storeId, [
      {
        variantId: moved.variant.id,
        onHandAfter: moved.variant.onHandQty,
        amountMinor: salePriceMinor,
        variantAmountMinor: moved.variant.amountMinor,
      },
      ...(moved.memberPushes ?? []).map((row) => ({
        ...row,
        variantAmountMinor: row.amountMinor,
      })),
    ]);
  }
  const status = moved.outcome === "rejected" ? "STOCK_SHORT" : "APPLIED";
  const receipt: WebhookReceiptRow = {
    id: randomUUID(),
    storeId: input.storeId,
    variantId: variant.id,
    channel: CHANNEL,
    externalOrderId: input.packageId,
    lineId: input.lineId,
    status,
    quantity: input.quantity,
    note,
    createdAt: new Date(),
  };
  const inserted = await ports.marketplace.insertReceipt(receipt);
  if (inserted === "conflict") {
    const again = await ports.marketplace.findReceipt(input.storeId, input.packageId, input.lineId, CHANNEL);
    if (!again) {
      throw new HepsiburadaRemoteError("Hepsiburada fişi okunamadı.");
    }
    return recorded(again.status);
  }
  if (status === "STOCK_SHORT") {
    return { outcome: "stock-short", status: "STOCK_SHORT" };
  }
  return { outcome: moved.outcome === "replay" ? "replay" : "applied", status: "APPLIED" };
}

export async function intakeHepsiburadaPackages(
  ports: HepsiburadaPorts,
  storeId: string,
  ownerUserId: string,
  packages: readonly HepsiburadaOrderPackage[],
): Promise<HepsiburadaLineIntake[]> {
  const results: HepsiburadaLineIntake[] = [];
  for (const pkg of packages) {
    const foreign = Boolean(pkg.currencyCode && pkg.currencyCode.toUpperCase() !== "TRY");
    const consumesPackage = !foreign && hepsiburadaPackageConsumesStock(pkg);
    for (const line of pkg.lines) {
      if (foreign) {
        const existing = await ports.marketplace.findReceipt(storeId, pkg.packageId, line.lineId, CHANNEL);
        results.push(existing ? recorded(existing.status) : { outcome: "skipped", reason: "foreign-currency" });
        continue;
      }
      results.push(
        await intakeLine(ports, {
          storeId,
          ownerUserId,
          orderNumber: pkg.orderNumber,
          packageId: pkg.packageId,
          lineId: line.lineId,
          barcode: line.barcode,
          quantity: line.quantity,
          consumes: consumesPackage && hepsiburadaLineConsumesStock(line),
        }),
      );
    }
    if (ports.recordFulfillment && pkg.lines.length > 0) {
      await ports.recordFulfillment(
        draftFromMarketplacePackage({
          storeId,
          channel: "HEPSIBURADA",
          externalOrderNo: pkg.orderNumber,
          statusText: pkg.status,
          lines: pkg.lines,
          now: ports.now?.() ?? new Date(),
        }),
      );
    }
  }
  return results;
}

export async function pushHepsiburadaListingStock(
  ports: HepsiburadaPorts,
  data: HepsiburadaStockPushEvent,
): Promise<{ syncStatus: "SYNCED" | "PENDING" }> {
  const listing = await ports.marketplace.findListingById(data.listingId);
  if (!listing || listing.storeId !== data.storeId || listing.channel !== CHANNEL) {
    throw new HepsiburadaRemoteError("Hepsiburada ilanı yok.");
  }
  const variant = await ports.commerce.findVariant(listing.storeId, listing.variantId);
  const saleMinor = channelListingSaleMinor(listing, variant?.amountMinor);
  if (!variant || saleMinor == null) {
    throw new HepsiburadaRemoteError("Hepsiburada ilan fiyatı yok.");
  }
  if (variant.onHandQty !== data.onHandAfter || saleMinor !== data.amountMinor) {
    return { syncStatus: "PENDING" };
  }
  const allowed = await outgoingSyncAllowed(ports.license, listing.storeId, ports.now?.() ?? new Date());
  if (!allowed) {
    await ports.marketplace.markListing(listing.id, {
      syncStatus: "PENDING",
      lastError: COMMERCE_LICENSE_ABSENT,
      lastSyncedAt: listing.lastSyncedAt,
    });
    return { syncStatus: "PENDING" };
  }
  const credential = await ports.marketplace.findCredential(listing.storeId, CHANNEL);
  if (!credential) {
    throw new HepsiburadaRemoteError("Hepsiburada kimliği yok.");
  }
  const opened = openStored(credential, ports.env);
  await pushHepsiburadaPriceAndStock({
    merchantId: opened.merchantId,
    apiKey: opened.apiKey,
    apiSecret: opened.apiSecret,
    merchantSku: listing.sku,
    hepsiburadaSku: listing.remoteBarcode,
    quantity: hepsiburadaPushQuantity(variant.onHandQty, variant.safetyBuffer),
    amountMinor: saleMinor,
    fetchImpl: ports.fetchImpl,
    baseUrl: ports.listingBaseUrl,
  });
  const fresh = await ports.commerce.findVariant(listing.storeId, listing.variantId);
  const freshListing = await ports.marketplace.findListingById(listing.id);
  const freshSale = channelListingSaleMinor(freshListing ?? listing, fresh?.amountMinor);
  if (!fresh || fresh.onHandQty !== data.onHandAfter || freshSale !== data.amountMinor) {
    return { syncStatus: "PENDING" };
  }
  await ports.marketplace.markListing(listing.id, {
    syncStatus: "SYNCED",
    lastError: "",
    lastSyncedAt: ports.now?.() ?? new Date(),
  });
  return { syncStatus: "SYNCED" };
}

export async function markHepsiburadaListingFailed(
  ports: Pick<HepsiburadaPorts, "commerce" | "marketplace">,
  input: { listingId: string; onHandAfter: number; amountMinor: number; message: string },
): Promise<"FAILED" | "skipped"> {
  const listing = await ports.marketplace.findListingById(input.listingId);
  if (!listing || listing.channel !== CHANNEL || listing.syncStatus === "SYNCED") {
    return "skipped";
  }
  const variant = await ports.commerce.findVariant(listing.storeId, listing.variantId);
  const saleMinor = channelListingSaleMinor(listing, variant?.amountMinor);
  if (!variant || variant.onHandQty !== input.onHandAfter || saleMinor !== input.amountMinor) {
    return "skipped";
  }
  const lastError = input.message.replace(/\s+/g, " ").trim().slice(0, 500) || "Hepsiburada stok itme başarısız.";
  await ports.marketplace.markListing(listing.id, {
    syncStatus: "FAILED",
    lastError,
    lastSyncedAt: listing.lastSyncedAt,
  });
  return "FAILED";
}

export async function pullHepsiburadaOrders(
  ports: HepsiburadaPorts,
): Promise<{ stores: number; lines: number; stockShort: number }> {
  const rows = await ports.marketplace.listCredentials(CHANNEL);
  if (rows.length === 0) {
    return { stores: 0, lines: 0, stockShort: 0 };
  }
  const now = ports.now?.() ?? new Date();
  const window = hepsiburadaOrderWindow(now);
  let lines = 0;
  let stockShort = 0;
  let stores = 0;
  for (const row of rows) {
    if (!(await outgoingSyncAllowed(ports.license, row.storeId, now))) {
      continue;
    }
    stores += 1;
    const opened = openStored(row, ports.env);
    const store = await ports.commerce.findStoreById(row.storeId);
    if (!store) {
      continue;
    }
    let page = 0;
    for (;;) {
      const packages = await pullHepsiburadaOrderPage({
        merchantId: opened.merchantId,
        apiKey: opened.apiKey,
        apiSecret: opened.apiSecret,
        beginDate: window.beginDate,
        endDate: window.endDate,
        page,
        fetchImpl: ports.fetchImpl,
        baseUrl: ports.orderBaseUrl,
      });
      const own = packages.filter((pkg) => pkg.merchantId === opened.merchantId);
      const intakes = await intakeHepsiburadaPackages(ports, store.id, store.ownerUserId, own);
      lines += intakes.filter((item) => item.outcome !== "skipped").length;
      stockShort += intakes.filter((item) => item.outcome !== "skipped" && item.status === "STOCK_SHORT").length;
      if (packages.length < HEPSIBURADA_ORDER_PAGE_SIZE) {
        break;
      }
      page += 1;
      if (page >= HEPSIBURADA_ORDER_MAX_PAGES) {
        throw new HepsiburadaRemoteError("Hepsiburada sipariş penceresi sayfa tavanında.");
      }
    }
  }
  return { stores, lines, stockShort };
}
