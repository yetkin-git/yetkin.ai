import { resolvePublicMediaUrl } from "@/lib/media/public-url";

/** Junior kapak. Fırın `scripts/bake-junior-covers.ts`. Diskte jpg yoksa kart SVG gösterir. */
export const JUNIOR_COVER_PUBLIC_DIR = "/media/junior/covers" as const;

const COVER_KEY_RE = /^jr_[a-z0-9_]+-\d+$/u;

export function isJuniorCoverKey(lessonKey: string): boolean {
  return COVER_KEY_RE.test(lessonKey.trim());
}

export function juniorCoverPublicPath(lessonKey: string): string {
  const key = lessonKey.trim();
  if (!isJuniorCoverKey(key)) {
    throw new Error("Junior kapak yolu: ders anahtarı geçersiz.");
  }
  return `${JUNIOR_COVER_PUBLIC_DIR}/${key}.jpg`;
}

/** Kart ve paylaşım kartı. CDN tabanı yoksa yerel kapak yolu. */
export function juniorCoverSrc(lessonKey: string): string {
  return resolvePublicMediaUrl(juniorCoverPublicPath(lessonKey));
}
