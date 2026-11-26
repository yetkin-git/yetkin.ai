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
import { listPublicStorefrontSlugs } from "@/lib/commerce/storefront-sitemap";
import { listSitemapKurumsalJobSlugs } from "@/lib/sales/kurumsal-screening-load";

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
  // `/hakkimizda` ve `/iletisim` artık `SITEMAP_STATIC_PATHS` içinde açık kayıttır;
  // footer bağı koparsa iki sayfa site haritasından düşmez (Faz 2 SEO tedavisi).
  const staticPaths = [
    ...SITEMAP_STATIC_PATHS,
    "/legal",
    JUNIOR_GUARDIAN_NOTICE_HREF,
    ...LEGAL_SITE_PATHS,
  ];
  const uniqueStatic = [...new Set(staticPaths)];
  return uniqueStatic.map((path) => sitemapEntry(path, lastModified));
}

/**
 * Kamuya açık e-ticaret vitrinleri (`/magaza/[slug]`).
 * `listPublicStorefrontSlugs` hata durumunda güvenli boş dizi döner; site haritası
 * üretimi bu yüzden düşmez. Kural filtresi (`isRobotsDisallowedPath`) aşağıdaki
 * ortak döngüde zaten uygulanır.
 */
async function storefrontSitemapEntries(lastModified: Date): Promise<MetadataRoute.Sitemap> {
  const slugs = await listPublicStorefrontSlugs();
  return slugs.map((slug) => sitemapEntry(`/magaza/${slug}`, lastModified));
}

/**
 * Kurumsal kamu ilanları. Yalnız aktif + süresi geçmemiş + `verifiedEmployerAt != null`.
 * Doğrulanmamış işveren noindex kalır ve site haritasına asla girmez (F1.3 / K-03).
 */
async function kurumsalJobSitemapEntries(
  fallbackLastModified: Date,
): Promise<MetadataRoute.Sitemap> {
  const rows = await listSitemapKurumsalJobSlugs();
  return [
    sitemapEntry("/ilan", fallbackLastModified),
    ...rows.map((row) => sitemapEntry(`/ilan/${row.slug}`, row.updatedAt)),
  ];
}

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // `lastmod` istek anı değil. İçerik dosyasının UTC günü; taban editöryal mühür.
  const lastModified = readSitemapLastModified();
  try {
    const staticEntries = staticSitemapEntries(lastModified);
    const courseEntries: MetadataRoute.Sitemap = [];
    const storefrontEntries = await storefrontSitemapEntries(lastModified);
    const kurumsalEntries = await kurumsalJobSitemapEntries(lastModified);
    const editorialEntries = [
      ...GLOSSARY_TERMS.map((term) => sitemapEntry(glossaryPath(term.slug), lastModified)),
      ...PUBLIC_GUIDES.map((guide) => sitemapEntry(guidePath(guide.slug), lastModified)),
    ];
    const seen = new Set<string>();
    const merged: MetadataRoute.Sitemap = [];
    for (const entry of [
      ...staticEntries,
      ...courseEntries,
      ...editorialEntries,
      ...storefrontEntries,
      ...kurumsalEntries,
    ]) {
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
