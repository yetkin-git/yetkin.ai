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
  ACADEMY_OFF201_STOREFRONT_SLUG,
  ACADEMY_VITRINE_SHELL_SKU_SLUGS,
  academyCatalogPurchasable,
  academyCourseNarrationPublished,
  academyProductionLineReleaseOpen,
  isAcademyProductionLineSkuSlug,
} from "@/lib/academy/pilot-sku";
import { ACADEMY_OFF201_DEFAULT_COVER } from "@/lib/academy/course-cover";
import { OFF_201_TITLE } from "@/lib/academy/curricula/office_ai/off-201";
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
    purchasable: academyCatalogPurchasable({
      courseSlug: row.slug,
      catalogRowPresent: true,
      isPublished: true,
    }),
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

/**
 * Canlı satırın tutarı katalogdadır. Tutar yoksa tohum haritası kartı doldurmaz.
 */
export function overlaySeedCatalogPrice(course: AcademyCourseWithPrice): AcademyCourseWithPrice {
  return withCardHonesty(course);
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
 * Anlatımı bitmiş ama bu çağrıda doğrulanmış satırı olmayan kart.
 * Satın Al basılmaz. Tohum tutarı kasa fiyatı değildir.
 */
function unpublishedNarratedCard(row: AcademyCatalogSeed): AcademyCourseWithPrice {
  return withCardHonesty({
    ...academyCourseRecordFromSeed(row),
    isPublished: false,
    priceMinor: null,
    currencyCode: ACADEMY_SEED_CURRENCY,
    purchasable: false,
  });
}

/**
 * Doğrulanmış satır. Satın Al yalnız üçü birden varken: yayın, aktif fiyat, disk mührü.
 * `priceMinor` aktif katalog satırından gelir; tohum tutarı buraya yazılmaz.
 */
function confirmedVitrineCard(row: AcademyCourseWithPrice): AcademyCourseWithPrice {
  return withCardHonesty({
    ...row,
    purchasable: academyCatalogPurchasable({
      courseSlug: row.slug,
      catalogRowPresent: row.priceMinor != null,
      isPublished: row.isPublished,
    }),
  });
}

/**
 * PEDAGOJI §D 5'li Vitrin Karması.
 * `live` yalnız veritabanından okunmuş kurs satırlarıdır. Boş dizi, yayın teyidi yok demektir.
 * Satın Al: `is_published`, aktif fiyat ve beş katman disk mührü. Biri eksikse kart satın al demez.
 * Anlatımı bitmemiş kardeş «Çok Yakında»dır. Üretim hattı kamu kapısı kapalıyken aynı kabuğa düşer; kapı açıkken doğrulanmış satır satın alınır.
 * Anlatımı bitmiş ama satırı kapalı kurs «Yayında Değil»dir.
 */
export function academyVitrineShellCourses(
  live: readonly AcademyCourseWithPrice[] = [],
): AcademyCourseWithPrice[] {
  const bySlug = new Map(live.map((row) => [row.slug, row]));
  const next: AcademyCourseWithPrice[] = [];
  for (const slug of ACADEMY_VITRINE_SHELL_SKU_SLUGS) {
    const liveRow = bySlug.get(slug);
    if (slug === ACADEMY_OFF201_STOREFRONT_SLUG) {
      if (!academyCourseNarrationPublished(slug)) {
        next.push(off201ClosedVitrineCourse());
        continue;
      }
      const row = liveRow ? confirmedVitrineCard(liveRow) : off201ClosedVitrineCourse();
      next.push({
        ...row,
        coverImage: row.coverImage ?? ACADEMY_OFF201_DEFAULT_COVER,
        level: row.level ?? "İleri",
      });
      continue;
    }
    const seed = academyCatalogSeedMatch(slug) ?? academyVitrineDisplaySeed(slug);
    if (!seed) {
      continue;
    }
    if (
      (isAcademyProductionLineSkuSlug(slug) && !academyProductionLineReleaseOpen(slug)) ||
      !academyCourseNarrationPublished(slug)
    ) {
      next.push(comingSoonAcademyCourseFromSeed(seed));
      continue;
    }
    next.push(liveRow ? confirmedVitrineCard(liveRow) : unpublishedNarratedCard(seed));
  }
  return next;
}

const OFF201_STAMP = new Date("2026-09-24T06:00:00.000Z");

/** OFF-201 kurs satırı. Katalog satırı yokken fiyat basılmaz; kilit `PriceCatalogEntry` keser. */
export function off201StorefrontCourseRecord(): AcademyCourseRecord {
  return {
    id: "ac_01_office_ai_ileri",
    slug: ACADEMY_OFF201_STOREFRONT_SLUG,
    title: OFF_201_TITLE,
    summary:
      "İleri ofis işi: dört parçalı istem, toplantı notu, formül, uzun belge, e-posta taslağı ve üç dosyada sayı denetimi.",
    catalogUnitKey: "course:01_office_ai_ileri",
    globalRank: 14,
    localRank: 2,
    trendScore: 28,
    isPublished: true,
    createdAt: OFF201_STAMP,
    updatedAt: OFF201_STAMP,
  };
}

/** OFF-201 satırı bu çağrıda doğrulanmadı. Tohum tutarı Satın Al açmaz. */
function off201ClosedVitrineCourse(): AcademyCourseWithPrice {
  const record = off201StorefrontCourseRecord();
  return withCardHonesty({
    ...record,
    isPublished: false,
    priceMinor: null,
    currencyCode: ACADEMY_SEED_CURRENCY,
    purchasable: false,
    level: "İleri",
    coverImage: ACADEMY_OFF201_DEFAULT_COVER,
  });
}

export function resolveAcademyCourseFromSeed(idOrSlug: string): AcademyCourseRecord | null {
  if (idOrSlug === ACADEMY_OFF201_STOREFRONT_SLUG || idOrSlug === "ac_01_office_ai_ileri") {
    return off201StorefrontCourseRecord();
  }
  const seed = academyCatalogSeedMatch(idOrSlug);
  if (seed) {
    return academyCourseRecordFromSeed(seed);
  }
  const publishedShell = academyVitrineDisplaySeed(idOrSlug);
  if (publishedShell && academyCourseNarrationPublished(idOrSlug)) {
    return academyCourseRecordFromSeed(publishedShell);
  }
  return null;
}
