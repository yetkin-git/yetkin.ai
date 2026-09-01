import type { MetadataRoute } from "next";
import { LEGAL_SITE_PATHS } from "@/lib/copy/legal-launch";
import { CANONICAL_SITE_ORIGIN } from "@/lib/copy/seo";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-31");
  const paths = ["/", "/legal", ...LEGAL_SITE_PATHS];
  const unique = [...new Set(paths)];
  return unique.map((path) => ({
    url: absoluteSiteUrl(path),
    lastModified,
    changeFrequency: path.startsWith("/legal") || path === "/iletisim" ? "monthly" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
