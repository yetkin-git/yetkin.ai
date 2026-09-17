import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { JsonLd } from "@/components/seo/json-ld";
import { NavigationProgressBar } from "@/components/shell/navigation-progress-bar";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { siteGraphJsonLd } from "@/lib/copy/json-ld";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import {
  CANONICAL_SITE_ORIGIN,
  PAGE_SEO,
  TITLE_TEMPLATE,
  pageMetadata,
} from "@/lib/copy/seo";
import "./globals.css";

const homeSeo = pageMetadata(PAGE_SEO.home);

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_ORIGIN),
  title: {
    default: PUBLIC_SEN.home.title,
    template: TITLE_TEMPLATE,
  },
  description: homeSeo.description,
  alternates: homeSeo.alternates,
  openGraph: {
    ...homeSeo.openGraph,
    siteName: YETKIN_BRAND,
  },
  twitter: homeSeo.twitter,
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
      </body>
    </html>
  );
}
