import "server-only";

import {
  JUNIOR_CHECKOUT_PAYTR_MESSAGE,
  JUNIOR_CHECKOUT_REFUSED_MESSAGE,
  type JuniorCheckoutOrderDraft,
  type JuniorCheckoutPlaceResult,
} from "@/lib/junior/checkout";
import { JUNIOR_PAYTR_BASKET_NAME } from "@/lib/junior/paytr";
import {
  fulfillJuniorLicenseFromClearedOrder,
  JUNIOR_LICENSE_ORDER_PURPOSE,
  juniorLicenseMerchantOid,
} from "@/lib/junior/paytr-license-bridge";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { persistCheckoutBilling } from "@/lib/kernel/identity/billing-info-write";
import { createPrismaBillingInfoStore } from "@/lib/kernel/identity/prisma-billing-info-store";
import { paytrUserFromBilling } from "@/lib/kernel/identity/billing-info";
import { getPrisma } from "@/lib/kernel/db";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { failPaymentOrder } from "@/lib/kernel/payments/clearing";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import { paytrPaymentProvider } from "@/lib/kernel/payments/paytr/adapter";
import {
  buildPaytrMerchantBrowserReturnUrl,
  isPaytrProductionSafetyError,
  resolvePaytrMerchantAppOrigin,
} from "@/lib/kernel/payments/paytr/checkout";
import { tryGetPaytrIframeUrl } from "@/lib/kernel/payments/paytr/iframe-embed";
import { createPrismaPaymentOrderStore } from "@/lib/kernel/payments/prisma-order-store";
import { logEvent } from "@/lib/kernel/observability/log";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

function toSnapshot(order: {
  id: string;
  userId: string;
  merchantOid: string;
  amountMinor: number;
  currencyCode: string;
  status: "PENDING" | "PAID" | "FAILED" | "CLEARED";
  createdAt: Date;
  purpose: string;
  consentVersion: string | null;
  distanceContractAccepted: boolean | null;
  digitalImmediatePerformanceAccepted: boolean | null;
}): PaymentOrderSnapshot {
  return {
    id: order.id,
    userId: order.userId,
    merchantOid: order.merchantOid,
    amountMinor: order.amountMinor,
    currencyCode: order.currencyCode === "TRY" ? "TRY" : "TRY",
    status: order.status,
    createdAt: order.createdAt,
    purpose: order.purpose,
    consentVersion: order.consentVersion,
    distanceContractAccepted: order.distanceContractAccepted,
    digitalImmediatePerformanceAccepted: order.digitalImmediatePerformanceAccepted,
  };
}

async function failQuiet(merchantOid: string): Promise<void> {
  try {
    await failPaymentOrder(createPrismaPaymentOrderStore(), merchantOid);
  } catch (error) {
    logEvent({
      level: "warn",
      event: "junior.checkout.fail_order",
      merchantOid,
      errorName: error instanceof Error ? error.name : "unknown",
    });
  }
}

/**
 * `junior-license:yearly` siparişini kurar ve PayTR get-token çağırır.
 * Onay kanıtı sipariş satırına yazılır. Abonelik burada açılmaz.
 * CLEARED tekrarında köprü aynı sipariş numarasını ikinci kez uzatmaz.
 */
