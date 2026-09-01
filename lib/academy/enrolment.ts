/**
 * Vitrin / Antre ticari kayıt durumu — harçlı SETTLED lisans.
 * Super Admin lab bağışı (`sa_grant:`) nakit değildir; "satın alındı" sayılmaz.
 * Ders kapısı ADMIN / SUPER_ADMIN için `hasAcademyPlayerAccess` (access.ts) ile açılır.
 * Client-safe: Prisma / engine import etmez.
 */

import { isAcademyLicenseActive } from "@/lib/academy/license";
import type { AcademyPurchaseRecord } from "@/lib/academy/types";

export const ACADEMY_GRANT_LOCK_PREFIX = "sa_grant:" as const;

export type AcademyStorefrontAccess = "unenrolled" | "enrolled" | "expired";

export function isAcademyGrantPurchase(
  purchase: Pick<AcademyPurchaseRecord, "priceLockId"> | null | undefined,
): boolean {
  return Boolean(purchase?.priceLockId.startsWith(ACADEMY_GRANT_LOCK_PREFIX));
}

/**
 * Antre / vitrin ticari CTA — harçlı SETTLED + 365 gün lisans.
 * Lab bağışı burada yeşil basmaz. ADMIN oynatıcı vizesi `hasAcademyPlayerAccess`.
 */
export function hasCommercialAcademyEnrolment(
  purchase: AcademyPurchaseRecord | null | undefined,
  now: Date = new Date(),
): boolean {
  return academyStorefrontAccess(purchase, now) === "enrolled";
}

export function academyStorefrontAccess(
  purchase: AcademyPurchaseRecord | null | undefined,
  now: Date = new Date(),
): AcademyStorefrontAccess {
  if (!purchase || purchase.status !== "SETTLED" || isAcademyGrantPurchase(purchase)) {
    return "unenrolled";
  }
  return isAcademyLicenseActive(purchase.settledAt, now) ? "enrolled" : "expired";
}
