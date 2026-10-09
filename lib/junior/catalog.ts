import "server-only";

import { JUNIOR_TELL_CLOSE, startsWithJuniorWarmOpening } from "@/lib/junior/content-rules";
import { JUNIOR_FEN_LESSONS } from "@/lib/junior/content/fen";
import { JUNIOR_ING_LESSONS } from "@/lib/junior/content/ing";
import { JUNIOR_MAT_LESSONS } from "@/lib/junior/content/mat";
import { JUNIOR_SOSYAL_LESSONS } from "@/lib/junior/content/sosyal";
import { JUNIOR_TURKCE_LESSONS } from "@/lib/junior/content/turkce";
import { JUNIOR_ELECTIVE_COURSES, type JuniorElectiveCourse } from "@/lib/junior/elective-catalog";
import { JUNIOR_COURSE_TITLES } from "@/lib/junior/human-titles";
import { JUNIOR_FREE_LESSON_KEY, JUNIOR_PILOT_GRADE, JUNIOR_PILOT_SLUGS, JUNIOR_QUIZ_PREPARING_LABEL } from "@/lib/junior/limits";
import { juniorProductionSealGaps } from "@/lib/junior/production-seal";
import {
  JUNIOR_ELECTIVE_CATEGORY,
  JUNIOR_ELECTIVE_TAG,
  JUNIOR_MAARIF_SKILL_TAGS,
  JUNIOR_PERSONAL_CURRICULUM_TAG,
  JUNIOR_VECTOR_STEP_COUNT,
  type JuniorCourseShelf,
  type JuniorLessonCard,
  type JuniorLessonScript,
} from "@/lib/junior/types";
import { juniorThisWeekLessonIndex } from "@/lib/junior/week";

export { JUNIOR_ELECTIVE_CATEGORY, JUNIOR_MAARIF_SKILL_TAGS };

export type { JuniorElectiveCourse, JuniorLessonScript };

export type JuniorPilotCourse = {
  slug: (typeof JUNIOR_PILOT_SLUGS)[number];
  code: string;
  title: string;
  subject: string;
  grade: typeof JUNIOR_PILOT_GRADE;
  track: "core";
  lessons: readonly JuniorLessonScript[];
};

export type JuniorCatalogCourse = JuniorPilotCourse | JuniorElectiveCourse;

export { JUNIOR_ELECTIVE_COURSES };

export const JUNIOR_PILOT_COURSES = [
  {
    slug: "jr_06_mat",
    code: "JR-06-MAT",
    title: JUNIOR_COURSE_TITLES.jr_06_mat,
    subject: "Matematik",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: JUNIOR_MAT_LESSONS,
  },
  {
    slug: "jr_06_fen",
    code: "JR-06-FEN",
    title: JUNIOR_COURSE_TITLES.jr_06_fen,
    subject: "Fen Bilimleri",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: JUNIOR_FEN_LESSONS,
  },
  {
    slug: "jr_06_turkce",
    code: "JR-06-TUR",
    title: JUNIOR_COURSE_TITLES.jr_06_turkce,
    subject: "Türkçe",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: JUNIOR_TURKCE_LESSONS,
  },
  {
    slug: "jr_06_ing_main",
    code: "JR-06-ING-ANA",
    title: JUNIOR_COURSE_TITLES.jr_06_ing_main,
    subject: "İngilizce",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: JUNIOR_ING_LESSONS,
  },
  {
    slug: "jr_06_sosyal",
    code: "JR-06-SOS",
    title: JUNIOR_COURSE_TITLES.jr_06_sosyal,
    subject: "Sosyal Bilgiler",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: JUNIOR_SOSYAL_LESSONS,
  },
] as const satisfies readonly JuniorPilotCourse[];

function juniorCatalogCourses(): readonly JuniorCatalogCourse[] {
  return [...JUNIOR_PILOT_COURSES, ...JUNIOR_ELECTIVE_COURSES];
}

/** Ücretsiz konu listesinin tek evi. Her kartın ilk konusu. Soru arşivi bu listeyi daraltmaz. */
export function juniorFreeLessonKeys(): readonly string[] {
  const keys = juniorCatalogCourses().flatMap((course) => {
    const opener = course.lessons[0];
    return opener ? [opener.key] : [];
  });
  if (!keys.includes(JUNIOR_FREE_LESSON_KEY)) {
    throw new Error("Ücretsiz konu listesi katalogdaki ilk konulardan koptu.");
  }
  return keys;
}

/** Seçmeli dersler. Mühür geçmeden çekirdek kartla aynı tam ders değildir. */
export function juniorElectiveCategory(): {
  title: typeof JUNIOR_ELECTIVE_CATEGORY;
  courses: readonly JuniorElectiveCourse[];
} {
  return {
    title: JUNIOR_ELECTIVE_CATEGORY,
    courses: JUNIOR_ELECTIVE_COURSES,
  };
}

/** Seçmeli ders: on iki adım, sıcak öğretmen girişi, Kavramsal Anlayış ve İfade Gücü. */
export function juniorElectiveLessonsSharePlayerContract(): boolean {
  return JUNIOR_ELECTIVE_COURSES.every((course) =>
    course.lessons.every(
      (lesson) =>
        lesson.scene === "elective" &&
        lesson.steps?.length === JUNIOR_VECTOR_STEP_COUNT &&
        startsWithJuniorWarmOpening(lesson.listenText) &&
        lesson.listenText.includes("Bugün Neler Öğrendik?") &&
        lesson.listenText.includes("Kavramsal Anlayış") &&
        lesson.listenText.includes("İfade Gücü") &&
        lesson.listenText.includes(JUNIOR_TELL_CLOSE),
    ),
  );
}

