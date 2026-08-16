import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yetkin Rail",
  description: "Mühürlü emek işletim sistemi",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Nonce CSP istek anında basılır; statik kabuk nonce taşıyamaz.
  await connection();
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
