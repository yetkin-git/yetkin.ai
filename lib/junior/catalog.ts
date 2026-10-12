import "server-only";

import { JUNIOR_TELL_CLOSE, startsWithJuniorWarmOpening } from "@/lib/junior/content-rules";
import { juniorSealedCourseLessons } from "@/lib/junior/content-source";
import { JUNIOR_FREE_STARTER_LABEL, JUNIOR_LEGACY_ARCHIVE_LABEL } from "@/lib/junior/meb";
import { JUNIOR_ELECTIVE_COURSES, type JuniorElectiveCourse } from "@/lib/junior/elective-catalog";
import { JUNIOR_COURSE_TITLES } from "@/lib/junior/human-titles";
import {
  JUNIOR_ELECTIVE_PRICE_EXCLUDED,
  JUNIOR_ARCHIVED_OPENER_KEYS,
  JUNIOR_FREE_LESSON_KEY,
  JUNIOR_FREE_OPENER_OVERRIDE,
  JUNIOR_PILOT_GRADE,
  JUNIOR_PILOT_SLUGS,
  JUNIOR_QUIZ_PREPARING_LABEL,
} from "@/lib/junior/limits";
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
import { juniorLessonUnit } from "@/lib/junior/units";
import {
  juniorActiveLessonKeys,
  juniorLessonWeekHeading,
  juniorLessonWeekSpan,
  juniorSchoolWeek,
} from "@/lib/junior/week";
import { JUNIOR_CALENDAR_VERSION, juniorCalendarBundle } from "@yetkin/junior-content/calendar";
import { JUNIOR_COURSE_SLUGS, type JuniorCourseSlug } from "@yetkin/junior-content";

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
    lessons: juniorSealedCourseLessons("jr_06_mat"),
  },
  {
    slug: "jr_06_fen",
    code: "JR-06-FEN",
    title: JUNIOR_COURSE_TITLES.jr_06_fen,
    subject: "Fen Bilimleri",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: juniorSealedCourseLessons("jr_06_fen"),
  },
  {
    slug: "jr_06_turkce",
    code: "JR-06-TUR",
    title: JUNIOR_COURSE_TITLES.jr_06_turkce,
    subject: "Türkçe",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: juniorSealedCourseLessons("jr_06_turkce"),
  },
  {
    slug: "jr_06_ing_main",
    code: "JR-06-ING-ANA",
    title: JUNIOR_COURSE_TITLES.jr_06_ing_main,
    subject: "İngilizce",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: juniorSealedCourseLessons("jr_06_ing_main"),
  },
  {
    slug: "jr_06_sosyal",
    code: "JR-06-SOS",
    title: JUNIOR_COURSE_TITLES.jr_06_sosyal,
    subject: "Sosyal Bilgiler",
    grade: JUNIOR_PILOT_GRADE,
    track: "core",
    lessons: juniorSealedCourseLessons("jr_06_sosyal"),
  },
] as const satisfies readonly JuniorPilotCourse[];

function juniorCatalogCourses(): readonly JuniorCatalogCourse[] {
  return [...JUNIOR_PILOT_COURSES, ...JUNIOR_ELECTIVE_COURSES];
}

/**
 * Ücretsiz konu listesinin tek evi.
 * Her kartın ilk konusu, arşive alınmış olanlar hariç; artı ücretsiz ilk ders kapısı (güncel hafta).
 * `JUNIOR_FREE_OPENER_OVERRIDE` dosya sırasındaki `-1` kapısını Maarif haftasının kartıyla değiştirir.
 * Soru arşivi bu listeyi daraltmaz.
 */
