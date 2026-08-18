import { randomUUID } from "node:crypto";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import { resolvePlatformTreasuryUserId } from "@/lib/kernel/escrow";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { requireActiveCatalogEntry } from "@/lib/kernel/pricing/catalog-band";
import type { PazaryeriEnginePorts } from "@/lib/pazaryeri/engine";
import { assertCashPathAllowedForCategory, isProductDoped } from "@/lib/pazaryeri/category";
import {
  PAZARYERI_DOPING_TTL_MS,
  PAZARYERI_DOPING_UNIT_KEY,
  PAZARYERI_MODULE_KEY,
  type MarketplaceDopingRecord,
  type MarketplaceProductRecord,
} from "@/lib/pazaryeri/types";

export type PurchaseMarketplaceDopingCommand = {
  productId: string;
  sellerUserId: string;
  platformUserId?: string;
  now?: Date;
};

function dopingDebitKey(dopingId: string): string {
  return `pazaryeri-doping:${dopingId}`;
}

function dopingCreditKey(dopingId: string): string {
  return `pazaryeri-doping-treasury:${dopingId}`;
}

export async function purchaseMarketplaceDoping(
  ports: PazaryeriEnginePorts,
  command: PurchaseMarketplaceDopingCommand,
): Promise<{ applied: boolean; product: MarketplaceProductRecord; doping: MarketplaceDopingRecord }> {
  const product =
    (await ports.pazaryeri.getProduct(command.productId)) ??
    (await ports.pazaryeri.getProductBySlug(command.productId));
  if (!product) {
    throw new Error("Ürün bulunamadı.");
  }
  if (product.userId !== command.sellerUserId) {
    throw new Error("Doping yalnız ilan sahibi tarafından alınır.");
  }
  if (product.status !== "LISTED") {
    throw new Error("Satışa kapalı ilan dopinglenemez.");
  }
  assertCashPathAllowedForCategory(product.category);

  const now = command.now ?? new Date();
  const active = await ports.pazaryeri.getActiveDopingForProduct(product.id, now);
  if (active || isProductDoped(product, now)) {
    throw new Error("İlan zaten dopingli.");
  }

  const catalog = await requireActiveCatalogEntry(
    ports.catalog,
    PAZARYERI_MODULE_KEY,
    PAZARYERI_DOPING_UNIT_KEY,
  );
  if (catalog.currencyCode !== SETTLEMENT_CURRENCY || product.currencyCode !== SETTLEMENT_CURRENCY) {
    throw new Error("Gün 0 settlement yalnızca TRY.");
  }
  const amountMinor = catalog.amountMinor;
  const platformUserId = command.platformUserId ?? resolvePlatformTreasuryUserId();
  if (platformUserId === command.sellerUserId) {
    throw new Error("Platform hazinesi satıcı ile çakışamaz.");
  }

  const dopingId = randomUUID();
  const expiresAt = new Date(now.getTime() + PAZARYERI_DOPING_TTL_MS);

  await appendLedgerEntry(ports.ledger, {
    userId: command.sellerUserId,
    currencyCode: catalog.currencyCode,
    amountMinor,
    direction: "DEBIT",
    label: "Yetkinİlan doping",
    purpose: "pazaryeri-doping",
    idempotencyKey: dopingDebitKey(dopingId),
  });
  await appendLedgerEntry(ports.ledger, {
    userId: platformUserId,
    currencyCode: catalog.currencyCode,
    amountMinor,
    direction: "CREDIT",
    label: "Yetkinİlan doping hazine",
    purpose: "pazaryeri-doping-treasury",
    idempotencyKey: dopingCreditKey(dopingId),
  });

  const doping = await ports.pazaryeri.insertDoping({
    id: dopingId,
    productId: product.id,
    userId: command.sellerUserId,
    amountMinor,
    currencyCode: catalog.currencyCode,
    status: "ACTIVE",
    startsAt: now,
    expiresAt,
    createdAt: now,
  });
  const next = await ports.pazaryeri.updateProduct(product.id, {
    isDoped: true,
    dopedUntil: expiresAt,
    updatedAt: now,
  });
  return { applied: true, product: next, doping };
}
