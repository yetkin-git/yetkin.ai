import type { AcademyExamAnswer, AcademyExamQuestion, AcademyStore } from "@/lib/academy/types";
import {
  loadAcademyExam,
  submitAcademyExam,
  type AcademyExamPorts,
  type SubmitAcademyExamResult,
} from "@/lib/academy/exam-engine";
import {
  academyExamAnswersFromPublicQuestions,
} from "@/lib/academy/exam-sitting";
import { academyCanonicalProofSubmission } from "@/lib/academy/proof-of-work";

export async function resolveExamPool(
  store: AcademyStore,
  courseId: string,
): Promise<AcademyExamQuestion[]> {
  const exam = await store.getExamByCourseId(courseId);
  if (!exam) {
    throw new Error("Müfredat sınavı henüz mühürlenmedi.");
  }
  return exam.questions;
}

/** Doğru şıklar — oturum permütasyonuna göre. */
export async function perfectAnswersForSitting(
  store: AcademyStore,
  courseId: string,
  publicQuestions: Parameters<typeof academyExamAnswersFromPublicQuestions>[0],
): Promise<AcademyExamAnswer[]> {
  return academyExamAnswersFromPublicQuestions(publicQuestions, await resolveExamPool(store, courseId));
}

/** Bilerek yanlış şıklar — baraj altı. */
export async function failingAnswersForSitting(
  store: AcademyStore,
  courseId: string,
  publicQuestions: Parameters<typeof academyExamAnswersFromPublicQuestions>[0],
): Promise<AcademyExamAnswer[]> {
  const pool = await resolveExamPool(store, courseId);
  const byId = new Map(pool.map((question) => [question.id, question]));
  return publicQuestions.map((question) => {
    const seeded = byId.get(question.id);
    if (!seeded) {
      throw new Error(`Sınav sorusu tohumda yok: ${question.id}`);
    }
    const correctText = seeded.choices[seeded.correctIndex] ?? "";
    const wrongIndex = question.choices.findIndex((choice) => choice !== correctText);
    return {
      questionId: question.id,
      choiceIndex: wrongIndex >= 0 ? wrongIndex : 0,
    };
  });
}

export async function submitAcademyExamWithFreshSitting(
  ports: AcademyExamPorts,
  command: {
    courseId: string;
    userId: string;
    email?: string | null;
    now?: Date;
    mode?: "perfect" | "failing";
    proof?: Parameters<typeof submitAcademyExam>[1]["proof"];
    timedOut?: boolean;
  },
): Promise<SubmitAcademyExamResult> {
  const view = await loadAcademyExam(
    ports,
    command.courseId,
    command.userId,
    command.now,
    command.email,
  );
  if (!view) {
    throw new Error("Sınav oturumu açılamadı.");
  }
  const mode = command.mode ?? "perfect";
  const answers =
    mode === "failing"
      ? await failingAnswersForSitting(ports.academy, command.courseId, view.questions)
      : await perfectAnswersForSitting(ports.academy, command.courseId, view.questions);
  const proof =
    command.proof ??
    (view.proofLessonKey
      ? (academyCanonicalProofSubmission(view.proofLessonKey) ?? undefined)
      : undefined);
  return submitAcademyExam(ports, {
    courseId: command.courseId,
    userId: command.userId,
    email: command.email,
    now: command.now,
    answers,
    sessionToken: view.sessionToken,
    proof,
    timedOut: command.timedOut,
  });
}
