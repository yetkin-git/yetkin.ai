import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode, SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import {
  parseAcademyExamAnswers,
  parseAcademyExamQuestions,
  serializeAcademyExamAnswers,
  serializeAcademyExamQuestions,
} from "@/lib/academy/exam";
import type {
  AcademyCertificateRecord,
  AcademyCourseRecord,
  AcademyExamAttemptRecord,
  AcademyExamRecord,
  AcademyLessonCompletionRecord,
  AcademyPulse,
  AcademyPurchaseRecord,
  AcademyStore,
} from "@/lib/academy/types";

function toCourse(row: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  catalogUnitKey: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AcademyCourseRecord {
  return { ...row };
}

function toPurchase(row: {
  id: string;
  userId: string;
  courseId: string;
  priceLockId: string;
  amountMinor: number;
  currencyCode: string;
  status: AcademyPurchaseRecord["status"];
  settledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): AcademyPurchaseRecord {
  return {
    ...row,
    amountMinor: toAmountMinor(row.amountMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
  };
}

function toCertificate(row: {
  id: string;
  userId: string;
  courseId: string;
  purchaseId: string;
  attemptId: string | null;
  title: string;
  serialKey: string;
  certificateHash: string | null;
  curriculumSeal: string | null;
  score: number | null;
  issuedAt: Date;
  createdAt: Date;
}): AcademyCertificateRecord {
  return { ...row };
}

function toExam(row: {
  id: string;
  courseId: string;
  title: string;
  passScore: number;
  questionsJson: string;
  createdAt: Date;
  updatedAt: Date;
}): AcademyExamRecord {
  return {
    id: row.id,
    courseId: row.courseId,
    title: row.title,
    passScore: row.passScore,
    questions: parseAcademyExamQuestions(row.questionsJson),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toAttempt(row: {
  id: string;
  examId: string;
  userId: string;
  purchaseId: string;
  answersJson: string;
  score: number;
  passed: boolean;
  status: AcademyExamAttemptRecord["status"];
  submittedAt: Date;
  createdAt: Date;
}): AcademyExamAttemptRecord {
  return {
    id: row.id,
    examId: row.examId,
    userId: row.userId,
    purchaseId: row.purchaseId,
    answers: parseAcademyExamAnswers(row.answersJson),
    score: row.score,
    passed: row.passed,
    status: row.status,
    submittedAt: row.submittedAt,
    createdAt: row.createdAt,
  };
}

function toCompletion(row: {
  id: string;
  userId: string;
  courseId: string;
  purchaseId: string;
  lessonKey: string;
  completedAt: Date;
  createdAt: Date;
}): AcademyLessonCompletionRecord {
  return { ...row };
}

export type AcademyWriteDb = Pick<
  PrismaClient,
  | "academyCourse"
  | "academyPurchase"
  | "academyCertificate"
  | "academyExam"
  | "academyExamAttempt"
  | "academyLessonCompletion"
>;

export function bindAcademyStore(db: AcademyWriteDb): AcademyStore {
  return {
    async insertCourse(course) {
      const row = await db.academyCourse.create({
        data: {
          id: course.id,
          slug: course.slug,
          title: course.title,
          summary: course.summary,
          catalogUnitKey: course.catalogUnitKey,
          isPublished: course.isPublished,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        },
      });
      return toCourse(row);
    },
    async getCourse(id) {
      const row = await db.academyCourse.findUnique({ where: { id } });
      return row ? toCourse(row) : null;
    },
    async getCourseBySlug(slug) {
      const row = await db.academyCourse.findUnique({ where: { slug } });
      return row ? toCourse(row) : null;
    },
    async listPublishedCourses() {
      const rows = await db.academyCourse.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toCourse);
    },
    async insertPurchase(purchase) {
      const row = await db.academyPurchase.create({
        data: {
          id: purchase.id,
          userId: purchase.userId,
          courseId: purchase.courseId,
          priceLockId: purchase.priceLockId,
          amountMinor: purchase.amountMinor,
          currencyCode: purchase.currencyCode,
          status: purchase.status,
          settledAt: purchase.settledAt,
          createdAt: purchase.createdAt,
          updatedAt: purchase.updatedAt,
        },
      });
      return toPurchase(row);
    },
    async getPurchase(id) {
      const row = await db.academyPurchase.findUnique({ where: { id } });
      return row ? toPurchase(row) : null;
    },
    async getPurchaseByUserAndCourse(userId, courseId) {
      const row = await db.academyPurchase.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });
      return row ? toPurchase(row) : null;
    },
    async insertCertificate(certificate) {
      const row = await db.academyCertificate.create({
        data: {
          id: certificate.id,
          userId: certificate.userId,
          courseId: certificate.courseId,
          purchaseId: certificate.purchaseId,
          attemptId: certificate.attemptId,
          title: certificate.title,
          serialKey: certificate.serialKey,
          certificateHash: certificate.certificateHash,
          curriculumSeal: certificate.curriculumSeal,
          score: certificate.score,
          issuedAt: certificate.issuedAt,
          createdAt: certificate.createdAt,
        },
      });
      return toCertificate(row);
    },
    async getCertificateByPurchaseId(purchaseId) {
      const row = await db.academyCertificate.findUnique({ where: { purchaseId } });
      return row ? toCertificate(row) : null;
    },
    async getCertificateByUserAndCourse(userId, courseId) {
      const row = await db.academyCertificate.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });
      return row ? toCertificate(row) : null;
    },
    async getCertificateByHash(hash) {
      const byHash = await db.academyCertificate.findUnique({ where: { certificateHash: hash } });
      if (byHash) {
        return toCertificate(byHash);
      }
      const bySerial = await db.academyCertificate.findUnique({ where: { serialKey: hash } });
      return bySerial ? toCertificate(bySerial) : null;
    },
    async listCertificatesForUser(userId) {
      const rows = await db.academyCertificate.findMany({
        where: { userId },
        orderBy: { issuedAt: "desc" },
      });
      return rows.map(toCertificate);
    },
    async insertExam(exam) {
      const row = await db.academyExam.create({
        data: {
          id: exam.id,
          courseId: exam.courseId,
          title: exam.title,
          passScore: exam.passScore,
          questionsJson: serializeAcademyExamQuestions(exam.questions),
          createdAt: exam.createdAt,
          updatedAt: exam.updatedAt,
        },
      });
      return toExam(row);
    },
    async getExamByCourseId(courseId) {
      const row = await db.academyExam.findUnique({ where: { courseId } });
      return row ? toExam(row) : null;
    },
    async insertAttempt(attempt) {
      const row = await db.academyExamAttempt.create({
        data: {
          id: attempt.id,
          examId: attempt.examId,
          userId: attempt.userId,
          purchaseId: attempt.purchaseId,
          answersJson: serializeAcademyExamAnswers(attempt.answers),
          score: attempt.score,
          passed: attempt.passed,
          status: attempt.status,
          submittedAt: attempt.submittedAt,
          createdAt: attempt.createdAt,
        },
      });
      return toAttempt(row);
    },
    async listAttemptsForUserExam(userId, examId) {
      const rows = await db.academyExamAttempt.findMany({
        where: { userId, examId },
        orderBy: { submittedAt: "desc" },
      });
      return rows.map(toAttempt);
    },
    async insertLessonCompletion(completion) {
      const row = await db.academyLessonCompletion.create({
        data: {
          id: completion.id,
          userId: completion.userId,
          courseId: completion.courseId,
          purchaseId: completion.purchaseId,
          lessonKey: completion.lessonKey,
          completedAt: completion.completedAt,
          createdAt: completion.createdAt,
        },
      });
      return toCompletion(row);
    },
    async getLessonCompletion(purchaseId, lessonKey) {
      const row = await db.academyLessonCompletion.findUnique({
        where: { purchaseId_lessonKey: { purchaseId, lessonKey } },
      });
      return row ? toCompletion(row) : null;
    },
    async listLessonCompletionsByPurchase(purchaseId) {
      const rows = await db.academyLessonCompletion.findMany({
        where: { purchaseId },
        orderBy: { completedAt: "asc" },
      });
      return rows.map(toCompletion);
    },
    async pulseForUser(userId) {
      const [purchasesCount, certificatesHeld, latest] = await Promise.all([
        db.academyPurchase.count({ where: { userId } }),
        db.academyCertificate.count({ where: { userId } }),
        db.academyCertificate.findFirst({
          where: { userId },
          orderBy: { issuedAt: "desc" },
          select: { title: true },
        }),
      ]);
      const pulse: AcademyPulse = {
        purchasesCount,
        certificatesHeld,
        lastCertificateTitle: latest?.title ?? null,
        currencyCode: SETTLEMENT_CURRENCY,
      };
      return pulse;
    },
  };
}

export function createPrismaAcademyStore(): AcademyStore {
  return bindAcademyStore(getPrisma());
}
