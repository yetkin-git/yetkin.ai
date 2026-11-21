import "server-only";

import { randomUUID } from "node:crypto";
import {
  fulfillCommerceLicenseFromClearedOrder,
  readCommerceMonthlyAmount,
  COMMERCE_LICENSE_ORDER_PURPOSE,
} from "@/lib/commerce/paytr-license-bridge";
import { createPrismaCommerceRepository } from "@/lib/commerce/prisma-repository";
import type { CommerceRepository } from "@/lib/commerce/repository";
import {
  commerceLicenseMerchantOid,
  type CommerceSubscriptionStore,
} from "@/lib/commerce/subscription";
import {
  COMMERCE_TRIAL_KEY_REQUIRED_MESSAGE,
  releaseCommerceTrialReservation,
  reserveCommerceTrial,
  sealCommerceTrialConsumption,
  trialMerchantKey,
} from "@/lib/commerce/trial-reservation";
import {
  COMMERCE_TRIAL_VERIFY_MINOR,
} from "@/lib/commerce/subscription-lifecycle";
import { classifyPaymentOrderPurpose, PAYMENT_ORDER_PURPOSE } from "@/lib/kernel/payments/order-purpose";
import { createPrismaCommerceSubscriptionStore } from "@/lib/commerce/subscription-prisma";
import { createPrismaLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { checkoutLegalConsentSchema, type CheckoutLegalConsent } from "@/lib/kernel/legal/checkout-consent";
import { paytrUserFromBilling, type CheckoutBillingInfo } from "@/lib/kernel/identity/billing-info";
import { readBillingInfo } from "@/lib/kernel/identity/billing-info-write";
import { createPrismaBillingInfoStore } from "@/lib/kernel/identity/prisma-billing-info-store";
import { getPrisma } from "@/lib/kernel/db";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { failPaymentOrder, type PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
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

const PAYTR_MESSAGE = "Ödeme penceresi açılmadı. Bir süre sonra yeniden dene.";
const BASKET_NAME = "Yetkin Commerce aylık lisans";

export type CommerceSubscriptionPlaceResult =
  | { ok: true; kind: "iframe"; merchantOid: string; iframeUrl: string }
  | { ok: true; kind: "settled"; merchantOid: string; expiresAt: string | null }
  | { ok: false; status: 400 | 404 | 409 | 422 | 503; error: string };

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2002";
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
    currencyCode: "TRY",
    status: order.status,
    createdAt: order.createdAt,
    purpose: order.purpose,
    consentVersion: order.consentVersion,
    distanceContractAccepted: order.distanceContractAccepted,
    digitalImmediatePerformanceAccepted: order.digitalImmediatePerformanceAccepted,
  };
}

async function rememberQuote(
  subscriptions: CommerceSubscriptionStore,
  input: {
    storeId: string;
    ownerUserId: string;
    listPriceMinor: number;
    now: Date;
    trialPending: boolean;
  },
): Promise<void> {
  const existing = await subscriptions.findByStoreId(input.storeId);
  if (existing?.status === "ACTIVE" || existing?.status === "TRIALING" || existing?.status === "PAST_DUE") {
    return;
  }
  await subscriptions.save({
    id: existing?.id ?? randomUUID(),
    storeId: input.storeId,
    ownerUserId: input.ownerUserId,
    status: "PENDING",
    listPriceMinor: input.listPriceMinor,
    appliedMerchantOids: existing?.appliedMerchantOids ?? [],
    expiresAt: null,
    trialPending: input.trialPending,
    paytrUtoken: existing?.paytrUtoken ?? "",
    paytrCtoken: existing?.paytrCtoken ?? "",
    createdAt: existing?.createdAt ?? input.now,
    updatedAt: input.now,
  });
}

/**
 * Katalogdaki `commerce / monthly` tutarıyla PayTR siparişi açar.
 * Satır yoksa veya kapalıysa tahsilat başlamaz. Tutar bu fonksiyonda sabit değildir.
 */