export function juniorFreeLessonKeys(): readonly string[] {
  if (!juniorLessonByKey(JUNIOR_FREE_LESSON_KEY)) {
    throw new Error("Ücretsiz ilk ders kapısı katalogda yok.");
  }
  const openers = juniorCatalogCourses().flatMap((course) => {
    const override = JUNIOR_FREE_OPENER_OVERRIDE[course.slug];
    if (override) {
      if (!course.lessons.some((lesson) => lesson.key === override)) {
        throw new Error(`Ücretsiz kapı katalogda yok: ${override}`);
      }
      return [override];
    }
    const opener = course.lessons[0];
    return opener ? [opener.key] : [];
  });
  const keys = openers.filter((key) => !JUNIOR_ARCHIVED_OPENER_KEYS.includes(key));
  if (!keys.includes(JUNIOR_FREE_LESSON_KEY)) {
    keys.push(JUNIOR_FREE_LESSON_KEY);
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
  return juniorFreeLessonKeys().includes(lessonKey) ? "free" : "locked";
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
  // Girdi `juniorPaidElectives` süzgecinden geçmiş olmalıdır (mühürsüz seçmeli ücretli pakette açılmaz).
  const priced =
    course.track === "elective" &&
    !(JUNIOR_ELECTIVE_PRICE_EXCLUDED as readonly string[]).includes(course.slug) &&
    plan.selectedElectives.includes(course.slug);
  if (course.track === "core" || priced) {
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
      access:
        course.track === "core" ||
        (chosen.has(course.slug) &&
          !(JUNIOR_ELECTIVE_PRICE_EXCLUDED as readonly string[]).includes(course.slug))
          ? "free"
          : lesson.access,
    })),
  }));
}

/** Mühür kapısı: seçmeli dersin her konusu yeşil olmalı (metin, ses, ısınma, soru, sahne). */
export function juniorCourseSealed(course: JuniorCatalogCourse): boolean {
  return course.lessons.length > 0 && course.lessons.every((lesson) => juniorProductionSealGaps(lesson).length === 0);
}

/** Ücretli pakete girebilecek seçmeli ders: seçmeli, taslak değil ve mühürlü (T-06). */
export function juniorElectiveOpenable(course: JuniorCatalogCourse): boolean {
  return (
    course.track === "elective" &&
    !(JUNIOR_ELECTIVE_PRICE_EXCLUDED as readonly string[]).includes(course.slug) &&
    juniorCourseSealed(course)
  );
}

/** Slug'a göre paket uygunluğu. Bilinmeyen slug uygun değildir. */
export function juniorElectiveOpenBySlug(slug: string): boolean {
  const course = juniorCourseBySlug(slug);
  return course !== null && juniorElectiveOpenable(course);
}

/**
 * Ücretli pakette sayılan seçmeliler (T-06). Mühürsüz seçim paket erişimi üretmez.
 * Denetim yolu bu süzgeçten geçmez; denetim sınırı bütün kilitli dersleri izlemeye açıktır.
 */
export function juniorPaidElectives(selected: readonly string[]): string[] {
  return selected.filter((slug) => juniorElectiveOpenBySlug(slug));
}

export type JuniorElectivePick = { slug: string; title: string; subject: string; ready: boolean };

/** Fiyat vaadi ve kota penceresi. Hazırlık taslağı (`jr_06_ing`) bu listeye girmez. `ready` mühür kapısıdır. */
export function juniorElectivePicks(): JuniorElectivePick[] {
  return JUNIOR_ELECTIVE_COURSES.filter(
    (course) => !(JUNIOR_ELECTIVE_PRICE_EXCLUDED as readonly string[]).includes(course.slug),
  ).map((course) => ({
    slug: course.slug,
    title: course.title,
    subject: course.subject,
    ready: juniorCourseSealed(course),
  }));
}

function isPilotSlug(slug: string): slug is JuniorCourseSlug {
  return (JUNIOR_COURSE_SLUGS as readonly string[]).includes(slug);
}

