/**
 * Vercel paketine girmeyen kamu medya kökleri.
 * Dosyalar yerelde `/media/...` yedeği olarak kalır.
 * Canlı okuma `NEXT_PUBLIC_MEDIA_BASE_URL` ile CDN'e gider.
 * Akademi mühür sesi bu listede yoktur; o kova `academy-sealed` imzasıdır.
 */

export const PUBLIC_MEDIA_VERCEL_OFFLOAD_DIRS = [
  "public/media/junior/audio",
  "public/media/junior/covers",
  "public/media/junior/warmup",
] as const;

export function isOffloadedPublicPath(relativePath: string): boolean {
  const normalized = relativePath.replaceAll("\\", "/").replace(/^\.?\//u, "");
  return PUBLIC_MEDIA_VERCEL_OFFLOAD_DIRS.some(
    (dir) => normalized === dir || normalized.startsWith(`${dir}/`),
  );
}
