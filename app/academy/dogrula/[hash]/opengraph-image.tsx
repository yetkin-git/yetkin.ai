import { ImageResponse } from "next/og";
import { academyCertificateOgAlt, academyProofHashPreview } from "@/lib/academy/certificate-share";
import { loadPublicAcademyVerifyByHash } from "@/lib/academy/load";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { OG_IMAGE_SIZE } from "@/lib/copy/seo";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { parseSha256Hex } from "@/lib/kernel/crypto/sha256";

export const alt = academyCertificateOgAlt();
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

/** Sertifika paylaşım plakası — LinkedIn / X `summary_large_image`. Vatandaş kimliği yok. */
export default async function AcademyVerifyOpenGraphImage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  const parsed = parseSha256Hex(hash);
  let title: string = ACADEMY_SEN.verify.landingTitle;
  let kicker: string = ACADEMY_SEN.certificates.sealed;
  if (parsed) {
    const resolution = await loadPublicAcademyVerifyByHash(parsed).catch(() => null);
    if (resolution?.status === "found" && resolution.kind === "certificate") {
      title = resolution.view.courseTitle;
    } else if (resolution?.status === "found" && resolution.kind === "proof") {
      title = resolution.view.courseTitle;
      kicker = ACADEMY_SEN.verify.proofValid;
    } else if (resolution?.status === "found" && resolution.kind === "pathway-mastery") {
      title = resolution.view.pathwayTitle;
      kicker = ACADEMY_SEN.verify.masteryTitle;
    }
  }
  const preview = parsed ? academyProofHashPreview(parsed) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #0b1220 0%, #1a2a4a 48%, #12203a 100%)",
          padding: 36,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "48px 56px",
            background: "linear-gradient(180deg, #fbf6eb 0%, #f3ead3 100%)",
            border: "3px solid #c9a227",
            borderRadius: 28,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
            <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: "#1a4a8c" }}>
              {YETKIN_BRAND}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#b8860b",
              }}
            >
              {kicker}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1.15,
                color: "#1b1408",
              }}
            >
              {title}
            </div>
            {preview ? (
              <div
                style={{
                  display: "flex",
                  marginTop: 28,
                  fontSize: 18,
                  color: "#5b5346",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                SHA-256 {preview}
              </div>
            ) : null}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 168,
              height: 168,
              borderRadius: 84,
              background: "radial-gradient(circle at 32% 28%, #e8c56a, #1a4a8c)",
              border: "6px solid #d4af37",
              color: "#f8e7b0",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            AKA
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
