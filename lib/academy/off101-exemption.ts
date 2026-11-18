import { randomUUID } from "node:crypto";
import {
  ACADEMY_EXAM_DRAW_COUNT,
  ACADEMY_EXAM_DURATION_MS,
  drawAcademyExamQuestionsPinned,
  materializeAcademyExamSitting,
  openAcademyExamSitting,
  publicQuestionsFromSitting,
  academyExamSittingExpired,
  sealAcademyExamSitting,
} from "@/lib/academy/exam-sitting";
import { ACADEMY_EXAM_PASS_SCORE, gradeAcademyExam } from "@/lib/academy/exam";
import { resolveAcademyExamFromSeed } from "@/lib/academy/seed";
import { resolveAcademyCourseFromSeed } from "@/lib/academy/published-catalog";
import type {
  AcademyExamPublicQuestion,
  AcademyExamAnswer,
  AcademyExemptionSealRecord,
  AcademyStore,
} from "@/lib/academy/types";

export const OFF_101_EXEMPTION_COURSE_SLUG = "01_office_ai" as const;
export const OFF_101_EXEMPTION_SEAL_TITLE = "OFF-101 Muafiyet Mührü" as const;
export const OFF_101_EXEMPTION_ENTRY_LABEL = "Doğrudan Muafiyet / Seviye Tespit Sınavı" as const;
/** Kayıt dönüşü query taşımadığı için sınav ayrı yoldadır. Motor aynıdır. */
export const OFF_101_EXEMPTION_PATH = "/academy/01_office_ai/seviye" as const;
/** Anonim önizleme jetonu. Kullanıcı satırı değildir; mühür yazılmaz. */
export const OFF_101_GUEST_ACTOR = "guest:exemption" as const;

export type Off101ExemptionPorts = {
  academy: AcademyStore;
};

export type Off101ExemptionView = {
  exam: { id: string; courseId: string; title: string; passScore: number };
  questions: AcademyExamPublicQuestion[];
  sessionToken: string;
  expiresAt: Date;
  durationMs: number;
  drawCount: number;
  seal: AcademyExemptionSealRecord | null;
};

export type SubmitOff101ExemptionResult = {
  passed: boolean;
  score: number;
  seal: AcademyExemptionSealRecord | null;
};

function sealOpensGate(seal: AcademyExemptionSealRecord | null): seal is AcademyExemptionSealRecord {
  return (
    seal != null &&
    seal.revokedAt == null &&
    seal.title === OFF_101_EXEMPTION_SEAL_TITLE &&
    Number.isInteger(seal.score) &&
    seal.score >= ACADEMY_EXAM_PASS_SCORE
  );
}

export function off101ExemptionSealOpensOff201(seal: AcademyExemptionSealRecord | null): boolean {
  return sealOpensGate(seal);
}

async function requireOff101Course(store: AcademyStore, courseId: string) {
  const course = (await store.getCourse(courseId)) ?? resolveAcademyCourseFromSeed(courseId);
  if (!course || course.slug !== OFF_101_EXEMPTION_COURSE_SLUG) {
    throw new Error("Muafiyet sınavı yalnız Ofiste Yapay Zekâ eğitimi içindir.");
  }
  return course;
}

/**
 * Satın alma ve müfredat tamamı gerekmez. Ders lisansı açılmaz.
 * Havuz, OFF-101 kurs sonu sınavıyla aynıdır. Baraj 70.
 */
export async function loadOff101ExemptionExam(
  ports: Off101ExemptionPorts,
  courseId: string,
  userId: string,
  now: Date = new Date(),
): Promise<Off101ExemptionView> {
  const course = await requireOff101Course(ports.academy, courseId);
  const exam = (await ports.academy.getExamByCourseId(course.id)) ?? resolveAcademyExamFromSeed(course.id);
  if (!exam) {
    throw new Error("Muafiyet sınavı henüz mühürlenmedi.");
  }
  const existing = await ports.academy.getExemptionSealByUserAndCourse(userId, course.id);
  const startedAt = now;
  const expiresAt = new Date(startedAt.getTime() + ACADEMY_EXAM_DURATION_MS);
  const drawn = drawAcademyExamQuestionsPinned(exam.questions, [], ACADEMY_EXAM_DRAW_COUNT);
  const jti = randomUUID();
  const sessionToken = sealAcademyExamSitting({
    userId,
    courseId: course.id,
    examId: exam.id,
    startedAt,
    expiresAt,
    jti,
    items: drawn.items,
    proofLessonKey: null,
  });
  await ports.academy.insertExamSitting({
    jti,
    userId,
    courseId: course.id,
    examId: exam.id,
    items: drawn.items,
    proofLessonKey: null,
    startedAt,
    expiresAt,
    consumedAt: null,
    createdAt: startedAt,
  });
  return {
    exam: {
      id: exam.id,
      courseId: exam.courseId,
      title: "OFF-101 Muafiyet / Seviye Tespit Sınavı",
      passScore: ACADEMY_EXAM_PASS_SCORE,
    },
    questions: publicQuestionsFromSitting(drawn.questions),
    sessionToken,
    expiresAt,
    durationMs: ACADEMY_EXAM_DURATION_MS,
    drawCount: drawn.questions.length,
    seal: sealOpensGate(existing) ? existing : null,
  };
}

