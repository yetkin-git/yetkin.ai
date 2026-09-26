/**
 * Kurs detayı — modül, ders türü (ses/video/doküman) ve süre.
 * Oynatıcı gövdesini açmaz; tohum müfredatından özet basar.
 * Süre, oynatıcıyla aynı mühürlü timings dosyasından okunur.
 */

import "@/lib/academy/lesson-json-disk";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { academyCourseSealedDurationMinutes } from "@/lib/academy/lesson-audio";
import {
  academyLessonMediaMeta,
  type AcademyLessonContentKind,
} from "@/lib/academy/lesson-meta";
import { academyCourseHasSealedAudio, academyTtsRebakeLessonKeys } from "@/lib/academy/pilot-sku";
import {
  academySyllabusModulePlansFor,
  type AcademySyllabusModulePlan,
} from "@/lib/academy/syllabus-groups";

export type { AcademySyllabusModulePlan };
export { academySyllabusModulePlansFor };

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
  const plans = academySyllabusModulePlansFor(slug, lessons.length);
  const modules: AcademySyllabusModule[] = [];
  let offset = 0;
  for (const plan of plans) {
    const group = lessons.slice(offset, offset + plan.size);
    modules.push({
      id: `${slug}-mod-${modules.length + 1}`,
      title: plan.title,
      lessons: group,
      durationMin: group.reduce((sum, lesson) => sum + lesson.durationMin, 0),
    });
    offset += plan.size;
  }
  const summed = lessons.reduce((sum, lesson) => sum + lesson.durationMin, 0);
  const sealedMinutes = academyCourseSealedDurationMinutes(slug);
  const durationMin =
    academyCourseHasSealedAudio(slug) && academyTtsRebakeLessonKeys(slug).length > 0 && sealedMinutes > 0
      ? sealedMinutes
      : summed;
  return {
    slug,
    modules,
    lessons,
    durationMin,
    lessonCount: lessons.length,
  };
}
