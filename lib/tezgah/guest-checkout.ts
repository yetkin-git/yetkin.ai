import "server-only";

import { randomBytes } from "node:crypto";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { getPrisma } from "@/lib/kernel/db";
import {
  normalizeBillingInput,
  paytrUserFromBilling,
  type CheckoutBillingFormState,
  type CheckoutBillingInfo,
} from "@/lib/kernel/identity/billing-info";
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
import { readTezgahCatalogAmount, TEZGAH_PRO_ORDER_PURPOSE, TEZGAH_PRO_UNIT } from "@/lib/tezgah/paid-lane";

/**
 * Faz 3 / §4.1 — **misafir ödeme** (Tezgâh Pro, 590 TL/ay).
 *
 * Neden: ücretsiz Tezgâh zaten kayıtsız üretim yapıyor; kota duvarında "kayıt ol"
 * adımı zorunluydu. Ödeme niyeti en yüksek noktada 4 adım (kayıt → doğrulama →
 * giriş → satın alma) yerine **1 adım** kalır.
 *
 * Dürüstlük sınırları (kritik):
 *
 * 1. **Ödeme öncesi hesap açılmaz.** Supabase `signUp` çağrısı burada yok. Misafir
 *    siparişi `payment_orders.user_id = NULL` olarak durur; `guest_email` ve fatura
 *    künyesi satırda mühürlenir.
 * 2. **`appendLedgerEntry` sahipsiz CREDIT kabul etmez.** Bu yüzden webhook CLEARED
 *    olduğunda defter **yazılmaz**; para, sahiplik bağlanana kadar havuzda bekler.
 *    `settlePaytrWebhookSuccess` `awaitingClaim` döner ve defter kaydı
 *    `/api/auth/claim-order` içinde yazılır — aynı `wallet-top-up:{merchantOid}`
 *    anahtarıyla, böylece defter mutabakat invariantı bozulmaz.
 * 3. **Aynı e-posta ikinci kez misafir olamaz** (kayıtlı kullanıcı misafir ödemesi
 *    yapıp iki abonelik doğurmaz). Kayıtlı e-posta `409` ile üyeye yönlendirilir.
 *
 * Tutar istekten okunmaz; yalnız katalog satırından gelir (A1).
 */

const PAYTR_MESSAGE = "Ödeme penceresi açılmadı. Bir süre sonra yeniden dene.";

export const GUEST_EMAIL_REGISTERED =
  "Bu e-posta bir hesaba bağlı. Giriş yapıp Tezgâh Pro'yu oradan aç; misafir ödeme yalnız yeni e-postalar içindir.";

export type TezgahGuestCheckoutResult =
  | { ok: true; kind: "iframe"; merchantOid: string; iframeUrl: string }
  | { ok: false; status: 400 | 409 | 422 | 503; error: string };

export type TezgahGuestCheckoutInput = {
  email: string;
  billing: CheckoutBillingInfo;
  idempotencyKey: string;
  userIp: string;
  consent: CheckoutLegalConsent;
  now?: Date;
};

export function normalizeGuestEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 320) {
    return null;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) ? email : null;
}

/** Misafir siparişi için deterministik merchantOid. Aynı anahtar aynı satırı açar. */
export function tezgahGuestMerchantOid(email: string, idempotencyKey: string): string {
  const digest = sha256Hex(`tezgah:guest:${email}:${idempotencyKey}`).slice(0, 24).toUpperCase();
  return `TZG${digest}`;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

export function parseGuestBilling(raw: unknown): CheckoutBillingInfo | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const parsed = normalizeBillingInput(raw as CheckoutBillingFormState);
  return parsed.ok ? parsed.billing : null;
}

/**
 * Misafir sipariş satırı + PayTR iframe.
 *
 * Sıra: e-posta ↔ mevcut hesap kontrolü → katalog tutarı → satır → get-token → iframe.
 * Herhangi bir adım düşerse satır FAILED kapanır; CREDIT yazılmaz, kullanıcıya
 * "ödemeyi aldık" denmez.
 */
export async function placeTezgahGuestCheckout(
  input: TezgahGuestCheckoutInput,
): Promise<TezgahGuestCheckoutResult> {
  void input.now;
  const email = normalizeGuestEmail(input.email);
  if (!email) {
    return { ok: false, status: 400, error: "Geçerli bir e-posta adresi gerekli." };
  }
  const amountMinor = await readTezgahCatalogAmount(TEZGAH_PRO_UNIT);
  if (amountMinor == null) {
    return { ok: false, status: 422, error: "Katalogda aktif fiyat yok." };
  }
  const prisma = getPrisma();
  // Kayıtlı e-posta misafir ödemesi yapamaz: iki abonelik doğmaz.
  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) {
    return { ok: false, status: 409, error: GUEST_EMAIL_REGISTERED };
  }

  const merchantOid = tezgahGuestMerchantOid(email, input.idempotencyKey);
  let order = await prisma.paymentOrder.findUnique({ where: { merchantOid } });
  if (order && order.guestEmail !== email) {
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
    return { ok: false, status: 409, error: "Bu ödeme zaten alındı. E-postandaki bağlantıyı aç." };
  }

  if (!order) {
    try {
      order = await prisma.paymentOrder.create({
        data: {
          userId: null,
          provider: "paytr",
          merchantOid,
          purpose: TEZGAH_PRO_ORDER_PURPOSE,
          ...(classifyPaymentOrderPurpose(TEZGAH_PRO_ORDER_PURPOSE)
            ? { orderPurpose: classifyPaymentOrderPurpose(TEZGAH_PRO_ORDER_PURPOSE)! }
            : {}),
          amountMinor,
          currencyCode: SETTLEMENT_CURRENCY,
          status: "PENDING",
          consentVersion: input.consent.consentVersion,
          distanceContractAccepted: input.consent.distanceContractAccepted,
          digitalImmediatePerformanceAccepted: input.consent.digitalImmediatePerformanceAccepted,
          guestEmail: email,
          guestBillingJson: JSON.stringify(input.billing),
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
    assertPaytrLiveUserIp(input.userIp, "tezgah.guest-checkout");
  } catch {
    return { ok: false, status: 400, error: "Ödeme adresi doğrulanamadı." };
  }

  const paytrUser = paytrUserFromBilling(input.billing);
  const returnUrl = buildPaytrMerchantBrowserReturnUrl(
    resolvePaytrMerchantAppOrigin(),
    "tezgah",
    merchantOid,
  );
  try {
    const checkout = await paytrPaymentProvider.beginCheckout({
      merchantOid,
      userIp: input.userIp,
      email,
      paymentAmountMinor: amountMinor,
      currencyCode: SETTLEMENT_CURRENCY,
      merchantOkUrl: returnUrl,
      merchantFailUrl: returnUrl,
      userBasket: [
        {
          name: "Tezgâh Pro aylık abonelik",
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
      event: "tezgah.guest.checkout.pending",
      merchantOid,
      amountMinor,
      purpose: TEZGAH_PRO_ORDER_PURPOSE,
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

/**
 * Claim token üretimi. Kriptografik rastgele (32 bayt → 43 karakter base64url).
 * Tek kullanımlık, süreli, tekilliği DB'de (`claim_token` unique) mühürlü.
 */
export function createClaimToken(): string {
  return randomBytes(32).toString("base64url");
}

export const CLAIM_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;
