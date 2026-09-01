import { randomUUID } from "node:crypto";
import type {
  AcademyCertificateRecord,
  AcademyExamAnswer,
  AcademyExamAttemptRecord,
  AcademyExamPublicQuestion,
  AcademyExamQuestion,
  AcademyExamRecord,
  AcademyStore,
} from "@/lib/academy/types";
import {
  academyCurriculumSealForSlug,
  academyCurriculumSealFromCompletions,
  curriculumForCourseSlug,
} from "@/lib/academy/curriculum";
import { ACADEMY_ONBOARDING_COURSE_SLUG } from "@/lib/academy/course-titles";
import {
  ACADEMY_EXAM_PASS_SCORE,
  computeAcademyCertificateHash,
  gradeAcademyExam,
} from "@/lib/academy/exam";
import {
  academyExamSittingExpired,
  ACADEMY_EXAM_DRAW_COUNT,
  ACADEMY_EXAM_DURATION_MS,
  drawAcademyExamQuestionsPinned,
  materializeAcademyExamSitting,
  openAcademyExamSitting,
  publicQuestionsFromSitting,
  sealAcademyExamSitting,
  shuffleCopy,
} from "@/lib/academy/exam-sitting";
import {
  academyInteractiveTaskByKey,
  evaluateAcademyProofSubmission,
  type AcademyProofSubmission,
} from "@/lib/academy/proof-of-work";
import {
  createAcademyGrantPurchase,
  hasUnlimitedAcademyAccess,
  resolveSettledAcademyPurchase,
} from "@/lib/academy/access";
import { resolveAcademyCourseFromSeed } from "@/lib/academy/published-catalog";
import { resolveAcademyExamFromSeed } from "@/lib/academy/seed";

export type AcademyExamPorts = {
  academy: AcademyStore;
};

export type SubmitAcademyExamCommand = {
  courseId: string;
  userId: string;
  answers: AcademyExamAnswer[];
  now?: Date;
  email?: string | null;
  /** Fail-closed zorunlu oturum jetonu — boş ile havuz puanlama yok. */
  sessionToken: string;
  timedOut?: boolean;
  proof?: AcademyProofSubmission;
};

export type SubmitAcademyExamResult = {
  attempt: AcademyExamAttemptRecord;
  exam: AcademyExamRecord;
  passed: boolean;
  score: number;
  certificate: AcademyCertificateRecord | null;
};

export type PublicAcademyExamView = {
  exam: Pick<AcademyExamRecord, "id" | "courseId" | "title" | "passScore">;
  questions: AcademyExamPublicQuestion[];
  purchaseId: string;
  certificate: AcademyCertificateRecord | null;
  sessionToken: string;
  expiresAt: Date;
  durationMs: number;
  drawCount: number;
  proofLessonKey: string | null;
};

/** Kapı açık / belge var — oturum ve süre henüz başlamaz. */
export type AcademyExamGateStatus = {
  exam: Pick<AcademyExamRecord, "id" | "courseId" | "title" | "passScore">;
  purchaseId: string;
  certificate: AcademyCertificateRecord | null;
  durationMs: number;
};

export function academyExamGateProofLessonKey(slug: string): string | null {
  if (ACADEMY_ONBOARDING_COURSE_SLUG != null && slug === ACADEMY_ONBOARDING_COURSE_SLUG) {
    return null;
  }
  for (const lesson of curriculumForCourseSlug(slug)) {
    if (academyInteractiveTaskByKey(lesson.key)) {
      return lesson.key;
    }
  }
  return null;
}

async function requireExamForCourse(
  store: AcademyStore,
  courseId: string,
): Promise<AcademyExamRecord> {
  const exam = (await store.getExamByCourseId(courseId)) ?? resolveAcademyExamFromSeed(courseId);
  if (!exam) {
    throw new Error("Müfredat sınavı henüz mühürlenmedi.");
  }
  return exam;
}

