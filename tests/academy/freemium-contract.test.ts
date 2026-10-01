import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hasAcademyOynaAccess, resolveAcademyEntitlement } from "@/lib/academy/access";
import { academyPaywallLockedLessonShells } from "@/lib/academy/paywall-shells";
import { isAcademyPlayerPaywallLessonLocked } from "@/lib/academy/preview-lock";
import { ACADEMY_LICENSE_DURATION_MS } from "@/lib/academy/license";
import type { AcademyPurchaseRecord } from "@/lib/academy/types";
import { curriculumExamPathKeys } from "@/lib/kernel/catalog-ids/exam-path";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";

/**
 * Anayasa B4 Freemium ilkesi.
 * Üç canlı kursta ders 1 (OFF-101 hazırlık şeridiyle) oturumsuz açıktır.
 * İkinci ders kapalıdır. Yürürlükteki lisans onu açar; süre dolunca yeniden kilitlenir.
 * Önizlemenin süresi yoktur.
 */

const CITIZEN = { userId: "citizen-freemium", email: "vatandas@yetkin.rail" };
const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const ADMIN_EMAIL = "admin@yetkin.test";
const CONFIRMED = "2026-01-01T00:00:00.000Z";
const SETTLED_AT = new Date("2026-01-01T00:00:00.000Z");
const ACTIVE_NOW = new Date(SETTLED_AT.getTime() + 24 * 60 * 60 * 1000);
const EXPIRED_NOW = new Date(SETTLED_AT.getTime() + ACADEMY_LICENSE_DURATION_MS);

const ORIGINAL_ADMIN = process.env.SUPER_ADMIN_USER_ID;
const ORIGINAL_EMAIL = process.env.CANONICAL_SUPER_ADMIN_EMAIL;

const COURSES = [
  {
    code: "OFF-101",
    slug: "01_office_ai",
    prepKey: "01_office_ai-0",
    lesson1: "01_office_ai-1",
    lesson2: "01_office_ai-k1",
  },
  {
    code: "OFF-201",
    slug: "01_office_ai_ileri",
    prepKey: null,
    lesson1: "01_office_ai_ileri-1",
    lesson2: "01_office_ai_ileri-2",
  },
  {
    code: "EC-102",
    slug: "02_ecommerce_ai",
    prepKey: null,
    lesson1: "02_ecommerce_ai-1",
    lesson2: "02_ecommerce_ai-2",
  },
] as const;

function settledPurchase(settledAt: Date, priceLockId = "price_freemium"): AcademyPurchaseRecord {
  return {
    id: "pur_freemium",
    userId: CITIZEN.userId,
    courseId: "ac_freemium",
    priceLockId,
    amountMinor: toAmountMinor(89_000),
    currencyCode: SETTLEMENT_CURRENCY,
    status: "SETTLED",
    settledAt,
    createdAt: settledAt,
    updatedAt: settledAt,
  };
}