export async function submitOff101ExemptionExam(
  ports: Off101ExemptionPorts,
  command: {
    courseId: string;
    userId: string;
    answers: AcademyExamAnswer[];
    sessionToken: string;
    timedOut?: boolean;
    now?: Date;
  },
): Promise<SubmitOff101ExemptionResult> {
  const course = await requireOff101Course(ports.academy, command.courseId);
  const exam = (await ports.academy.getExamByCourseId(course.id)) ?? resolveAcademyExamFromSeed(course.id);
  if (!exam) {
    throw new Error("Muafiyet sınavı henüz mühürlenmedi.");
  }
  const now = command.now ?? new Date();
  const token = command.sessionToken.trim();
  const sitting = openAcademyExamSitting(token);
  if (
    !sitting ||
    sitting.userId !== command.userId ||
    sitting.courseId !== course.id ||
    sitting.examId !== exam.id
  ) {
    throw new Error("Sınav oturumu geçersiz.");
  }
  const consumed = await ports.academy.consumeExamSitting({
    jti: sitting.jti,
    userId: command.userId,
    courseId: course.id,
    examId: exam.id,
    items: sitting.items,
    now,
  });
  if (!consumed) {
    throw new Error("Sınav oturumu geçersiz.");
  }
  const questions = materializeAcademyExamSitting(exam.questions, sitting.items);
  const score =
    command.timedOut || academyExamSittingExpired(sitting, now)
      ? 0
      : gradeAcademyExam(questions, command.answers).score;
  const passed = score >= ACADEMY_EXAM_PASS_SCORE;
  const existing = await ports.academy.getExemptionSealByUserAndCourse(command.userId, course.id);
  if (sealOpensGate(existing)) {
    return { passed: true, score: existing.score, seal: existing };
  }
  if (!passed) {
    return { passed: false, score, seal: null };
  }
  const seal = await ports.academy.insertExemptionSeal({
    id: randomUUID(),
    userId: command.userId,
    courseId: course.id,
    examId: exam.id,
    title: OFF_101_EXEMPTION_SEAL_TITLE,
    score,
    issuedAt: now,
    revokedAt: null,
    revokeReason: null,
    createdAt: now,
  });
  return { passed: true, score, seal };
}

function gapHeading(prompt: string): string {
  const line = prompt.replace(/\s+/g, " ").trim();
  const stop = line.search(/[.?!]/u);
  const sentence = stop > 0 ? line.slice(0, stop + 1) : line;
  if (sentence.length <= 96) {
    return sentence;
  }
  return `${sentence.slice(0, 93).trimEnd()}…`;
}

export type Off101ExemptionPreviewResult = {
  passed: boolean;
  score: number;
  gaps: string[];
};

/**
 * Kayıtsız oturum. Sınav oturumu ve muafiyet mührü yazılmaz.
 * Puan HMAC jetonundan, sunucudaki havuzla hesaplanır.
 */
export async function loadOff101ExemptionPreview(
  ports: Off101ExemptionPorts,
  courseId: string,
  now: Date = new Date(),
): Promise<Omit<Off101ExemptionView, "seal">> {
  const course = await requireOff101Course(ports.academy, courseId);
  const exam = (await ports.academy.getExamByCourseId(course.id)) ?? resolveAcademyExamFromSeed(course.id);
  if (!exam) {
    throw new Error("Muafiyet sınavı henüz mühürlenmedi.");
  }
  const startedAt = now;
  const expiresAt = new Date(startedAt.getTime() + ACADEMY_EXAM_DURATION_MS);
  const drawn = drawAcademyExamQuestionsPinned(exam.questions, [], ACADEMY_EXAM_DRAW_COUNT);
  const sessionToken = sealAcademyExamSitting({
    userId: OFF_101_GUEST_ACTOR,
    courseId: course.id,
    examId: exam.id,
    startedAt,
    expiresAt,
    jti: randomUUID(),
    items: drawn.items,
    proofLessonKey: null,
  });
  return {
    exam: {
      id: exam.id,
      courseId: exam.courseId,
      title: "OFF-101 Muafiyet / Seviye Tespit Sınavı",
      passScore: ACADEMY_EXAM_PASS_SCORE,
    },
    questions: publicQuestionsFromSitting(drawn.questions),
    sessionToken,
    expiresAt,
    durationMs: ACADEMY_EXAM_DURATION_MS,
    drawCount: drawn.questions.length,
  };
}

export async function gradeOff101ExemptionPreview(
  ports: Off101ExemptionPorts,
  command: {
    courseId: string;
    answers: AcademyExamAnswer[];
    sessionToken: string;
    timedOut?: boolean;
    now?: Date;
  },
): Promise<Off101ExemptionPreviewResult> {
  const course = await requireOff101Course(ports.academy, command.courseId);
  const exam = (await ports.academy.getExamByCourseId(course.id)) ?? resolveAcademyExamFromSeed(course.id);
  if (!exam) {
    throw new Error("Muafiyet sınavı henüz mühürlenmedi.");
  }
  const now = command.now ?? new Date();
  const sitting = openAcademyExamSitting(command.sessionToken.trim());
  if (
    !sitting ||
    sitting.userId !== OFF_101_GUEST_ACTOR ||
    sitting.courseId !== course.id ||
    sitting.examId !== exam.id
  ) {
    throw new Error("Sınav oturumu geçersiz.");
  }
  const questions = materializeAcademyExamSitting(exam.questions, sitting.items);
  const expired = command.timedOut === true || academyExamSittingExpired(sitting, now);
  const graded = expired
    ? { score: 0, correctCount: 0, total: questions.length }
    : gradeAcademyExam(questions, command.answers);
  const byId = new Map(command.answers.map((answer) => [answer.questionId, answer.choiceIndex]));
  const gaps = (
    expired ? questions : questions.filter((question) => byId.get(question.id) !== question.correctIndex)
  ).map((question) => gapHeading(question.prompt));
  return {
    passed: graded.score >= ACADEMY_EXAM_PASS_SCORE,
    score: graded.score,
    gaps,
  };
}
