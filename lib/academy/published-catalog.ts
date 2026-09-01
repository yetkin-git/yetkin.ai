import { orderAcademyCatalogByCurriculum } from "@/lib/academy/catalog-filter";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import { academyCardOfferPaths } from "@/lib/academy/purchase-path";
import {
  ACADEMY_CATALOG_SEEDS,
  ACADEMY_SEED_CURRENCY,
  academyCatalogSeedMatch,
  type AcademyCatalogSeed,
} from "@/lib/academy/catalog-seed";
import type { AcademyCourseRecord, AcademyCourseWithPrice } from "@/lib/academy/types";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";

const SEED_STAMP = new Date("2026-08-21T15:00:00.000Z");

export function academyCourseSeedMatch(idOrSlug: string): AcademyCatalogSeed | undefined {
  return academyCatalogSeedMatch(idOrSlug);
}

export function academyCourseRecordFromSeed(row: AcademyCatalogSeed): AcademyCourseRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    catalogUnitKey: row.catalogUnitKey,
    globalRank: row.globalRank,
    localRank: row.localRank,
    trendScore: row.trendScore,
    isPublished: true,
    createdAt: SEED_STAMP,
    updatedAt: SEED_STAMP,
  };
}

function withCardHonesty(course: AcademyCourseWithPrice): AcademyCourseWithPrice {
  const seed = academyCatalogSeedMatch(course.slug) ?? academyCatalogSeedMatch(course.id);
  return {
    ...course,
    summary: seed?.summary ?? course.summary,
    level: academyCourseLevelBySlug(course.slug),
    offerPaths: academyCardOfferPaths(),
  };
}

export function publishedAcademyCourseFromSeed(row: AcademyCatalogSeed): AcademyCourseWithPrice {
  return withCardHonesty({
    ...academyCourseRecordFromSeed(row),
    priceMinor: toAmountMinor(row.seedAmountMinor),
    currencyCode: ACADEMY_SEED_CURRENCY,
    purchasable: true,
  });
}

type AcademyCatalogOrderable = { slug: string; level?: string | null };

/**
 * Vitrin sırası: sabit kulvar önceliği → modül kodu (101→102→103) → slug.
 * created_at / puan kolonu okunmaz; kart dizilimine karışmaz.
 */
export function orderAcademyShowcaseCatalog<T extends AcademyCatalogOrderable>(
  courses: readonly T[],
): T[] {
  return orderAcademyCatalogByCurriculum(courses);
}

export function publishedCoursesFromSeed(): AcademyCourseWithPrice[] {
  return orderAcademyShowcaseCatalog(ACADEMY_CATALOG_SEEDS.map(publishedAcademyCourseFromSeed));
}

export function overlaySeedCatalogPrice(course: AcademyCourseWithPrice): AcademyCourseWithPrice {
  if (course.priceMinor != null) {
    return withCardHonesty(course);
  }
  const seed = academyCatalogSeedMatch(course.slug) ?? academyCatalogSeedMatch(course.id);
  if (!seed) {
    return withCardHonesty(course);
  }
  return withCardHonesty({
    ...course,
    priceMinor: toAmountMinor(seed.seedAmountMinor),
    currencyCode: ACADEMY_SEED_CURRENCY,
    purchasable: course.isPublished,
  });
}

/**
 * Vitrin: mühürlü büyüme tohumları. DB satırı varsa üzerine biner;
 * tohumda olmayan yayındaki hayalet SKU'lar vitrine girmez.
 */
export function mergePublishedAcademyCatalog(
  live: readonly AcademyCourseWithPrice[],
  seeded: readonly AcademyCourseWithPrice[] = publishedCoursesFromSeed(),
): AcademyCourseWithPrice[] {
  const bySlug = new Map(live.map((row) => [row.slug, overlaySeedCatalogPrice(row)]));
  return orderAcademyShowcaseCatalog(seeded.map((seed) => bySlug.get(seed.slug) ?? seed));
}

export function resolveAcademyCourseFromSeed(idOrSlug: string): AcademyCourseRecord | null {
  const seed = academyCatalogSeedMatch(idOrSlug);
  return seed ? academyCourseRecordFromSeed(seed) : null;
}
