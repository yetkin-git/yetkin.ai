import type { MetadataRoute } from "next";
import { academyCourseCoverPath } from "@/lib/academy/course-cover";
import {
  ACADEMY_GROWTH_SKU_SLUGS,
  ACADEMY_OFF201_STOREFRONT_SLUG,
  ACADEMY_PRODUCTION_LINE_SKU_SLUGS,
  isAcademyStorefrontSlug,
} from "@/lib/academy/pilot-sku";
import { LEGAL_SITE_PATHS } from "@/lib/copy/legal-launch";
import { readPublishedAcademySlugs } from "@/lib/kernel/catalog/published-academy-slugs";
import { juniorCoverSrc } from "@/lib/junior/covers";
import { JUNIOR_ELECTIVE_SLUGS, JUNIOR_PILOT_SLUGS } from "@/lib/junior/limits";
import {
  CANONICAL_SITE_ORIGIN,
  isRobotsDisallowedPath,
  SITEMAP_STATIC_PATHS,
  sitemapRoutePolicy,
} from "@/lib/copy/seo";

/**
 * Google Search Console `<loc>` yalnız `https://yetkin.ai`.
 * `NEXT_PUBLIC_APP_URL` (vercel.app, www, staging) site haritasına yazılmaz;
 * o kökenler apexe yönlenir ve «Yönlendirmeli sayfa» üretir.
 */
function absoluteSiteUrl(path: string): string {
  return new URL(path, `${CANONICAL_SITE_ORIGIN}/`).href;
}

function sitemapEntry(
  path: string,
  lastModified: Date,
  images?: readonly string[],
): MetadataRoute.Sitemap[number] {
  const policy = sitemapRoutePolicy(path);
  return {
    url: absoluteSiteUrl(path),
    lastModified,
    changeFrequency: policy.changeFrequency,
    priority: policy.priority,
    ...(images && images.length > 0 ? { images: [...images] } : {}),
  };
}

/**
 * Yayın adayları — karttaki vitrin slug’ları.
 * İstek anında `is_published` satırı süzgeçtir. Okuma düşerse kart listesi kalır.
 */
const SITEMAP_ACADEMY_COURSE_SLUGS = [
  ...ACADEMY_GROWTH_SKU_SLUGS,
  ACADEMY_OFF201_STOREFRONT_SLUG,
  ...ACADEMY_PRODUCTION_LINE_SKU_SLUGS,
] as const;

export function sitemapCourseSlugs(
  candidates: readonly string[],
  publishedSlugs: ReadonlySet<string> | null,
): string[] {
  if (!publishedSlugs) {
    return [...candidates];
  }
  return candidates.filter((slug) => publishedSlugs.has(slug));
}

function publishedAcademyCourseEntries(
  lastModified: Date,
  publishedSlugs: ReadonlySet<string> | null,
): MetadataRoute.Sitemap {
  try {
    const candidates = SITEMAP_ACADEMY_COURSE_SLUGS.filter((slug) => isAcademyStorefrontSlug(slug));
    return sitemapCourseSlugs(candidates, publishedSlugs).map((slug) => {
      let images: string[] | undefined;
      try {
        const cover = academyCourseCoverPath(slug);
        images = cover ? [absoluteSiteUrl(cover)] : undefined;
      } catch {
        images = undefined;
      }
      return sitemapEntry(`/academy/${slug}`, lastModified, images);
    });
  } catch {
    return [];
  }
}

/**
 * Ücretsiz ilk konu kartları. Katalog gövdesi burada okunmaz.
 * Anahtar `{slug}-1` ile `juniorFreeLessonKeys` aynı sıradadır; test kilitler.
 * Kilitli haftalar ve kasa yolu yazılmaz.
 */
const JUNIOR_SITEMAP_FREE_LESSON_KEYS = [...JUNIOR_PILOT_SLUGS, ...JUNIOR_ELECTIVE_SLUGS].map(
  (slug) => `${slug}-1`,
);

function juniorFreeLessonEntries(lastModified: Date): MetadataRoute.Sitemap {
  try {
    return JUNIOR_SITEMAP_FREE_LESSON_KEYS.map((lessonKey) => {
      let images: string[] | undefined;
      try {
        images = [absoluteSiteUrl(juniorCoverSrc(lessonKey))];
      } catch {
        images = undefined;
      }
      return sitemapEntry(`/junior/ders/${lessonKey}`, lastModified, images);
    });
  } catch {
    return [];
  }
}

function staticSitemapEntries(lastModified: Date): MetadataRoute.Sitemap {
  const staticPaths = [...SITEMAP_STATIC_PATHS, "/legal", ...LEGAL_SITE_PATHS];
  const uniqueStatic = [...new Set(staticPaths)];
  return uniqueStatic.map((path) => sitemapEntry(path, lastModified));
}

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // SEO Tedavi (P1) — sabit mühür yerine dinamik üretim anı.
  // Kurs girdisi kartta duran ve satırı yayında olan slug’dır.
  const lastModified = new Date();
  try {
    const publishedSlugs = await readPublishedAcademySlugs();
    const staticEntries = staticSitemapEntries(lastModified);
    const courseEntries = publishedAcademyCourseEntries(lastModified, publishedSlugs);
    const juniorEntries = juniorFreeLessonEntries(lastModified);
    const seen = new Set<string>();
    const merged: MetadataRoute.Sitemap = [];
    for (const entry of [...staticEntries, ...courseEntries, ...juniorEntries]) {
      if (seen.has(entry.url)) {
        continue;
      }
      const pathname = new URL(entry.url).pathname;
      if (isRobotsDisallowedPath(pathname === "" ? "/" : pathname)) {
        continue;
      }
      seen.add(entry.url);
      merged.push(entry);
    }
    return merged;
  } catch {
    return [...staticSitemapEntries(lastModified), ...juniorFreeLessonEntries(lastModified)];
  }
}
