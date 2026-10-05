import { randomUUID } from "node:crypto";
import {
  ACADEMY_LOCKED_LESSON_PROBE,
  resolveAcademyEntitlement,
} from "@/lib/academy/entitlement";
import { ACADEMY_GRANT_LOCK_PREFIX } from "@/lib/academy/enrolment";
import { isAcademyLicenseActive } from "@/lib/academy/license";
import type { AcademyPurchaseRecord, AcademyStore } from "@/lib/academy/types";
import {
  isCanonicalSuperAdminEmail,
  isCitizenTestAccountEmail,
  isSuperAdminActor,
} from "@/lib/kernel/auth/super-admin";
import { AuthRequiredError, sessionUserNotInDatabaseMessage } from "@/lib/kernel/auth/require-session";
import { isPrismaForeignKeyViolation } from "@/lib/kernel/db-errors";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";

export { isCanonicalSuperAdminEmail };
export {
  academyLessonBelongsToCourse,
  resolveAcademyEntitlement,
  type AcademyEntitlement,
  type AcademyEntitlementActor,
  type AcademyEntitlementReason,
} from "@/lib/academy/entitlement";

export const ACADEMY_GRANT_PURPOSE = "academy-grant" as const;

export type AcademyActor = {
  userId: string;
  email?: string | null;
  emailConfirmedAt?: string | null;
};

export function academyActorFromSession(session: {
  id: string;
  email?: string | null;
  emailConfirmedAt?: string | null;
}): AcademyActor {
  return {
    userId: session.id,
    email: session.email,
    emailConfirmedAt: session.emailConfirmedAt,
  };
}

/** Üretimde sıfır harçlı SETTLED bağış kapalıdır. Lab'ta Super Admin + audit. */
export function isZeroFeeAcademyGrantOpen(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  return nodeEnv !== "production";
}

/**
 * Akademi ödeme duvarı muafiyeti.
 * Prisma `role` kolonu yok. Tek kapı `isSuperAdminActor`:
 * e-posta doğrulanmış olmalı. Üretimde yerleşik kanonik kutu env gecikse de açılır;
 * başka adres UUID ve kanonik e-posta env’inin birlikte eşleşmesini ister.
 * Ayrı e-posta kümesi yoktur.
 */
export function hasAcademyAdminBypass(actor: AcademyActor): boolean {
  return isSuperAdminActor({
    id: actor.userId,
    email: actor.email,
    emailConfirmedAt: actor.emailConfirmedAt,
  });
}

/**
 * Laboratuvar geçişi. Üretimde kapalıdır.
 * Doğrulanmış süper yönetici (`yapinet360@gmail.com`) üretimde ders izler.
 * Sınavı ve sertifikayı bu fonksiyonla atlamaz.
 */
export function hasUnlimitedAcademyAccess(actor: AcademyActor): boolean {
  if (!isZeroFeeAcademyGrantOpen()) {
    return false;
  }
  return hasAcademyAdminBypass(actor);
}

/**
 * Kurs düzeyi lisans.
 * Önizleme dersi açık sayılmaz: sonda `ACADEMY_LOCKED_LESSON_PROBE` ikinci derstir.
 * Dönüş yalnız `admin-bypass` veya `active-licence` iken doğrudur.
 */
function licenceProbeOpens(
  purchase: AcademyPurchaseRecord | null | undefined,
  actor: AcademyActor | null,
  now: Date,
): boolean {
  const decision = resolveAcademyEntitlement({
    actor,
    purchase,
    courseSlug: ACADEMY_LOCKED_LESSON_PROBE.courseSlug,
    lessonKey: ACADEMY_LOCKED_LESSON_PROBE.lessonKey,
    now,
  });
  return decision.reason === "admin-bypass" || decision.reason === "active-licence";
}

/**
 * Ders oynatıcı + Antre içerik kapısı — ticari lisans veya ADMIN bypass.
 * Karar `resolveAcademyEntitlement`. Bağış "satın alındı" değildir, nakit yazılmaz.
 */
export function hasAcademyPlayerAccess(
  purchase: AcademyPurchaseRecord | null | undefined,
  actor: AcademyActor,
  now: Date = new Date(),
): boolean {
  return licenceProbeOpens(purchase, actor, now);
}

/**
 * Vatandaş oynatıcısı (`/oyna`).
 * Vatandaş ve vatandaş test hesabı yalnız ticari lisans.
 * SUPER_ADMIN üretimde de satın alma satırı olmadan açılır.
 * Sıfır harçlı bağış yazılmaz; bu kapı nakit değildir.
 */
export function hasAcademyOynaAccess(
  purchase: AcademyPurchaseRecord | null | undefined,
  actor: AcademyActor,
  now: Date = new Date(),
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  if (isCitizenTestAccountEmail(actor.email)) {
    return licenceProbeOpens(purchase, actor, now);
  }
  if (hasAcademyAdminBypass(actor)) {
    return true;
  }
  if (nodeEnv === "production") {
    return licenceProbeOpens(purchase, actor, now);
  }
  return hasAcademyPlayerAccess(purchase, actor, now);
}

/**
 * Kilitli ders metni — asistan ve müfredat içeriği.
 * Vatandaşta bağış yetmez. SUPER_ADMIN izleme muafiyeti yeter; nakit satır açmaz.
 */
export function hasAcademyLockedLessonContentAccess(
  purchase: AcademyPurchaseRecord | null | undefined,
  now: Date = new Date(),
  actor?: AcademyActor | null,
): boolean {
  return licenceProbeOpens(purchase, actor ?? null, now);
}

/**
 * İçerik kapısı. Süper yönetici izleme muafiyeti üretimde ders gövdesini açar.
 * Bu dönüş sınav ve sertifika muafiyeti değildir. Onlar üretimde gerçek satır ve bitmiş müfredat ister.
 */
export function hasPurchased(
  purchase: AcademyPurchaseRecord | null,
  actor: AcademyActor,
  now: Date = new Date(),
): boolean {
  if (licenceProbeOpens(purchase, actor, now)) {
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
  if (licenceProbeOpens(purchase, actor, new Date())) {
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
    } catch (error) {
      const raced = await store.getPurchaseByUserAndCourse(actor.userId, courseId);
      if (raced) {
        return raced;
      }
      if (isPrismaForeignKeyViolation(error)) {
        throw new AuthRequiredError(sessionUserNotInDatabaseMessage());
      }
      throw error;
    }
  }
  return existing ?? createAcademyAdminBypassPurchase(actor.userId, courseId);
}

/** SETTLED satır lisans süresi dolsa da döner. Super Admin tohum bağışı oynatıcıdaki gibi. */
export async function resolveAcademyArtifactPurchase(
  store: Pick<AcademyStore, "getPurchaseByUserAndCourse" | "insertPurchase">,
  actor: AcademyActor,
  courseId: string,
  options: { persistGrant?: boolean } = {},
): Promise<AcademyPurchaseRecord | null> {
  const existing = await store.getPurchaseByUserAndCourse(actor.userId, courseId);
  if (existing?.status === "SETTLED") {
    return existing;
  }
  if (!hasUnlimitedAcademyAccess(actor)) {
    return existing;
  }
  if (options.persistGrant === false) {
    return existing ?? createAcademyAdminBypassPurchase(actor.userId, courseId);
  }
  // Lab grant kalıcı olsun — PDF / iş kanıtı tamamlamalarla aynı purchaseId paylaşsın.
  return resolveSettledAcademyPurchase(store, actor, courseId, { persistGrant: true });
}
