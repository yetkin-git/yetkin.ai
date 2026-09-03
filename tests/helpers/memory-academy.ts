import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type {
  AcademyCertificateRecord,
  AcademyCourseRecord,
  AcademyExamAttemptRecord,
  AcademyExamRecord,
  AcademyExamSittingRecord,
  AcademyLessonCompletionRecord,
  AcademyPulse,
  AcademyPurchaseRecord,
  AcademyStore,
} from "@/lib/academy/types";
import type { AcademyEnginePorts, AcademyPurchaseWritePorts } from "@/lib/academy/engine";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import {
  academyExamSittingMayConsume,
  cloneAcademyExamSittingItems,
} from "@/lib/academy/exam-sitting";
import { orderAcademyCatalogByCurriculum } from "@/lib/academy/catalog-filter";
import { createSerializedUnitOfWork, type MemoryLedgerStore } from "./memory-money";
import type { MemoryCheckoutPriceLockStore } from "./memory-pricing";

type AcademyMemoryState = {
  courses: Array<[string, AcademyCourseRecord]>;
  purchases: Array<[string, AcademyPurchaseRecord]>;
  certificates: Array<[string, AcademyCertificateRecord]>;
  exams: Array<[string, AcademyExamRecord]>;
  attempts: Array<[string, AcademyExamAttemptRecord]>;
  completions: Array<[string, AcademyLessonCompletionRecord]>;
  sittings: Array<[string, AcademyExamSittingRecord]>;
};

export type MemoryAcademyStore = AcademyStore & {
  failNextPurchaseInsert(): void;
  capture(): AcademyMemoryState;
  restore(state: AcademyMemoryState): void;
};

