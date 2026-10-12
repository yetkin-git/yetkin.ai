function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export type JuniorPlayPractice = {
  id: string;
  prompt: string;
  choices: string[];
};

export type JuniorPlayView = {
  lessonKey: string;
  title: string;
  courseTitle: string;
  access: "free" | "locked";
  script: string;
  steps: string[];
  audioUrl: string | null;
  warmupUrl: string | null;
  coverUrl: string | null;
  expiresAt: string | null;
  practice: JuniorPlayPractice[];
  progressStatus: "fresh" | "going" | "done" | null;
};

export function presentJuniorLessonPlay(data: unknown): JuniorPlayView | null {
  const root = asRecord(data);
  const lesson = asRecord(root?.lesson);
  const media = asRecord(root?.media);
  if (!lesson || !media) {
    return null;
  }
  const lessonKey = asString(lesson.lessonKey);
  const title = asString(lesson.title);
  const courseTitle = asString(lesson.courseTitle);
  const script = asString(lesson.script);
  const access = lesson.access === "locked" ? "locked" : lesson.access === "free" ? "free" : null;
  if (!lessonKey || !title || !courseTitle || !script || !access) {
    return null;
  }
  const steps = Array.isArray(lesson.steps)
    ? lesson.steps.filter((step): step is string => typeof step === "string" && step.trim().length > 0)
    : [];
  const practice = Array.isArray(root?.practice)
    ? root.practice.flatMap((item) => {
        const row = asRecord(item);
        const id = asString(row?.id);
        const prompt = asString(row?.prompt);
        const choices = Array.isArray(row?.choices)
          ? row.choices.filter((choice): choice is string => typeof choice === "string" && choice.length > 0)
          : [];
        if (!id || !prompt || choices.length < 2) {
          return [];
        }
        return [{ id, prompt, choices }];
      })
    : [];
  const progress = asRecord(root?.progress);
  const progressStatus =
    progress?.status === "fresh" || progress?.status === "going" || progress?.status === "done"
      ? progress.status
      : null;
  return {
    lessonKey,
    title,
    courseTitle,
    access,
    script,
    steps,
    audioUrl: typeof media.audioUrl === "string" ? media.audioUrl : null,
    warmupUrl: typeof media.warmupUrl === "string" ? media.warmupUrl : null,
    coverUrl: typeof media.coverUrl === "string" ? media.coverUrl : null,
    expiresAt: typeof media.expiresAt === "string" ? media.expiresAt : null,
    practice,
    progressStatus,
  };
}

export function presentJuniorProgressStatus(data: unknown): "going" | "done" | null {
  const root = asRecord(data);
  const progress = asRecord(root?.progress);
  if (progress?.status === "going" || progress?.status === "done") {
    return progress.status;
  }
  return null;
}
