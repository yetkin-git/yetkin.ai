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
 * Kenar, `?v={sha}` adresini `immutable` ile bir yıl tutuyor.
 * Köken düzelince o anahtar eski gövdeyi vermeye devam eder. Katalog bu yüzden `v2-` ister;
 * ses kapısındaki kuşak ile aynıdır. Yeni sorgu kökeni okur.
 */
export const JUNIOR_COVER_CACHE_GENERATION = "v2";

export function juniorCoverCacheQuery(lessonKey: string): string {
  const hash = juniorCoverManifestHash(lessonKey);
  return hash ? `?v=${JUNIOR_COVER_CACHE_GENERATION}-${hash}` : "";
}

/**
 * Katalog kapağı. Adres `public/media/junior/covers/{ders}.jpg?v=v2-{manifest}` dosyasıdır.
 * `NEXT_PUBLIC_MEDIA_BASE_URL` doluysa aynı dosya CDN köküne bağlanır; sorgu korunur.
 * Taban boşsa tarayıcı diskteki kamu JPEG'i ister. Şablon SVG bu adresi değiştirmez.
 */
export function juniorCoverSrc(lessonKey: string): string {
  const path = juniorCoverPublicPath(lessonKey);
  const query = juniorCoverCacheQuery(lessonKey);
  return resolvePublicMediaUrl(query ? `${path}${query}` : path);
}

/** Katalog kapağının boyanacağı katman. Manifest yoksa veya yükleme düşerse SVG. */
export type JuniorCoverFrame = "fallback" | "pending" | "photo";

export function juniorCoverFrame(input: {
  inManifest: boolean;
  failed: boolean;
  ready: boolean;
}): JuniorCoverFrame {
  if (!input.inManifest || input.failed) {
    return "fallback";
  }
  if (input.ready) {
    return "photo";
  }
  return "pending";
}

/**
 * Önbelleğe alınmış 404, `onError` dinleyici bağlanmadan bitebilir.
 * `complete && naturalWidth === 0` o kaçağı kapatır.
 */
export function juniorCoverDecodeFailed(img: { complete: boolean; naturalWidth: number }): boolean {
  return img.complete && img.naturalWidth === 0;
}

/**
 * CDN gövdesi: durum 200, `Content-Length` indirilen baytla aynı, SHA-256 manifest ile aynı.
 * Manifest kapak kaydı bayt sayısı taşımaz; eşit özet eşit bayttır.
 */
export function juniorCoverCdnIssue(
  lessonKey: string,
  expected: { readonly sha256: string },
  actual: { status: number; contentLength: string | null; bytes: number; sha256: string },
): string | null {
  if (actual.status !== 200) {
    return `CDN yanıtı ${actual.status}: ${lessonKey}.jpg`;
  }
  const length = actual.contentLength === null ? Number.NaN : Number(actual.contentLength);
  if (length !== actual.bytes) {
    return `CDN boyutu uyuşmuyor: ${lessonKey}.jpg (${actual.contentLength ?? "yok"} ≠ ${actual.bytes})`;
  }
  if (actual.sha256 !== expected.sha256) {
    return `CDN SHA-256 uyuşmuyor: ${lessonKey}.jpg`;
  }
  return null;
}
