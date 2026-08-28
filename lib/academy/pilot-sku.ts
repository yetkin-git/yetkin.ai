/**
 * Akademi büyüme kataloğu — popüler yetkinlik yolları.
 * Vitrin bu slug listesine kilitlidir; Prisma hayalet SKU vitrine girmez.
 * python-temel Amiral Ders olarak durur; tek kart kısıtı kalkmıştır.
 */

export const ACADEMY_PILOT_SKU_SLUG = "python-temel" as const;

export const ACADEMY_GROWTH_SKU_SLUGS = [
  "python-temel",
  "fullstack-temel",
  "ai-temel",
  "ux-temel",
] as const;

export type AcademyPilotSkuSlug = typeof ACADEMY_PILOT_SKU_SLUG;
export type AcademyGrowthSkuSlug = (typeof ACADEMY_GROWTH_SKU_SLUGS)[number];

/** Amiral Ders (python-temel) bölüm sayısı — Temel + İleri kapanış. */
export const ACADEMY_PILOT_SKU_LESSON_COUNT = 12 as const;

/** Vitrindeki her büyüme SKU’su aynı pedagojik derinliktedir. */
export const ACADEMY_GROWTH_LESSON_COUNT = 12 as const;

export function isAcademyPilotSkuSlug(slug: string): slug is AcademyPilotSkuSlug {
  return slug === ACADEMY_PILOT_SKU_SLUG;
}

export function isAcademyGrowthSkuSlug(slug: string): slug is AcademyGrowthSkuSlug {
  return (ACADEMY_GROWTH_SKU_SLUGS as readonly string[]).includes(slug);
}

/**
 * Vitrin — popüler büyüme yolları, CEO sırası.
 * Eski adı `filterAcademyPilotCatalog` (tek kart) durur; süzgeç artık dört SKU basar.
 */
export function filterAcademyGrowthCatalog<T extends { slug: string }>(
  courses: readonly T[],
): T[] {
  const bySlug = new Map(courses.map((row) => [row.slug, row] as const));
  const next: T[] = [];
  for (const slug of ACADEMY_GROWTH_SKU_SLUGS) {
    const row = bySlug.get(slug);
    if (row) {
      next.push(row);
    }
  }
  return next;
}

/** @deprecated Büyüme vitrini — `filterAcademyGrowthCatalog` ile aynı. */
export function filterAcademyPilotCatalog<T extends { slug: string }>(
  courses: readonly T[],
): T[] {
  return filterAcademyGrowthCatalog(courses);
}
