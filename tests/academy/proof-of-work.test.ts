import { describe, expect, it } from "vitest";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import {
  completeAcademyLesson,
  loadAcademyCurriculumPlayer,
} from "@/lib/academy/curriculum-engine";
import { loadAcademyExam } from "@/lib/academy/exam-engine";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import {
  ACADEMY_PROOF_OF_WORK_HASH_PATTERN,
  ACADEMY_PROOF_OF_WORK_VERSION,
  academyCanonicalProofSubmission,
  academyInteractiveTaskByKey,
  academyProofOfWorkCanonicalJson,
  academyProofOfWorkHash,
  canonicalAcademyProofOfWorkHash,
  evaluateAcademyProofSubmission,
  isAcademyWorkTasksComplete,
  listAcademyInteractiveTaskKeys,
} from "@/lib/academy/proof-of-work";
import { completeAcademyLessonInputSchema } from "@/lib/academy/schemas";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "pow-buyer";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

describe("akademi fail-closed iş kanıtı", () => {
  it("HTTP tamamlama şeması proof gövdesini isteğe bağlı tutar", () => {
    expect(completeAcademyLessonInputSchema.safeParse({ lessonKey: "python-temel-1" }).success).toBe(
      true,
    );
    expect(
      completeAcademyLessonInputSchema.safeParse({
        lessonKey: "python-temel-1",
        proof: academyCanonicalProofSubmission("python-temel-1"),
      }).success,
    ).toBe(true);
  });

  it("Matrix derslerin her birinde görev tohumu vardır; kanonik gönderim geçer", () => {
    const curriculumKeys = new Set<string>();
    for (const row of ACADEMY_COURSE_SEEDS) {
      for (const lesson of curriculumForCourseSlug(row.slug)) {
        curriculumKeys.add(lesson.key);
      }
    }
    expect(curriculumKeys.size).toBe(132);
    for (const lessonKey of curriculumKeys) {
      const task = academyInteractiveTaskByKey(lessonKey);
      expect(task, lessonKey).not.toBeNull();
      const proof = academyCanonicalProofSubmission(lessonKey);
      expect(proof, lessonKey).not.toBeNull();
      const judged = evaluateAcademyProofSubmission(lessonKey, proof);
      expect(judged.ok, lessonKey).toBe(true);
      if (!judged.ok) {
        continue;
      }
      const hash = academyProofOfWorkHash(
        academyProofOfWorkCanonicalJson({ lessonKey, success: judged.success }),
        sha256Hex,
      );
      expect(hash).toMatch(ACADEMY_PROOF_OF_WORK_HASH_PATTERN);
    }
    expect(listAcademyInteractiveTaskKeys().length).toBe(Object.keys(LESSON_PRACTICE).length);
    expect(ACADEMY_PROOF_OF_WORK_VERSION).toBe("yetkin-rail.academy.proof-of-work.v1");
    expect(academyInteractiveTaskByKey("python-temel-1")?.kind).toBe("param-lock");
    expect(canonicalAcademyProofOfWorkHash("python-temel-1", sha256Hex)).toMatch(
      ACADEMY_PROOF_OF_WORK_HASH_PATTERN,
    );
    expect(canonicalAcademyProofOfWorkHash("python-temel-2", sha256Hex)).toMatch(
      ACADEMY_PROOF_OF_WORK_HASH_PATTERN,
    );
    expect(canonicalAcademyProofOfWorkHash("python-temel-3", sha256Hex)).toMatch(
      ACADEMY_PROOF_OF_WORK_HASH_PATTERN,
    );
  });

  it("yanlış tutar, yasak tarif ve yanlış kilit düşer", () => {
    expect(
      evaluateAcademyProofSubmission("python-temel-1", {
        kind: "amount-kurus",
        amountText: "250.00",
        currencyText: "TRY",
      }).ok,
    ).toBe(false);
    expect(
      evaluateAcademyProofSubmission("python-temel-1", {
        kind: "prompt-pack",
        prompt: "yanlış tarif",
        slots: {},
      }).ok,
    ).toBe(false);
    const lock = academyCanonicalProofSubmission("python-temel-1");
    expect(lock?.kind).toBe("param-lock");
    if (lock?.kind === "param-lock") {
      const wrong = { ...lock, slots: { ...lock.slots, s1: "d-float" } };
      expect(evaluateAcademyProofSubmission("python-temel-1", wrong).ok).toBe(false);
    }
  });

  it("iş kanıtı gövdesi olmadan SETTLED ders kapanır; motor kanonik özeti basar", async () => {
    const course = memoryCourse();
    const ports = {
      ledger: createMemoryLedgerStore([
        { userId: BUYER, amountMinor: 100_000 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: 25_000 },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    };
    await ports.academy.insertCourse(course);
    await ports.academy.insertExam(memoryExam(course.id));
    const locked = await lockAcademyCoursePrice(ports, { courseId: course.id, userId: BUYER });
    await purchaseAcademyCourse(ports, {
      courseId: course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    const lessons = curriculumForCourseSlug(course.slug);
    const first = await completeAcademyLesson(ports, {
      courseId: course.id,
      userId: BUYER,
      lessonKey: lessons[0]!.key,
    });
    expect(first.applied).toBe(true);
    expect(first.completion.proofOfWorkHash).toMatch(ACADEMY_PROOF_OF_WORK_HASH_PATTERN);
    expect(
      isAcademyWorkTasksComplete(
        lessons.map((lesson) => lesson.key),
        [first.completion],
      ),
    ).toBe(false);

    const player = await loadAcademyCurriculumPlayer(ports, {
      courseId: course.id,
      userId: BUYER,
    });
    expect(player.workTasksComplete).toBe(false);
    // Doğrudan sınav/vize: ödeme sonrası oturum açılır (onboarding SKU'da iş kanıtı pimi yoktur).
    const examView = await loadAcademyExam(ports, course.id, BUYER);
    expect(examView).not.toBeNull();
    expect(examView?.purchaseId).toBeTruthy();
  });

  it("tamamlanan ders satırı süreç Map'i boşken sınav kapısını açık tutar", async () => {
    const course = memoryCourse();
    const ports = {
      ledger: createMemoryLedgerStore([
        { userId: BUYER, amountMinor: 100_000 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: 25_000 },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    };
    await ports.academy.insertCourse(course);
    await ports.academy.insertExam(memoryExam(course.id));
    const locked = await lockAcademyCoursePrice(ports, { courseId: course.id, userId: BUYER });
    await purchaseAcademyCourse(ports, {
      courseId: course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    const purchase = await ports.academy.getPurchaseByUserAndCourse(BUYER, course.id);
    expect(purchase).not.toBeNull();
    const lessons = curriculumForCourseSlug(course.slug);
    const now = new Date("2026-08-22T12:00:00.000Z");
    for (const lesson of lessons) {
      await ports.academy.insertLessonCompletion({
        id: `row-${lesson.key}`,
        userId: BUYER,
        courseId: course.id,
        purchaseId: purchase!.id,
        lessonKey: lesson.key,
        proofOfWorkHash: null,
        completedAt: now,
        createdAt: now,
      });
    }
    const rows = await ports.academy.listLessonCompletionsByPurchase(purchase!.id);
    expect(isAcademyWorkTasksComplete(lessons.map((lesson) => lesson.key), rows)).toBe(true);
    expect(await loadAcademyExam(ports, course.id, BUYER)).not.toBeNull();
  });
});
