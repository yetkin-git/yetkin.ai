import { JUNIOR_LESSON_FACE } from "@/lib/junior/lesson-face";
import { JUNIOR_ELECTIVE_SLUGS, JUNIOR_PILOT_SLUGS } from "@/lib/junior/limits";

/**
 * İstemciye açık ders başlıkları.
 * Konu başlığı senaryodan türer (`JUNIOR_LESSON_FACE`).
 * Raf başlığı bu dosyadadır; katalog onu okur.
 */

type JuniorCourseSlug = (typeof JUNIOR_PILOT_SLUGS)[number] | (typeof JUNIOR_ELECTIVE_SLUGS)[number];

const LESSON_TITLE_BY_KEY = new Map<string, string>(
  JUNIOR_LESSON_FACE.map((row) => [row.key, row.title]),
);

export const JUNIOR_COURSE_TITLES = {
  jr_06_mat: "6. Sınıf Matematik",
  jr_06_fen: "6. Sınıf Fen Bilimleri",
  jr_06_turkce: "6. Sınıf Türkçe",
  jr_06_ing_main: "6. Sınıf İngilizce",
  jr_06_sosyal: "6. Sınıf Sosyal Bilgiler",
  jr_06_ing: "Seçmeli İngilizce (Pratik & Konuşma)",
  jr_06_alm: "Almanca",
  jr_06_fra: "Fransızca",
  jr_06_siyer: "Siyer-i Nebi",
  jr_06_kod: "Bilgisayar Bilimi / Kodlama",
  jr_06_arp: "Seçmeli Arapça",
} as const satisfies Record<JuniorCourseSlug, string>;

export function juniorCourseTitleBySlug(slug: string): string | null {
  if (Object.prototype.hasOwnProperty.call(JUNIOR_COURSE_TITLES, slug)) {
    return JUNIOR_COURSE_TITLES[slug as JuniorCourseSlug];
  }
  return null;
}

/** `jr_06_sosyal-1` ve düz `jr_06_sosyal` aynı ders rafına iner. */
export function juniorCourseSlugFromLessonKey(lessonKey: string): string | null {
  const trimmed = lessonKey.trim();
  if (juniorCourseTitleBySlug(trimmed)) {
    return trimmed;
  }
  const match = /^(.*)-(\d+)$/.exec(trimmed);
  const slug = match?.[1];
  if (!slug || !juniorCourseTitleBySlug(slug)) {
    return null;
  }
  return slug;
}

export function juniorCourseTitleFromLessonKey(lessonKey: string): string | null {
  const slug = juniorCourseSlugFromLessonKey(lessonKey);
  return slug ? juniorCourseTitleBySlug(slug) : null;
}

export function juniorLessonTitleByKey(lessonKey: string): string | null {
  return LESSON_TITLE_BY_KEY.get(lessonKey.trim()) ?? null;
}