export function juniorCourseBySlug(slug: string): JuniorCatalogCourse | null {
  return juniorCatalogCourses().find((course) => course.slug === slug) ?? null;
}

export function juniorCourseByLessonKey(lessonKey: string): JuniorCatalogCourse | null {
  return juniorCatalogCourses().find((course) => course.lessons.some((lesson) => lesson.key === lessonKey)) ?? null;
}

export function juniorCatalogLessonKeys(): string[] {
  return juniorCatalogCourses().flatMap((course) => course.lessons.map((lesson) => lesson.key));
}

export function juniorLessonByKey(lessonKey: string): JuniorLessonScript | null {
  for (const course of juniorCatalogCourses()) {
    const lesson = course.lessons.find((row) => row.key === lessonKey);
    if (lesson) {
      return lesson;
    }
  }
  return null;
}

export function juniorLessonAccess(lessonKey: string): "free" | "locked" | "missing" {
  const course = juniorCourseByLessonKey(lessonKey);
  if (!course) {
    return "missing";
  }
  return course.lessons[0]?.key === lessonKey ? "free" : "locked";
}

export type JuniorPlanAccess = {
  active: boolean;
  selectedElectives: readonly string[];
};

/** Yıllık paket açıkken çekirdek derslerin ve seçilen seçmeli derslerin kilidi kalkar. */
export function juniorLessonAccessForPlan(
  lessonKey: string,
  plan: JuniorPlanAccess | null,
): "free" | "locked" | "missing" {
  const base = juniorLessonAccess(lessonKey);
  if (base !== "locked" || !plan?.active) {
    return base;
  }
  const course = juniorCourseByLessonKey(lessonKey);
  if (!course) {
    return "missing";
  }
  if (course.track === "core" || plan.selectedElectives.includes(course.slug)) {
    return "free";
  }
  return "locked";
}

export function stampJuniorPlanAccess(
  shelves: readonly JuniorCourseShelf[],
  plan: JuniorPlanAccess,
): JuniorCourseShelf[] {
  if (!plan.active) {
    return shelves.map((course) => ({ ...course, lessons: course.lessons.map((lesson) => ({ ...lesson })) }));
  }
  const chosen = new Set(plan.selectedElectives);
  return shelves.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson) => ({
      ...lesson,
      access: course.track === "core" || chosen.has(course.slug) ? "free" : lesson.access,
    })),
  }));
}

export function juniorElectivePicks(): { slug: string; title: string; subject: string }[] {
  return JUNIOR_ELECTIVE_COURSES.map((course) => ({
    slug: course.slug,
    title: course.title,
    subject: course.subject,
  }));
}

function toShelf(course: JuniorCatalogCourse, now: Date): JuniorCourseShelf {
  const weekIndex = juniorThisWeekLessonIndex(course.lessons.length, now);
  const lessons = course.lessons.map((lesson, index): JuniorLessonCard => ({
    key: lesson.key,
    title: lesson.title,
    teaser: lesson.teaser,
    access: course.lessons[0]?.key === lesson.key ? "free" : "locked",
    thisWeek: weekIndex === index,
    status: juniorProductionSealGaps(lesson).length === 0 ? "fresh" : "preparing",
  }));
  const preparingShelf = course.track === "elective" && lessons.some((lesson) => lesson.status === "preparing");
  const labels = preparingShelf
    ? [JUNIOR_QUIZ_PREPARING_LABEL, JUNIOR_PERSONAL_CURRICULUM_TAG, JUNIOR_ELECTIVE_TAG, ...JUNIOR_MAARIF_SKILL_TAGS]
    : course.track === "elective"
      ? [JUNIOR_PERSONAL_CURRICULUM_TAG, JUNIOR_ELECTIVE_TAG, ...JUNIOR_MAARIF_SKILL_TAGS]
      : [...JUNIOR_MAARIF_SKILL_TAGS];
  return {
    slug: course.slug,
    title: course.title,
    subject: course.subject,
    grade: course.grade,
    track: course.track,
    labels,
    lessons,
  };
}

export function juniorCourseShelves(now = new Date()): JuniorCourseShelf[] {
  return juniorCatalogCourses().map((course) => toShelf(course, now));
}

/**
 * Kişiye özel müfredat.
 * Seçim yoksa (null) bütün seçmeli raflar açık kalır.
 * Dizi gelirse çekirdek dersler durur, yalnız seçilen seçmeli dersler yanlarına gelir.
 */
export function juniorPersonalizedShelves(
  chosenElectiveSlugs: readonly string[] | null,
  now = new Date(),
): JuniorCourseShelf[] {
  const shelves = juniorCourseShelves(now);
  if (chosenElectiveSlugs === null) {
    return shelves;
  }
  const chosen = new Set(chosenElectiveSlugs);
  return shelves.filter((course) => course.track === "core" || chosen.has(course.slug));
}

/**
 * Raf her zaman 6. sınıf pilot metnidir.
 * Seçilen sınıf başlığı değiştirmez. Başka sınıfın dersi yazılana kadar kart 6. sınıfta kalır.
 */
export function juniorShelvesForGrade(
  _grade: number,
  chosenElectiveSlugs: readonly string[] | null,
  now = new Date(),
): JuniorCourseShelf[] {
  return juniorPersonalizedShelves(chosenElectiveSlugs, now);
}