async function gradeSitting(input: {
  academy: AcademyStore;
  exam: AcademyExamRecord;
  courseId: string;
  answers: AcademyExamAnswer[];
  sessionToken: string;
  userId: string;
  timedOut?: boolean;
  now: Date;
  proof?: AcademyProofSubmission;
}): Promise<{ score: number; questions: AcademyExamQuestion[] }> {
  const token = input.sessionToken.trim();
  if (!token) {
    throw new Error("Sınav oturumu geçersiz.");
  }
  const sitting = openAcademyExamSitting(token);
  if (
    !sitting ||
    sitting.userId !== input.userId ||
    sitting.courseId !== input.courseId ||
    sitting.examId !== input.exam.id
  ) {
    throw new Error("Sınav oturumu geçersiz.");
  }
  const consumed = await input.academy.consumeExamSitting({
    jti: sitting.jti,
    userId: input.userId,
    courseId: input.courseId,
    examId: input.exam.id,
    items: sitting.items,
    now: input.now,
  });
  if (!consumed) {
    throw new Error("Sınav oturumu geçersiz.");
  }
  const questions = materializeAcademyExamSitting(input.exam.questions, sitting.items);
  if (input.timedOut || academyExamSittingExpired(sitting, input.now)) {
    return { score: 0, questions };
  }
  if (sitting.proofLessonKey) {
    const judged = evaluateAcademyProofSubmission(sitting.proofLessonKey, input.proof);
    if (!judged.ok) {
      return { score: 0, questions };
    }
  }
  return { score: gradeAcademyExam(questions, input.answers).score, questions };
}

/**
 * S58-A: satın al ≠ sertifika. Baraj ≥70. Hash SHA256.
 * Dürüst iki kapı: SETTLED satın alma sınavı açar (müfredat zorunlu değildir).
 * Oturum jetonu zorunlu; yalnız çekilen iş kanıtı / müfredat soruları puanlanır.
 */
export async function submitAcademyExam(
  ports: AcademyExamPorts,
  command: SubmitAcademyExamCommand,
): Promise<SubmitAcademyExamResult> {
  const course =
    (await ports.academy.getCourse(command.courseId)) ?? resolveAcademyCourseFromSeed(command.courseId);
  if (!course) {
    throw new Error("Kurs bulunamadı.");
  }
  const actor = { userId: command.userId, email: command.email };
  const purchase = await resolveSettledAcademyPurchase(ports.academy, actor, course.id, {
    persistGrant: hasUnlimitedAcademyAccess(actor),
  });
  if (!purchase) {
    throw new Error("Sınav için kurs satın alma kaydı gerekir.");
  }

  const exam = await requireExamForCourse(ports.academy, course.id);
  const now = command.now ?? new Date();
  const { score } = await gradeSitting({
    academy: ports.academy,
    exam,
    courseId: course.id,
    answers: command.answers,
    sessionToken: command.sessionToken,
    userId: command.userId,
    timedOut: command.timedOut,
    now,
    proof: command.proof,
  });
  const passed = score >= ACADEMY_EXAM_PASS_SCORE;

  const attempt = await ports.academy.insertAttempt({
    id: randomUUID(),
    examId: exam.id,
    userId: command.userId,
    purchaseId: purchase.id,
    answers: command.answers,
    score,
    passed,
    status: "GRADED",
    submittedAt: now,
    createdAt: now,
  });

  const existingCert = await ports.academy.getCertificateByUserAndCourse(command.userId, course.id);
  if (existingCert) {
    return {
      attempt,
      exam,
      passed: true,
      score: existingCert.score ?? score,
      certificate: existingCert,
    };
  }

  if (!passed) {
    return { attempt, exam, passed: false, score, certificate: null };
  }

  const completions = await ports.academy.listLessonCompletionsByPurchase(purchase.id);
  const curriculumSeal =
    academyCurriculumSealFromCompletions(
      course.slug,
      completions.map((row) => row.lessonKey),
    ) ?? academyCurriculumSealForSlug(course.slug);
  if (!curriculumSeal) {
    throw new Error("Müfredat mühürü basılamaz — SKU ders listesi eksik.");
  }

  const certificateHash = computeAcademyCertificateHash({
    userId: command.userId,
    courseId: course.id,
    attemptId: attempt.id,
    score,
    issuedAt: now,
    curriculumSeal,
  });

  const certificate = await ports.academy.insertCertificate({
    id: randomUUID(),
    userId: command.userId,
    courseId: course.id,
    purchaseId: purchase.id,
    attemptId: attempt.id,
    title: course.title,
    serialKey: certificateHash,
    certificateHash,
    curriculumSeal,
    score,
    issuedAt: now,
    revokedAt: null,
    revokeReason: null,
    createdAt: now,
  });

  return { attempt, exam, passed: true, score, certificate };
}

