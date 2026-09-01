import type { MetadataRoute } from "next";
import { LEGAL_SITE_PATHS } from "@/lib/copy/legal-launch";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-31");
  const paths = ["/", "/legal", ...LEGAL_SITE_PATHS];
  const unique = [...new Set(paths)];
  return unique.map((path) => ({
    url: path,
    lastModified,
    changeFrequency: path.startsWith("/legal") || path === "/iletisim" ? "monthly" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
