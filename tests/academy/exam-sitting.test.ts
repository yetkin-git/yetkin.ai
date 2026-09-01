import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import {
  academyExamGateProofLessonKey,
  loadAcademyExam,
  submitAcademyExam,
} from "@/lib/academy/exam-engine";
import { completeAcademyCurriculum } from "@/lib/academy/curriculum-engine";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";
import {
  academyExamAnswersFromPublicQuestions,
  openAcademyExamSitting,
  resetAcademyExamSittingConsumptionsForTests,
  sealAcademyExamSitting,
} from "@/lib/academy/exam-sitting";
import {
  academyCanonicalProofSubmission,
  evaluateAcademyProofSubmission,
} from "@/lib/academy/proof-of-work";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "exam-sitting-buyer";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

describe("sınav oturumu MAC ve iş kanıtı kapısı", () => {
  afterEach(() => {
    resetAcademyExamSittingConsumptionsForTests();
  });

  it("MAC sunucu sırrına bağlanır; sürüm dizesi anahtar değildir", () => {
    const src = readFileSync(join(process.cwd(), "lib/academy/exam-sitting.ts"), "utf8");
    expect(src).toContain("ACADEMY_EXAM_SITTING_SECRET");
    expect(src).toContain("yetkin-rail.academy.exam-sitting.mac.v1");
    expect(src).toContain("Sınav oturumu henüz bağlanmadı.");
    expect(src).toContain("ServiceUnavailableError");
    expect(src).toContain('process.env.VITEST !== "true"');
    expect(src).toContain("academyExamSittingMayConsume");
    expect(src).toContain("serializeAcademyExamSittingItems");
    expect(src).not.toContain('createHmac("sha256", ACADEMY_EXAM_SITTING_VERSION)');
  });

  it("jeton proofLessonKey taşır; sapmış MAC açılmaz", () => {
    const now = new Date("2026-08-22T12:00:00.000Z");
    const token = sealAcademyExamSitting({
      userId: BUYER,
      courseId: "course-ai",
      examId: "exam-ai",
      startedAt: now,
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
      jti: "jti-ai-1",
      items: [{ id: "q1", permutation: [0, 1, 2, 3] }],
      proofLessonKey: "python-temel-1",
    });
    const opened = openAcademyExamSitting(token);
    expect(opened?.proofLessonKey).toBe("python-temel-1");
    expect(opened?.jti).toBe("jti-ai-1");
    expect(openAcademyExamSitting(`${token}x`)).toBeNull();
  });

  it("onboarding slug null iken Matrix SKU param-lock kapısı taşır", () => {
    expect(academyExamGateProofLessonKey("python-temel")).toBe("python-temel-1");
    expect(academyExamGateProofLessonKey("ai-temel")).toBe("ai-temel-1");
    const proof = academyCanonicalProofSubmission("python-temel-1");
    expect(proof?.kind).toBe("param-lock");
    expect(evaluateAcademyProofSubmission("python-temel-1", proof).ok).toBe(true);
    expect(evaluateAcademyProofSubmission("python-temel-1", { kind: "param-lock", slots: {} }).ok).toBe(
      false,
    );
  });

  it("süreli oturumda iş kanıtı yoksa puan 0; kilit + doğru şık barajı geçer", async () => {
    const seed = academyCourseSeedBySlug("python-temel");
    expect(seed).toBeDefined();
    const course = memoryCourse({
      id: seed!.id,
      slug: seed!.slug,
      title: seed!.title,
      summary: seed!.summary,
      catalogUnitKey: seed!.catalogUnitKey,
    });
    const exam = memoryExam(course.id, {
      id: seed!.exam.id,
      title: seed!.exam.title,
      passScore: seed!.exam.passScore,
      questions: seed!.exam.questions,
    });
    const ports = {
      ledger: createMemoryLedgerStore([
        { userId: BUYER, amountMinor: 100_000 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: seed!.seedAmountMinor },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    };
    await ports.academy.insertCourse(course);
    await ports.academy.insertExam(exam);
    const locked = await lockAcademyCoursePrice(ports, { courseId: course.id, userId: BUYER });
    await purchaseAcademyCourse(ports, {
      courseId: course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    await completeAcademyCurriculum(ports, { courseId: course.id, userId: BUYER });

    const now = new Date("2026-08-22T12:00:00.000Z");
    const view = await loadAcademyExam(ports, course.id, BUYER, now);
    expect(view).not.toBeNull();
    expect(view!.proofLessonKey).toBe("python-temel-1");
    expect(view!.questions.some((question) => question.id.startsWith("q_pow_"))).toBe(true);

    const answers = academyExamAnswersFromPublicQuestions(view!.questions, exam.questions);
    const denied = await submitAcademyExam(ports, {
      courseId: course.id,
      userId: BUYER,
      answers,
      sessionToken: view!.sessionToken,
      now,
    });
    expect(denied.passed).toBe(false);
    expect(denied.score).toBe(0);
    expect(denied.certificate).toBeNull();

    await expect(
      submitAcademyExam(ports, {
        courseId: course.id,
        userId: BUYER,
        answers,
        sessionToken: view!.sessionToken,
        now,
        proof: academyCanonicalProofSubmission("python-temel-1") ?? undefined,
      }),
    ).rejects.toThrow(/oturumu geçersiz/);

    const retry = await loadAcademyExam(ports, course.id, BUYER, now);
    expect(retry).not.toBeNull();
    const sealedAnswers = academyExamAnswersFromPublicQuestions(retry!.questions, exam.questions);
    const sealed = await submitAcademyExam(ports, {
      courseId: course.id,
      userId: BUYER,
      answers: sealedAnswers,
      sessionToken: retry!.sessionToken,
      now,
      proof: academyCanonicalProofSubmission("python-temel-1") ?? undefined,
    });
    expect(sealed.passed).toBe(true);
    expect(sealed.score).toBeGreaterThanOrEqual(70);
    expect(sealed.certificate).not.toBeNull();
  });

  it("HMAC jetonu sunucu sicili olmadan geçmez; sahte oturum barajı açmaz", async () => {
    const seed = academyCourseSeedBySlug("python-temel");
    expect(seed).toBeDefined();
    const course = memoryCourse({
      id: seed!.id,
      slug: seed!.slug,
      title: seed!.title,
      summary: seed!.summary,
      catalogUnitKey: seed!.catalogUnitKey,
    });
    const exam = memoryExam(course.id, {
      id: seed!.exam.id,
      title: seed!.exam.title,
      passScore: seed!.exam.passScore,
      questions: seed!.exam.questions,
    });
    const ports = {
      ledger: createMemoryLedgerStore([
        { userId: BUYER, amountMinor: 100_000 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: seed!.seedAmountMinor },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    };
    await ports.academy.insertCourse(course);
    await ports.academy.insertExam(exam);
    const locked = await lockAcademyCoursePrice(ports, { courseId: course.id, userId: BUYER });
    await purchaseAcademyCourse(ports, {
      courseId: course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    await completeAcademyCurriculum(ports, { courseId: course.id, userId: BUYER });

    const now = new Date("2026-08-22T12:00:00.000Z");
    const forged = sealAcademyExamSitting({
      userId: BUYER,
      courseId: course.id,
      examId: exam.id,
      startedAt: now,
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
      jti: "forged-sitting-jti",
      items: exam.questions.slice(0, 4).map((question) => ({
        id: question.id,
        permutation: question.choices.map((_, choiceIndex) => choiceIndex),
      })),
      proofLessonKey: "python-temel-1",
    });
    await expect(
      submitAcademyExam(ports, {
        courseId: course.id,
        userId: BUYER,
        answers: exam.questions.slice(0, 4).map((question) => ({
          questionId: question.id,
          choiceIndex: question.correctIndex,
        })),
        sessionToken: forged,
        now,
        proof: academyCanonicalProofSubmission("python-temel-1") ?? undefined,
      }),
    ).rejects.toThrow(/oturumu geçersiz/);
    expect(await ports.academy.getCertificateByUserAndCourse(BUYER, course.id)).toBeNull();
  });

  it("boş sessionToken fail-closed; havuz puanlama yok", async () => {
    const seed = academyCourseSeedBySlug("python-temel");
    expect(seed).toBeDefined();
    const course = memoryCourse({
      id: seed!.id,
      slug: seed!.slug,
      title: seed!.title,
      summary: seed!.summary,
      catalogUnitKey: seed!.catalogUnitKey,
    });
    const exam = memoryExam(course.id, {
      id: seed!.exam.id,
      title: seed!.exam.title,
      passScore: seed!.exam.passScore,
      questions: seed!.exam.questions,
    });
    const ports = {
      ledger: createMemoryLedgerStore([
        { userId: BUYER, amountMinor: 100_000 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: seed!.seedAmountMinor },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    };
    await ports.academy.insertCourse(course);
    await ports.academy.insertExam(exam);
    const locked = await lockAcademyCoursePrice(ports, { courseId: course.id, userId: BUYER });
    await purchaseAcademyCourse(ports, {
      courseId: course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    await completeAcademyCurriculum(ports, { courseId: course.id, userId: BUYER });
    await expect(
      submitAcademyExam(ports, {
        courseId: course.id,
        userId: BUYER,
        answers: [{ questionId: "q1", choiceIndex: 0 }],
        sessionToken: "   ",
      }),
    ).rejects.toThrow(/oturumu geçersiz/);
  });
});
