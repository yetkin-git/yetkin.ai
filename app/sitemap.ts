import type { MetadataRoute } from "next";
import { academyCourseCoverPath } from "@/lib/academy/course-cover";
import { filterAcademyGrowthCatalog } from "@/lib/academy/pilot-sku";
import { publishedCoursesFromSeed } from "@/lib/academy/published-catalog";
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
 * Yayın vitrin SKU’ları — katalog tohumu SSOT.
 * Prisma overlay hayalet slug eklemez (`mergePublishedAcademyCatalog`).
 */
function publishedAcademyCourseEntries(lastModified: Date): MetadataRoute.Sitemap {
  return filterAcademyGrowthCatalog(publishedCoursesFromSeed())
    .filter((row) => row.isPublished)
    .map((row) => {
      const cover = academyCourseCoverPath(row.slug);
      return sitemapEntry(`/academy/${row.slug}`, row.updatedAt ?? lastModified, [
        absoluteSiteUrl(cover),
      ]);
    });
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-31");
  const staticPaths = [
    "/",
    ...PRODUCT_ROOM_PATHS,
    PAGE_SEO.academyVerify.path,
    "/legal",
    ...LEGAL_SITE_PATHS,
  ];
  const uniqueStatic = [...new Set(staticPaths)];
  const staticEntries = uniqueStatic.map((path) => sitemapEntry(path, lastModified));
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
}
