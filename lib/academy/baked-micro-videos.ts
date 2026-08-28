/**
 * Önceden basılmış WebM/MP4/HLS anahtarları.
 * Bake betiği Faz 3'te arşivdedir (`archived/lib/academy-studio/`).
 * Canlı `scripts/render-academy-lesson-media.ts` bake yapmaz.
 * Boş kümede oynatıcı Dynamic Canvas + mühürlü SVG döngüsünü basar;
 * sayfa yükünde üretim API’si çağrılmaz. Operatör binary bırakırsa
 * `ACADEMY_BAKED_MICRO_VIDEO_KEYS` / `ACADEMY_BAKED_HLS_KEYS` dolar.
 */
export const ACADEMY_BAKED_MICRO_VIDEO_KEYS: readonly string[] = [];
export const ACADEMY_BAKED_HLS_KEYS: readonly string[] = [];

export function isAcademyMicroVideoBaked(assetKey: string): boolean {
  return ACADEMY_BAKED_MICRO_VIDEO_KEYS.includes(assetKey);
}

export function isAcademyHlsBaked(assetKey: string): boolean {
  return ACADEMY_BAKED_HLS_KEYS.includes(assetKey);
}
