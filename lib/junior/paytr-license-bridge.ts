import "server-only";

import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import { logEvent } from "@/lib/kernel/observability/log";
import { JUNIOR_INVOICE_WITHHELD } from "@/lib/junior/invoice-seal";
import {
  JUNIOR_ELECTIVE_QUOTA,
  JUNIOR_GRADE_SWITCH_RIGHTS,
  JUNIOR_PLAN_CODE,
} from "@/lib/junior/limits";
import { JUNIOR_POS_PROVIDER, juniorPlanExpiry } from "@/lib/junior/plan";
import type { JuniorStore } from "@/lib/junior/ports";

/** PayTR sipariş niyeti. Düz cüzdan yüklemesi paket açmaz. */
export const JUNIOR_LICENSE_ORDER_PURPOSE = "junior-license:yearly" as const;

export function juniorLicenseOrderPurpose(): typeof JUNIOR_LICENSE_ORDER_PURPOSE {
  return JUNIOR_LICENSE_ORDER_PURPOSE;
}

export function isJuniorLicenseOrder(purpose: string | undefined): boolean {
  return purpose === JUNIOR_LICENSE_ORDER_PURPOSE;
}

/** Aynı kullanıcı ve aynı idempotency anahtarı aynı sipariş numarasını üretir. */
export function juniorLicenseMerchantOid(userId: string, idempotencyKey: string): string {
  const digest = sha256Hex(`junior-license:${userId}:${idempotencyKey}`).slice(0, 24).toUpperCase();
  return `JR${digest}`;
}

export type JuniorLicenseFulfillResult = {
  applied: boolean;
  expiresAt: string | null;
  reason: "not_junior" | "not_cleared" | "currency" | "amount" | "settled" | "already_settled" | "extended";
};

function yearlyExpiry(existingExpiresAt: Date | null, now: Date): Date {
  if (existingExpiresAt && existingExpiresAt.getTime() > now.getTime()) {
    return juniorPlanExpiry(existingExpiresAt);
  }
  return juniorPlanExpiry(now);
}

/**
 * CLEARED `junior-license:yearly` siparişi yıllık paketi yazar.
 * Aynı merchant_oid ikinci kez süreyi uzatmaz.
 * Yeni sipariş, bitmemiş sürenin üstüne bir yıl ekler.
 * TCKN, telefon ve adres siparişte yoktur; satıra düz kimlik yazılmaz.
 */
export async function fulfillJuniorLicenseFromClearedOrder(
  store: JuniorStore,
  order: PaymentOrderSnapshot,
  now: Date = new Date(),
): Promise<JuniorLicenseFulfillResult> {
  if (!isJuniorLicenseOrder(order.purpose)) {
    return { applied: false, expiresAt: null, reason: "not_junior" };
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

  const existing = await store.getSubscription(order.userId);
  if (existing?.appliedMerchantOids.includes(order.merchantOid)) {
    logEvent({
      level: "info",
      event: "junior.license.replay",
      userId: order.userId,
      merchantOid: order.merchantOid,
      orderId: order.id,
      amountMinor: order.amountMinor,
      purpose: JUNIOR_LICENSE_ORDER_PURPOSE,
      applied: false,
      reason: "already_settled",
    });
    return {
      applied: false,
      expiresAt: existing.expiresAt?.toISOString() ?? null,
      reason: "already_settled",
    };
  }

  const expiresAt = yearlyExpiry(existing?.status === "ACTIVE" ? existing.expiresAt : null, now);
  const saved = await store.saveActiveSubscription({
    userId: order.userId,
    status: "ACTIVE",
    planCode: JUNIOR_PLAN_CODE,
    listPriceMinor: order.amountMinor,
    currencyCode: "TRY",
    provider: JUNIOR_POS_PROVIDER,
    providerRef: order.merchantOid,
    cardLast4: "0000",
    invoiceName: existing?.invoiceName ?? "Veli",
    invoiceTckn: existing?.invoiceTckn ?? JUNIOR_INVOICE_WITHHELD,
    invoicePhone: existing?.invoicePhone ?? JUNIOR_INVOICE_WITHHELD,
    invoiceAddress: existing?.invoiceAddress ?? JUNIOR_INVOICE_WITHHELD,
    appliedMerchantOids: [...(existing?.appliedMerchantOids ?? []), order.merchantOid],
    electiveQuota: JUNIOR_ELECTIVE_QUOTA,
    gradeSwitchRights: existing?.gradeSwitchRights ?? JUNIOR_GRADE_SWITCH_RIGHTS,
    activatedAt: existing?.activatedAt ?? now,
    expiresAt,
  });
  const extended = Boolean(existing?.status === "ACTIVE");
  logEvent({
    level: "info",
    event: "junior.license.fulfilled",
    userId: order.userId,
    merchantOid: order.merchantOid,
    orderId: order.id,
    amountMinor: order.amountMinor,
    purpose: JUNIOR_LICENSE_ORDER_PURPOSE,
    applied: true,
    reason: extended ? "extended" : "settled",
  });
  return {
    applied: true,
    expiresAt: saved.expiresAt?.toISOString() ?? null,
    reason: extended ? "extended" : "settled",
  };
}
