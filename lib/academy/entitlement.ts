/**
 * Akademi ders kapısının tek saf kararı.
 * Girdi dışında okuma yapmaz: veritabanı, oturum ve saat çağıran taraftadır.
 * Super Admin kararı aktör kimliği ve kanonik env ile okunur; bu fonksiyon satır yazmaz.
 * Dağınık kapılar (`purchase-path`, oynatıcı kabuğu, asistan) kademeli olarak buraya bağlanır.
 */

import { OFFICE_AI_PREP_STRIP, OFFICE_AI_PREP_STRIP_KEY } from "@/lib/academy/curricula/office_ai/prep";
import { hasCommercialAcademyEnrolment, isAcademyGrantPurchase } from "@/lib/academy/enrolment";
import { isAcademyLicenseActive } from "@/lib/academy/license";
import type { AcademyPurchaseRecord } from "@/lib/academy/types";
import {
  CURRICULUM_LESSON_KEYS_BY_SLUG,
  curriculumExamPathFirstLessonKey,
  curriculumExamPathKeys,
} from "@/lib/kernel/catalog-ids/exam-path";
import { isCitizenTestAccountEmail, isSuperAdminActor } from "@/lib/kernel/auth/super-admin";

export type AcademyEntitlementActor = {
  userId: string;
  email?: string | null;
  emailConfirmedAt?: string | null;
};

export type AcademyEntitlementReason =
  | "anonymous-preview"
  | "prep-strip"
  | "active-licence"
  | "admin-bypass"
  | "licence-expired"
  | "unlicensed"
  | "foreign-lesson";

export type AcademyEntitlement = {
  /** Bu ders şu anda oynatılabilir. */
  open: boolean;
  /** Ödeme duvarı bu dersi kilitler. */
  paywallLocked: boolean;
  /** Harçlı SETTLED lisans bu anda yürürlüktedir. Lab bağışı buna girmez. */
  commercialEnrolment: boolean;
  /** SETTLED harçlı satır var ve 365 gün dolmuştur. */
  licenseExpired: boolean;
  /** `lessonKey` bu `courseSlug` sınav yolunda veya hazırlık şeridindedir. */
  lessonBelongsToCourse: boolean;
  reason: AcademyEntitlementReason;
};

export function academyLessonBelongsToCourse(courseSlug: string, lessonKey: string): boolean {
  const slug = courseSlug.trim();
  const key = lessonKey.trim();
  if (!slug || !key) {
    return false;
  }
  if (curriculumExamPathKeys(slug).includes(key)) {
    return true;
  }
  return slug === OFFICE_AI_PREP_STRIP.slug && key === OFFICE_AI_PREP_STRIP_KEY;
}

/** Anahtarın sahibi kurs. Slug verilmeden önizleme sayılmaz. */
export function courseSlugForAcademyLessonKey(lessonKey: string): string | null {
  const key = lessonKey.trim();
  if (!key) {
    return null;
  }
  if (key === OFFICE_AI_PREP_STRIP_KEY) {
    return OFFICE_AI_PREP_STRIP.slug;
  }
  for (const [slug, keys] of Object.entries(CURRICULUM_LESSON_KEYS_BY_SLUG)) {
    if (keys.includes(key)) {
      return slug;
    }
  }
  return null;
}

/**
 * Kurs düzeyi kapılar ders anahtarı taşımaz.
 * Karar, önizleme olmayan ve bu sluga ait bir ders üzerinden okunur.
 * İlk ders seçilirse oturumsuz ziyaretçi de açık görünür.
 */
export const ACADEMY_LOCKED_LESSON_PROBE = {
  courseSlug: "02_ecommerce_ai",
  lessonKey: "02_ecommerce_ai-2",
} as const;

function isPrepStrip(courseSlug: string, lessonKey: string): boolean {
  return courseSlug.trim() === OFFICE_AI_PREP_STRIP.slug && lessonKey.trim() === OFFICE_AI_PREP_STRIP_KEY;
}

function isOpeningLesson(courseSlug: string, lessonKey: string): boolean {
  const first = curriculumExamPathFirstLessonKey(courseSlug.trim());
  return first != null && lessonKey.trim() === first;
}

function actorHasAdminBypass(actor: AcademyEntitlementActor | null): boolean {
  if (!actor || isCitizenTestAccountEmail(actor.email)) {
    return false;
  }
  return isSuperAdminActor({
    id: actor.userId,
    email: actor.email,
    emailConfirmedAt: actor.emailConfirmedAt,
  });
}

function locked(
  reason: AcademyEntitlementReason,
  facts: Pick<AcademyEntitlement, "commercialEnrolment" | "licenseExpired" | "lessonBelongsToCourse">,
): AcademyEntitlement {
  return { open: false, paywallLocked: true, reason, ...facts };
}

function unlocked(
  reason: AcademyEntitlementReason,
  facts: Pick<AcademyEntitlement, "commercialEnrolment" | "licenseExpired" | "lessonBelongsToCourse">,
): AcademyEntitlement {
  return { open: true, paywallLocked: false, reason, ...facts };
}

/**
 * Freemium kararı.
 * Oturum ve satın alma yokken sınav yolunun ilk dersi ve (yalnız OFF-101) hazırlık şeridi açıktır.
 * Sonraki dersler harçlı lisans ister. Lisans dolunca o dersler yeniden kilitlenir; önizlemenin süresi yoktur.
 * Başka kursun anahtarı bu slug üzerinde açık sayılmaz.
 */
export function resolveAcademyEntitlement(input: {
  actor: AcademyEntitlementActor | null;
  purchase: AcademyPurchaseRecord | null | undefined;
  courseSlug: string;
  lessonKey: string;
  now: Date;
}): AcademyEntitlement {
  const purchase = input.purchase ?? null;
  const grant = isAcademyGrantPurchase(purchase);
  const licenseExpired = Boolean(
    purchase &&
      purchase.status === "SETTLED" &&
      !grant &&
      !isAcademyLicenseActive(purchase.settledAt, input.now),
  );
  const commercialEnrolment = hasCommercialAcademyEnrolment(purchase, input.now);
  const lessonBelongsToCourse = academyLessonBelongsToCourse(input.courseSlug, input.lessonKey);
  const facts = { commercialEnrolment, licenseExpired, lessonBelongsToCourse };

  if (!lessonBelongsToCourse) {
    return locked("foreign-lesson", facts);
  }
  if (actorHasAdminBypass(input.actor)) {
    return unlocked("admin-bypass", facts);
  }
  if (commercialEnrolment) {
    return unlocked("active-licence", facts);
  }
  if (isPrepStrip(input.courseSlug, input.lessonKey)) {
    return unlocked("prep-strip", facts);
  }
  if (isOpeningLesson(input.courseSlug, input.lessonKey)) {
    return unlocked("anonymous-preview", facts);
  }
  if (licenseExpired) {
    return locked("licence-expired", facts);
  }
  return locked("unlicensed", facts);
}

const probeFirst = curriculumExamPathFirstLessonKey(ACADEMY_LOCKED_LESSON_PROBE.courseSlug);
if (
  probeFirst == null ||
  probeFirst === ACADEMY_LOCKED_LESSON_PROBE.lessonKey ||
  !academyLessonBelongsToCourse(
    ACADEMY_LOCKED_LESSON_PROBE.courseSlug,
    ACADEMY_LOCKED_LESSON_PROBE.lessonKey,
  )
) {
  throw new Error("Kilitli ders sondası önizleme veya yabancı anahtar olamaz.");
}
