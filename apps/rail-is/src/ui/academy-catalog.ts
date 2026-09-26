import { DRON_COURSE_SLUGS, dronCourseTitle, type DronCourseSlug } from "./course-slugs";

/**
 * Amiral + OFF-201 vitrin.
 * OFF-201 lansman etiketi tohumla aynıdır: ₺1.290. Canlı kilit katalog satırındadır.
 */
export const DRON_ACADEMY_VITRINE_SLUGS = DRON_COURSE_SLUGS;

export type DronAcademyVitrineSlug = DronCourseSlug;

export const DRON_PRICE_PENDING_LABEL = "Fiyat Bekleniyor" as const;

export type DronAcademyCatalogItem = {
  slug: DronAcademyVitrineSlug;
  title: string;
  priceLabel: string | null;
};

export function dronAcademyCatalog(): DronAcademyCatalogItem[] {
  return DRON_ACADEMY_VITRINE_SLUGS.map((slug) => ({
    slug,
    title: dronCourseTitle(slug),
    priceLabel: slug === "01_office_ai_ileri" ? "₺1.290" : null,
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
