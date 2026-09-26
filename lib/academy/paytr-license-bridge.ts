import { lockAcademyCoursePrice, purchaseAcademyCourse, type AcademyEnginePorts } from "@/lib/academy/engine";
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

export function academyLicenseOrderPurpose(slug: string): string {
  if (!isAcademyLicenseSaleSlug(slug)) {
    throw new Error("Akademi lisans SKU'su geçersiz.");
  }
  if (!academyCourseSaleOpen(slug)) {
    throw new Error("Kurs satışa kapalı.");
  }
  return `${ACADEMY_LICENSE_ORDER_PURPOSE_PREFIX}${slug}`;
}

export function readAcademyLicenseSlug(purpose: string | undefined): string | null {
  if (!purpose?.startsWith(ACADEMY_LICENSE_ORDER_PURPOSE_PREFIX)) {
    return null;
  }
  const slug = purpose.slice(ACADEMY_LICENSE_ORDER_PURPOSE_PREFIX.length).trim();
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
 */
export async function fulfillAcademyLicenseFromClearedOrder(
  ports: AcademyEnginePorts,
  order: PaymentOrderSnapshot,
  now: Date = new Date(),
  options: { slug?: string } = {},
): Promise<AcademyLicenseFulfillResult> {
  const slug = options.slug ?? readAcademyLicenseSlug(order.purpose);
  if (!slug) {
    return { applied: false, purchaseId: null, reason: "not_academy" };
  }
  if (order.status !== "CLEARED") {
    return { applied: false, purchaseId: null, reason: "not_cleared" };
  }

  try {
    const locked = await lockAcademyCoursePrice(ports, {
      courseId: slug,
      userId: order.userId,
      now,
    });
    const result = await purchaseAcademyCourse(ports, {
      courseId: locked.course.id,
      userId: order.userId,
      lockId: locked.lock.id,
      now,
      consent: consentFromOrder(order),
    });
    logEvent({
      level: "info",
      event: "academy.license.fulfilled",
      userId: order.userId,
      merchantOid: order.merchantOid,
      orderId: order.id,
      amountMinor: result.purchase.amountMinor,
      purpose: academyLicenseOrderPurpose(slug),
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
    if (message.includes("satışa kapalı") || message.includes("bulunamadı")) {
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
