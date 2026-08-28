import { afterEach, describe, expect, it } from "vitest";

import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";

import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";

import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";

import { loadAcademyExam, loadAcademyExamGateStatus, submitAcademyExam } from "@/lib/academy/exam-engine";

import { academyCurriculumSealForSlug } from "@/lib/academy/curriculum";

import { completeAcademyCurriculum } from "@/lib/academy/curriculum-engine";

import {

  ACADEMY_EXAM_PASS_SCORE,

  verifyAcademyCertificateHash,

} from "@/lib/academy/exam";

import { resetAcademyExamSittingConsumptionsForTests } from "@/lib/academy/exam-sitting";

import { issueCareerVisaStamp } from "@/lib/career/engine";

import { createMemoryLedgerStore } from "../helpers/memory-money";

import { createMemoryAcademyStore, memoryCourse, memoryExam } from "../helpers/memory-academy";

import {

  createMemoryCheckoutPriceLockStore,

  createMemoryPriceCatalogStore,

} from "../helpers/memory-pricing";

import { createMemoryCareerProofStore, createMemoryCareerStore } from "../helpers/memory-career";

import { submitAcademyExamWithFreshSitting } from "../helpers/academy-exam-sitting";



const BUYER = "exam-buyer";

const PLATFORM = PLATFORM_TREASURY_USER_ID;

const COURSE_PRICE = 25_000;

const ADMIN_EMAIL = "admin@yetkin.test";

const ORIGINAL_EMAIL = process.env.CANONICAL_SUPER_ADMIN_EMAIL;



function world() {

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



async function settle(ctx: ReturnType<typeof world>) {

  await ctx.ports.academy.insertCourse(ctx.course);

  await ctx.ports.academy.insertExam(ctx.exam);

  const locked = await lockAcademyCoursePrice(ctx.ports, { courseId: ctx.course.id, userId: BUYER });

  const purchased = await purchaseAcademyCourse(ctx.ports, {

    courseId: ctx.course.id,

    userId: BUYER,

    lockId: locked.lock.id,

    platformUserId: PLATFORM,

  });

  await completeAcademyCurriculum(ctx.ports, { courseId: ctx.course.id, userId: BUYER });

  return purchased;

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



  it("satın alma sertifika basmaz; ≥70 SHA256 mühür ve kariyer vizesi basar", async () => {

    const ctx = world();

    const purchased = await settle(ctx);

    expect(purchased.certificate).toBeNull();

    expect(ACADEMY_EXAM_PASS_SCORE).toBe(70);



    const now = new Date("2026-08-14T12:00:00.000Z");

    const result = await submitAcademyExamWithFreshSitting(ctx.ports, {

      courseId: ctx.course.id,

      userId: BUYER,

      now,

    });

    expect(result.passed).toBe(true);

    expect(result.score).toBe(100);

    expect(result.certificate).not.toBeNull();

    expect(result.certificate?.certificateHash).toMatch(/^[a-f0-9]{64}$/);

    expect(result.certificate?.serialKey).toBe(result.certificate?.certificateHash);

    expect(

      verifyAcademyCertificateHash({

        userId: BUYER,

        courseId: ctx.course.id,

        attemptId: result.attempt.id,

        score: 100,

        issuedAt: now,

        curriculumSeal: academyCurriculumSealForSlug("python-temel")!,

        certificateHash: result.certificate!.certificateHash!,

      }),

    ).toBe(true);

    expect(result.certificate?.curriculumSeal).toBe(academyCurriculumSealForSlug("python-temel"));



    const proofs = createMemoryCareerProofStore([

      {

        sourceKind: "ACADEMY_CERTIFICATE",

        sourceId: result.certificate!.id,

        userId: BUYER,

        actorUserIds: [BUYER],

        title: result.certificate!.title,

        issuedAt: result.certificate!.issuedAt,

        certificateHash: result.certificate!.certificateHash,

      },

    ]);

    const visa = await issueCareerVisaStamp(

      { career: createMemoryCareerStore(), proofs },

      { sourceKind: "ACADEMY_CERTIFICATE", sourceId: result.certificate!.id, actorUserId: BUYER },

    );

    expect(visa.applied).toBe(true);

    expect(visa.stamp.sourceKind).toBe("ACADEMY_CERTIFICATE");

    expect(visa.stamp.certificateHash).toBe(result.certificate!.certificateHash);

  });



  it("69 ve altı sertifika basmaz", async () => {

    const ctx = world();

    await settle(ctx);

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



  it("satın almadan sınav açılmaz; SETTLED sonrası müfredatsız doğrudan sınav; ikinci geçiş aynı sertifikayı döner", async () => {

    const ctx = world();

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



    const locked = await lockAcademyCoursePrice(ctx.ports, { courseId: ctx.course.id, userId: BUYER });

    await purchaseAcademyCourse(ctx.ports, {

      courseId: ctx.course.id,

      userId: BUYER,

      lockId: locked.lock.id,

      platformUserId: PLATFORM,

    });

    // Doğrudan sınav/vize yolu — müfredat tamamı zorunlu değildir.

    const first = await submitAcademyExamWithFreshSitting(ctx.ports, {

      courseId: ctx.course.id,

      userId: BUYER,

    });

    expect(first.passed).toBe(true);

    expect(first.certificate).not.toBeNull();



    const second = await submitAcademyExamWithFreshSitting(ctx.ports, {

      courseId: ctx.course.id,

      userId: BUYER,

    });

    expect(second.certificate?.id).toBe(first.certificate?.id);

  });



it("kanonik Super Admin müfredat ve satın alma olmadan sınav oturumu açar", async () => {

    process.env.CANONICAL_SUPER_ADMIN_EMAIL = ADMIN_EMAIL;

    const ctx = world();

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

    const result = await submitAcademyExamWithFreshSitting(ctx.ports, {

      courseId: ctx.course.id,

      userId: BUYER,

      email: ADMIN_EMAIL,

    });

    expect(result.passed).toBe(true);

    expect(result.certificate).not.toBeNull();

  });



  it("kapı durumu oturum açmaz; süre yalnız loadAcademyExam ile başlar", async () => {

    const ctx = world();

    await settle(ctx);

    const status = await loadAcademyExamGateStatus(ctx.ports, ctx.course.id, BUYER);

    expect(status).not.toBeNull();

    expect(status?.certificate).toBeNull();

    expect(status && "sessionToken" in status).toBe(false);

    expect(status && "questions" in status).toBe(false);



    const open = await loadAcademyExam(ctx.ports, ctx.course.id, BUYER);

    expect(open?.sessionToken).toBeTruthy();

    expect(open?.questions.length).toBeGreaterThan(0);

    expect(open?.expiresAt.getTime()).toBeGreaterThan(Date.now());

  });

});