export function createMemoryAcademyStore(): MemoryAcademyStore {
  const courses = new Map<string, AcademyCourseRecord>();
  const purchases = new Map<string, AcademyPurchaseRecord>();
  const certificates = new Map<string, AcademyCertificateRecord>();
  const exams = new Map<string, AcademyExamRecord>();
  const attempts = new Map<string, AcademyExamAttemptRecord>();
  const completions = new Map<string, AcademyLessonCompletionRecord>();
  const sittings = new Map<string, AcademyExamSittingRecord>();
  let failPurchase = false;

  return {
    failNextPurchaseInsert() {
      failPurchase = true;
    },
    capture() {
      return {
        courses: [...courses.entries()].map(([key, value]) => [key, { ...value }]),
        purchases: [...purchases.entries()].map(([key, value]) => [key, { ...value }]),
        certificates: [...certificates.entries()].map(([key, value]) => [key, { ...value }]),
        exams: [...exams.entries()].map(([key, value]) => [
          key,
          { ...value, questions: value.questions.map((question) => ({ ...question })) },
        ]),
        attempts: [...attempts.entries()].map(([key, value]) => [
          key,
          { ...value, answers: value.answers.map((answer) => ({ ...answer })) },
        ]),
        completions: [...completions.entries()].map(([key, value]) => [key, { ...value }]),
        sittings: [...sittings.entries()].map(([key, value]) => [
          key,
          {
            ...value,
            items: cloneAcademyExamSittingItems(value.items),
          },
        ]),
      };
    },
    restore(state) {
      courses.clear();
      purchases.clear();
      certificates.clear();
      exams.clear();
      attempts.clear();
      completions.clear();
      sittings.clear();
      for (const [key, value] of state.courses) {
        courses.set(key, { ...value });
      }
      for (const [key, value] of state.purchases) {
        purchases.set(key, { ...value });
      }
      for (const [key, value] of state.certificates) {
        certificates.set(key, { ...value });
      }
      for (const [key, value] of state.exams) {
        exams.set(key, {
          ...value,
          questions: value.questions.map((question) => ({ ...question })),
        });
      }
      for (const [key, value] of state.attempts) {
        attempts.set(key, {
          ...value,
          answers: value.answers.map((answer) => ({ ...answer })),
        });
      }
      for (const [key, value] of state.completions) {
        completions.set(key, { ...value });
      }
      for (const [key, value] of state.sittings) {
        sittings.set(key, {
          ...value,
          items: cloneAcademyExamSittingItems(value.items),
        });
      }
    },
    async insertCourse(course) {
      courses.set(course.id, course);
      return { ...course };
    },
    async getCourse(id) {
      const row = courses.get(id);
      return row ? { ...row } : null;
    },
    async getCourseBySlug(slug) {
      const found = [...courses.values()].find((row) => row.slug === slug);
      return found ? { ...found } : null;
    },
    async listPublishedCourses() {
      return orderAcademyCatalogByCurriculum(
        [...courses.values()].filter((row) => row.isPublished),
      ).map((row) => ({ ...row }));
    },
    async insertPurchase(purchase) {
      if (failPurchase) {
        failPurchase = false;
        throw new Error("Satın alma yazımı düştü.");
      }
      const duplicate = [...purchases.values()].find(
        (row) => row.userId === purchase.userId && row.courseId === purchase.courseId,
      );
      if (duplicate) {
        const error = new Error("Unique constraint failed");
        error.name = "PrismaClientKnownRequestError";
        (error as unknown as { code: string }).code = "P2002";
        throw error;
      }
      purchases.set(purchase.id, purchase);
      return { ...purchase };
    },
    async updatePurchase(id, patch) {
      const found = purchases.get(id);
      if (!found) {
        throw new Error("Satın alma bulunamadı.");
      }
      const next: AcademyPurchaseRecord = { ...found, ...patch };
      purchases.set(id, next);
      return { ...next };
    },
    async getPurchase(id) {
      const row = purchases.get(id);
      return row ? { ...row } : null;
    },
    async getPurchaseByUserAndCourse(userId, courseId) {
      const found = [...purchases.values()].find(
        (row) => row.userId === userId && row.courseId === courseId,
      );
      return found ? { ...found } : null;
    },
    async listPurchasesForUser(userId) {
      return [...purchases.values()]
        .filter((row) => row.userId === userId)
        .sort((a, b) => b.settledAt.getTime() - a.settledAt.getTime())
        .map((row) => ({ ...row }));
    },
    async insertCertificate(certificate) {
      certificates.set(certificate.id, certificate);
      return { ...certificate };
    },
    async revokeCertificate(id, patch) {
      const found = certificates.get(id);
      if (!found) {
        throw new Error("Sertifika bulunamadı.");
      }
      const next = { ...found, revokedAt: patch.revokedAt, revokeReason: patch.revokeReason };
      certificates.set(id, next);
      return { ...next };
    },
    async getCertificateByPurchaseId(purchaseId) {
      const found = [...certificates.values()].find((row) => row.purchaseId === purchaseId);
      return found ? { ...found } : null;
    },
    async getCertificateByUserAndCourse(userId, courseId) {
      const found = [...certificates.values()].find(
        (row) => row.userId === userId && row.courseId === courseId,
      );
      return found ? { ...found } : null;
    },
    async getCertificateByHash(hash) {
      const found = [...certificates.values()].find(
        (row) => row.certificateHash === hash || row.serialKey === hash,
      );
      return found ? { ...found } : null;
    },
    async listCertificatesForUser(userId) {
      return [...certificates.values()]
        .filter((row) => row.userId === userId)
        .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime())
        .map((row) => ({ ...row }));
    },
    async insertExam(exam) {
      exams.set(exam.id, exam);
      return { ...exam, questions: exam.questions.map((question) => ({ ...question })) };
    },
    async getExamByCourseId(courseId) {
      const found = [...exams.values()].find((row) => row.courseId === courseId);
      return found
        ? { ...found, questions: found.questions.map((question) => ({ ...question })) }
        : null;
    },
    async insertExamSitting(sitting) {
      const record: AcademyExamSittingRecord = {
        ...sitting,
        items: cloneAcademyExamSittingItems(sitting.items),
      };
      sittings.set(record.jti, record);
      return {
        ...record,
        items: cloneAcademyExamSittingItems(record.items),
      };
    },
    async getExamSittingByJti(jti) {
      const row = sittings.get(jti);
      return row
        ? { ...row, items: cloneAcademyExamSittingItems(row.items) }
        : null;
    },
    async consumeExamSitting(input) {
      const row = sittings.get(input.jti);
      if (!row || !academyExamSittingMayConsume(row, input)) {
        return false;
      }
      row.consumedAt = input.now;
      sittings.set(row.jti, row);
      return true;
    },
    async insertAttempt(attempt) {
      attempts.set(attempt.id, attempt);
      return { ...attempt, answers: attempt.answers.map((answer) => ({ ...answer })) };
    },
    async listAttemptsForUserExam(userId, examId) {
      return [...attempts.values()]
        .filter((row) => row.userId === userId && row.examId === examId)
        .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
        .map((row) => ({ ...row, answers: row.answers.map((answer) => ({ ...answer })) }));
    },
    async insertLessonCompletion(completion) {
      const key = `${completion.purchaseId}:${completion.lessonKey}`;
      const existing = completions.get(key);
      if (existing) {
        const next = {
          ...existing,
          proofOfWorkHash: completion.proofOfWorkHash ?? existing.proofOfWorkHash,
          completedAt: completion.completedAt,
        };
        completions.set(key, next);
        return { ...next };
      }
      completions.set(key, completion);
      return { ...completion };
    },
    async getLessonCompletion(purchaseId, lessonKey) {
      const row = completions.get(`${purchaseId}:${lessonKey}`);
      return row ? { ...row } : null;
    },
    async listLessonCompletionsByPurchase(purchaseId) {
      return [...completions.values()]
        .filter((row) => row.purchaseId === purchaseId)
        .sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime())
        .map((row) => ({ ...row }));
    },
    async pulseForUser(userId) {
      const ownPurchases = [...purchases.values()].filter((row) => row.userId === userId);
      const ownCerts = [...certificates.values()].filter(
        (row) => row.userId === userId && row.revokedAt === null,
      );
      const latest = [...ownCerts].sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime())[0];
      const pulse: AcademyPulse = {
        purchasesCount: ownPurchases.length,
        certificatesHeld: ownCerts.length,
        lastCertificateTitle: latest?.title ?? null,
        currencyCode: SETTLEMENT_CURRENCY,
      };
      return pulse;
    },
  };
}

