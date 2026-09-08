/**
 * Kurs detayı — modül, ders türü (ses/video/doküman) ve süre.
 * Oynatıcı gövdesini açmaz; tohum müfredatından özet basar.
 */

import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  academyLessonMediaMeta,
  type AcademyLessonContentKind,
} from "@/lib/academy/lesson-meta";

export type AcademySyllabusLesson = {
  key: string;
  order: number;
  title: string;
  kind: AcademyLessonContentKind;
  durationMin: number;
};

export type AcademySyllabusModule = {
  id: string;
  title: string;
  lessons: readonly AcademySyllabusLesson[];
  durationMin: number;
};

export type AcademySyllabus = {
  slug: string;
  modules: readonly AcademySyllabusModule[];
  lessons: readonly AcademySyllabusLesson[];
  durationMin: number;
  lessonCount: number;
};

const LESSONS_PER_MODULE = 4;

const MODULE_TITLES: Record<string, readonly string[]> = {};

function moduleTitleFor(slug: string, moduleIndex: number): string {
  const named = MODULE_TITLES[slug]?.[moduleIndex];
  if (named) {
    return named;
  }
  return `Modül ${moduleIndex + 1}`;
}

export function curriculumSyllabusForCourseSlug(slug: string): AcademySyllabus {
  const seeds = curriculumForCourseSlug(slug);
  const lessons: AcademySyllabusLesson[] = seeds.map((lesson) => {
    const media = academyLessonMediaMeta({ ...lesson, courseSlug: slug });
    return {
      key: lesson.key,
      order: lesson.order,
      title: lesson.title,
      kind: media.kind,
      durationMin: media.durationMin,
    };
  });
  const modules: AcademySyllabusModule[] = [];
  for (let offset = 0; offset < lessons.length; offset += LESSONS_PER_MODULE) {
    const group = lessons.slice(offset, offset + LESSONS_PER_MODULE);
    const moduleIndex = modules.length;
    modules.push({
      id: `${slug}-mod-${moduleIndex + 1}`,
      title: moduleTitleFor(slug, moduleIndex),
      lessons: group,
      durationMin: group.reduce((sum, lesson) => sum + lesson.durationMin, 0),
    });
  }
  return {
    slug,
    modules,
    lessons,
    durationMin: lessons.reduce((sum, lesson) => sum + lesson.durationMin, 0),
    lessonCount: lessons.length,
  };
}
