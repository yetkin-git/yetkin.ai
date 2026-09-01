import { randomUUID } from "node:crypto";
import {
  ACADEMY_GRANT_LOCK_PREFIX,
  hasCommercialAcademyEnrolment,
} from "@/lib/academy/enrolment";
import { isAcademyLicenseActive } from "@/lib/academy/license";
import type { AcademyPurchaseRecord, AcademyStore } from "@/lib/academy/types";
import {
  isCanonicalSuperAdminEmail,
  isSuperAdminUser,
} from "@/lib/kernel/auth/super-admin";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { logEvent } from "@/lib/kernel/observability/log";

export { isCanonicalSuperAdminEmail };

export const ACADEMY_GRANT_PURPOSE = "academy-grant" as const;

export type AcademyActor = {
  userId: string;
  email?: string | null;
};

/** Üretimde sıfır harçlı SETTLED bağış kapalıdır. Lab'ta Super Admin + audit. */
export function isZeroFeeAcademyGrantOpen(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  return nodeEnv !== "production";
}

/**
 * ADMIN / SUPER_ADMIN — kanonik e-posta veya SUPER_ADMIN_USER_ID.
 * Prisma rol kolonu yok; env Super Admin kimliği her iki rol adını karşılar.
 */
export function hasAcademyAdminBypass(actor: AcademyActor): boolean {
  return isCanonicalSuperAdminEmail(actor.email) || isSuperAdminUser(actor.userId);
}

export function hasUnlimitedAcademyAccess(actor: AcademyActor): boolean {
  if (!isZeroFeeAcademyGrantOpen()) {
    return false;
  }
  return hasAcademyAdminBypass(actor);
}

/**
 * Ders oynatıcı + Antre içerik kapısı — ticari lisans veya ADMIN bypass.
 * `hasCommercialAcademyEnrolment` ayrı kalır: bağış "satın alındı" değildir, nakit yazılmaz.
 */
export function hasAcademyPlayerAccess(
  purchase: AcademyPurchaseRecord | null | undefined,
  actor: AcademyActor,
  now: Date = new Date(),
): boolean {
  if (hasAcademyAdminBypass(actor)) {
    return true;
  }
  return hasCommercialAcademyEnrolment(purchase, now);
}

/** Satın alma yoksa bile ADMIN / SUPER_ADMIN SETTLED sayılır — içerik kapısı. */
export function hasPurchased(
  purchase: AcademyPurchaseRecord | null,
  actor: AcademyActor,
  now: Date = new Date(),
): boolean {
  if (hasAcademyAdminBypass(actor)) {
    return true;
  }
  if (purchase?.status !== "SETTLED") {
    return false;
  }
  return isAcademyLicenseActive(purchase.settledAt, now);
}

/**
 * Mühürlü ders notu / iş kanıtı kartı — 365 gün lisans bitse de SETTLED kayıt yeter.
 * Oynatıcı ve sınav kapısı `hasPurchased` ile lisans ister; PDF bu kapıdan geçer.
 */
export function hasAcademyArtifactAccess(
  purchase: AcademyPurchaseRecord | null,
  actor: AcademyActor,
): boolean {
  if (hasAcademyAdminBypass(actor)) {
    return true;
  }
  return purchase?.status === "SETTLED";
}

function academyGrantPurchaseRecord(
  userId: string,
  courseId: string,
  now: Date,
): AcademyPurchaseRecord {
  return {
    id: randomUUID(),
    userId,
    courseId,
    priceLockId: `${ACADEMY_GRANT_LOCK_PREFIX}${userId}:${courseId}`,
    amountMinor: toAmountMinor(0),
    currencyCode: SETTLEMENT_CURRENCY,
    status: "SETTLED",
    settledAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

/** Üretimde kalıcı yazılmaz; oynatıcı / Antre içeriği için bellek içi SATIR. */
export function createAcademyAdminBypassPurchase(
  userId: string,
  courseId: string,
  now: Date = new Date(),
): AcademyPurchaseRecord {
  logEvent({
    level: "warn",
    event: "academy.admin-bypass",
    purpose: ACADEMY_GRANT_PURPOSE,
    userId,
    action: "academy-admin-bypass",
    amountMinor: 0,
    applied: true,
    reason: courseId,
  });
  return academyGrantPurchaseRecord(userId, courseId, now);
}

export function createAcademyGrantPurchase(
  userId: string,
  courseId: string,
  now: Date = new Date(),
): AcademyPurchaseRecord {
  if (!isZeroFeeAcademyGrantOpen()) {
    throw new Error("Üretimde sıfır harçlı akademi bağışı kapalıdır.");
  }
  logEvent({
    level: "warn",
    event: "academy.grant",
    purpose: ACADEMY_GRANT_PURPOSE,
    userId,
    action: ACADEMY_GRANT_PURPOSE,
    amountMinor: 0,
    applied: true,
    reason: courseId,
  });
  return academyGrantPurchaseRecord(userId, courseId, now);
}

export async function resolveSettledAcademyPurchase(
  store: Pick<AcademyStore, "getPurchaseByUserAndCourse" | "insertPurchase">,
  actor: AcademyActor,
  courseId: string,
  options: { persistGrant?: boolean } = {},
): Promise<AcademyPurchaseRecord | null> {
  const existing = await store.getPurchaseByUserAndCourse(actor.userId, courseId);
  if (existing?.status === "SETTLED") {
    if (hasAcademyAdminBypass(actor) || isAcademyLicenseActive(existing.settledAt)) {
      return existing;
    }
    return null;
  }
  if (!hasAcademyAdminBypass(actor)) {
    return existing;
  }
  if (options.persistGrant && isZeroFeeAcademyGrantOpen()) {
    if (existing) {
      return existing;
    }
    try {
      return await store.insertPurchase(createAcademyGrantPurchase(actor.userId, courseId));
    } catch {
      const raced = await store.getPurchaseByUserAndCourse(actor.userId, courseId);
      return raced ?? createAcademyGrantPurchase(actor.userId, courseId);
    }
  }
  return existing ?? createAcademyAdminBypassPurchase(actor.userId, courseId);
}

/** SETTLED satır lisans süresi dolsa da döner. Super Admin tohum bağışı oynatıcıdaki gibi. */
export async function resolveAcademyArtifactPurchase(
  store: Pick<AcademyStore, "getPurchaseByUserAndCourse" | "insertPurchase">,
  actor: AcademyActor,
  courseId: string,
): Promise<AcademyPurchaseRecord | null> {
  const existing = await store.getPurchaseByUserAndCourse(actor.userId, courseId);
  if (existing?.status === "SETTLED") {
    return existing;
  }
  if (!hasUnlimitedAcademyAccess(actor)) {
    return existing;
  }
  // Lab grant kalıcı olsun — PDF / iş kanıtı tamamlamalarla aynı purchaseId paylaşsın.
  return resolveSettledAcademyPurchase(store, actor, courseId, { persistGrant: true });
}
