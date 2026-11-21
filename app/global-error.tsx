"use client";

/**
 * Kök hata sınırı — `app/layout.tsx` seviyesinde bir çökme olduğunda
 * (CSP nonce, `cookies()`, `JsonLd`, font veya globals) Next'in beyaz ekranı
 * yerine markalı kurtarma basar.
 *
 * Next sözleşmesi (docs: file-conventions/error#global-error):
 * - Hata sınırı istemci bileşeni olmak zorundadır.
 * - `global-error` kök layout'un **yerine** geçer; kendi `<html>` ve `<body>`
 *   etiketlerini basmak zorundadır.
 * - Global CSS dahil **değildir**; bu yüzden stil satır içi verilir (CSP
 *   `style-src 'unsafe-inline'` bilinçli istisnadır, bkz. `edge-guard.ts`).
 * - `metadata` / `generateMetadata` desteklenmez; başlık `<title>` ile basılır.
 *
 * `retry` prop'u Next 16.3.0'da stable'dır (`package.json` alt sınırı `^16.3.0`).
 * Guard: prop yoksa buton gizlenir — sessiz TypeError yerine dürüst davranış.
 */

import { useEffect } from "react";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import { YETKIN_BRAND } from "@/lib/copy/brand";

const PAGE_STYLE = {
  minHeight: "100dvh",
  margin: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem 1.25rem",
  background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 40%, #ffffff 100%)",
  color: "#0f172a",
  fontFamily:
    '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
} as const;

const CARD_STYLE = {
  width: "100%",
  maxWidth: "34rem",
  borderRadius: "1rem",
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  padding: "2rem",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
} as const;

const PRIMARY_LINK_STYLE = {
  display: "inline-flex",
  minHeight: "2.75rem",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.75rem",
  padding: "0 1.25rem",
  background: "#1d4ed8",
  color: "#ffffff",
  fontSize: "0.875rem",
  fontWeight: 600,
  textDecoration: "none",
} as const;

const SECONDARY_BUTTON_STYLE = {
  display: "inline-flex",
  minHeight: "2.75rem",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.75rem",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  padding: "0 1.25rem",
  color: "#0f172a",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
} as const;

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const copy = PUBLIC_SEN.error;
  return (
    <html lang="tr">
      <body style={PAGE_STYLE}>
        <title>{`${copy.title} · ${YETKIN_BRAND}`}</title>
        <main style={CARD_STYLE} role="alert" data-global-error="">
          <p
            style={{
              margin: 0,
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#1d4ed8",
            }}
          >
            {copy.eyebrow}
          </p>
          <h1 style={{ margin: "0.5rem 0 0", fontSize: "1.5rem", lineHeight: 1.3 }}>
            {copy.title}
          </h1>
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.9375rem", lineHeight: 1.6, color: "#475569" }}>
            {copy.description}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
            {typeof retry === "function" ? (
              <button type="button" onClick={() => retry()} style={SECONDARY_BUTTON_STYLE}>
                {copy.retry}
              </button>
            ) : null}
            {/*
              Bilinçli `<a>`: kök layout çöktüğünde App Router bağlamı da bozuk
              olabilir. `next/link` istemci gezinmesi router'a bağlıdır; burada
              tam sayfa yenileme ile ana sayfaya dönmek doğru kurtarma davranışıdır.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={PRIMARY_LINK_STYLE}>
              {copy.homeCta}
            </a>
          </div>
          {error.digest ? (
            <p style={{ margin: "1rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>
              {copy.codeLabel} {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
