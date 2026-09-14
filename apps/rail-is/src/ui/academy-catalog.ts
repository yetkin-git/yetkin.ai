import { ACADEMY_COURSE_TITLES, academyCourseTitleBySlug } from "@yetkin/kernel";

/**
 * Amiral vitrin — GET katalog hop'u yoktur.
 * Taslak kardeş SKU üretim bandındadır. Başlık `@yetkin/kernel` SSOT.
 */
export const DRON_ACADEMY_VITRINE_SLUGS = [
  "01_office_ai",
] as const;

export type DronAcademyVitrineSlug = (typeof DRON_ACADEMY_VITRINE_SLUGS)[number];

export type DronAcademyCatalogItem = {
  slug: DronAcademyVitrineSlug;
  title: string;
};

export function dronAcademyCatalog(): DronAcademyCatalogItem[] {
  return DRON_ACADEMY_VITRINE_SLUGS.map((slug) => ({
    slug,
    title: academyCourseTitleBySlug(slug) ?? ACADEMY_COURSE_TITLES[slug],
  }));
}

export function academyLessonIntentId(courseId: string, lessonKey: string): string {
  return `academy-lesson:${courseId}:${lessonKey}`;
}

export function academyExamIntentId(courseId: string): string {
  return `academy-exam:${courseId}`;
}

export function academyPurchaseIntentId(courseId: string): string {
  return `academy-purchase:${courseId}`;
}

export function academyLockIntentId(courseId: string): string {
  return `academy-lock:${courseId}`;
}

export function academyCertificateVerifyPath(hash: string): string {
  return `/academy/dogrula/${hash.trim()}`;
}

export function academyCertificateVerifyUrl(apiBase: string, hash: string): string {
  const base = apiBase.trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error("Amiral adresi yok. Mühür URL üretilmez.");
  }
  return `${base}${academyCertificateVerifyPath(hash)}`;
}
