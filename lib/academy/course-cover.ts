/**
 * Kurs kapak görseli — Tur 3 sinema plakası (`{sku}-1-eye.webp` + `.avif`).
 * OG `og:image` ve sitemap `images` WebP yolunu basar.
 * Ders oynatıcı posteri JPG’de kalır; müfredat gövdesi / curriculum.ts bu dosyaya girmez.
 */

import { academyMicroVideoPublicSources } from "@/lib/academy/lesson-media";
import { isAcademyGrowthSkuSlug } from "@/lib/academy/pilot-sku";

/** Büyüme görsel sicilinde olmayan amiral SKU’ların 1. ders diyagramı. */
const FIRST_LESSON_COVER_DIAGRAM: Readonly<Record<string, string>> = {};

/** `03` kapağı e-ticaret eye kopyasıydı; yeni dosya adı immutable cache’i kırar. */
const GROWTH_CINEMA_COVER_FILE: Readonly<Record<string, string>> = {
  "03_social_media_ai": "03_social_media_ai-reels-1-eye.webp",
};

export const ACADEMY_BRAND_FALLBACK_COVER = "/icon.svg" as const;

/** Katalog kartı — mobil tam genişlik, tablet yarım, masaüstü üçte bir. */
export const ACADEMY_COURSE_COVER_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" as const;

/** Ana sayfa 2/3/5 sütun ızgara — LCP kartı mobilde 50vw. */
export const ACADEMY_HOME_CINEMA_COVER_SIZES =
  "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw" as const;

/** Srcset adayları — 1280 kanon; 640/960 dosya adı `-640w` / `-960w`. */
export const ACADEMY_COURSE_COVER_SRCSET_WIDTHS = [640, 960, 1280] as const;

export type AcademyCourseCoverSrcSetWidth = (typeof ACADEMY_COURSE_COVER_SRCSET_WIDTHS)[number];

/** Ana sayfa LCP — amiral AVIF; `<head>` preload + Cloudflare Early Hints / HTTP/2 Push. */
export const ACADEMY_HOME_LCP_COVER_AVIF = "/academy/cinema/01_office_ai-1-eye.avif" as const;

export const ACADEMY_HOME_LCP_COVER_AVIF_SRCSET =
  "/academy/cinema/01_office_ai-1-eye-640w.avif 640w, /academy/cinema/01_office_ai-1-eye-960w.avif 960w, /academy/cinema/01_office_ai-1-eye.avif 1280w" as const;

export const ACADEMY_HOME_LCP_PRELOAD_LINK =
  `</academy/cinema/01_office_ai-1-eye.avif>; rel=preload; as=image; type="image/avif"; imagesrcset="${ACADEMY_HOME_LCP_COVER_AVIF_SRCSET}"; imagesizes="${ACADEMY_HOME_CINEMA_COVER_SIZES}"` as const;

export function academyCourseCoverDiagramKey(slug: string): string | null {
  return FIRST_LESSON_COVER_DIAGRAM[slug] ?? null;
}

/** Kamuya açık kapak yolu — vitrin SKU’su Tur 3 eye WebP; yoksa marka mührü. */
export function academyCourseCoverPath(slug: string): string {
  if (isAcademyGrowthSkuSlug(slug)) {
    const file = GROWTH_CINEMA_COVER_FILE[slug] ?? `${slug}-1-eye.webp`;
    return `/academy/cinema/${file}`;
  }
  const diagramKey = academyCourseCoverDiagramKey(slug);
  if (!diagramKey) {
    return ACADEMY_BRAND_FALLBACK_COVER;
  }
  return academyMicroVideoPublicSources(diagramKey).poster;
}

export function academyCourseCoverAvifPath(slug: string): string {
  const webp = academyCourseCoverPath(slug);
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
