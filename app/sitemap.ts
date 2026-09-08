import type { MetadataRoute } from "next";
import { academyCourseCoverPath } from "@/lib/academy/course-cover";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { LEGAL_SITE_PATHS } from "@/lib/copy/legal-launch";
import {
  CANONICAL_SITE_ORIGIN,
  PAGE_SEO,
  PRODUCT_ROOM_PATHS,
  sitemapRoutePolicy,
} from "@/lib/copy/seo";

/** Google Search Console `<loc>` için kanonik canlı köken. Bağıl yol yasak. */

function publicSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return CANONICAL_SITE_ORIGIN;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") return CANONICAL_SITE_ORIGIN;
    if (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname.endsWith(".localhost")
    ) {
      return CANONICAL_SITE_ORIGIN;
    }
    return parsed.origin;
  } catch {
    return CANONICAL_SITE_ORIGIN;
  }
}

function absoluteSiteUrl(path: string): string {
  return new URL(path, `${publicSiteOrigin()}/`).href;
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
 * Yayın vitrin SKU’ları — `ACADEMY_GROWTH_SKU_SLUGS` SSOT.
 * Fiyat/tohum/Prisma katmanı sitemap’e girmez; katalog throw 500 üretmez.
 */
function publishedAcademyCourseEntries(lastModified: Date): MetadataRoute.Sitemap {
  try {
    return ACADEMY_GROWTH_SKU_SLUGS.map((slug) => {
      let images: string[] | undefined;
      try {
        images = [absoluteSiteUrl(academyCourseCoverPath(slug))];
      } catch {
        images = undefined;
      }
      return sitemapEntry(`/academy/${slug}`, lastModified, images);
    });
  } catch {
    return [];
  }
}

function staticSitemapEntries(lastModified: Date): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    ...PRODUCT_ROOM_PATHS,
    PAGE_SEO.academyVerify.path,
    "/legal",
    ...LEGAL_SITE_PATHS,
  ];
  const uniqueStatic = [...new Set(staticPaths)];
  return uniqueStatic.map((path) => sitemapEntry(path, lastModified));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-05");
  try {
    const staticEntries = staticSitemapEntries(lastModified);
    const courseEntries = publishedAcademyCourseEntries(lastModified);
    const seen = new Set<string>();
    const merged: MetadataRoute.Sitemap = [];
    for (const entry of [...staticEntries, ...courseEntries]) {
      if (seen.has(entry.url)) {
        continue;
      }
      seen.add(entry.url);
      merged.push(entry);
    }
    return merged;
  } catch {
    return staticSitemapEntries(lastModified);
  }
}