export function memoryCourse(overrides?: Partial<AcademyCourseRecord>): AcademyCourseRecord {
  const now = new Date("2026-08-14T00:00:00.000Z");
  return {
    id: "course-1",
    slug: "python-temel",
    title: "yetkin.ai temeli",
    summary: "Onaylı ödeme ve mühürlü müfredat.",
    catalogUnitKey: "course:python-temel",
    globalRank: 99,
    localRank: 99,
    trendScore: 0,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function memoryExam(
  courseId = "course-1",
  overrides?: Partial<AcademyExamRecord>,
): AcademyExamRecord {
  const now = new Date("2026-08-14T00:00:00.000Z");
  return {
    id: "exam-1",
    courseId,
    title: "yetkin.ai temeli müfredat sınavı",
    passScore: ACADEMY_EXAM_PASS_SCORE,
    questions: [
      {
        id: "q1",
        prompt: "Nakit tutarı hangi birimde tutulur?",
        choices: ["float TL", "amountMinor", "amountKurus", "wei"],
        correctIndex: 1,
      },
      {
        id: "q2",
        prompt: "LLM çağrısı hangi kapıdan geçer?",
        choices: ["doğrudan Gemini", "invokeLlm", "fetch openai", "Socket.IO"],
        correctIndex: 1,
      },
      {
        id: "q3",
        prompt: "Sertifika ne zaman basılır?",
        choices: ["satın alımda", "sınav ≥70", "dashboard açılınca", "iade sonrası"],
        correctIndex: 1,
      },
      {
        id: "q4",
        prompt: "DevLabs tezgâhında exec var mıdır?",
        choices: ["evet sandbox", "hayır", "yalnız Super Admin", "Docker zorunlu"],
        correctIndex: 1,
      },
    ],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/** Debit + hazine credit + purchase insert tek atomik birim; hata anında restore. */
export function withMemoryAcademyAtomic<
  T extends {
    ledger: MemoryLedgerStore;
    locks: MemoryCheckoutPriceLockStore;
    academy: MemoryAcademyStore;
  },
>(ports: T): T & Pick<AcademyEnginePorts, "runPurchaseAtomic"> {
  const uow = createSerializedUnitOfWork();
  return {
    ...ports,
    async runPurchaseAtomic<R>(work: (tx: AcademyPurchaseWritePorts) => Promise<R>): Promise<R> {
      return uow.run([ports.ledger, ports.locks, ports.academy], () =>
        work({
          ledger: ports.ledger,
          locks: ports.locks,
          academy: ports.academy,
        }),
      );
    },
  };
}
