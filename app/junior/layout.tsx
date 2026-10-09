import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { JUNIOR_SEO_KEYWORDS, JUNIOR_TITLE_TEMPLATE, OG_LOCALE, PAGE_SEO } from "@/lib/copy/seo";

/**
 * Kanonik adres bu kabukta durmaz. Durursa ders sayfası
 * `https://yetkin.ai/junior` kanoniğini miras alır.
 * Başlık şablonu çocuk sayfalara uygulanır: `%s | yetkin.ai Junior`.
 * Ders sayfası tam başlığı mutlak basar; şablon ikinci kez eklenmez.
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
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_SEO.junior.title,
    description: PAGE_SEO.junior.description,
  },
};

export default function JuniorLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
