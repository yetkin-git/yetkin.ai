/**
 * Kurs kapak görseli — yalnız taze ingest edilen 1. bölüm sinema plakası bağlanır.
 * Diğer vitrin SKU’ları şeffaf «Yakında» şablonuna düşer; marka Y mührü kapak değildir.
 */

import { academyMicroVideoPublicSources } from "@/lib/academy/lesson-media";
import {
  ACADEMY_FLAGSHIP_SKU_SLUG,
  isAcademyGrowthSkuSlug,
  isAcademyProductionLineSkuSlug,
} from "@/lib/academy/pilot-sku";

/** Büyüme görsel sicilinde olmayan amiral SKU’ların 1. ders diyagramı. */
const FIRST_LESSON_COVER_DIAGRAM: Readonly<Record<string, string>> = {};

/** Taze ingest — `01_office_ai` 1. bölüm göz plakası. */
const FLAGSHIP_CINEMA_COVER_STEM = "01_office_ai-1-eye" as const;

/** Favicon / marka mührü — vitrin kartı kapağı değildir. */
export const ACADEMY_BRAND_FALLBACK_COVER = "/icon.svg" as const;

/** Amiral 1. bölüm — mühürlü süre 496 sn ≈ 8 dk. */
export const ACADEMY_FLAGSHIP_CHAPTER_ONE_DURATION_MIN = 8 as const;

/** Katalog kartı — mobil tam genişlik, tablet yarım, masaüstü üçte bir. */
export const ACADEMY_COURSE_COVER_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" as const;

/** Ana sayfa 2/3/5 sütun ızgara — LCP kartı mobilde 50vw. */
export const ACADEMY_HOME_CINEMA_COVER_SIZES =
  "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw" as const;

/** Srcset adayları — 1280 kanon; 640/960 dosya adı `-640w` / `-960w`. */
export const ACADEMY_COURSE_COVER_SRCSET_WIDTHS = [640, 960, 1280] as const;

export type AcademyCourseCoverSrcSetWidth = (typeof ACADEMY_COURSE_COVER_SRCSET_WIDTHS)[number];

/** Amiral AVIF — kart `fetchPriority`; Early Hints preload basılmaz. */
export const ACADEMY_HOME_LCP_COVER_AVIF = `/academy/cinema/${FLAGSHIP_CINEMA_COVER_STEM}.avif` as const;

export const ACADEMY_HOME_LCP_COVER_AVIF_SRCSET =
  `/academy/cinema/${FLAGSHIP_CINEMA_COVER_STEM}-640w.avif 640w, /academy/cinema/${FLAGSHIP_CINEMA_COVER_STEM}-960w.avif 960w, /academy/cinema/${FLAGSHIP_CINEMA_COVER_STEM}.avif 1280w` as const;

export const ACADEMY_HOME_LCP_PRELOAD_LINK = "" as const;

export const ACADEMY_CATALOG_LCP_PRELOAD_LINK = "" as const;

export function academyCourseCoverDiagramKey(slug: string): string | null {
  return FIRST_LESSON_COVER_DIAGRAM[slug] ?? null;
}

export function academyCourseHasCinemaCover(slug: string): boolean {
  return slug === ACADEMY_FLAGSHIP_SKU_SLUG;
}

/** Vitrin SKU — taze ingest yok; şeffaf Yakında şablonu. */
export function academyCourseIsComingSoon(slug: string): boolean {
  return isAcademyProductionLineSkuSlug(slug) || (isAcademyGrowthSkuSlug(slug) && !academyCourseHasCinemaCover(slug));
}

/**
 * Kamuya açık kapak yolu — yalnız amiral 1. bölüm WebP.
 * Diğer SKU `null` döner; kart CSS Yakında plakası basar, OG varsayılan plakaya düşer.
 */
export function academyCourseCoverPath(slug: string): string | null {
  if (academyCourseHasCinemaCover(slug)) {
    return `/academy/cinema/${FLAGSHIP_CINEMA_COVER_STEM}.webp`;
  }
  const diagramKey = academyCourseCoverDiagramKey(slug);
  if (!diagramKey) {
    return null;
  }
  return academyMicroVideoPublicSources(diagramKey).poster;
}

export function academyCourseCoverAvifPath(slug: string): string | null {
  const webp = academyCourseCoverPath(slug);
  if (!webp) {
    return null;
  }
  return academyCourseCoverAvifFromPath(webp) ?? webp;
}

export function academyCourseCoverAvifFromPath(path: string): string | null {
  if (!isAcademyCinemaCoverPath(path) || !path.endsWith(".webp")) {
    return null;
  }
  return `${path.slice(0, -".webp".length)}.avif`;
}

export function academyCourseCoverWidthPath(
  path: string,
  width: AcademyCourseCoverSrcSetWidth,
): string {
  if (width === 1280 || !/\.(?:webp|avif)$/u.test(path)) {
    return path;
  }
  return path.replace(/\.(webp|avif)$/u, `-${width}w.$1`);
}

export function academyCourseCoverSrcSet(path: string): string | null {
  if (!isAcademyCinemaCoverPath(path)) {
    return null;
  }
  return ACADEMY_COURSE_COVER_SRCSET_WIDTHS.map(
    (width) => `${academyCourseCoverWidthPath(path, width)} ${width}w`,
  ).join(", ");
}

export function isAcademyBrandFallbackCover(path: string): boolean {
  return path === ACADEMY_BRAND_FALLBACK_COVER;
}

export function isAcademyCinemaCoverPath(path: string): boolean {
  return /^\/academy\/cinema\/.+-1-eye\.(?:webp|avif)$/u.test(path);
}
