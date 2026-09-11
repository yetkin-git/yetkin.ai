import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_VERIFY_ALIAS_PATH,
  academyCertificateOgImagePath,
  academyCertificateShareText,
  academyPublicVerifyUrl,
  academyVerifyAliasPath,
  academyVerifyShareMetadata,
  linkedInShareUrl,
  xShareUrl,
} from "@/lib/academy/certificate-share";
import { academyVerifyPath } from "@/lib/academy/lesson-note-paths";
import { CANONICAL_SITE_ORIGIN, DEFAULT_OG_IMAGE, PAGE_SEO } from "@/lib/copy/seo";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

const ROOT = process.cwd();
const HASH = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("sertifika sosyal paylaşım yüzeyi", () => {
  it("kanonik doğrulama URL'si mutlak sicil yoludur; alias /verify aynı hash'e iner", () => {
    expect(ACADEMY_VERIFY_ALIAS_PATH).toBe("/verify");
    expect(academyVerifyPath(HASH)).toBe(`/academy/dogrula/${HASH}`);
    expect(academyVerifyAliasPath(HASH)).toBe(`/verify/${HASH}`);
    expect(academyPublicVerifyUrl(HASH, CANONICAL_SITE_ORIGIN)).toBe(
      `${CANONICAL_SITE_ORIGIN}/academy/dogrula/${HASH}`,
    );
    expect(academyCertificateOgImagePath(HASH)).toBe(
      `/academy/dogrula/${HASH}/opengraph-image`,
    );
  });

  it("LinkedIn ve X intent URL'si vatandaş kimliği taşımaz", () => {
    const verifyUrl = academyPublicVerifyUrl(HASH, CANONICAL_SITE_ORIGIN);
    const text = academyCertificateShareText("Ofis Yapay Zekâ");
    expect(text).toContain("Ofis Yapay Zekâ");
    expect(text).not.toMatch(/userId|e-posta|holder/i);
    expect(academyCertificateShareText()).toBe(ACADEMY_SEN.certificates.shareText);
    expect(linkedInShareUrl(verifyUrl)).toContain("linkedin.com/sharing/share-offsite");
    expect(linkedInShareUrl(verifyUrl)).toContain(encodeURIComponent(verifyUrl));
    expect(xShareUrl(verifyUrl, text)).toContain("x.com/intent/tweet");
    expect(xShareUrl(verifyUrl, text)).toContain(encodeURIComponent(verifyUrl));
  });

  it("doğrulama sayfası OG/Twitter plakası ve paylaşım butonlarını basar", () => {
    const hashPage = readSrc("app/academy/dogrula/[hash]/page.tsx");
    const seal = readSrc("components/academy/certificate-seal.tsx");
    const share = readSrc("components/academy/certificate-share-actions.tsx");
    const exam = readSrc("components/academy/exam-panel.tsx");
    expect(hashPage).toContain("academyVerifyShareMetadata");
    expect(hashPage).toContain("CertificateShareActions");
    expect(seal).toContain("CertificateShareActions");
    expect(share).toContain("shareLinkedIn");
    expect(share).toContain("shareX");
    expect(share).toContain("linkedInShareUrl");
    expect(share).toContain("xShareUrl");
    expect(exam).toContain("visaStamp");
    expect(exam).toContain("VisaWaxSeal");
    expect(existsSync(join(ROOT, "app/academy/dogrula/[hash]/opengraph-image.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/academy/dogrula/[hash]/twitter-image.tsx"))).toBe(true);
    expect(readSrc("app/academy/dogrula/[hash]/opengraph-image.tsx")).toContain("ImageResponse");
    expect(readSrc("app/academy/dogrula/[hash]/twitter-image.tsx")).toContain("./opengraph-image");
    expect(PAGE_SEO.academyVerify.image).toBe(DEFAULT_OG_IMAGE);
  });

  it("paylaşım metadata'sı summary_large_image ve diploma plakasını giyer", () => {
    const meta = academyVerifyShareMetadata({
      hash: HASH,
      title: "Ofis Yapay Zekâ · Sertifika doğrula",
      description: "SHA-256 sicil bütünlük kaydı.",
    });
    expect(meta.openGraph).toMatchObject({
      images: [{ url: academyCertificateOgImagePath(HASH), alt: "Ofis Yapay Zekâ · Sertifika doğrula" }],
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      images: [academyCertificateOgImagePath(HASH)],
    });
    expect(meta.alternates).toMatchObject({ canonical: `/academy/dogrula/${HASH}` });
  });

  it("/verify alias 301 ile kanonik dogrula adresine iner", () => {
    const config = readSrc("next.config.ts");
    const alias = readSrc("app/verify/[hash]/page.tsx");
    const landing = readSrc("app/verify/page.tsx");
    expect(config).toContain('source: "/verify"');
    expect(config).toContain('destination: "/academy/dogrula"');
    expect(config).toContain('source: "/verify/:hash"');
    expect(config).toContain('destination: "/academy/dogrula/:hash"');
    expect(config).toContain("statusCode: 301");
    expect(alias).toContain("permanentRedirect");
    expect(alias).toContain("academyVerifyPath");
    expect(landing).toContain("permanentRedirect");
    expect(ACADEMY_SEN.certificates.shareLinkedIn).toBe("LinkedIn'de Paylaş");
    expect(ACADEMY_SEN.certificates.shareX).toBe("X'te Paylaş");
  });
});
