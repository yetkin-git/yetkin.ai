import { ImageResponse } from "next/og";
import { loadPublicTalentCard } from "@/lib/career/public-talent-load";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { OG_IMAGE_SIZE } from "@/lib/copy/seo";

export const alt = `${YETKIN_BRAND} doğrulanmış rozet`;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

/** Rozet paylaşım plakası. Vatandaş kimliği ve e-posta yazılmaz. */
export default async function VisaOpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resolution = await loadPublicTalentCard(id).catch(() => null);
  const found = resolution?.status === "found" ? resolution.card : null;
  const title = found?.featured.title ?? "Kariyer Kartı";
  const count = found ? String(found.seals.length) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #0b1220 0%, #12203a 55%, #0f2744 100%)",
          color: "#ffffff",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>{YETKIN_BRAND}</div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#d4b15a" }}>
              Doğrulanmış rozet
            </div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 54, fontWeight: 600, lineHeight: 1.15 }}>
              {title.slice(0, 80)}
            </div>
            {count ? (
              <div style={{ display: "flex", marginTop: 16, fontSize: 24, color: "#d6e4f5" }}>
                {count} doğrulanmış rozet
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
