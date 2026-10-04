/**
 * Ders sayısı ve konuşma kelime tabanı.
 * Sıfır bölümlü iskelet henüz ders taşımaz; ilk bölüm yazıldığında taban açılır.
 * Sayıların evi `production-standard.ts` dir.
 */

import { CURRICULUM_MODULES_BY_SLUG } from "@/lib/academy/curricula";
import {
  academySpokenMinutesFromWordCount,
  assertAcademyAiLessonCount,
  assertAcademyAiLessonSpokenWordCount,
} from "@/lib/academy/production-standard";
import { countAcademyMarkdownWords } from "@/lib/academy/word-count";

export type AcademyCurriculumFloorSection = {
  lessonKey?: string;
  title: string;
  contentMarkdown: string;
};

export type AcademyCurriculumFloorCourse = {
  label: string;
  sections: readonly AcademyCurriculumFloorSection[];
};

export type AcademyCurriculumFloorLessonReport = {
  key: string;
  words: number;
  minutes: number;
};

export type AcademyCurriculumFloorReportRow = {
  label: string;
  lessonCount: number;
  totalWords: number;
  totalMinutes: number;
  skipped: boolean;
  lessons: readonly AcademyCurriculumFloorLessonReport[];
};

function lessonLabel(section: AcademyCurriculumFloorSection): string {
  return section.lessonKey?.trim() || section.title.trim() || "ders";
}

/** Yazılmış eğitimin ihlalleri. Boş iskelet ihlal değildir. */
export function academyCurriculumFloorViolations(
  courses: readonly AcademyCurriculumFloorCourse[],
): string[] {
  const issues: string[] = [];
  for (const course of courses) {
    if (course.sections.length === 0) continue;
    try {
      assertAcademyAiLessonCount(course.sections.length, course.label);
    } catch (error) {
      issues.push(error instanceof Error ? error.message : String(error));
    }
    for (const section of course.sections) {
      const words = countAcademyMarkdownWords(section.contentMarkdown);
      try {
        assertAcademyAiLessonSpokenWordCount(words, lessonLabel(section));
      } catch (error) {
        issues.push(error instanceof Error ? error.message : String(error));
      }
    }
  }
  return issues;
}

export function academyCurriculumFloorReport(
  courses: readonly AcademyCurriculumFloorCourse[],
): AcademyCurriculumFloorReportRow[] {
  return courses.map((course) => {
    if (course.sections.length === 0) {
      return {
        label: course.label,
        lessonCount: 0,
        totalWords: 0,
        totalMinutes: 0,
        skipped: true,
        lessons: [],
      };
    }
    const lessons = course.sections.map((section) => {
      const words = countAcademyMarkdownWords(section.contentMarkdown);
      return {
        key: lessonLabel(section),
        words,
        minutes: academySpokenMinutesFromWordCount(words),
      };
    });
    const totalWords = lessons.reduce((sum, lesson) => sum + lesson.words, 0);
    return {
      label: course.label,
      lessonCount: lessons.length,
      totalWords,
      totalMinutes: academySpokenMinutesFromWordCount(totalWords),
      skipped: false,
      lessons,
    };
  });
}

/** Canlı kayıt. PR-105, SM-103 ve BOT-104 gövdesi kayıtlı modüldedir; ikinci kez yazılmaz. */
export function academyLiveCurriculumFloorCourses(): AcademyCurriculumFloorCourse[] {
  return Object.entries(CURRICULUM_MODULES_BY_SLUG).map(([slug, module]) => ({
    label: slug,
    sections: module.sections,
  }));
}

export function academyLiveCurriculumFloorViolations(): string[] {
  return academyCurriculumFloorViolations(academyLiveCurriculumFloorCourses());
}
