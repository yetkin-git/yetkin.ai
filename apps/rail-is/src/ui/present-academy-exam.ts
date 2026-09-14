import { classifyV1Failure, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asInt(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

export type AcademyExamQuestionView = {
  id: string;
  prompt: string;
  choices: string[];
};

export type AcademyExamView =
  | { kind: "idle"; testID: "dron-exam-idle" }
  | { kind: "loading"; testID: "dron-exam-loading"; title: string }
  | {
      kind: "ready";
      testID: "dron-exam-ready";
      courseId: string;
      title: string;
      questions: AcademyExamQuestionView[];
      sessionToken: string;
      answers: Record<string, number>;
      pending: boolean;
      error: string | null;
      requestId: string | null;
      expiresAt: string | null;
    }
  | {
      kind: "submitted";
      testID: "dron-exam-submitted";
      passed: boolean;
      score: number;
      passScore: number;
      certificateHash: string | null;
      serialKey: string | null;
    }
  | {
      kind: "error";
      testID: "dron-exam-error";
      title: string;
      message: string;
      requestId: string | null;
    };

export function emptyAcademyExam(): AcademyExamView {
  return { kind: "idle", testID: "dron-exam-idle" };
}

export function presentAcademyExamLoading(): AcademyExamView {
  return {
    kind: "loading",
    testID: RAIL_IS_COPY.exam.loadingTestID,
    title: RAIL_IS_COPY.exam.loading,
  };
}

function parseQuestion(raw: unknown): AcademyExamQuestionView | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }
  const id = asString(row.id);
  const prompt = asString(row.prompt);
  const choices = Array.isArray(row.choices)
    ? row.choices.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  if (!id || !prompt || choices.length < 2) {
    return null;
  }
  return { id, prompt, choices };
}

export function presentAcademyExam(data: unknown, courseId: string): AcademyExamView {
  const root = asRecord(data);
  if (!root) {
    return presentAcademyExamFromFailure({
      kind: "protocol",
      status: null,
      message: RAIL_IS_COPY.protocol,
      requestId: null,
      envelopeError: null,
    });
  }
  const exam = asRecord(root.exam);
  const sessionToken = asString(root.sessionToken);
  const questions = Array.isArray(root.questions)
    ? root.questions.map(parseQuestion).filter((row): row is AcademyExamQuestionView => row !== null)
    : [];
  const title = asString(exam?.title) ?? RAIL_IS_COPY.exam.title;
  if (!sessionToken || questions.length === 0) {
    return presentAcademyExamFromFailure({
      kind: "protocol",
      status: null,
      message: RAIL_IS_COPY.protocol,
      requestId: null,
      envelopeError: null,
    });
  }
  return {
    kind: "ready",
    testID: RAIL_IS_COPY.exam.readyTestID,
    courseId,
    title,
    questions,
    sessionToken,
    answers: {},
    pending: false,
    error: null,
    requestId: null,
    expiresAt: asString(root.expiresAt),
  };
}

export function presentAcademyExamAnswer(
  view: AcademyExamView,
  questionId: string,
  choiceIndex: number,
): AcademyExamView {
  if (view.kind !== "ready") {
    return view;
  }
  return {
    ...view,
    answers: { ...view.answers, [questionId]: choiceIndex },
    error: null,
  };
}

export function presentAcademyExamPending(view: AcademyExamView): AcademyExamView {
  if (view.kind !== "ready") {
    return view;
  }
  return { ...view, pending: true, error: null };
}

export function presentAcademyExamSubmitted(data: unknown): AcademyExamView {
  const root = asRecord(data);
  const score = asInt(root?.score);
  const passScore = asInt(root?.passScore);
  if (!root || score === null || passScore === null || typeof root.passed !== "boolean") {
    return presentAcademyExamFromFailure({
      kind: "protocol",
      status: null,
      message: RAIL_IS_COPY.protocol,
      requestId: null,
      envelopeError: null,
    });
  }
  const certificate = asRecord(root.certificate);
  return {
    kind: "submitted",
    testID: RAIL_IS_COPY.exam.submittedTestID,
    passed: root.passed,
    score,
    passScore,
    certificateHash: asString(certificate?.certificateHash),
    serialKey: asString(certificate?.serialKey),
  };
}

export function presentAcademyExamFromFailure(failure: ClassifiedV1Failure): AcademyExamView {
  return {
    kind: "error",
    testID: RAIL_IS_COPY.exam.errorTestID,
    title: RAIL_IS_COPY.exam.errorTitle,
    message: failure.message,
    requestId: failure.requestId,
  };
}

export function presentAcademyExamError(error: unknown): AcademyExamView {
  return presentAcademyExamFromFailure(classifyV1Failure(error));
}

export function presentAcademyExamLocalFail(view: AcademyExamView, message: string): AcademyExamView {
  if (view.kind !== "ready") {
    return view;
  }
  return { ...view, pending: false, error: message };
}
