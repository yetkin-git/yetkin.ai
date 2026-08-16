import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

export const ACADEMY_MODULE_KEY = "academy" as const;

export type AcademyPurchaseStatus = "SETTLED";

export type AcademyCourseRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  catalogUnitKey: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AcademyPurchaseRecord = {
  id: string;
  userId: string;
  courseId: string;
  priceLockId: string;
  amountMinor: AmountMinor;
  currencyCode: CurrencyCode;
  status: AcademyPurchaseStatus;
  settledAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type AcademyCertificateRecord = {
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
};

export type AcademyExamQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
};

export type AcademyExamPublicQuestion = {
  id: string;
  prompt: string;
  choices: string[];
};

export type AcademyExamAnswer = {
  questionId: string;
  choiceIndex: number;
};

export type AcademyExamRecord = {
  id: string;
  courseId: string;
  title: string;
  passScore: number;
  questions: AcademyExamQuestion[];
  createdAt: Date;
  updatedAt: Date;
};

export type AcademyExamAttemptStatus = "GRADED";

export type AcademyExamAttemptRecord = {
  id: string;
  examId: string;
  userId: string;
  purchaseId: string;
  answers: AcademyExamAnswer[];
  score: number;
  passed: boolean;
  status: AcademyExamAttemptStatus;
  submittedAt: Date;
  createdAt: Date;
};

export type AcademyPulse = {
  purchasesCount: number;
  certificatesHeld: number;
  lastCertificateTitle: string | null;
  currencyCode: CurrencyCode;
};

export type AcademyLessonCompletionRecord = {
  id: string;
  userId: string;
  courseId: string;
  purchaseId: string;
  lessonKey: string;
  completedAt: Date;
  createdAt: Date;
};

export type AcademyStore = {
  insertCourse(course: AcademyCourseRecord): Promise<AcademyCourseRecord>;
  getCourse(id: string): Promise<AcademyCourseRecord | null>;
  getCourseBySlug(slug: string): Promise<AcademyCourseRecord | null>;
  listPublishedCourses(): Promise<AcademyCourseRecord[]>;
  insertPurchase(purchase: AcademyPurchaseRecord): Promise<AcademyPurchaseRecord>;
  getPurchase(id: string): Promise<AcademyPurchaseRecord | null>;
  getPurchaseByUserAndCourse(userId: string, courseId: string): Promise<AcademyPurchaseRecord | null>;
  insertCertificate(certificate: AcademyCertificateRecord): Promise<AcademyCertificateRecord>;
  getCertificateByPurchaseId(purchaseId: string): Promise<AcademyCertificateRecord | null>;
  getCertificateByUserAndCourse(userId: string, courseId: string): Promise<AcademyCertificateRecord | null>;
  getCertificateByHash(hash: string): Promise<AcademyCertificateRecord | null>;
  listCertificatesForUser(userId: string): Promise<AcademyCertificateRecord[]>;
  insertExam(exam: AcademyExamRecord): Promise<AcademyExamRecord>;
  getExamByCourseId(courseId: string): Promise<AcademyExamRecord | null>;
  insertAttempt(attempt: AcademyExamAttemptRecord): Promise<AcademyExamAttemptRecord>;
  listAttemptsForUserExam(userId: string, examId: string): Promise<AcademyExamAttemptRecord[]>;
  insertLessonCompletion(
    completion: AcademyLessonCompletionRecord,
  ): Promise<AcademyLessonCompletionRecord>;
  getLessonCompletion(
    purchaseId: string,
    lessonKey: string,
  ): Promise<AcademyLessonCompletionRecord | null>;
  listLessonCompletionsByPurchase(purchaseId: string): Promise<AcademyLessonCompletionRecord[]>;
  pulseForUser(userId: string): Promise<AcademyPulse>;
};
