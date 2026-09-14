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

export type AcademyLessonView = {
  key: string;
  order: number;
  title: string;
  body: string;
  completed: boolean;
  open: boolean;
};

export type AcademyPlayerView =
  | { kind: "idle"; testID: "dron-academy-player-idle" }
  | { kind: "loading"; testID: "dron-academy-player-loading"; title: string }
  | {
      kind: "need_purchase";
      testID: "dron-academy-need-purchase";
      courseId: string;
      title: string;
      message: string;
    }
  | {
      kind: "ready";
      testID: "dron-academy-player-ready";
      courseId: string;
      courseSlug: string;
      courseTitle: string;
      completedCount: number;
      totalCount: number;
      curriculumComplete: boolean;
      nextLessonKey: string | null;
      selectedLessonKey: string | null;
      lessons: AcademyLessonView[];
      certificateHash: string | null;
      pending: boolean;
      error: string | null;
      requestId: string | null;
    }
  | {
      kind: "error";
      testID: "dron-academy-player-error";
      title: string;
      message: string;
      requestId: string | null;
    };

const IDLE: AcademyPlayerView = { kind: "idle", testID: "dron-academy-player-idle" };

export function emptyAcademyPlayer(): AcademyPlayerView {
  return IDLE;
}

export function presentAcademyPlayerLoading(): AcademyPlayerView {
  return {
    kind: "loading",
    testID: RAIL_IS_COPY.academy.playerLoadingTestID,
    title: RAIL_IS_COPY.academy.playerLoading,
  };
}

function parseLesson(raw: unknown): AcademyLessonView | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }
  const key = asString(row.key);
  const title = asString(row.title);
  const order = asInt(row.order);
  if (!key || !title || order === null) {
    return null;
  }
  return {
    key,
    order,
    title,
    body: typeof row.body === "string" ? row.body : "",
    completed: row.completed === true,
    open: row.open === true,
  };
}

export function presentAcademyPlayer(data: unknown, selectedLessonKey?: string | null): AcademyPlayerView {
  const root = asRecord(data);
  const player = asRecord(root?.player) ?? root;
  if (!player) {
    return presentAcademyPlayerFromFailure({
      kind: "protocol",
      status: null,
      message: RAIL_IS_COPY.protocol,
      requestId: null,
      envelopeError: null,
    });
  }
  const courseId = asString(player.courseId);
  const courseSlug = asString(player.courseSlug);
  const courseTitle = asString(player.courseTitle);
  const completedCount = asInt(player.completedCount);
  const totalCount = asInt(player.totalCount);
  if (!courseId || !courseSlug || !courseTitle || completedCount === null || totalCount === null) {
    return presentAcademyPlayerFromFailure({
      kind: "protocol",
      status: null,
      message: RAIL_IS_COPY.protocol,
      requestId: null,
      envelopeError: null,
    });
  }
  const lessons = Array.isArray(player.lessons)
    ? player.lessons.map(parseLesson).filter((row): row is AcademyLessonView => row !== null)
    : [];
  const certificate = asRecord(player.certificate);
  const nextLessonKey = asString(player.nextLessonKey);
  const selected =
    selectedLessonKey && lessons.some((lesson) => lesson.key === selectedLessonKey)
      ? selectedLessonKey
      : nextLessonKey ?? lessons.find((lesson) => lesson.open)?.key ?? lessons[0]?.key ?? null;
  return {
    kind: "ready",
    testID: RAIL_IS_COPY.academy.playerReadyTestID,
    courseId,
    courseSlug,
    courseTitle,
    completedCount,
    totalCount,
    curriculumComplete: player.curriculumComplete === true,
    nextLessonKey,
    selectedLessonKey: selected,
    lessons,
    certificateHash: asString(certificate?.certificateHash),
    pending: false,
    error: null,
    requestId: null,
  };
}

export function presentAcademyNeedPurchase(courseId: string, message?: string): AcademyPlayerView {
  return {
    kind: "need_purchase",
    testID: RAIL_IS_COPY.academy.needPurchaseTestID,
    courseId,
    title: RAIL_IS_COPY.academy.needPurchaseTitle,
    message: message?.trim() || RAIL_IS_COPY.academy.needPurchase,
  };
}

export function presentAcademyPlayerFromFailure(failure: ClassifiedV1Failure): AcademyPlayerView {
  return {
    kind: "error",
    testID: RAIL_IS_COPY.academy.playerErrorTestID,
    title: RAIL_IS_COPY.academy.playerErrorTitle,
    message: failure.message,
    requestId: failure.requestId,
  };
}

export function presentAcademyPlayerError(error: unknown): AcademyPlayerView {
  return presentAcademyPlayerFromFailure(classifyV1Failure(error));
}

export function presentAcademyPlayerPending(view: AcademyPlayerView): AcademyPlayerView {
  if (view.kind !== "ready") {
    return view;
  }
  return { ...view, pending: true, error: null };
}

export function presentAcademyPlayerLocalFail(view: AcademyPlayerView, message: string): AcademyPlayerView {
  if (view.kind !== "ready") {
    return view;
  }
  return { ...view, pending: false, error: message };
}

export function selectAcademyLesson(view: AcademyPlayerView, lessonKey: string): AcademyPlayerView {
  if (view.kind !== "ready") {
    return view;
  }
  if (!view.lessons.some((lesson) => lesson.key === lessonKey)) {
    return view;
  }
  return { ...view, selectedLessonKey: lessonKey, error: null };
}
