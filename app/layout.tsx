import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { NavigationProgressBar } from "@/components/shell/navigation-progress-bar";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import "./globals.css";

export const metadata: Metadata = {
  title: YETKIN_BRAND,
  description: PUBLIC_SEN.home.title,
};

/** Nonce CSP istek anında basılır; statik kabuk nonce taşıyamaz. */
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
        <NavigationProgressBar />
        {children}
      </body>
    </html>
  );
}
