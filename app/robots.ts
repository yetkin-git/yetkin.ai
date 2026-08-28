import type { MetadataRoute } from "next";
import { LEGAL_FOOTER_LINKS } from "@/lib/copy/legal-launch";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/legal", ...LEGAL_FOOTER_LINKS.map((link) => link.href)],
    },
  };
}
