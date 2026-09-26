import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  academyCatalogPriceMinorForSlug,
  OFF_201_CATALOG_READER_DEFAULT_MINOR,
  OFF_201_LAUNCH_PRICE_MINOR,
} from "@/lib/academy/catalog-pricing";
import { assertPhase2ExamInterfacesReadyForText } from "@/lib/academy/curricula/phase2-exam-readiness";
import { OFF_201_EXAM_PASS_SCORE } from "@/lib/academy/curricula/office_ai/off-201";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { ACADEMY_EXAM_PASS_SCORE, gradeAcademyExam } from "@/lib/academy/exam";
import { OFFICE_AI_2_EXAM_QUESTIONS, academyExamPoolForSlug } from "@/lib/academy/exam-pools";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { loadAcademyLessonExam } from "@/lib/academy/lesson-exams";
import {
  OFF_201_CATALOG_MODULE_KEY,
  OFF_201_CATALOG_UNIT_KEY,
  off201CatalogPriceIsSet,
} from "@/lib/academy/off201-catalog-slot";
import {
  loadOff101ExemptionExam,
  OFF_101_EXEMPTION_SEAL_TITLE,
  submitOff101ExemptionExam,
} from "@/lib/academy/off101-exemption";
import { academyExamAnswersFromPublicQuestions } from "@/lib/academy/exam-sitting";
import { ACADEMY_MODULE_KEY, type AcademyCertificateRecord } from "@/lib/academy/types";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "buyer-off201";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
/** Super Admin test satırı — 129000 kuruş, ₺1.290 KDV dahil. Satış sabiti değildir. */
const CATALOG_PRICE = 129_000;
const BUYER_START = 229_000;
const FORBIDDEN = [
  /\bprompt\b/iu,
  /\btemperature\b/iu,
  /\bSUM\b/u,
  /XLOOKUP/iu,
  /özet tablo/iu,
  /\bOCR\b/u,
  /belge birleştirme/iu,
  /yapay zeka\b/u,
];

function certificate(score: number | null, revokedAt: Date | null = null): AcademyCertificateRecord {
  const now = new Date("2026-09-01T00:00:00.000Z");
  return {
    id: "cert-off101",
    userId: BUYER,
    courseId: "course-off101",
    purchaseId: "purchase-off101",
    attemptId: "attempt-off101",
    title: "Ofiste Yapay Zekâ",
    serialKey: "serial-off101",
    certificateHash: "ab".repeat(32),
    curriculumSeal: "cd".repeat(32),
    score,
    issuedAt: now,
    revokedAt,
    revokeReason: revokedAt ? "iptal" : null,
    createdAt: now,
  };
}

function world(score: number | null | "none" = "none", revoked = false) {
  const prior = memoryCourse({
    id: "course-off101",
    slug: "01_office_ai",
    title: "Ofiste Yapay Zekâ",
    catalogUnitKey: "course:01_office_ai",
  });
  const course = memoryCourse({
    id: "course-off201",
    slug: "01_office_ai_ileri",
    title: "İleri Ofis Yapay Zekâ",
    catalogUnitKey: OFF_201_CATALOG_UNIT_KEY,
  });
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: BUYER_START },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const catalog = createMemoryPriceCatalogStore([
    {
      moduleKey: ACADEMY_MODULE_KEY,
      unitKey: OFF_201_CATALOG_UNIT_KEY,
      amountMinor: CATALOG_PRICE,
    },
  ]);
  const locks = createMemoryCheckoutPriceLockStore();
  const academy = createMemoryAcademyStore();
  return { prior, course, ledger, catalog, locks, academy, score, revoked };
}

async function seed(ports: ReturnType<typeof world>) {
  await ports.academy.insertCourse(ports.prior);
  await ports.academy.insertCourse(ports.course);
  if (ports.score !== "none") {
    await ports.academy.insertCertificate(certificate(ports.score, ports.revoked ? new Date("2026-09-02T00:00:00.000Z") : null));
  }
}

