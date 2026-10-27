import { formatMinorLabel } from "./money";
import { DRON_COURSE_SLUGS, dronCourseTitle, type DronCourseSlug } from "./course-slugs";

/**
 * Altı vitrin kartı. Fiyat etiketi `/api/v1/academy/catalog` satırındaki `priceMinor` alanıdır.
 * Kodda donmuş lira yoktur. Satır yoksa etiket boş kalır.
 */
export const DRON_ACADEMY_VITRINE_SLUGS = DRON_COURSE_SLUGS;

export type DronAcademyVitrineSlug = DronCourseSlug;

export const DRON_PRICE_PENDING_LABEL = "Fiyat Bekleniyor" as const;

export type DronAcademyCatalogItem = {
  slug: DronAcademyVitrineSlug;
  title: string;
  priceLabel: string | null;
};

export function dronAcademyCatalog(
  priceLabels?: Readonly<Record<string, string | null>> | null,
): DronAcademyCatalogItem[] {
  return DRON_ACADEMY_VITRINE_SLUGS.map((slug) => ({
    slug,
    title: dronCourseTitle(slug),
    priceLabel: priceLabels?.[slug] ?? null,
  }));
}

/** Katalog hop gövdesinden fiyat etiketi. Tutar yoksa `null`. Uydurma lira yazılmaz. */
export function dronAcademyPriceLabelsFromCatalog(data: unknown): Record<string, string | null> {
  const root = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const courses = Array.isArray(root?.courses) ? root.courses : [];
  const labels: Record<string, string | null> = {};
  for (const row of courses) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const record = row as { slug?: unknown; priceMinor?: unknown; currencyCode?: unknown };
    if (typeof record.slug !== "string" || !record.slug.trim()) {
      continue;
    }
    if (typeof record.priceMinor !== "number" || !Number.isInteger(record.priceMinor)) {
      labels[record.slug] = null;
      continue;
    }
    const currency = record.currencyCode === "USD" || record.currencyCode === "EUR" ? record.currencyCode : "TRY";
    try {
      labels[record.slug] = formatMinorLabel(record.priceMinor, currency);
    } catch {
      labels[record.slug] = null;
    }
  }
  return labels;
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
