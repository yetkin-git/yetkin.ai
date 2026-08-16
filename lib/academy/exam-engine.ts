import { randomUUID } from "node:crypto";
import type {
  AcademyCertificateRecord,
  AcademyExamAnswer,
  AcademyExamAttemptRecord,
  AcademyExamPublicQuestion,
  AcademyExamRecord,
  AcademyStore,
} from "@/lib/academy/types";
import { assertAcademyCurriculumComplete } from "@/lib/academy/curriculum-engine";
import { academyCurriculumSealFromCompletions, isAcademyCurriculumComplete } from "@/lib/academy/curriculum";
import {
  ACADEMY_EXAM_PASS_SCORE,
  computeAcademyCertificateHash,
  gradeAcademyExam,
  toPublicAcademyExamQuestions,
} from "@/lib/academy/exam";

export type AcademyExamPorts = {
  academy: AcademyStore;
};

export type SubmitAcademyExamCommand = {
  courseId: string;
  userId: string;
  answers: AcademyExamAnswer[];
  now?: Date;
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
};

async function requireExamForCourse(
  store: AcademyStore,
  courseId: string,
): Promise<AcademyExamRecord> {
  const exam = await store.getExamByCourseId(courseId);
  if (!exam) {
    throw new Error("Müfredat sınavı henüz mühürlenmedi.");
  }
  return exam;
}

/**
 * S58-A: satın al ≠ sertifika. Baraj ≥70. Hash SHA256.
 */
export async function submitAcademyExam(
  ports: AcademyExamPorts,
  command: SubmitAcademyExamCommand,
): Promise<SubmitAcademyExamResult> {
  const course = await ports.academy.getCourse(command.courseId);
  if (!course) {
    throw new Error("Kurs bulunamadı.");
  }
  const purchase = await ports.academy.getPurchaseByUserAndCourse(command.userId, course.id);
  if (!purchase) {
    throw new Error("Sınav için kurs satın alma kaydı gerekir.");
  }
  await assertAcademyCurriculumComplete(ports, {
    courseId: course.id,
    userId: command.userId,
    courseSlug: course.slug,
  });

  const exam = await requireExamForCourse(ports.academy, course.id);
  const { score } = gradeAcademyExam(exam.questions, command.answers);
  const passed = score >= ACADEMY_EXAM_PASS_SCORE;
  const now = command.now ?? new Date();

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
  const curriculumSeal = academyCurriculumSealFromCompletions(
    course.slug,
    completions.map((row) => row.lessonKey),
  );
  if (!curriculumSeal) {
    throw new Error("Müfredat mühürü basılamaz — SKU ders listesi eksik veya tamamlanmamış.");
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
    createdAt: now,
  });

  return { attempt, exam, passed: true, score, certificate };
}

export async function loadPublicAcademyExam(
  ports: AcademyExamPorts,
  courseId: string,
  userId: string,
): Promise<PublicAcademyExamView | null> {
  const course = await ports.academy.getCourse(courseId);
  if (!course) {
    return null;
  }
  const purchase = await ports.academy.getPurchaseByUserAndCourse(userId, courseId);
  if (!purchase || purchase.status !== "SETTLED") {
    return null;
  }
  const completions = await ports.academy.listLessonCompletionsByPurchase(purchase.id);
  if (
    !isAcademyCurriculumComplete(
      course.slug,
      completions.map((row) => row.lessonKey),
    )
  ) {
    return null;
  }
  const exam = await ports.academy.getExamByCourseId(courseId);
  if (!exam) {
    return null;
  }
  const certificate = await ports.academy.getCertificateByUserAndCourse(userId, courseId);
  return {
    exam: {
      id: exam.id,
      courseId: exam.courseId,
      title: exam.title,
      passScore: ACADEMY_EXAM_PASS_SCORE,
    },
    questions: toPublicAcademyExamQuestions(exam.questions),
    purchaseId: purchase.id,
    certificate,
  };
}