async function resolveAcademyExamEligibility(
  ports: AcademyExamPorts,
  courseId: string,
  userId: string,
  now?: Date,
  email?: string | null,
): Promise<{
  course: NonNullable<Awaited<ReturnType<AcademyStore["getCourse"]>>>;
  purchase: { id: string };
  exam: AcademyExamRecord;
  certificate: AcademyCertificateRecord | null;
} | null> {
  const course = (await ports.academy.getCourse(courseId)) ?? resolveAcademyCourseFromSeed(courseId);
  if (!course) {
    return null;
  }
  const actor = { userId, email };
  const unlimited = hasUnlimitedAcademyAccess(actor);
  const purchase = unlimited
    ? ((await resolveSettledAcademyPurchase(ports.academy, actor, course.id, { persistGrant: false })) ??
      createAcademyGrantPurchase(userId, course.id, now ?? new Date()))
    : await ports.academy.getPurchaseByUserAndCourse(userId, courseId);
  if (!purchase || purchase.status !== "SETTLED") {
    return null;
  }
  // Doğrudan sınav/vize yolu: SETTLED yeter; müfredat tamamı zorunlu değildir.
  const exam = await requireExamForCourse(ports.academy, course.id).catch(() => null);
  if (!exam) {
    return null;
  }
  const certificate = await ports.academy.getCertificateByUserAndCourse(userId, course.id);
  return { course, purchase, exam, certificate };
}

/** Sınav kapısı durumu — süre ve soru çekimi yok; Bastırılana kadar oturum açılmaz. */
export async function loadAcademyExamGateStatus(
  ports: AcademyExamPorts,
  courseId: string,
  userId: string,
  now?: Date,
  email?: string | null,
): Promise<AcademyExamGateStatus | null> {
  const eligible = await resolveAcademyExamEligibility(ports, courseId, userId, now, email);
  if (!eligible) {
    return null;
  }
  return {
    exam: {
      id: eligible.exam.id,
      courseId: eligible.exam.courseId,
      title: eligible.exam.title,
      passScore: ACADEMY_EXAM_PASS_SCORE,
    },
    purchaseId: eligible.purchase.id,
    certificate: eligible.certificate,
    durationMs: ACADEMY_EXAM_DURATION_MS,
  };
}

export async function loadAcademyExam(
  ports: AcademyExamPorts,
  courseId: string,
  userId: string,
  now?: Date,
  email?: string | null,
): Promise<PublicAcademyExamView | null> {
  const eligible = await resolveAcademyExamEligibility(ports, courseId, userId, now, email);
  if (!eligible) {
    return null;
  }
  const { course, purchase, exam, certificate } = eligible;
  const startedAt = now ?? new Date();
  const expiresAt = new Date(startedAt.getTime() + ACADEMY_EXAM_DURATION_MS);
  const proofLessonKey = academyExamGateProofLessonKey(course.slug);
  const pinned = exam.questions.filter((question) => question.id.startsWith("q_pow_"));
  const pinIds = pinned.length > 0 ? [shuffleCopy(pinned)[0]!.id] : [];
  const drawn = drawAcademyExamQuestionsPinned(exam.questions, pinIds, ACADEMY_EXAM_DRAW_COUNT);
  const jti = randomUUID();
  const sessionToken = sealAcademyExamSitting({
    userId,
    courseId: course.id,
    examId: exam.id,
    startedAt,
    expiresAt,
    jti,
    items: drawn.items,
    proofLessonKey,
  });
  await ports.academy.insertExamSitting({
    jti,
    userId,
    courseId: course.id,
    examId: exam.id,
    items: drawn.items,
    proofLessonKey,
    startedAt,
    expiresAt,
    consumedAt: null,
    createdAt: startedAt,
  });
  return {
    exam: {
      id: exam.id,
      courseId: exam.courseId,
      title: exam.title,
      passScore: ACADEMY_EXAM_PASS_SCORE,
    },
    questions: publicQuestionsFromSitting(drawn.questions),
    purchaseId: purchase.id,
    certificate,
    sessionToken,
    expiresAt,
    durationMs: ACADEMY_EXAM_DURATION_MS,
    drawCount: drawn.questions.length,
    proofLessonKey,
  };
}














