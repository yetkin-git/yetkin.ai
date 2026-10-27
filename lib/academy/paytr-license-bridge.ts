import { lockAcademyCoursePrice, purchaseAcademyCourse, type AcademyEnginePorts } from "@/lib/academy/engine";
import { ensureAcademyProductionDiskProbe } from "@/lib/academy/production-seal-disk";
import { academyCourseSaleOpen, isAcademyLicenseSaleSlug } from "@/lib/academy/pilot-sku";
import {
  CHECKOUT_LEGAL_CONSENT_PAYLOAD,
  CHECKOUT_LEGAL_CONSENT_VERSION,
  type CheckoutLegalConsent,
} from "@/lib/kernel/legal/checkout-consent";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import { logEvent } from "@/lib/kernel/observability/log";

/** PayTR sipariş niyeti — düz cüzdan yüklemesinden ayrı. */
export const ACADEMY_LICENSE_ORDER_PURPOSE_PREFIX = "academy-license:" as const;

/**
 * Ödeme ÖNCESİ niyet üretimi. Satış kapısı burada (para çekilmeden önce) sorulur.
 * Bu fonksiyonun fail-closed davranışı K1 ile kaldırılmaz; kaldırılan,
 * tahsilat SONRASI köprüdeki ikinci kapı kontrolüdür.
 */
export function academyLicenseOrderPurpose(slug: string): string {
  if (!isAcademyLicenseSaleSlug(slug)) {
    throw new Error("Akademi lisans SKU'su geçersiz.");
  }
  ensureAcademyProductionDiskProbe();
  if (!academyCourseSaleOpen(slug)) {
    throw new Error("Kurs satışa kapalı.");
  }
  return `${ACADEMY_LICENSE_ORDER_PURPOSE_PREFIX}${slug}`;
}

/**
 * Niyetten slug'ı kapıya bakmadan çıkarır (saf ayrıştırma).
 * Geçerlilik = önek + lisans adayı slug. Satışın o an açık olup olmadığı sorulmaz.
 * Tahsilat sonrası köprü ve hook erken-filtrelemesi bunu kullanır (K1).
 */
export function parseAcademyLicenseSlug(purpose: string | undefined): string | null {
  if (!purpose?.startsWith(ACADEMY_LICENSE_ORDER_PURPOSE_PREFIX)) {
    return null;
  }
  const slug = purpose.slice(ACADEMY_LICENSE_ORDER_PURPOSE_PREFIX.length).trim();
  return isAcademyLicenseSaleSlug(slug) ? slug : null;
}

/**
 * Ödeme öncesi okuma: slug + satış kapısı birlikte.
 * Yalnız tahsilat başlatmadan önce çağrılır; köprüde kullanılmaz.
 */
export function readAcademyLicenseSlug(purpose: string | undefined): string | null {
  const slug = parseAcademyLicenseSlug(purpose);
  if (!slug) {
    return null;
  }
  ensureAcademyProductionDiskProbe();
  return academyCourseSaleOpen(slug) ? slug : null;
}

export type AcademyLicenseFulfillResult = {
  applied: boolean;
  purchaseId: string | null;
  reason: "not_academy" | "not_cleared" | "settled" | "already_settled" | "insufficient" | "closed";
};

function consentFromOrder(order: PaymentOrderSnapshot): CheckoutLegalConsent | undefined {
  if (
    order.consentVersion === CHECKOUT_LEGAL_CONSENT_VERSION &&
    order.distanceContractAccepted === true &&
    order.digitalImmediatePerformanceAccepted === true
  ) {
    return CHECKOUT_LEGAL_CONSENT_PAYLOAD;
  }
  return undefined;
}

/**
 * CLEARED akademi kasası → fiyat kilidi + cüzdan DEBIT + `academy_purchases` SETTLED.
 * Düz `wallet-top-up` niyeti lisans açmaz. İkinci çağrı bakiyeyi yeniden düşürmez.
 *
 * K1 güvencesi: Sipariş CLEARED ise lisans, satış kapısı ödeme ile bildirim
 * arasında kapanmış olsa bile tamamlanır. Kapı kontrolü ödeme öncesindedir
 * (`academyLicenseOrderPurpose`); burada tekrar sorulmaz.
 * Yetersiz bakiyede lisans yazılmaz. Para cüzdanda lisanssız kalmasın diye
 * kanca `refundUnlicensedAcademyCreditForOrder` ile yalnız bu siparişin tutarını
 * karta iade etmeyi dener. Bu fonksiyon iade siparişi açmaz.
 */
export async function fulfillAcademyLicenseFromClearedOrder(
  ports: AcademyEnginePorts,
  order: PaymentOrderSnapshot,
  now: Date = new Date(),
  options: { slug?: string } = {},
): Promise<AcademyLicenseFulfillResult> {
  const slug = options.slug ?? parseAcademyLicenseSlug(order.purpose);
  if (!slug) {
    return { applied: false, purchaseId: null, reason: "not_academy" };
  }
  if (order.status !== "CLEARED") {
    return { applied: false, purchaseId: null, reason: "not_cleared" };
  }

  const course = await ports.academy.getCourseBySlug(slug);
  if (!course) {
    return { applied: false, purchaseId: null, reason: "closed" };
  }

  try {
    const locked = await lockAcademyCoursePrice(ports, {
      courseId: course.id,
      userId: order.userId,
      now,
      fromClearedOrder: true,
    });
    const result = await purchaseAcademyCourse(ports, {
      courseId: locked.course.id,
      userId: order.userId,
      lockId: locked.lock.id,
      now,
      consent: consentFromOrder(order),
      fromClearedOrder: true,
    });
    logEvent({
      level: "info",
      event: "academy.license.fulfilled",
      userId: order.userId,
      merchantOid: order.merchantOid,
      orderId: order.id,
      amountMinor: result.purchase.amountMinor,
      purpose: order.purpose,
      applied: result.applied,
      reason: result.applied ? "settled" : "already_settled",
    });
    return {
      applied: result.applied,
      purchaseId: result.purchase.id,
      reason: result.applied ? "settled" : "already_settled",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (isInsufficientBalanceError(message)) {
      logEvent({
        level: "warn",
        event: "academy.license.fulfill_skipped",
        userId: order.userId,
        merchantOid: order.merchantOid,
        orderId: order.id,
        amountMinor: order.amountMinor,
        reason: "insufficient",
        applied: false,
      });
      return { applied: false, purchaseId: null, reason: "insufficient" };
    }
    if (message.includes("bulunamadı")) {
      logEvent({
        level: "warn",
        event: "academy.license.fulfill_skipped",
        userId: order.userId,
        merchantOid: order.merchantOid,
        orderId: order.id,
        reason: "closed",
        applied: false,
      });
      return { applied: false, purchaseId: null, reason: "closed" };
    }
    throw error;
  }
}