function outcomeProgress(slug: JuniorCourseSlug, lessonKeys: readonly string[]): {
  outcomeWritten: number;
  outcomeTotal: number;
} {
  const bundle = juniorCalendarBundle(slug);
  const sealed = new Set(lessonKeys);
  const rows = bundle.outcomes.filter((outcome) => outcome.hours > 0);
  const outcomeWritten = rows.filter(
    (outcome) =>
      !outcome.processOpen &&
      bundle.topics.some(
        (topic) =>
          sealed.has(topic.lessonKey) && topic.hours > 0 && topic.outcomeCodes.includes(outcome.outcomeCode),
      ),
  ).length;
  return { outcomeWritten, outcomeTotal: rows.length };
}

/**
 * Matematik ve fen kartı çıktı adını yazar.
 * Türkçe ve İngilizce uydusu aynı tema adını paylaşır; rozet ders başlığını taşır.
 */
function shelfWeekHeading(slug: JuniorCourseSlug, lessonKey: string, title: string): string | null {
  const heading = juniorLessonWeekHeading(slug, lessonKey);
  if (!heading) {
    return null;
  }
  if (slug !== "jr_06_turkce" && slug !== "jr_06_ing_main") {
    return heading;
  }
  const colon = heading.indexOf(":");
  if (colon < 0) {
    return `${heading}: ${title}`;
  }
  return `${heading.slice(0, colon)}: ${title}`;
}

const WEEK_SECTION = ["", " (B Bölümü)", " (C Bölümü)", " (D Bölümü)", " (E Bölümü)"] as const;

/** Aynı hafta aralığındaki ikinci kart «3. Hafta (B Bölümü)» yazar. */
function withWeekSection(heading: string, index: number): string {
  const mark = WEEK_SECTION[index] ?? ` (${index + 1}. Bölüm)`;
  if (!mark) {
    return heading;
  }
  const colon = heading.indexOf(":");
  if (colon < 0) {
    return `${heading}${mark}`;
  }
  return `${heading.slice(0, colon)}${mark}${heading.slice(colon)}`;
}

/**
 * Raf sırası MEB başlangıç haftasıdır. Takvimsiz kart sonda kalır.
 * Aynı hafta etiketini taşıyan ikinci kart basılmaz.
 */
function orderShelfLessons(slug: JuniorCourseSlug | null, lessons: JuniorLessonCard[]): JuniorLessonCard[] {
  if (!slug) {
    return lessons;
  }
  const ranked = lessons.map((lesson, index) => ({
    lesson,
    index,
    span: juniorLessonWeekSpan(slug, lesson.key),
  }));
  ranked.sort((left, right) => {
    const leftWeek = left.span?.startWeek ?? Number.POSITIVE_INFINITY;
    const rightWeek = right.span?.startWeek ?? Number.POSITIVE_INFINITY;
    if (leftWeek !== rightWeek) {
      return leftWeek - rightWeek;
    }
    const leftEnd = left.span?.endWeek ?? Number.POSITIVE_INFINITY;
    const rightEnd = right.span?.endWeek ?? Number.POSITIVE_INFINITY;
    if (leftEnd !== rightEnd) {
      return leftEnd - rightEnd;
    }
    return left.index - right.index;
  });
  const placed = new Map<string, number>();
  const seenHeading = new Set<string>();
  const ordered: JuniorLessonCard[] = [];
  for (const row of ranked) {
    let lesson = row.lesson;
    if (row.span && lesson.weekHeading) {
      const key = `${row.span.startWeek}-${row.span.endWeek}`;
      const index = placed.get(key) ?? 0;
      placed.set(key, index + 1);
      if (index > 0) {
        lesson = { ...lesson, weekHeading: withWeekSection(lesson.weekHeading, index) };
      }
    }
    if (lesson.weekHeading) {
      if (seenHeading.has(lesson.weekHeading)) {
        continue;
      }
      seenHeading.add(lesson.weekHeading);
    }
    ordered.push(lesson);
  }
  return ordered;
}

