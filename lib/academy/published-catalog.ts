import { orderAcademyCatalogByCurriculum } from "@/lib/academy/catalog-filter";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import { academyCardOfferPaths } from "@/lib/academy/purchase-path";
import {
  ACADEMY_CATALOG_SEEDS,
  ACADEMY_SEED_CURRENCY,
  academyCatalogSeedMatch,
  academyVitrineDisplaySeed,
  type AcademyCatalogSeed,
} from "@/lib/academy/catalog-seed";
import {
  ACADEMY_VITRINE_SHELL_SKU_SLUGS,
  isAcademyGrowthSkuSlug,
  isAcademyProductionLineSkuSlug,
} from "@/lib/academy/pilot-sku";
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
  const seed =
    academyCatalogSeedMatch(course.slug) ??
    academyCatalogSeedMatch(course.id) ??
    academyVitrineDisplaySeed(course.slug);
  return {
    ...course,
    summary: seed?.summary ?? course.summary,
    level: academyCourseLevelBySlug(course.slug),
    offerPaths: academyCardOfferPaths(course.slug),
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

function comingSoonAcademyCourseFromSeed(row: AcademyCatalogSeed): AcademyCourseWithPrice {
  return withCardHonesty({
    ...academyCourseRecordFromSeed(row),
    isPublished: false,
    priceMinor: toAmountMinor(row.seedAmountMinor),
    currencyCode: ACADEMY_SEED_CURRENCY,
    purchasable: false,
  });
}

type AcademyCatalogOrderable = { slug: string; level?: string | null };

/**
 * Vitrin sırası: sabit kulvar önceliği → seviye yedek kodu → slug.
 * Kart SKU (OFF-101…PR-105) PEDAGOJI §D.1 karmasına kilitlidir; created_at / puan okunmaz.
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
  const seed =
    academyCatalogSeedMatch(course.slug) ??
    academyCatalogSeedMatch(course.id) ??
    academyVitrineDisplaySeed(course.slug);
  if (!seed) {
    return withCardHonesty(course);
  }
  return withCardHonesty({
    ...course,
    priceMinor: toAmountMinor(seed.seedAmountMinor),
    currencyCode: ACADEMY_SEED_CURRENCY,
    purchasable: course.isPublished && isAcademyGrowthSkuSlug(course.slug),
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

/**
 * PEDAGOJI §D 5'li Vitrin Karması — amiral satın alınır; kardeşler dürüst Yakında kabuğu.
 * Hayali oynatıcı / antre SKU basılmaz.
 */
export function academyVitrineShellCourses(
  live: readonly AcademyCourseWithPrice[] = publishedCoursesFromSeed(),
): AcademyCourseWithPrice[] {
  const published = mergePublishedAcademyCatalog(live);
  const bySlug = new Map(published.map((row) => [row.slug, row]));
  const next: AcademyCourseWithPrice[] = [];
  for (const slug of ACADEMY_VITRINE_SHELL_SKU_SLUGS) {
    const liveRow = bySlug.get(slug);
    if (liveRow && isAcademyGrowthSkuSlug(slug)) {
      next.push(liveRow);
      continue;
    }
    if (!isAcademyProductionLineSkuSlug(slug)) {
      continue;
    }
    const seed = academyVitrineDisplaySeed(slug);
    if (seed) {
      next.push(comingSoonAcademyCourseFromSeed(seed));
    }
  }
  return next;
}

export function resolveAcademyCourseFromSeed(idOrSlug: string): AcademyCourseRecord | null {
  const seed = academyCatalogSeedMatch(idOrSlug);
  if (seed) {
    return academyCourseRecordFromSeed(seed);
  }
  return null;
}
