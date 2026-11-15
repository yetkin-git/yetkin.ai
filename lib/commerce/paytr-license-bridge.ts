import "server-only";

import { randomUUID } from "node:crypto";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import { logEvent } from "@/lib/kernel/observability/log";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import type { CommerceRepository } from "@/lib/commerce/repository";
import {
  COMMERCE_MONTHLY_MODULE,
  COMMERCE_MONTHLY_UNIT,
  commerceLicenseExpiry,
  storeIdFromCommerceMerchantOid,
  type CommerceSubscriptionRow,
  type CommerceSubscriptionStore,
} from "@/lib/commerce/subscription";

/** PayTR sipariş niyeti. Düz cüzdan yüklemesi paket açmaz. */
export const COMMERCE_LICENSE_ORDER_PURPOSE = "commerce-license:monthly" as const;

export const COMMERCE_LICENSE_DEBIT_PURPOSE = "commerce-license" as const;

export function isCommerceLicenseOrder(purpose: string | undefined): boolean {
  return purpose === COMMERCE_LICENSE_ORDER_PURPOSE;
}

export function commerceLicenseDebitIdempotencyKey(merchantOid: string): string {
  return `${COMMERCE_LICENSE_DEBIT_PURPOSE}:${merchantOid}`;
}

export type CommerceLicenseFulfillResult = {
  applied: boolean;
  expiresAt: string | null;
  reason:
    | "not_commerce"
    | "not_cleared"
    | "currency"
    | "amount"
    | "catalog"
    | "store"
    | "already_settled"
    | "extended";
};

export async function readCommerceMonthlyAmount(catalog: PriceCatalogStore): Promise<number | null> {
  const entry = await catalog.findActiveEntry(COMMERCE_MONTHLY_MODULE, COMMERCE_MONTHLY_UNIT);
  if (!entry || !entry.isActive || entry.unitType !== "MINOR" || entry.currencyCode !== "TRY") {
    return null;
  }
  if (!Number.isInteger(entry.amountMinor) || entry.amountMinor <= 0) {
    return null;
  }
  return entry.amountMinor;
}

/**
 * CLEARED `commerce-license:monthly` siparişi süreyi uzatır ve aynı tutarı cüzdandan düşer.
 * Katalog tutarı, sipariş tutarı ve yazılacak `list_price_minor` aynı olmalıdır.
 * Bekleyen satırın anlık görüntüsü bu üçlüye uymazsa paket yazılmaz.
 * Aktif satırın önceki ay görüntüsü yenilemede değişebilir; yeni görüntü siparişle yazılır.
 * Aynı merchant_oid ikinci kez süreyi uzatmaz. Düşüm tutmazsa süre yazılmaz.
 */
export async function fulfillCommerceLicenseFromClearedOrder(
  commerce: CommerceRepository,
  subscriptions: CommerceSubscriptionStore,
  catalog: PriceCatalogStore,
  order: PaymentOrderSnapshot,
  ledger: LedgerStore,
  now: Date = new Date(),
): Promise<CommerceLicenseFulfillResult> {
  if (!isCommerceLicenseOrder(order.purpose)) {
    return { applied: false, expiresAt: null, reason: "not_commerce" };
  }
  if (order.status !== "CLEARED") {
    return { applied: false, expiresAt: null, reason: "not_cleared" };
  }
  if (order.currencyCode !== "TRY") {
    return { applied: false, expiresAt: null, reason: "currency" };
  }
  if (!Number.isInteger(order.amountMinor) || order.amountMinor <= 0) {
    return { applied: false, expiresAt: null, reason: "amount" };
  }
  const storeId = storeIdFromCommerceMerchantOid(order.merchantOid);
  const store = storeId ? await commerce.findStoreById(storeId) : null;
  if (!store || store.ownerUserId !== order.userId) {
    return { applied: false, expiresAt: null, reason: "store" };
  }
  const catalogAmount = await readCommerceMonthlyAmount(catalog);
  if (catalogAmount == null || catalogAmount !== order.amountMinor) {
    return { applied: false, expiresAt: null, reason: catalogAmount == null ? "catalog" : "amount" };
  }
  const existing = await subscriptions.findByStoreId(store.id);
  if (existing && existing.ownerUserId !== order.userId) {
    return { applied: false, expiresAt: null, reason: "store" };
  }
  if (existing && existing.status !== "ACTIVE" && existing.listPriceMinor !== order.amountMinor) {
    return { applied: false, expiresAt: null, reason: "amount" };
  }
  const already = existing?.appliedMerchantOids.includes(order.merchantOid) ?? false;
  try {
    await appendLedgerEntry(ledger, {
      userId: order.userId,
      currencyCode: "TRY",
      amountMinor: toPositiveAmountMinor(order.amountMinor),
      direction: "DEBIT",
      label: "Commerce aylık lisans",
      purpose: COMMERCE_LICENSE_DEBIT_PURPOSE,
      idempotencyKey: commerceLicenseDebitIdempotencyKey(order.merchantOid),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (already && isInsufficientBalanceError(message)) {
      return {
        applied: false,
        expiresAt: existing?.expiresAt?.toISOString() ?? null,
        reason: "already_settled",
      };
    }
    throw error;
  }
  if (already && existing) {
    return {
      applied: false,
      expiresAt: existing.expiresAt?.toISOString() ?? null,
      reason: "already_settled",
    };
  }
  const expiresAt = commerceLicenseExpiry(existing?.status === "ACTIVE" ? existing.expiresAt : null, now);
  const saved: CommerceSubscriptionRow = {
    id: existing?.id ?? randomUUID(),
    storeId: store.id,
    ownerUserId: store.ownerUserId,
    status: "ACTIVE",
    listPriceMinor: order.amountMinor,
    appliedMerchantOids: [...(existing?.appliedMerchantOids ?? []), order.merchantOid],
    expiresAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await subscriptions.save(saved);
  logEvent({
    level: "info",
    event: "commerce.license.fulfilled",
    userId: order.userId,
    merchantOid: order.merchantOid,
    orderId: order.id,
    amountMinor: order.amountMinor,
    purpose: COMMERCE_LICENSE_ORDER_PURPOSE,
    applied: true,
  });
  return {
    applied: true,
    expiresAt: expiresAt.toISOString(),
    reason: existing?.status === "ACTIVE" ? "extended" : "extended",
  };
}