describe("Freemium sözleşme — OFF-101, OFF-201, EC-102", () => {
  afterEach(() => {
    if (ORIGINAL_ADMIN == null) {
      delete process.env.SUPER_ADMIN_USER_ID;
    } else {
      process.env.SUPER_ADMIN_USER_ID = ORIGINAL_ADMIN;
    }
    if (ORIGINAL_EMAIL == null) {
      delete process.env.CANONICAL_SUPER_ADMIN_EMAIL;
    } else {
      process.env.CANONICAL_SUPER_ADMIN_EMAIL = ORIGINAL_EMAIL;
    }
  });

  it("oturumsuz ziyaretçi ders 1'i ve OFF-101 hazırlık şeridini açar; ikinci ders kilitlidir", () => {
    for (const course of COURSES) {
      const keys = curriculumExamPathKeys(course.slug);
      expect(keys[0], course.code).toBe(course.lesson1);
      expect(keys[1], course.code).toBe(course.lesson2);

      const lesson1 = resolveAcademyEntitlement({
        actor: null,
        purchase: null,
        courseSlug: course.slug,
        lessonKey: course.lesson1,
        now: ACTIVE_NOW,
      });
      expect(lesson1.open, course.code).toBe(true);
      expect(lesson1.paywallLocked, course.code).toBe(false);
      expect(lesson1.reason, course.code).toBe("anonymous-preview");

      const lesson2 = resolveAcademyEntitlement({
        actor: null,
        purchase: null,
        courseSlug: course.slug,
        lessonKey: course.lesson2,
        now: ACTIVE_NOW,
      });
      expect(lesson2.open, course.code).toBe(false);
      expect(lesson2.paywallLocked, course.code).toBe(true);
      expect(lesson2.reason, course.code).toBe("unlicensed");

      const shells = academyPaywallLockedLessonShells(course.slug);
      const shell1 = shells.find((row) => row.key === course.lesson1);
      const shell2 = shells.find((row) => row.key === course.lesson2);
      expect(shell1?.open, course.code).toBe(true);
      expect(shell1?.body.length, course.code).toBeGreaterThan(0);
      expect(shell2?.open, course.code).toBe(false);
      expect(shell2?.body, course.code).toBe("");
      expect(isAcademyPlayerPaywallLessonLocked(course.slug, course.lesson1, true)).toBe(false);
      expect(isAcademyPlayerPaywallLessonLocked(course.slug, course.lesson2, true)).toBe(true);
    }

    const prep = resolveAcademyEntitlement({
      actor: null,
      purchase: null,
      courseSlug: "01_office_ai",
      lessonKey: "01_office_ai-0",
      now: ACTIVE_NOW,
    });
    expect(prep.open).toBe(true);
    expect(prep.paywallLocked).toBe(false);
    expect(prep.reason).toBe("prep-strip");
    expect(isAcademyPlayerPaywallLessonLocked("01_office_ai", "01_office_ai-0", true)).toBe(false);

    const prepOnOtherCourse = resolveAcademyEntitlement({
      actor: null,
      purchase: null,
      courseSlug: "02_ecommerce_ai",
      lessonKey: "01_office_ai-0",
      now: ACTIVE_NOW,
    });
    expect(prepOnOtherCourse.lessonBelongsToCourse).toBe(false);
    expect(prepOnOtherCourse.paywallLocked).toBe(true);
    expect(prepOnOtherCourse.reason).toBe("foreign-lesson");
  });

  it("yürürlükteki lisans ikinci dersi açar; süre dolunca yeniden kilitler; önizleme açık kalır", () => {
    const activePurchase = settledPurchase(SETTLED_AT);
    const expiredPurchase = settledPurchase(SETTLED_AT);

    for (const course of COURSES) {
      expect(
        hasAcademyOynaAccess(activePurchase, CITIZEN, ACTIVE_NOW),
        course.code,
      ).toBe(true);
      const open = resolveAcademyEntitlement({
        actor: CITIZEN,
        purchase: activePurchase,
        courseSlug: course.slug,
        lessonKey: course.lesson2,
        now: ACTIVE_NOW,
      });
      expect(open.paywallLocked, course.code).toBe(false);
      expect(open.commercialEnrolment, course.code).toBe(true);
      expect(open.reason, course.code).toBe("active-licence");

      expect(
        hasAcademyOynaAccess(expiredPurchase, CITIZEN, EXPIRED_NOW),
        course.code,
      ).toBe(false);
      const relocked = resolveAcademyEntitlement({
        actor: CITIZEN,
        purchase: expiredPurchase,
        courseSlug: course.slug,
        lessonKey: course.lesson2,
        now: EXPIRED_NOW,
      });
      expect(relocked.paywallLocked, course.code).toBe(true);
      expect(relocked.open, course.code).toBe(false);
      expect(relocked.licenseExpired, course.code).toBe(true);
      expect(relocked.commercialEnrolment, course.code).toBe(false);
      expect(relocked.reason, course.code).toBe("licence-expired");

      const preview = resolveAcademyEntitlement({
        actor: CITIZEN,
        purchase: expiredPurchase,
        courseSlug: course.slug,
        lessonKey: course.lesson1,
        now: EXPIRED_NOW,
      });
      expect(preview.paywallLocked, course.code).toBe(false);
      expect(preview.open, course.code).toBe(true);
      expect(preview.licenseExpired, course.code).toBe(true);
      expect(preview.reason, course.code).toBe("anonymous-preview");
    }

    const grant = settledPurchase(SETTLED_AT, "sa_grant:citizen-freemium:ac_freemium");
    const grantLocked = resolveAcademyEntitlement({
      actor: CITIZEN,
      purchase: grant,
      courseSlug: "02_ecommerce_ai",
      lessonKey: "02_ecommerce_ai-2",
      now: ACTIVE_NOW,
    });
    expect(grantLocked.paywallLocked).toBe(true);
    expect(grantLocked.commercialEnrolment).toBe(false);
  });

  it("başka kursun ilk ders anahtarı bu kursu açmaz", () => {
    const crossed = resolveAcademyEntitlement({
      actor: CITIZEN,
      purchase: null,
      courseSlug: "01_office_ai",
      lessonKey: "02_ecommerce_ai-1",
      now: ACTIVE_NOW,
    });
    expect(crossed.lessonBelongsToCourse).toBe(false);
    expect(crossed.open).toBe(false);
    expect(crossed.paywallLocked).toBe(true);
    expect(crossed.reason).toBe("foreign-lesson");

    const licensed = settledPurchase(SETTLED_AT);
    const stillForeign = resolveAcademyEntitlement({
      actor: CITIZEN,
      purchase: licensed,
      courseSlug: "01_office_ai",
      lessonKey: "01_office_ai_ileri-1",
      now: ACTIVE_NOW,
    });
    expect(stillForeign.commercialEnrolment).toBe(true);
    expect(stillForeign.lessonBelongsToCourse).toBe(false);
    expect(stillForeign.paywallLocked).toBe(true);
  });

  it("asistan route'u ders anahtarını resolveAcademyEntitlement ile kursa bağlar", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/academy/lesson-assistant/route.ts"),
      "utf8",
    );
    expect(route).toContain("resolveAcademyEntitlement");
    expect(route).toContain("lessonBelongsToCourse");
    expect(route).not.toContain("isAcademyFreePreviewLessonKey");
  });

  it("Super Admin lisansı olmadan ikinci dersi açar", () => {
    delete process.env.SUPER_ADMIN_USER_ID;
    process.env.CANONICAL_SUPER_ADMIN_EMAIL = ADMIN_EMAIL;
    const decision = resolveAcademyEntitlement({
      actor: { userId: ADMIN_ID, email: ADMIN_EMAIL, emailConfirmedAt: CONFIRMED },
      purchase: null,
      courseSlug: "02_ecommerce_ai",
      lessonKey: "02_ecommerce_ai-2",
      now: ACTIVE_NOW,
    });
    expect(decision.open).toBe(true);
    expect(decision.paywallLocked).toBe(false);
    expect(decision.reason).toBe("admin-bypass");
    expect(decision.commercialEnrolment).toBe(false);
  });
});
