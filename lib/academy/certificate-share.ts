import type { Metadata } from "next";
import { academyProofHashPreview, academyVerifyPath, academyVerifyUrl } from "@/lib/academy/lesson-note-paths";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { CANONICAL_SITE_ORIGIN, pageMetadata } from "@/lib/copy/seo";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { parseSha256Hex } from "@/lib/kernel/crypto/sha256";

/** Kısa kamu alias — kanonik sicil `/academy/dogrula/[hash]`. */
export const ACADEMY_VERIFY_ALIAS_PATH = "/verify" as const;

export function academyVerifyAliasPath(hash: string): string {
  return `${ACADEMY_VERIFY_ALIAS_PATH}/${hash.trim().toLowerCase()}`;
}

/** Paylaşım ve OG için mutlak doğrulama URL'si. Kanonik yol; alias 301 ile aynı sicile iner. */
export function academyPublicVerifyUrl(hash: string, origin?: string): string {
  const base =
    origin?.trim().replace(/\/$/u, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/u, "") ||
    CANONICAL_SITE_ORIGIN;
  return academyVerifyUrl(hash, base);
}

export function academyCertificateShareText(courseTitle?: string): string {
  const named = courseTitle?.trim();
  if (named) {
    return ACADEMY_SEN.certificates.shareTextNamed(named);
  }
  return ACADEMY_SEN.certificates.shareText;
}

export function linkedInShareUrl(verifyUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
}

export function xShareUrl(verifyUrl: string, text: string): string {
  const params = new URLSearchParams({ text, url: verifyUrl });
  return `https://x.com/intent/tweet?${params.toString()}`;
}

export function academyCertificateOgImagePath(hash: string): string {
  return `${academyVerifyPath(hash)}/opengraph-image`;
}

export function academyCertificateOgAlt(courseTitle?: string): string {
  const named = courseTitle?.trim();
  if (named) {
    return `${named} · ${YETKIN_BRAND} · ${ACADEMY_SEN.certificates.sealed}`;
  }
  return `${YETKIN_BRAND} · ${ACADEMY_SEN.certificates.sealed}`;
}

export function academyVerifyShareMetadata({
  hash,
  title,
  description,
}: {
  hash: string;
  title: string;
  description: string;
}): Metadata {
  const parsed = parseSha256Hex(hash);
  return pageMetadata({
    title,
    description,
    path: `/academy/dogrula/${hash}`,
    image: parsed ? academyCertificateOgImagePath(parsed) : undefined,
  });
}

export { academyProofHashPreview, academyVerifyPath };
