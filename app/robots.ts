import type { MetadataRoute } from "next";
import { LEGAL_SITE_PATHS } from "@/lib/copy/legal-launch";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/legal", ...LEGAL_SITE_PATHS],
    },
  };
}
