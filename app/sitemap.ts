import type { MetadataRoute } from "next";
import { LEGAL_SITE_PATHS } from "@/lib/copy/legal-launch";
import { JUNIOR_GUARDIAN_NOTICE_HREF } from "@/lib/copy/junior-guardian-notice";
import { GLOSSARY_TERMS, glossaryPath } from "@/lib/copy/glossary";
import { guidePath, PUBLIC_GUIDES } from "@/lib/copy/guides";
import {
  CANONICAL_SITE_ORIGIN,
  isRobotsDisallowedPath,
  SITEMAP_STATIC_PATHS,
  sitemapRoutePolicy,
} from "@/lib/copy/seo";
import { readSitemapLastModified } from "@/lib/copy/sitemap-lastmod";

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

function staticSitemapEntries(lastModified: Date): MetadataRoute.Sitemap {
  // `/legal/junior-veli` footer listesinde yoktur (veli onay ekranından açılır) ama
  // kamuya açık 200 dönen yasal bir yüzeydir; site haritasına ayrıca yazılır.
  const staticPaths = [
    ...SITEMAP_STATIC_PATHS,
    "/legal",
    JUNIOR_GUARDIAN_NOTICE_HREF,
    ...LEGAL_SITE_PATHS,
  ];
  const uniqueStatic = [...new Set(staticPaths)];
  return uniqueStatic.map((path) => sitemapEntry(path, lastModified));
}

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // `lastmod` istek anı değil. İçerik dosyasının UTC günü; taban editöryal mühür.
  const lastModified = readSitemapLastModified();
  try {
    const staticEntries = staticSitemapEntries(lastModified);
    const courseEntries: MetadataRoute.Sitemap = [];
    const editorialEntries = [
      ...GLOSSARY_TERMS.map((term) => sitemapEntry(glossaryPath(term.slug), lastModified)),
      ...PUBLIC_GUIDES.map((guide) => sitemapEntry(guidePath(guide.slug), lastModified)),
    ];
    const seen = new Set<string>();
    const merged: MetadataRoute.Sitemap = [];
    for (const entry of [...staticEntries, ...courseEntries, ...editorialEntries]) {
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
    return staticSitemapEntries(lastModified);
  }
}
