import "server-only";

import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { getPrisma } from "@/lib/kernel/db";
import { paytrUserFromBilling, type CheckoutBillingInfo } from "@/lib/kernel/identity/billing-info";
import { readBillingInfo } from "@/lib/kernel/identity/billing-info-write";
import { createPrismaBillingInfoStore } from "@/lib/kernel/identity/prisma-billing-info-store";
import type { CheckoutLegalConsent } from "@/lib/kernel/legal/checkout-consent";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { failPaymentOrder } from "@/lib/kernel/payments/clearing";
import { classifyPaymentOrderPurpose } from "@/lib/kernel/payments/order-purpose";
import { paytrPaymentProvider } from "@/lib/kernel/payments/paytr/adapter";
import {
  assertPaytrLiveUserIp,
  buildPaytrMerchantBrowserReturnUrl,
  isPaytrProductionSafetyError,
  resolvePaytrMerchantAppOrigin,
} from "@/lib/kernel/payments/paytr/checkout";
import { tryGetPaytrIframeUrl } from "@/lib/kernel/payments/paytr/iframe-embed";
import { createPrismaPaymentOrderStore } from "@/lib/kernel/payments/prisma-order-store";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  fulfillTezgahOrder,
  readTezgahCatalogAmount,
  TEZGAH_CREDIT_ORDER_PURPOSE,
  TEZGAH_CREDIT_UNIT,
  TEZGAH_PRO_ORDER_PURPOSE,
  TEZGAH_PRO_UNIT,
} from "@/lib/tezgah/paid-lane";

const PAYTR_MESSAGE = "Ödeme penceresi açılmadı. Bir süre sonra yeniden dene.";

export type TezgahCheckoutKind = "pro" | "credit-pack";

export type TezgahCheckoutResult =
  | { ok: true; kind: "iframe"; merchantOid: string; iframeUrl: string }
  | { ok: true; kind: "settled"; merchantOid: string }
  | { ok: false; status: 400 | 409 | 422 | 503; error: string };

export function tezgahMerchantOid(kind: TezgahCheckoutKind, userId: string, idempotencyKey: string): string {
  const mark = kind === "pro" ? "P" : "C";
  const digest = sha256Hex(`tezgah:${kind}:${userId}:${idempotencyKey}`).slice(0, 24).toUpperCase();
  return `TZ${mark}${digest}`;
}

function purposeFor(kind: TezgahCheckoutKind): string {
  return kind === "pro" ? TEZGAH_PRO_ORDER_PURPOSE : TEZGAH_CREDIT_ORDER_PURPOSE;
}

function unitFor(kind: TezgahCheckoutKind): string {
  return kind === "pro" ? TEZGAH_PRO_UNIT : TEZGAH_CREDIT_UNIT;
}

function basketName(kind: TezgahCheckoutKind): string {
  return kind === "pro" ? "Tezgâh Pro aylık abonelik" : "Tezgâh 10 üretim kredisi";
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2002";
}

/**
 * Katalog satırı yoksa tahsilat başlamaz. Tutar bu fonksiyonda sabit değildir.
 */
