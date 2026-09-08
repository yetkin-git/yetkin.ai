import { ImageResponse } from "next/og";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { DEFAULT_OG_IMAGE_ALT, OG_IMAGE_SIZE } from "@/lib/copy/seo";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import { BRAND_MARK_COLORS } from "@/lib/ui/brand-mark-geometry";

export const alt = DEFAULT_OG_IMAGE_ALT;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

/** Kök paylaşım plakası — Twitter `summary_large_image` 1200×630. */
export default function OpenGraphImage() {
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
            {YETKIN_BRAND}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 54,
            fontWeight: 600,
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          {PUBLIC_SEN.home.title}
        </div>
      </div>
    ),
    { ...size },
  );
}
