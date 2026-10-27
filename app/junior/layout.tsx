import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import {
  JUNIOR_SEO_KEYWORDS,
  JUNIOR_TITLE_TEMPLATE,
  OG_IMAGE_SIZE,
  OG_LOCALE,
  PAGE_SEO,
} from "@/lib/copy/seo";

/**
 * Kanonik adres bu kabukta durmaz. Durursa ders sayfası
 * `https://yetkin.ai/junior` kanoniğini miras alır.
 * Başlık şablonu çocuk sayfalara uygulanır: `%s | yetkin.ai Junior`.
 * Ders sayfası tam başlığı mutlak basar; şablon ikinci kez eklemez.
 *
 * `og:image` burada `app/junior/opengraph-image.tsx` plakasına bağlanır. Kök plaka
 * yetişkin Akademi vaadini taşır; veliye giden bağlantı Junior başlığıyla açılmalıdır.
 * Ders sayfası kendi kapak görselini `pageMetadata` ile bastığı için bunu ezer.
 */
export const metadata: Metadata = {
  title: {
    default: "6. Sınıf Online Dersler",
    template: JUNIOR_TITLE_TEMPLATE,
  },
  description: PAGE_SEO.junior.description,
  keywords: [...JUNIOR_SEO_KEYWORDS],
  openGraph: {
    type: "website",
    locale: OG_LOCALE,
    siteName: `${YETKIN_BRAND} Junior`,
    title: PAGE_SEO.junior.title,
    description: PAGE_SEO.junior.description,
    images: [
      {
        url: `${PAGE_SEO.junior.path}/opengraph-image`,
        alt: `${PAGE_SEO.junior.title} · ${YETKIN_BRAND}`,
        width: OG_IMAGE_SIZE.width,
        height: OG_IMAGE_SIZE.height,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_SEO.junior.title,
    description: PAGE_SEO.junior.description,
    images: [`${PAGE_SEO.junior.path}/opengraph-image`],
  },
};

export default function JuniorLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