export async function placeCommerceSubscriptionOrder(input: {
  commerce?: CommerceRepository;
  subscriptions?: CommerceSubscriptionStore;
  userId: string;
  email: string;
  storeId: string;
  idempotencyKey: string;
  userIp: string;
  consent: CheckoutLegalConsent;
  billing?: CheckoutBillingInfo | null;
  now?: Date;
}): Promise<CommerceSubscriptionPlaceResult> {
  const commerce = input.commerce ?? createPrismaCommerceRepository();
  const subscriptions = input.subscriptions ?? createPrismaCommerceSubscriptionStore();
  const now = input.now ?? new Date();
  const store = await commerce.findStoreForOwner(input.userId, input.storeId);
  if (!store) {
    return { ok: false, status: 404, error: "Kayıt bulunamadı." };
  }
  const catalogAmount = await readCommerceMonthlyAmount(createPrismaPriceCatalogStore());
  if (catalogAmount == null) {
    return { ok: false, status: 422, error: "Aylık tutar katalogda açık değil." };
  }
  const merchantOid = commerceLicenseMerchantOid(store.id, input.idempotencyKey);
  if (!merchantOid) {
    return { ok: false, status: 422, error: "Mağaza kimliği geçersiz." };
  }
  const billing = input.billing === undefined ? await readBillingInfo(createPrismaBillingInfoStore(), input.userId) : input.billing;
  if (!billing) {
    return { ok: false, status: 422, error: "Fatura künyesi gerekli." };
  }
  const merchantKey = trialMerchantKey(billing);
  const seated = await subscriptions.findByStoreId(store.id);
  const openSeat =
    seated?.status === "ACTIVE" || seated?.status === "TRIALING" || seated?.status === "PAST_DUE";
  const prisma = getPrisma();
  let order = await prisma.paymentOrder.findUnique({ where: { merchantOid } });
  if (order && (order.userId !== input.userId || order.purpose !== COMMERCE_LICENSE_ORDER_PURPOSE)) {
    return { ok: false, status: 409, error: "Bu ödeme anahtarı başka bir işe bağlı." };
  }
  if (order?.status === "FAILED") {
    return { ok: false, status: 409, error: "Bu ödeme denemesi kapandı. Sayfayı yenileyip yeniden dene." };
  }

  // Deneme kararı: sipariş önceden yazılmışsa tutarı ondan okunur; yeni siparişte hak
  // yalnız rezervasyon başarılıysa açılır. Rezervasyon artık TTL'lidir ve hata yolunda
  // serbest bırakılır; ödeme penceresini kapatan kullanıcı deneme hakkını yakmaz.
  let trial = false;
  let reservationKey: string | null = null;
  if (order) {
    trial = order.amountMinor === COMMERCE_TRIAL_VERIFY_MINOR;
  } else if (!openSeat) {
    if (!merchantKey) {
      // Sessizce tam fiyat çekmek yerine açık hata: deneme VKN/TCKN ister.
      return { ok: false, status: 422, error: COMMERCE_TRIAL_KEY_REQUIRED_MESSAGE };
    }
    const reservation = await reserveCommerceTrial(merchantKey, store.id, now);
    if (reservation.ok) {
      trial = true;
      reservationKey = merchantKey;
    } else if (reservation.kind === "no_key") {
      return { ok: false, status: 422, error: COMMERCE_TRIAL_KEY_REQUIRED_MESSAGE };
    } else if (reservation.kind === "held") {
      return {
        ok: false,
        status: 409,
        error: "Bu vergi kimliği için açık bir ödeme penceresi var. O pencereyi tamamla veya bir saat sonra yeniden dene.",
      };
    } else if (reservation.kind === "error") {
      return { ok: false, status: 503, error: PAYTR_MESSAGE };
    }
    // `consumed`: deneme hakkı gerçekten tüketilmiş; katalog tutarından devam edilir.
  }
  const amountMinor = order ? order.amountMinor : trial ? COMMERCE_TRIAL_VERIFY_MINOR : catalogAmount;
  if (order && order.amountMinor !== amountMinor) {
    return { ok: false, status: 409, error: "Aynı ödeme anahtarı farklı tutarla kullanılamaz." };
  }
  if (order?.status === "CLEARED") {
    // Tüketim mührü idempotent: webhook kaçmış olsa da hak kalıcı kalır.
    if (trial) {
      await sealCommerceTrialConsumption(merchantKey, store.id);
    }
    const fulfilled = await fulfillCommerceLicenseFromClearedOrder(
      commerce,
      subscriptions,
      createPrismaPriceCatalogStore(),
      toSnapshot({ ...order, status: "CLEARED", currencyCode: "TRY" }),
      createPrismaLedgerStore(),
      now,
    );
    return { ok: true, kind: "settled", merchantOid, expiresAt: fulfilled.expiresAt };
  }
  await rememberQuote(subscriptions, {
    storeId: store.id,
    ownerUserId: store.ownerUserId,
    listPriceMinor: catalogAmount,
    trialPending: trial,
    now,
  });
  if (!order) {
    try {
      order = await prisma.paymentOrder.create({
        data: {
          userId: input.userId,
          provider: "paytr",
          merchantOid,
          purpose: COMMERCE_LICENSE_ORDER_PURPOSE,
          orderPurpose: classifyPaymentOrderPurpose(COMMERCE_LICENSE_ORDER_PURPOSE) ?? PAYMENT_ORDER_PURPOSE.COMMERCE_LICENSE,
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
        await releaseCommerceTrialReservation(reservationKey, store.id, "order_create_failed");
        return { ok: false, status: 503, error: PAYTR_MESSAGE };
      }
      order = await prisma.paymentOrder.findUnique({ where: { merchantOid } });
    }
  }
  if (!order) {
    await releaseCommerceTrialReservation(reservationKey, store.id, "order_missing");
    return { ok: false, status: 503, error: PAYTR_MESSAGE };
  }
  try {
    assertPaytrLiveUserIp(input.userIp, "commerce.subscription");
  } catch {
    await releaseCommerceTrialReservation(reservationKey, store.id, "user_ip_rejected");
    return { ok: false, status: 400, error: "Ödeme adresi doğrulanamadı." };
  }
  const paytrUser = paytrUserFromBilling(billing);
  // CRO: e-ticaret lisansı dönüşü `masa=e-ticaret` taşır; kullanıcı panele iner.
  const returnUrl = buildPaytrMerchantBrowserReturnUrl(
    resolvePaytrMerchantAppOrigin(),
    "e-ticaret",
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
      userBasket: [{
        name: trial ? "Yetkin Commerce kart doğrulama" : BASKET_NAME,
        amountMinor: toPositiveAmountMinor(amountMinor),
        quantity: 1,
      }],
      userName: paytrUser.userName,
      userAddress: paytrUser.userAddress,
      userPhone: paytrUser.userPhone,
      storeCard: trial,
    });
    if (!checkout.ok || checkout.mockCheckout) {
      await failPaymentOrder(createPrismaPaymentOrderStore(), merchantOid).catch(() => undefined);
      await releaseCommerceTrialReservation(reservationKey, store.id, "iframe_not_opened");
      return { ok: false, status: 503, error: PAYTR_MESSAGE };
    }
    const iframeUrl = tryGetPaytrIframeUrl(checkout.token) ?? tryGetPaytrIframeUrl(checkout.iframeUrl ?? "");
    if (!iframeUrl) {
      await failPaymentOrder(createPrismaPaymentOrderStore(), merchantOid).catch(() => undefined);
      await releaseCommerceTrialReservation(reservationKey, store.id, "iframe_url_missing");
      return { ok: false, status: 503, error: PAYTR_MESSAGE };
    }
    logEvent({
      level: "info",
      event: "commerce.subscription.pending",
      userId: input.userId,
      merchantOid,
      amountMinor,
      purpose: COMMERCE_LICENSE_ORDER_PURPOSE,
    });
    return { ok: true, kind: "iframe", merchantOid, iframeUrl };
  } catch (error) {
    await failPaymentOrder(createPrismaPaymentOrderStore(), merchantOid).catch(() => undefined);
    await releaseCommerceTrialReservation(reservationKey, store.id, "checkout_threw");
    if (isPaytrProductionSafetyError(error)) {
      return { ok: false, status: 503, error: PAYTR_MESSAGE };
    }
    return { ok: false, status: 503, error: PAYTR_MESSAGE };
  }
}

export function parseCommerceSubscriptionConsent(raw: unknown): CheckoutLegalConsent | null {
  const record = raw != null && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
  const parsed = checkoutLegalConsentSchema.safeParse(record);
  return parsed.success ? parsed.data : null;
}
