import { afterEach, describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { loadAcademyExam, loadAcademyExamGateStatus, submitAcademyExam } from "@/lib/academy/exam-engine";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { completeAcademyCurriculum } from "@/lib/academy/curriculum-engine";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { resetAcademyExamSittingConsumptionsForTests } from "@/lib/academy/exam-sitting";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import {
  createMemoryAcademyStore,
  memoryCourse,
  memoryExam,
  memoryPublishedSku,
} from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";
import { submitAcademyExamWithFreshSitting } from "../helpers/academy-exam-sitting";

const BUYER = "exam-buyer";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const COURSE_PRICE = 25_000;
const ADMIN_EMAIL = "admin@yetkin.test";
const ORIGINAL_EMAIL = process.env.CANONICAL_SUPER_ADMIN_EMAIL;

function emptyWorld() {
  const course = memoryCourse();
  const exam = memoryExam(course.id);
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: 100_000 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const catalog = createMemoryPriceCatalogStore([
    { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: COURSE_PRICE },
  ]);
  const academy = createMemoryAcademyStore();
  return {
    course,
    exam,
    ports: {
      ledger,
      catalog,
      locks: createMemoryCheckoutPriceLockStore(),
      academy,
    },
  };
}

function officeWorld() {
  const published = memoryPublishedSku();
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: 200_000 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const catalog = createMemoryPriceCatalogStore([
    {
      moduleKey: ACADEMY_MODULE_KEY,
      unitKey: published.course.catalogUnitKey,
      amountMinor: published.amountMinor,
    },
  ]);
  const academy = createMemoryAcademyStore();
  return {
    course: published.course,
    exam: published.exam,
    amountMinor: published.amountMinor,
    ports: {
      ledger,
      catalog,
      locks: createMemoryCheckoutPriceLockStore(),
      academy,
    },
  };
}

async function purchaseOnly(ctx: ReturnType<typeof emptyWorld> | ReturnType<typeof officeWorld>) {
  await ctx.ports.academy.insertCourse(ctx.course);
  await ctx.ports.academy.insertExam(ctx.exam);
  const locked = await lockAcademyCoursePrice(ctx.ports, { courseId: ctx.course.id, userId: BUYER });
  return purchaseAcademyCourse(ctx.ports, {
    courseId: ctx.course.id,
    userId: BUYER,
    lockId: locked.lock.id,
    platformUserId: PLATFORM,
  });
}

async function purchaseAndCompleteOffice() {
  const ctx = officeWorld();
  await purchaseOnly(ctx);
  const player = await completeAcademyCurriculum(ctx.ports, {
    courseId: ctx.course.id,
    userId: BUYER,
  });
  expect(player.curriculumComplete).toBe(true);
  expect(player.totalCount).toBe(6);
  return ctx;
}

describe("akademi sınav kapısı (S58-A)", () => {
  afterEach(() => {
    resetAcademyExamSittingConsumptionsForTests();
    if (ORIGINAL_EMAIL == null) {
      delete process.env.CANONICAL_SUPER_ADMIN_EMAIL;
    } else {
      process.env.CANONICAL_SUPER_ADMIN_EMAIL = ORIGINAL_EMAIL;
    }
  });

  it("satın alma sertifika basmaz; müfredat bitmeden sınav kapısı 403", async () => {
    const ctx = emptyWorld();
    const purchased = await purchaseOnly(ctx);
    expect(purchased.certificate).toBeNull();
    expect(purchased.purchase.status).toBe("SETTLED");
    expect(ACADEMY_EXAM_PASS_SCORE).toBe(70);
    expect(curriculumForCourseSlug(ctx.course.slug)).toEqual([]);

    await expect(
      completeAcademyCurriculum(ctx.ports, { courseId: ctx.course.id, userId: BUYER }),
    ).rejects.toThrow(/Müfredat tohumu yok/);

    await expect(loadAcademyExamGateStatus(ctx.ports, ctx.course.id, BUYER)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    await expect(loadAcademyExam(ctx.ports, ctx.course.id, BUYER)).rejects.toThrow(
      /Sınav kapısı müfredat tamamlanınca açılır/,
    );
    await expect(
      submitAcademyExamWithFreshSitting(ctx.ports, {
        courseId: ctx.course.id,
        userId: BUYER,
        now: new Date("2026-08-14T12:00:00.000Z"),
      }),
    ).rejects.toThrow(/Sınav kapısı müfredat tamamlanınca açılır/);
  });

  it("01_office_ai SETTLED ama 6 makale yokken GET/POST exam açılmaz", async () => {
    const ctx = officeWorld();
    await purchaseOnly(ctx);
    expect(curriculumForCourseSlug(ctx.course.slug)).toHaveLength(6);

    await expect(loadAcademyExam(ctx.ports, ctx.course.id, BUYER)).rejects.toThrow(
      /Sınav kapısı müfredat tamamlanınca açılır/,
    );
    await expect(
      submitAcademyExam(ctx.ports, {
        courseId: ctx.course.id,
        userId: BUYER,
        answers: [],
        sessionToken: "missing-sitting",
      }),
    ).rejects.toThrow(/Sınav kapısı müfredat tamamlanınca açılır/);
  });

  it("69 ve altı sertifika basmaz", async () => {
    const ctx = await purchaseAndCompleteOffice();
    const result = await submitAcademyExamWithFreshSitting(ctx.ports, {
      courseId: ctx.course.id,
      userId: BUYER,
      mode: "failing",
    });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
    expect(result.certificate).toBeNull();
    expect(await ctx.ports.academy.getCertificateByUserAndCourse(BUYER, ctx.course.id)).toBeNull();
  });

  it("satın almadan sınav açılmaz", async () => {
    const ctx = emptyWorld();
    await ctx.ports.academy.insertCourse(ctx.course);
    await ctx.ports.academy.insertExam(ctx.exam);
    await expect(
      submitAcademyExam(ctx.ports, {
        courseId: ctx.course.id,
        userId: BUYER,
        answers: [{ questionId: "q1", choiceIndex: 1 }],
        sessionToken: "missing-sitting",
      }),
    ).rejects.toThrow(/satın alma/);
  });

  it("kanonik Super Admin müfredat ve satın alma olmadan sınav oturumu açar; boş müfredatta mühür yok", async () => {
    process.env.CANONICAL_SUPER_ADMIN_EMAIL = ADMIN_EMAIL;
    const ctx = emptyWorld();
    await ctx.ports.academy.insertCourse(ctx.course);
    await ctx.ports.academy.insertExam(ctx.exam);
    const view = await loadAcademyExam(
      ctx.ports,
      ctx.course.id,
      BUYER,
      undefined,
      ADMIN_EMAIL,
    );
    expect(view).not.toBeNull();
    expect(view?.questions.length).toBeGreaterThan(0);
    await expect(
      submitAcademyExamWithFreshSitting(ctx.ports, {
        courseId: ctx.course.id,
        userId: BUYER,
        email: ADMIN_EMAIL,
      }),
    ).rejects.toThrow(/Müfredat mühürü basılamaz/);
  });

  it("kapı durumu oturum açmaz; süre yalnız loadAcademyExam ile başlar", async () => {
    const ctx = await purchaseAndCompleteOffice();
    const status = await loadAcademyExamGateStatus(ctx.ports, ctx.course.id, BUYER);
    expect(status).not.toBeNull();
    expect(status?.certificate).toBeNull();
    expect(status && "sessionToken" in status).toBe(false);
    expect(status && "questions" in status).toBe(false);

    const open = await loadAcademyExam(ctx.ports, ctx.course.id, BUYER);
    expect(open?.sessionToken).toBeTruthy();
    expect(open?.questions.length).toBe(10);
    expect(open?.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