describe("OFF-201 fırın öncesi hazırlık", () => {
  it("kurs havuzu 36 soru, mini sınav ders başı 3, baraj A4 ile 70", () => {
    expect(() => assertPhase2ExamInterfacesReadyForText()).not.toThrow();
    expect(OFF_201_EXAM_PASS_SCORE).toBe(ACADEMY_EXAM_PASS_SCORE);
    expect(ACADEMY_EXAM_PASS_SCORE).toBe(70);
    expect(OFFICE_AI_2_EXAM_QUESTIONS).toHaveLength(36);
    expect(academyExamPoolForSlug("01_office_ai_ileri")).toHaveLength(36);
    expect(academyExamPoolForSlug("OFF-201")).toHaveLength(36);
    const keys = curriculumLessonKeysForSlug("01_office_ai_ileri");
    expect(keys).toHaveLength(6);
    for (const key of keys) {
      const exam = loadAcademyLessonExam(key);
      expect(exam?.passScore).toBe(ACADEMY_EXAM_PASS_SCORE);
      expect(exam?.questions.length).toBeGreaterThanOrEqual(3);
      for (const question of exam?.questions ?? []) {
        expect(OFFICE_AI_2_EXAM_QUESTIONS.some((row) => row.id === question.id)).toBe(false);
      }
    }
    const surface = OFFICE_AI_2_EXAM_QUESTIONS.map((row) => `${row.prompt}\n${row.choices.join("\n")}`).join("\n");
    for (const pattern of FORBIDDEN) {
      expect(surface).not.toMatch(pattern);
    }
    const drawn = OFFICE_AI_2_EXAM_QUESTIONS.slice(0, 10);
    const perfect = gradeAcademyExam(
      drawn,
      drawn.map((question) => ({ questionId: question.id, choiceIndex: question.correctIndex })),
    );
    expect(perfect.score).toBe(100);
    expect(perfect.score >= ACADEMY_EXAM_PASS_SCORE).toBe(true);
    const six = gradeAcademyExam(
      drawn,
      drawn.map((question, index) => ({
        questionId: question.id,
        choiceIndex: index < 6 ? question.correctIndex : (question.correctIndex + 1) % 4,
      })),
    );
    expect(six.score).toBe(60);
    expect(six.score >= ACADEMY_EXAM_PASS_SCORE).toBe(false);
  });

  it("katalog satırı yokken soğuk fiyat basmaz; satır varsa o kuruşu keser", () => {
    expect(OFF_201_CATALOG_READER_DEFAULT_MINOR).toBeNull();
    expect(academyCatalogPriceMinorForSlug("01_office_ai_ileri")).toBeNull();
    expect(OFF_201_LAUNCH_PRICE_MINOR).toBe(129_000);
    expect(readFileSync(join(process.cwd(), "supabase/migrations/20260926153000_off201_launch_price.sql"), "utf8")).toContain(
      "129000",
    );
    expect(OFF_201_CATALOG_MODULE_KEY).toBe(ACADEMY_MODULE_KEY);
    expect(OFF_201_CATALOG_UNIT_KEY).toBe("course:01_office_ai_ileri");
    const slot = readFileSync(join(process.cwd(), "lib/academy/off201-catalog-slot.ts"), "utf8");
    expect(slot).not.toMatch(/seedAmountMinor/u);
    expect(slot).not.toMatch(/=\s*\d{2,}/u);
    expect(readFileSync(join(process.cwd(), "lib/academy/catalog-pricing.ts"), "utf8")).toContain(
      "OFF_201_CATALOG_READER_DEFAULT_MINOR",
    );
    expect(CATALOG_PRICE).toBe(129_000);
    expect(off201CatalogPriceIsSet([])).toBe(false);
    expect(
      off201CatalogPriceIsSet([
        {
          moduleKey: OFF_201_CATALOG_MODULE_KEY,
          unitKey: OFF_201_CATALOG_UNIT_KEY,
          isActive: true,
          amountMinor: CATALOG_PRICE,
        },
      ]),
    ).toBe(true);
    expect(ADMIN_SEN.off201PriceUnset.body).toContain(OFF_201_CATALOG_UNIT_KEY);
    expect(ADMIN_SEN.off201PriceUnset.body).toMatch(/kodda durmaz/u);
    expect(ADMIN_SEN.off201PriceUnset.body).not.toMatch(/\d{3,}/u);
    const page = readFileSync(join(process.cwd(), "app/(kernel)/admin/page.tsx"), "utf8");
    expect(page).toContain("off201PriceUnset");
    expect(page).toContain("academy.off201.catalog_price_unset");
  });

  it("altı ders mühürlüyse satış açılır; OFF-101 belgesi şart değildir", async () => {
    for (const ports of [world(), world(69), world(80, true), world(70)]) {
      await seed(ports);
      const locked = await lockAcademyCoursePrice(ports, { courseId: ports.course.id, userId: BUYER });
      expect(locked.lock.amountMinor).toBe(CATALOG_PRICE);
      expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(BUYER_START);
    }

    const buyer = world();
    await seed(buyer);
    const locked = await lockAcademyCoursePrice(buyer, { courseId: buyer.course.id, userId: BUYER });
    const bought = await purchaseAcademyCourse(buyer, {
      courseId: buyer.course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    expect(bought.applied).toBe(true);
    expect(buyer.ledger.snapshot(BUYER).amountMinor).toBe(BUYER_START - CATALOG_PRICE);
    expect(buyer.ledger.snapshot(PLATFORM).amountMinor).toBe(CATALOG_PRICE);
    const again = await purchaseAcademyCourse(buyer, {
      courseId: buyer.course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    expect(again.applied).toBe(false);
    expect(buyer.ledger.snapshot(BUYER).amountMinor).toBe(BUYER_START - CATALOG_PRICE);
    expect(buyer.ledger.snapshot(PLATFORM).amountMinor).toBe(CATALOG_PRICE);
  });

  it("baraj altı muafiyet satın almayı kesmez; mühür ikinci kez para kesmez", async () => {
    const now = new Date("2026-09-24T08:00:00.000Z");
    const pool = academyExamPoolForSlug("01_office_ai");
    const ports = world();
    await seed(ports);
    await ports.academy.insertExam({
      id: "exam-off101",
      courseId: ports.prior.id,
      title: "OFF-101 Muafiyet / Seviye Tespit Sınavı",
      passScore: 70,
      questions: pool.map((question) => ({ ...question })),
      createdAt: now,
      updatedAt: now,
    });
    const low = await loadOff101ExemptionExam(ports, ports.prior.id, BUYER, now);
    const lowAnswers = academyExamAnswersFromPublicQuestions(low.questions, pool).map((answer) => ({
      ...answer,
      choiceIndex: (answer.choiceIndex + 1) % 4,
    }));
    const lowSubmit = await submitOff101ExemptionExam(ports, {
      courseId: ports.prior.id,
      userId: BUYER,
      sessionToken: low.sessionToken,
      now,
      answers: lowAnswers,
    });
    expect(lowSubmit.passed).toBe(false);
    expect(lowSubmit.seal).toBeNull();
    const locked = await lockAcademyCoursePrice(ports, { courseId: ports.course.id, userId: BUYER });
    expect(locked.lock.amountMinor).toBe(CATALOG_PRICE);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(BUYER_START);

    const opened = await loadOff101ExemptionExam(ports, ports.prior.id, BUYER, now);
    const passed = await submitOff101ExemptionExam(ports, {
      courseId: ports.prior.id,
      userId: BUYER,
      sessionToken: opened.sessionToken,
      now,
      answers: academyExamAnswersFromPublicQuestions(opened.questions, pool),
    });
    expect(passed.passed).toBe(true);
    expect(passed.seal?.title).toBe(OFF_101_EXEMPTION_SEAL_TITLE);
    expect(passed.score).toBeGreaterThanOrEqual(70);
    await expect(
      purchaseAcademyCourse(ports, {
        courseId: ports.course.id,
        userId: BUYER,
        lockId: "missing-lock",
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow("Satın alma için geçerli fiyat kilidi yok.");
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(BUYER_START);
    const bought = await purchaseAcademyCourse(ports, {
      courseId: ports.course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    expect(bought.applied).toBe(true);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(BUYER_START - CATALOG_PRICE);
    const repeat = await purchaseAcademyCourse(ports, {
      courseId: ports.course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    expect(repeat.applied).toBe(false);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(BUYER_START - CATALOG_PRICE);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(CATALOG_PRICE);
  });
});
