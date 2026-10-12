import { JUNIOR_COVER_MANIFEST } from "@/lib/junior/cover-manifest.generated";
import { resolvePublicMediaUrl } from "@/lib/media/public-url";

/** Junior kapak klasörü. Fırın `scripts/bake-junior-covers.ts` 1280×720 JPEG yazar. */
export const JUNIOR_COVER_PUBLIC_DIR = "/media/junior/covers" as const;

const COVER_KEY_RE = /^jr_[a-z0-9_]+-\d+$/u;

export function isJuniorCoverKey(lessonKey: string): boolean {
  return COVER_KEY_RE.test(lessonKey.trim());
}

/** Manifest SHA-256 özetinin ilk 12 karakteri. Kayıt yoksa boştur. */
export function juniorCoverManifestHash(lessonKey: string): string {
  const sha = JUNIOR_COVER_MANIFEST[lessonKey.trim()]?.sha256 ?? "";
  return sha.length >= 12 ? sha.slice(0, 12) : "";
}

export function juniorCoverPublicPath(lessonKey: string): string {
  const key = lessonKey.trim();
  if (!isJuniorCoverKey(key)) {
    throw new Error("Junior kapak yolu: ders anahtarı geçersiz.");
  }
  return `${JUNIOR_COVER_PUBLIC_DIR}/${key}.jpg`;
}

/**
 * Katalog kapağı. Adres `public/media/junior/covers/{ders}.jpg?v={manifest}` dosyasıdır.
 * `NEXT_PUBLIC_MEDIA_BASE_URL` doluysa aynı dosya CDN köküne bağlanır; sorgu korunur.
 * Taban boşsa tarayıcı diskteki kamu JPEG'i ister. Şablon SVG bu adresi değiştirmez.
 */
export function juniorCoverSrc(lessonKey: string): string {
  const path = juniorCoverPublicPath(lessonKey);
  const hash = juniorCoverManifestHash(lessonKey);
  const versioned = hash ? `${path}?v=${hash}` : path;
  return resolvePublicMediaUrl(versioned);
}
