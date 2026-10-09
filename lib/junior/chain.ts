import { JUNIOR_QUIZ_PASS_SCORE, JUNIOR_TELL_PASS_SCORE } from "@/lib/junior/limits";
import type { JuniorCourseShelf, JuniorLessonStatus } from "@/lib/junior/types";

type ProgressMark = {
  lessonKey: string;
  mode: string;
  score: number;
};

export function juniorTellPassed(rows: readonly ProgressMark[], lessonKey: string): boolean {
  return rows.some(
    (row) =>
      row.lessonKey === lessonKey &&
      (row.mode === "speak" || row.mode === "write") &&
      row.score >= JUNIOR_TELL_PASS_SCORE,
  );
}

export function juniorLessonStatus(rows: readonly ProgressMark[], lessonKey: string): JuniorLessonStatus {
  const mine = rows.filter((row) => row.lessonKey === lessonKey);
  if (mine.some((row) => row.mode === "quiz" && row.score >= JUNIOR_QUIZ_PASS_SCORE)) {
    return "done";
  }
  if (mine.length > 0) {
    return "going";
  }
  return "fresh";
}

export function stampJuniorLessonStatus(
  courses: readonly JuniorCourseShelf[],
  rows: readonly ProgressMark[],
): JuniorCourseShelf[] {
  return courses.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson) => ({
      ...lesson,
      status: lesson.status === "preparing" ? "preparing" : juniorLessonStatus(rows, lesson.key),
    })),
  }));
}

/** Seçili profilin damgasını, erişimi ayrıca açılmış vitrine taşır. Eksik anahtar durduğu gibi kalır. */
export function carryJuniorLessonStatus(
  courses: readonly JuniorCourseShelf[],
  stamped: readonly JuniorCourseShelf[],
): JuniorCourseShelf[] {
  const statusByKey = new Map<string, JuniorLessonStatus>();
  for (const course of stamped) {
    for (const lesson of course.lessons) {
      statusByKey.set(lesson.key, lesson.status);
    }
  }
  return courses.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson) => {
      const status = statusByKey.get(lesson.key);
      if (!status) {
        return { ...lesson };
      }
      return { ...lesson, status };
    }),
  }));
}
