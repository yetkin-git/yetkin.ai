import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { submitAcademyExam } from "@/lib/academy/exam-engine";
import { completeAcademyCurriculum } from "@/lib/academy/curriculum-engine";
import { academyCurriculumSealForSlug } from "@/lib/academy/curriculum";
import { verifyAcademyCertificateHash } from "@/lib/academy/exam";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { createMemoryLedgerStore } from "./memory-money";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "./memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "./memory-pricing";
import type { AcademyCertificateRecord, AcademyPurchaseRecord } from "@/lib/academy/types";
import type { MemoryLedgerStore } from "./memory-money";

export const E2E_ACADEMY_BUYER_ID = "e2e-academy-buyer";
export const E2E_ACADEMY_PLATFORM_ID = PLATFORM_TREASURY_USER_ID;
export const E2E_ACADEMY_START_MINOR = 100_000;
export const E2E_ACADEMY_SLUG = "rail-temel";

export type AcademyCashJourneyResult = {
  ledger: MemoryLedgerStore;
  purchase: AcademyPurchaseRecord;
  firstApplied: boolean;
  replayApplied: boolean;
  certificate: AcademyCertificateRecord | null;
  buyerBalanceAfter: number;
  platformBalanceAfter: number;
  seedAmountMinor: number;
};

/**
 * Akademi mutlu yol (bellek): katalog tohumu → kilit → settlement → müfredat → sınav ≥70 → SHA256 sertifika.
 * Emanet yoktur. Canlı Postgres/Auth istemez.
 */
export async function runAcademyCashJourney(): Promise<AcademyCashJourneyResult> {
  const seed = academyCourseSeedBySlug(E2E_ACADEMY_SLUG);
  if (!seed) {
    throw new Error("rail-temel tohumu yok.");
  }
  const now = new Date("2026-08-15T18:00:00.000Z");
  const course = memoryCourse({
    id: seed.id,
    slug: seed.slug,
    title: seed.title,
    summary: seed.summary,
    catalogUnitKey: seed.catalogUnitKey,
  });
  const exam = memoryExam(course.id, {
    id: seed.exam.id,
    title: seed.exam.title,
    passScore: seed.exam.passScore,
    questions: seed.exam.questions,
  });
  const ledger = createMemoryLedgerStore([
    { userId: E2E_ACADEMY_BUYER_ID, amountMinor: E2E_ACADEMY_START_MINOR },
    { userId: E2E_ACADEMY_PLATFORM_ID, amountMinor: 0 },
  ]);
  const ports = {
    ledger,
    catalog: createMemoryPriceCatalogStore([
      {
        moduleKey: ACADEMY_MODULE_KEY,
        unitKey: seed.catalogUnitKey,
        amountMinor: seed.seedAmountMinor,
      },
    ]),
    locks: createMemoryCheckoutPriceLockStore(),
    academy: createMemoryAcademyStore(),
  };
  await ports.academy.insertCourse(course);
  await ports.academy.insertExam(exam);

  const locked = await lockAcademyCoursePrice(ports, {
    courseId: course.id,
    userId: E2E_ACADEMY_BUYER_ID,
    now,
  });
  const first = await purchaseAcademyCourse(ports, {
    courseId: course.id,
    userId: E2E_ACADEMY_BUYER_ID,
    lockId: locked.lock.id,
    platformUserId: E2E_ACADEMY_PLATFORM_ID,
    now,
  });
  const replay = await purchaseAcademyCourse(ports, {
    courseId: course.id,
    userId: E2E_ACADEMY_BUYER_ID,
    lockId: locked.lock.id,
    platformUserId: E2E_ACADEMY_PLATFORM_ID,
    now,
  });

  const curriculum = await completeAcademyCurriculum(ports, {
    courseId: course.id,
    userId: E2E_ACADEMY_BUYER_ID,
    now,
  });
  if (!curriculum.curriculumComplete) {
    throw new Error("Müfredat tamamlanmadı.");
  }

  const passing = seed.exam.questions.map((question) => ({
    questionId: question.id,
    choiceIndex: question.correctIndex,
  }));
  const examNow = new Date("2026-08-15T18:05:00.000Z");
  const examResult = await submitAcademyExam(ports, {
    courseId: course.id,
    userId: E2E_ACADEMY_BUYER_ID,
    answers: passing,
    now: examNow,
  });
  if (!examResult.certificate?.certificateHash) {
    throw new Error("Sertifika hash basılmadı.");
  }
  const hashOk = verifyAcademyCertificateHash({
    userId: E2E_ACADEMY_BUYER_ID,
    courseId: course.id,
    attemptId: examResult.attempt.id,
    score: examResult.score,
    issuedAt: examNow,
    curriculumSeal: academyCurriculumSealForSlug(E2E_ACADEMY_SLUG)!,
    certificateHash: examResult.certificate.certificateHash,
  });
  if (!hashOk) {
    throw new Error("Sertifika hash doğrulanamadı.");
  }

  return {
    ledger,
    purchase: first.purchase,
    firstApplied: first.applied,
    replayApplied: replay.applied,
    certificate: examResult.certificate,
    buyerBalanceAfter: ledger.snapshot(E2E_ACADEMY_BUYER_ID).amountMinor,
    platformBalanceAfter: ledger.snapshot(E2E_ACADEMY_PLATFORM_ID).amountMinor,
    seedAmountMinor: seed.seedAmountMinor,
  };
}