function toShelf(course: JuniorCatalogCourse, now: Date): JuniorCourseShelf {
  const pilot = isPilotSlug(course.slug) ? course.slug : null;
  const active = new Set(pilot ? juniorActiveLessonKeys(pilot, now) : []);
  const bandByKey = new Map(pilot ? juniorCalendarBundle(pilot).topics.map((topic) => [topic.lessonKey, topic.band]) : []);
  const freeKeys = new Set(juniorFreeLessonKeys());
  const lessons = course.lessons.map((lesson): JuniorLessonCard => {
    const free = freeKeys.has(lesson.key);
    const card: JuniorLessonCard = {
      key: lesson.key,
      title: lesson.title,
      teaser: lesson.teaser,
      access: free ? "free" : "locked",
      thisWeek: active.has(lesson.key),
      status: juniorProductionSealGaps(lesson).length === 0 ? "fresh" : "preparing",
    };
    const heading = pilot ? shelfWeekHeading(pilot, lesson.key, lesson.title) : null;
    if (heading) {
      card.weekHeading = heading;
    }
    if (lesson.key === JUNIOR_FREE_LESSON_KEY) {
      // Güncel haftanın ücretsiz ilk dersi arşiv rafına girmez; kendi etiketini taşır.
      card.starterLabel = JUNIOR_FREE_STARTER_LABEL;
    } else if (bandByKey.get(lesson.key) === "legacy-2018") {
      // 2018 kaynaklı açılış ücretsizse başlangıç etiketini, değilse müfredat dışı arşiv etiketini taşır.
      if (card.access === "free") {
        card.starterLabel = JUNIOR_FREE_STARTER_LABEL;
      } else {
        card.archiveLabel = JUNIOR_LEGACY_ARCHIVE_LABEL;
      }
    }
    const unit = pilot ? juniorLessonUnit(pilot, lesson.key) : null;
    if (unit) {
      card.unitCode = unit.code;
      card.unitIndex = unit.index;
      card.unitTitle = unit.title;
    }
    return card;
  });
  const orderedLessons = orderShelfLessons(pilot, lessons);
  const preparingShelf = course.track === "elective" && orderedLessons.some((lesson) => lesson.status === "preparing");
  const labels = preparingShelf
    ? [JUNIOR_QUIZ_PREPARING_LABEL, JUNIOR_PERSONAL_CURRICULUM_TAG, JUNIOR_ELECTIVE_TAG, ...JUNIOR_MAARIF_SKILL_TAGS]
    : course.track === "elective"
      ? [JUNIOR_PERSONAL_CURRICULUM_TAG, JUNIOR_ELECTIVE_TAG, ...JUNIOR_MAARIF_SKILL_TAGS]
      : [...JUNIOR_MAARIF_SKILL_TAGS];
  const progress = pilot ? outcomeProgress(pilot, orderedLessons.map((lesson) => lesson.key)) : {};
  return {
    slug: course.slug,
    title: course.title,
    subject: course.subject,
    grade: course.grade,
    track: course.track,
    labels,
    lessons: orderedLessons,
    ...progress,
  };
}

const shelfCache = new Map<string, JuniorCourseShelf[]>();

function copyJuniorShelves(shelves: readonly JuniorCourseShelf[]): JuniorCourseShelf[] {
  return shelves.map((course) => ({
    ...course,
    labels: [...course.labels],
    lessons: course.lessons.map((lesson) => ({ ...lesson })),
  }));
}

/** Hafta anahtarı. Aynı okul haftasında `thisWeek` değişmez. */
function shelfCacheKey(now: Date): string {
  const week = juniorSchoolWeek(now);
  const stamp = week === null ? "pre" : String(week);
  return `${JUNIOR_CALENDAR_VERSION}:${stamp}`;
}

export function clearJuniorCourseShelfCache(): void {
  shelfCache.clear();
}

export function juniorCourseShelves(now = new Date()): JuniorCourseShelf[] {
  const key = shelfCacheKey(now);
  let cached = shelfCache.get(key);
  if (!cached) {
    cached = juniorCatalogCourses().map((course) => toShelf(course, now));
    shelfCache.set(key, cached);
  }
  return copyJuniorShelves(cached);
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
