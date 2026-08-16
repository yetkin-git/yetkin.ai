import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
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
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";

export function createMemoryAcademyStore(): AcademyStore {
  const courses = new Map<string, AcademyCourseRecord>();
  const purchases = new Map<string, AcademyPurchaseRecord>();
  const certificates = new Map<string, AcademyCertificateRecord>();
  const exams = new Map<string, AcademyExamRecord>();
  const attempts = new Map<string, AcademyExamAttemptRecord>();
  const completions = new Map<string, AcademyLessonCompletionRecord>();

  return {
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
      return [...courses.values()]
        .filter((row) => row.isPublished)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async insertPurchase(purchase) {
      purchases.set(purchase.id, purchase);
      return { ...purchase };
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
    async insertCertificate(certificate) {
      certificates.set(certificate.id, certificate);
      return { ...certificate };
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
      completions.set(`${completion.purchaseId}:${completion.lessonKey}`, completion);
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
      const ownCerts = [...certificates.values()].filter((row) => row.userId === userId);
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
    slug: "rail-temel",
    title: "Yetkin Rail temeli",
    summary: "Tek nakit defter, emanet ve settlement.",
    catalogUnitKey: "course:rail-temel",
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
    title: "Rail temeli müfredat sınavı",
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
