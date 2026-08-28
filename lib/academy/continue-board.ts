/**
 * Eksik / yarım kaldı paneli — satın alınmış, henüz mühürlenmemiş eğitimde
 * kaldığı derse veya sınav kapısına tek tıkla dönüş.
 * Yazma yok; salt görünüm çözümleyicisi.
 */

import {
  curriculumLessonCountForSlug,
  curriculumLessonKeysForSlug,
  isAcademyCurriculumCompleteFromIndex,
  nextAcademyLessonKeyFromIndex,
} from "@/lib/academy/curricula/lesson-index";
import { academyCourseTitleBySlug } from "@/lib/academy/course-titles";

export type AcademyContinuePhase = "lesson" | "exam";

export type AcademyContinueBoard = {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  completedCount: number;
  totalCount: number;
  nextLessonKey: string | null;
  phase: AcademyContinuePhase;
  /** lesson → /oyna; exam → kurs sayfası (ExamStartGate). */
  href: string;
};

export function resolveAcademyContinueBoard(input: {
  courseId: string;
  courseSlug: string;
  courseTitle?: string | null;
  completedLessonKeys: readonly string[];
  hasCertificate: boolean;
}): AcademyContinueBoard | null {
  if (input.hasCertificate) {
    return null;
  }
  const slug = input.courseSlug.trim();
  if (!slug) {
    return null;
  }
  const keys = curriculumLessonKeysForSlug(slug);
  if (keys.length === 0) {
    return null;
  }
  const done = [...new Set(input.completedLessonKeys.filter((key) => key.trim().length > 0))];
  const completedCount = keys.filter((key) => done.includes(key)).length;
  const curriculumComplete = isAcademyCurriculumCompleteFromIndex(slug, done);
  const nextLessonKey = nextAcademyLessonKeyFromIndex(slug, done);
  const title =
    input.courseTitle?.trim() || academyCourseTitleBySlug(slug) || slug;
  if (curriculumComplete) {
    return {
      courseId: input.courseId,
      courseSlug: slug,
      courseTitle: title,
      completedCount,
      totalCount: curriculumLessonCountForSlug(slug),
      nextLessonKey: null,
      phase: "exam",
      href: `/academy/${slug}`,
    };
  }
  return {
    courseId: input.courseId,
    courseSlug: slug,
    courseTitle: title,
    completedCount,
    totalCount: curriculumLessonCountForSlug(slug),
    nextLessonKey,
    phase: "lesson",
    href: `/academy/${slug}/oyna`,
  };
}

/** Katalog şeridi — yalnız yarım kalan ders veya sınav kapısı; başlanmamış satın alma yok. */
export function isAcademyContinueResumeStrip(
  board: AcademyContinueBoard | null | undefined,
): board is AcademyContinueBoard {
  return Boolean(board && (board.phase === "exam" || board.completedCount > 0));
}

export function pickAcademyContinueBoard(
  boards: readonly AcademyContinueBoard[],
): AcademyContinueBoard | null {
  const resumes = boards.filter(isAcademyContinueResumeStrip);
  if (resumes.length === 0) {
    return null;
  }
  const inProgress = resumes.find(
    (board) => board.phase === "lesson" && board.completedCount > 0,
  );
  if (inProgress) {
    return inProgress;
  }
  return resumes.find((board) => board.phase === "exam") ?? null;
}
