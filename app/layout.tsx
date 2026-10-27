import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { Ga4Bootstrap } from "@/components/kernel/ga4-bootstrap";
import { JsonLd } from "@/components/seo/json-ld";
import { NavigationProgressBar } from "@/components/shell/navigation-progress-bar";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { siteGraphJsonLd } from "@/lib/copy/json-ld";
import { SEM_LANDING_KEYWORDS } from "@/lib/copy/sem-keywords";
import { CANONICAL_SITE_ORIGIN, OG_LOCALE, TITLE_TEMPLATE } from "@/lib/copy/seo";
import "./globals.css";

/**
 * Kök kabuk sayfa kanoniği taşımaz. `alternates` burada olsaydı çocuk rotalar
 * (kasa, şifre, çıkış paketi) ana sayfa veya akademi URL'sini miras alır ve
 * Search Console «Standart etiket alternatif sayfa» yazardı.
 * Kamu sayfaları kendi `pageMetadata` kanoniğini basar.
 */
export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_ORIGIN),
  title: {
    default: YETKIN_BRAND,
    template: TITLE_TEMPLATE,
  },
  description: `${YETKIN_BRAND} dijital eğitim.`,
  keywords: [...SEM_LANDING_KEYWORDS],
  openGraph: {
    type: "website",
    locale: OG_LOCALE,
    siteName: YETKIN_BRAND,
    title: YETKIN_BRAND,
    description: `${YETKIN_BRAND} dijital eğitim.`,
  },
  twitter: {
    card: "summary_large_image",
    title: YETKIN_BRAND,
    description: `${YETKIN_BRAND} dijital eğitim.`,
  },
};

/**
 * Nonce CSP istek anında basılır; statik kabuk nonce taşıyamaz.
 * `connection()` HTML'i `no-store` / dinamik tutar — kenar cache yok (TTFB bedeli).
 * A katmanı `script-src` nonce + `strict-dynamic` durur; hash-CSP'ye sessizce dönülmez.
 * Köken bölgesi `vercel.json` `fra1` (Node); `preferredRegion` Next 16.3'te Edge'e bağlı ve yok sayılır.
 */
async function RequestBoundCsp() {
  await connection();
  return null;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <Suspense fallback={null}>
          <RequestBoundCsp />
        </Suspense>
        <JsonLd data={siteGraphJsonLd()} />
        <NavigationProgressBar />
        {children}
        <Ga4Bootstrap />
      </body>
    </html>
  );
}
