import { ImageResponse } from "next/og";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { OG_IMAGE_SIZE, PAGE_SEO } from "@/lib/copy/seo";
import { BRAND_MARK_COLORS } from "@/lib/ui/brand-mark-geometry";

export const alt = `${PAGE_SEO.junior.title} · ${YETKIN_BRAND}`;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

/**
 * Junior dikey plakası — `/junior` sosyal paylaşım kartı.
 * Kök plaka (`app/opengraph-image.tsx`) yetişkin Akademi vaadini taşır; veliye giden
 * bağlantı `6. Sınıf Online Dersler` başlığıyla açılmalıdır. Veli adı, çocuk adı ve
 * okul adı bu plakaya basılmaz (A4 — kişisel veri yok).
 */
export default function JuniorOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #0b1220 0%, #12203a 52%, #0f2744 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${BRAND_MARK_COLORS.violet}, ${BRAND_MARK_COLORS.safir})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            Y
          </div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, letterSpacing: -0.5 }}>
            {YETKIN_BRAND} Junior
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 56,
            fontWeight: 600,
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          6. Sınıf Online Dersler
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 26,
            lineHeight: 1.4,
            maxWidth: 900,
            color: "#b9c6de",
          }}
        >
          Matematik · Fen Bilimleri · Türkçe · İngilizce · Sosyal Bilgiler
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 22,
            fontWeight: 600,
            color: "#7fe3c0",
          }}
        >
          Her kartın ilk konusu ücretsiz
        </div>
      </div>
    ),
    { ...size },
  );
}
