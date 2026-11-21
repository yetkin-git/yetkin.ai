import "server-only";

import { randomUUID } from "node:crypto";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import { classifyPaymentOrderPurpose, PAYMENT_ORDER_PURPOSE } from "@/lib/kernel/payments/order-purpose";
import { logEvent } from "@/lib/kernel/observability/log";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import type { CommerceRepository } from "@/lib/commerce/repository";
import {
  COMMERCE_TRIAL_VERIFY_MINOR,
  commerceTrialWindow,
} from "@/lib/commerce/subscription-lifecycle";
import { sealCommerceTrialConsumptionForStore } from "@/lib/commerce/trial-reservation";
import {
  COMMERCE_MONTHLY_MODULE,
  COMMERCE_MONTHLY_UNIT,
  addCommerceLicenseMonth,
  storeIdFromCommerceMerchantOid,
  type CommerceSubscriptionRow,
  type CommerceSubscriptionStore,
} from "@/lib/commerce/subscription";

/** PayTR sipariş niyeti. Düz cüzdan yüklemesi paket açmaz. */
export const COMMERCE_LICENSE_ORDER_PURPOSE = "commerce-license:monthly" as const;

export const COMMERCE_LICENSE_DEBIT_PURPOSE = "commerce-license" as const;

export function isCommerceLicenseOrder(purpose: string | undefined): boolean {
  return (
    purpose === COMMERCE_LICENSE_ORDER_PURPOSE ||
    classifyPaymentOrderPurpose(purpose) === PAYMENT_ORDER_PURPOSE.COMMERCE_LICENSE
  );
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
 * Süre uzatmanın başlangıç noktası.
 *
 * Aktif lisansta bitmemiş süre korunur. Denemede (`TRIALING`) kalan deneme günleri
 * **yakılmaz**: yeni dönem `trialEndsAt` üzerine eklenir. Erken dönüş yapan kullanıcı
 * hem deneme günlerini hem yeni ayı kullanır.
 */
export function commerceRenewalBase(
  row: Pick<CommerceSubscriptionRow, "status" | "expiresAt" | "trialEndsAt" | "currentPeriodEnd"> | null,
  now: Date,
): Date | null {
  if (!row) {
    return null;
  }
  const future = (candidate: Date | null | undefined) =>
    candidate && candidate.getTime() > now.getTime() ? candidate : null;
  if (row.status === "ACTIVE") {
    return future(row.expiresAt) ?? future(row.currentPeriodEnd);
  }
  if (row.status === "TRIALING" || row.status === "PAST_DUE") {
    return future(row.trialEndsAt) ?? future(row.currentPeriodEnd) ?? future(row.expiresAt);
  }
  return null;
}

async function fulfillCommerceTrial(
  subscriptions: CommerceSubscriptionStore,
  order: PaymentOrderSnapshot,
  ledger: LedgerStore,
  existing: CommerceSubscriptionRow,
  already: boolean,
  now: Date,
): Promise<CommerceLicenseFulfillResult> {
  try {
    await appendLedgerEntry(ledger, {
      userId: order.userId,
      currencyCode: "TRY",
      amountMinor: toPositiveAmountMinor(order.amountMinor),
      direction: "DEBIT",
      label: "Commerce deneme kart doğrulama",
      purpose: COMMERCE_LICENSE_DEBIT_PURPOSE,
      idempotencyKey: commerceLicenseDebitIdempotencyKey(order.merchantOid),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (already && isInsufficientBalanceError(message)) {
      return {
        applied: false,
        expiresAt: existing.expiresAt?.toISOString() ?? null,
        reason: "already_settled",
      };
    }
    throw error;
  }
  if (already) {
    return {
      applied: false,
      expiresAt: existing.expiresAt?.toISOString() ?? null,
      reason: "already_settled",
    };
  }
  // CLEARED mühürü: deneme hakkı burada gerçekten tükenir (ödeme penceresi kilidi değil).
  await sealCommerceTrialConsumptionForStore(existing.storeId, now);
  const window = commerceTrialWindow(now);
  const saved: CommerceSubscriptionRow = {
    ...existing,
    status: "TRIALING",
    appliedMerchantOids: [...existing.appliedMerchantOids, order.merchantOid],
    expiresAt: window.trialEndsAt,
    trialEndsAt: window.trialEndsAt,
    currentPeriodEnd: window.currentPeriodEnd,
    cancelAtPeriodEnd: false,
    trialPending: false,
    dunningAttempts: 0,
    lastDunningAt: null,
    updatedAt: now,
  };
  await subscriptions.save(saved);
  logEvent({
    level: "info",
    event: "commerce.license.trial_started",
    userId: order.userId,
    merchantOid: order.merchantOid,
    orderId: order.id,
    amountMinor: order.amountMinor,
    purpose: COMMERCE_LICENSE_ORDER_PURPOSE,
    applied: true,
  });
  return { applied: true, expiresAt: window.trialEndsAt.toISOString(), reason: "extended" };
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
  const existing = await subscriptions.findByStoreId(store.id);
  if (existing && existing.ownerUserId !== order.userId) {
    return { applied: false, expiresAt: null, reason: "store" };
  }
  const already = existing?.appliedMerchantOids.includes(order.merchantOid) ?? false;
  if (existing?.trialPending && order.amountMinor === COMMERCE_TRIAL_VERIFY_MINOR) {
    return fulfillCommerceTrial(subscriptions, order, ledger, existing, already, now);
  }  const catalogAmount = await readCommerceMonthlyAmount(catalog);
  if (catalogAmount == null || catalogAmount !== order.amountMinor) {
    return { applied: false, expiresAt: null, reason: catalogAmount == null ? "catalog" : "amount" };
  }
  if (existing && existing.status !== "ACTIVE" && existing.listPriceMinor !== order.amountMinor) {
    return { applied: false, expiresAt: null, reason: "amount" };
  }
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
  const expiresAt = addCommerceLicenseMonth(
    commerceRenewalBase(existing, now) ?? now,
  );
  const saved: CommerceSubscriptionRow = {
    id: existing?.id ?? randomUUID(),
    storeId: store.id,
    ownerUserId: store.ownerUserId,
    status: "ACTIVE",
    listPriceMinor: order.amountMinor,
    appliedMerchantOids: [...(existing?.appliedMerchantOids ?? []), order.merchantOid],
    expiresAt,
    trialEndsAt: existing?.trialEndsAt ?? null,
    currentPeriodEnd: expiresAt,
    cancelAtPeriodEnd: false,
    paytrUtoken: existing?.paytrUtoken ?? "",
    paytrCtoken: existing?.paytrCtoken ?? "",
    dunningAttempts: 0,
    lastDunningAt: null,
    trialPending: false,
    trialQuestionsUsed: existing?.trialQuestionsUsed ?? 0,
    trialOptimizationsUsed: existing?.trialOptimizationsUsed ?? 0,
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
