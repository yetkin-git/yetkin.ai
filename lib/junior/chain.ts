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
      status: juniorLessonStatus(rows, lesson.key),
    })),
  }));
}