export async function placeJuniorPaytrOrder(
  draft: JuniorCheckoutOrderDraft,
): Promise<JuniorCheckoutPlaceResult> {
  await persistCheckoutBilling(createPrismaBillingInfoStore(), draft.userId, draft.billing);
  const merchantOid = juniorLicenseMerchantOid(draft.userId, draft.idempotencyKey);
  const prisma = getPrisma();
  let order = await prisma.paymentOrder.findUnique({ where: { merchantOid } });
  if (order && order.userId !== draft.userId) {
    return { ok: false, status: 409, error: "Bu ödeme anahtarı başka bir hesaba ait." };
  }
  if (order && order.amountMinor !== draft.amountMinor) {
    return { ok: false, status: 409, error: "Aynı ödeme anahtarı farklı tutarla kullanılamaz." };
  }
  if (order && order.purpose !== JUNIOR_LICENSE_ORDER_PURPOSE) {
    return { ok: false, status: 409, error: "Bu ödeme anahtarı başka bir işe bağlı." };
  }
  if (order?.status === "FAILED") {
    return { ok: false, status: 409, error: "Bu ödeme denemesi kapandı. Sayfayı yenileyip yeniden dene." };
  }
  if (order?.status === "PAID") {
    return {
      ok: false,
      status: 503,
      error: "Ödeme alındı. Paket, banka bildirimi kapanınca açılır.",
    };
  }
  if (order?.status === "CLEARED") {
    if (order.currencyCode !== "TRY") {
      return { ok: false, status: 503, error: JUNIOR_CHECKOUT_PAYTR_MESSAGE };
    }
    const fulfilled = await fulfillJuniorLicenseFromClearedOrder(
      createPrismaJuniorStore(),
      toSnapshot({ ...order, status: "CLEARED", currencyCode: "TRY" }),
    );
    return {
      ok: true,
      kind: "settled",
      merchantOid: order.merchantOid,
      expiresAt: fulfilled.expiresAt,
    };
  }

  if (!order) {
    try {
      order = await prisma.paymentOrder.create({
        data: {
          userId: draft.userId,
          provider: "paytr",
          merchantOid,
          purpose: JUNIOR_LICENSE_ORDER_PURPOSE,
          amountMinor: draft.amountMinor,
          currencyCode: SETTLEMENT_CURRENCY,
          status: "PENDING",
          consentVersion: draft.consent.consentVersion,
          distanceContractAccepted: draft.consent.distanceContractAccepted,
          digitalImmediatePerformanceAccepted: draft.consent.digitalImmediatePerformanceAccepted,
        },
      });
    } catch (error) {
      if (!isUniqueViolation(error)) {
        logEvent({
          level: "error",
          event: "junior.checkout.order_insert",
          userId: draft.userId,
          merchantOid,
          errorName: error instanceof Error ? error.name : "unknown",
        });
        return { ok: false, status: 503, error: JUNIOR_CHECKOUT_PAYTR_MESSAGE };
      }
      order = await prisma.paymentOrder.findUnique({ where: { merchantOid } });
    }
  }
  if (!order || order.userId !== draft.userId) {
    return { ok: false, status: 503, error: JUNIOR_CHECKOUT_PAYTR_MESSAGE };
  }

  const paytrUser = paytrUserFromBilling(draft.billing);
  const origin = resolvePaytrMerchantAppOrigin();
  const returnUrl = buildPaytrMerchantBrowserReturnUrl(origin);
  try {
    const checkout = await paytrPaymentProvider.beginCheckout({
      merchantOid,
      userIp: draft.userIp,
      email: draft.email,
      paymentAmountMinor: draft.amountMinor,
      currencyCode: SETTLEMENT_CURRENCY,
      merchantOkUrl: returnUrl,
      merchantFailUrl: returnUrl,
      userBasket: [
        { name: JUNIOR_PAYTR_BASKET_NAME, amountMinor: toPositiveAmountMinor(draft.amountMinor), quantity: 1 },
      ],
      userName: paytrUser.userName,
      userAddress: paytrUser.userAddress,
      userPhone: paytrUser.userPhone,
    });
    if (!checkout.ok || checkout.mockCheckout) {
      logEvent({
        level: "warn",
        event: "junior.checkout.token_failed",
        userId: draft.userId,
        merchantOid,
        reason: checkout.ok ? "mock" : checkout.reason,
      });
      await failQuiet(merchantOid);
      const status = !checkout.ok && (checkout.reason === "invalid_user" || checkout.reason === "invalid_amount")
        ? 400
        : 503;
      const error =
        !checkout.ok && (checkout.reason === "invalid_user" || checkout.reason === "invalid_amount")
          ? checkout.message
          : JUNIOR_CHECKOUT_PAYTR_MESSAGE;
      return { ok: false, status, error };
    }
    const iframeUrl = tryGetPaytrIframeUrl(checkout.token) ?? tryGetPaytrIframeUrl(checkout.iframeUrl ?? "");
    if (!iframeUrl) {
      await failQuiet(merchantOid);
      return { ok: false, status: 503, error: JUNIOR_CHECKOUT_PAYTR_MESSAGE };
    }
    logEvent({
      level: "info",
      event: "junior.checkout.pending",
      userId: draft.userId,
      merchantOid,
      amountMinor: draft.amountMinor,
      purpose: JUNIOR_LICENSE_ORDER_PURPOSE,
    });
    return { ok: true, kind: "iframe", merchantOid, iframeUrl };
  } catch (error) {
    logEvent({
      level: "error",
      event: "junior.checkout.token_threw",
      userId: draft.userId,
      merchantOid,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    await failQuiet(merchantOid);
    if (isPaytrProductionSafetyError(error)) {
      return { ok: false, status: 503, error: JUNIOR_CHECKOUT_REFUSED_MESSAGE };
    }
    return { ok: false, status: 503, error: JUNIOR_CHECKOUT_PAYTR_MESSAGE };
  }
}
