import type { MetadataRoute } from "next";
import { LEGAL_SITE_PATHS } from "@/lib/copy/legal-launch";
import { ROBOTS_DISALLOW_PATHS, SITEMAP_STATIC_PATHS } from "@/lib/copy/seo";
import { isLiveBroadcastShutdownEnvActive } from "@/lib/kernel/http/live-broadcast-shutdown";

export default function robots(): MetadataRoute.Robots {
  if (isLiveBroadcastShutdownEnvActive()) {
    return {
      rules: {
        userAgent: "*",
        allow: ["/legal", ...LEGAL_SITE_PATHS, "/iletisim", "/hakkimizda"],
        disallow: ["/"],
      },
      sitemap: "https://yetkin.ai/sitemap.xml",
    };
  }
  return {
    rules: {
      userAgent: "*",
      allow: [...SITEMAP_STATIC_PATHS, "/legal", ...LEGAL_SITE_PATHS],
      disallow: [...ROBOTS_DISALLOW_PATHS],
    },
    sitemap: "https://yetkin.ai/sitemap.xml",
  };
}