export async function placeTezgahCheckout(input: {
  userId: string;
  email: string;
  kind: TezgahCheckoutKind;
  idempotencyKey: string;
  userIp: string;
  consent: CheckoutLegalConsent;
  billing?: CheckoutBillingInfo | null;
  now?: Date;
}): Promise<TezgahCheckoutResult> {
  const now = input.now ?? new Date();
  const amountMinor = await readTezgahCatalogAmount(unitFor(input.kind));
  if (amountMinor == null) {
    return { ok: false, status: 422, error: "Katalogda aktif fiyat yok." };
  }
  const purpose = purposeFor(input.kind);
  const merchantOid = tezgahMerchantOid(input.kind, input.userId, input.idempotencyKey);
  const billing = input.billing === undefined ? await readBillingInfo(createPrismaBillingInfoStore(), input.userId) : input.billing;
  if (!billing) {
    return { ok: false, status: 422, error: "Fatura künyesi gerekli." };
  }
  const prisma = getPrisma();
  let order = await prisma.paymentOrder.findUnique({ where: { merchantOid } });
  if (order && (order.userId !== input.userId || order.purpose !== purpose)) {
    return { ok: false, status: 409, error: "Bu ödeme anahtarı başka bir işe bağlı." };
  }
  if (order && order.amountMinor !== amountMinor) {
    return { ok: false, status: 409, error: "Aynı ödeme anahtarı farklı tutarla kullanılamaz." };
  }
  if (order?.status === "FAILED") {
    return { ok: false, status: 409, error: "Bu ödeme denemesi kapandı. Sayfayı yenileyip yeniden dene." };
  }
  if (order?.status === "CLEARED") {
    await fulfillTezgahOrder({
      userId: order.userId,
      merchantOid,
      purpose,
      amountMinor: order.amountMinor,
      currencyCode: "TRY",
      status: "CLEARED",
      now,
    });
    return { ok: true, kind: "settled", merchantOid };
  }
  if (!order) {
    try {
      order = await prisma.paymentOrder.create({
        data: {
          userId: input.userId,
          provider: "paytr",
          merchantOid,
          purpose,
          ...(classifyPaymentOrderPurpose(purpose) ? { orderPurpose: classifyPaymentOrderPurpose(purpose)! } : {}),
          amountMinor,
          currencyCode: SETTLEMENT_CURRENCY,
          status: "PENDING",
          consentVersion: input.consent.consentVersion,
          distanceContractAccepted: input.consent.distanceContractAccepted,
          digitalImmediatePerformanceAccepted: input.consent.digitalImmediatePerformanceAccepted,
        },
      });
    } catch (error) {
      if (!isUniqueViolation(error)) {
        return { ok: false, status: 503, error: PAYTR_MESSAGE };
      }
      order = await prisma.paymentOrder.findUnique({ where: { merchantOid } });
    }
  }
  if (!order) {
    return { ok: false, status: 503, error: PAYTR_MESSAGE };
  }
  try {
    assertPaytrLiveUserIp(input.userIp, "tezgah.checkout");
  } catch {
    return { ok: false, status: 400, error: "Ödeme adresi doğrulanamadı." };
  }
  const paytrUser = paytrUserFromBilling(billing);
  // CRO: dönüş adresi satın alınan masayı taşır. Tezgâh Pro ve kredi paketi
  // `masa=tezgah` ile döner; cüzdan paneli kullanıcıyı doğru ekrana geçirir.
  const returnUrl = buildPaytrMerchantBrowserReturnUrl(
    resolvePaytrMerchantAppOrigin(),
    "tezgah",
    merchantOid,
  );
  try {
    const checkout = await paytrPaymentProvider.beginCheckout({
      merchantOid,
      userIp: input.userIp,
      email: input.email,
      paymentAmountMinor: amountMinor,
      currencyCode: SETTLEMENT_CURRENCY,
      merchantOkUrl: returnUrl,
      merchantFailUrl: returnUrl,
      userBasket: [{ name: basketName(input.kind), amountMinor: toPositiveAmountMinor(amountMinor), quantity: 1 }],
      userName: paytrUser.userName,
      userAddress: paytrUser.userAddress,
      userPhone: paytrUser.userPhone,
    });
    if (!checkout.ok || checkout.mockCheckout) {
      await failPaymentOrder(createPrismaPaymentOrderStore(), merchantOid).catch(() => undefined);
      return { ok: false, status: 503, error: PAYTR_MESSAGE };
    }
    const iframeUrl = tryGetPaytrIframeUrl(checkout.token) ?? tryGetPaytrIframeUrl(checkout.iframeUrl ?? "");
    if (!iframeUrl) {
      await failPaymentOrder(createPrismaPaymentOrderStore(), merchantOid).catch(() => undefined);
      return { ok: false, status: 503, error: PAYTR_MESSAGE };
    }
    logEvent({
      level: "info",
      event: "tezgah.checkout.pending",
      userId: input.userId,
      merchantOid,
      amountMinor,
      purpose,
    });
    return { ok: true, kind: "iframe", merchantOid, iframeUrl };
  } catch (error) {
    await failPaymentOrder(createPrismaPaymentOrderStore(), merchantOid).catch(() => undefined);
    if (isPaytrProductionSafetyError(error)) {
      return { ok: false, status: 503, error: PAYTR_MESSAGE };
    }
    return { ok: false, status: 503, error: PAYTR_MESSAGE };
  }
}
