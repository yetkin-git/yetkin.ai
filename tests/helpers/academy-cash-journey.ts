import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { completeAcademyCurriculum } from "@/lib/academy/curriculum-engine";
import { curriculumForCourseSlug, academyCurriculumSealForSlug } from "@/lib/academy/curriculum";
import { verifyAcademyCertificateHash } from "@/lib/academy/exam";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { createMemoryLedgerStore } from "./memory-money";
import { createMemoryAcademyStore, memoryPublishedSku } from "./memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "./memory-pricing";
import { submitAcademyExamWithFreshSitting } from "./academy-exam-sitting";
import type { AcademyCertificateRecord, AcademyPurchaseRecord } from "@/lib/academy/types";
import type { MemoryLedgerStore } from "./memory-money";

export const E2E_ACADEMY_BUYER_ID = "e2e-academy-buyer";
export const E2E_ACADEMY_PLATFORM_ID = PLATFORM_TREASURY_USER_ID;
export const E2E_ACADEMY_START_MINOR = 200_000;
/** Yayın amiral SKU — 6 compact makale + ofis sınav havuzu. */
export const E2E_ACADEMY_SLUG = "01_office_ai";
export const E2E_ACADEMY_SEED_AMOUNT_MINOR = 89_000;

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
 * Akademi mutlu yol (bellek): 01_office_ai → kilit → settlement → 6 makale → sınav → SHA-256.
 * Emanet yoktur. Canlı Postgres/Auth istemez.
 */
export async function runAcademyCashJourney(): Promise<AcademyCashJourneyResult> {
  const published = memoryPublishedSku(E2E_ACADEMY_SLUG);
  const seedAmountMinor = published.amountMinor;
  const now = new Date("2026-08-15T18:00:00.000Z");
  const course = published.course;
  const exam = published.exam;
  const ledger = createMemoryLedgerStore([
    { userId: E2E_ACADEMY_BUYER_ID, amountMinor: E2E_ACADEMY_START_MINOR },
    { userId: E2E_ACADEMY_PLATFORM_ID, amountMinor: 0 },
  ]);
  const ports = {
    ledger,
    catalog: createMemoryPriceCatalogStore([
      {
        moduleKey: ACADEMY_MODULE_KEY,
        unitKey: course.catalogUnitKey,
        amountMinor: seedAmountMinor,
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

  const lessons = curriculumForCourseSlug(E2E_ACADEMY_SLUG);
  if (lessons.length !== 6) {
    throw new Error(`01_office_ai müfredatı 6 ders ister, gelen ${lessons.length}.`);
  }

  const curriculum = await completeAcademyCurriculum(ports, {
    courseId: course.id,
    userId: E2E_ACADEMY_BUYER_ID,
    now,
  });
  if (!curriculum.curriculumComplete) {
    throw new Error("Müfredat tamamlanmadı.");
  }

  const examNow = new Date("2026-08-15T18:05:00.000Z");
  const examResult = await submitAcademyExamWithFreshSitting(ports, {
    courseId: course.id,
    userId: E2E_ACADEMY_BUYER_ID,
    now: examNow,
  });
  if (!examResult.certificate?.certificateHash) {
    throw new Error("Sertifika hash basılmadı.");
  }
  const seal = academyCurriculumSealForSlug(E2E_ACADEMY_SLUG);
  if (!seal) {
    throw new Error("Müfredat mührü yok.");
  }
  const hashOk = verifyAcademyCertificateHash({
    userId: E2E_ACADEMY_BUYER_ID,
    courseId: course.id,
    attemptId: examResult.attempt.id,
    score: examResult.score,
    issuedAt: examNow,
    curriculumSeal: seal,
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
    seedAmountMinor,
  };
}

