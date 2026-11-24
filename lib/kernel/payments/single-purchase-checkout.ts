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
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { logEvent } from "@/lib/kernel/observability/log";

/**
 * Tek bir katalog satırının PayTR tahsilatı.
 *
 * `placeTezgahCheckout` deseninin **çekirdek** hâli: tutar istekten okunmaz, yalnız
 * aktif `PriceCatalogEntry.amountMinor` satırından gelir. Satır yoksa 422 döner ve
 * tahsilat **başlamaz** (fiyat uydurulmaz — A1).
 *
 * Neden çekirdek: Faz 3'te ikinci bir dikey (kariyer) kendi ürününü satıyor. O dikeyin
 * `lib/tezgah/checkout` dosyasını import etmesi B1 import duvarına (`module.engine`)
 * takılırdı. Bu yüzden ortak tahsilat çekirdekte durur; dikey yalnız **kendi**
 * purpose/unit/basket adını verir. Dikey→dikey bağımlılık doğmaz.
 *
 * Sıra (değişmez): sipariş satırı → PSP get-token → iframe. Tutar uyuşmazlığında,
 * anahtar çakışmasında veya PSP hatasında sipariş FAILED kapanır; CREDIT yazılmaz.
 * CLEARED olduğunda ürün kancası (`*-license-hook`) çalışır, burada değil.
 */

const PAYTR_MESSAGE = "Ödeme penceresi açılmadı. Bir süre sonra yeniden dene.";

export type SinglePurchaseInput = {
  userId: string;
  email: string;
  /** Katalog kimliği. `career` + `yetkincv-exam` gibi. */
  moduleKey: string;
  unitKey: string;
  /** `PaymentOrder.purpose` dizgisi. Ürün kancası bu dizgiyi okur. */
  purpose: string;
  /** PayTR sepet satırı. Kullanıcıya görünen ürün adı. */
  basketName: string;
  /** Dönüş masası (`?masa=`). Tanınmayan değer cüzdana düşer. */
  returnDesk: string;
  idempotencyKey: string;
  userIp: string;
  consent: CheckoutLegalConsent;
  billing?: CheckoutBillingInfo | null;
  now?: Date;
};

export type SinglePurchaseResult =
  | { ok: true; kind: "iframe"; merchantOid: string; iframeUrl: string }
  | { ok: true; kind: "settled"; merchantOid: string }
  | { ok: false; status: 400 | 409 | 422 | 503; error: string };

export function singlePurchaseMerchantOid(input: {
  prefix: string;
  userId: string;
  moduleKey: string;
  unitKey: string;
  idempotencyKey: string;
}): string {
  const digest = sha256Hex(
    `${input.prefix}:${input.moduleKey}:${input.unitKey}:${input.userId}:${input.idempotencyKey}`,
  )
    .slice(0, 24)
    .toUpperCase();
  return `${input.prefix}${digest}`;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

async function readActiveCatalogAmount(moduleKey: string, unitKey: string): Promise<number | null> {
  try {
    const entry = await createPrismaPriceCatalogStore().findActiveEntry(moduleKey, unitKey);
    if (
      !entry ||
      entry.unitType !== "MINOR" ||
      entry.currencyCode !== "TRY" ||
      !entry.isActive ||
      entry.amountMinor <= 0
    ) {
      return null;
    }
    return entry.amountMinor;
  } catch {
    return null;
  }
}

export async function placeSingleCatalogPurchase(
  input: SinglePurchaseInput,
): Promise<SinglePurchaseResult> {
  void input.now;
  const amountMinor = await readActiveCatalogAmount(input.moduleKey, input.unitKey);
  if (amountMinor == null) {
    return { ok: false, status: 422, error: "Katalogda aktif fiyat yok." };
  }
  const merchantOid = singlePurchaseMerchantOid({
    prefix: "SP",
    userId: input.userId,
    moduleKey: input.moduleKey,
    unitKey: input.unitKey,
    idempotencyKey: input.idempotencyKey,
  });
  const billing =
    input.billing === undefined
      ? await readBillingInfo(createPrismaBillingInfoStore(), input.userId)
      : input.billing;
  if (!billing) {
    return { ok: false, status: 422, error: "Fatura künyesi gerekli." };
  }

  const prisma = getPrisma();
  let order = await prisma.paymentOrder.findUnique({ where: { merchantOid } });
  if (order && (order.userId !== input.userId || order.purpose !== input.purpose)) {
    return { ok: false, status: 409, error: "Bu ödeme anahtarı başka bir işe bağlı." };
  }
  if (order && order.amountMinor !== amountMinor) {
    return { ok: false, status: 409, error: "Aynı ödeme anahtarı farklı tutarla kullanılamaz." };
  }
  if (order?.status === "FAILED") {
    return {
      ok: false,
      status: 409,
      error: "Bu ödeme denemesi kapandı. Sayfayı yenileyip yeniden dene.",
    };
  }
  if (order?.status === "CLEARED") {
    // Kapanmış satır: ürün kancası ikinci kez çalışır (idempotent), yeniden tahsilat yok.
    return { ok: true, kind: "settled", merchantOid };
  }

  if (!order) {
    try {
      order = await prisma.paymentOrder.create({
        data: {
          userId: input.userId,
          provider: "paytr",
          merchantOid,
          purpose: input.purpose,
          ...(classifyPaymentOrderPurpose(input.purpose)
            ? { orderPurpose: classifyPaymentOrderPurpose(input.purpose)! }
            : {}),
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
    assertPaytrLiveUserIp(input.userIp, "single-purchase.checkout");
  } catch {
    return { ok: false, status: 400, error: "Ödeme adresi doğrulanamadı." };
  }

  const paytrUser = paytrUserFromBilling(billing);
  const returnUrl = buildPaytrMerchantBrowserReturnUrl(
    resolvePaytrMerchantAppOrigin(),
    input.returnDesk,
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
      userBasket: [
        {
          name: input.basketName,
          amountMinor: toPositiveAmountMinor(amountMinor),
          quantity: 1,
        },
      ],
      userName: paytrUser.userName,
      userAddress: paytrUser.userAddress,
      userPhone: paytrUser.userPhone,
    });
    if (!checkout.ok || checkout.mockCheckout) {
      await failPaymentOrder(createPrismaPaymentOrderStore(), merchantOid).catch(() => undefined);
      return { ok: false, status: 503, error: PAYTR_MESSAGE };
    }
    const iframeUrl =
      tryGetPaytrIframeUrl(checkout.token) ?? tryGetPaytrIframeUrl(checkout.iframeUrl ?? "");
    if (!iframeUrl) {
      await failPaymentOrder(createPrismaPaymentOrderStore(), merchantOid).catch(() => undefined);
      return { ok: false, status: 503, error: PAYTR_MESSAGE };
    }
    logEvent({
      level: "info",
      event: "catalog.purchase.pending",
      userId: input.userId,
      merchantOid,
      amountMinor,
      purpose: input.purpose,
      applied: true,
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
