import { juniorCourseSlugFromLessonKey } from "@/lib/junior/human-titles";
import { JUNIOR_PILOT_SLUGS } from "@/lib/junior/limits";
import { resolvePublicMediaUrl } from "@/lib/media/public-url";

/**
 * Beş çekirdek dersin ısınma kaseti.
 * Seçmeli derslerde kaset yoktur; oynatıcı doğrudan sahneye düşer.
 * Dosyalar `public/media/junior/warmup/` altındadır ve yaklaşık 10 saniyedir.
 */
export const JUNIOR_CORE_WARMUP_SRC = {
  jr_06_mat: "/media/junior/warmup/jr_06_mat-warmup.mp4",
  jr_06_fen: "/media/junior/warmup/jr_06_fen-warmup.mp4",
  jr_06_turkce: "/media/junior/warmup/jr_06_turkce-warmup.mp4",
  jr_06_sosyal: "/media/junior/warmup/jr_06_sosyal-warmup.mp4",
  jr_06_ing_main: "/media/junior/warmup/jr_06_ing_main-warmup.mp4",
} as const satisfies Record<(typeof JUNIOR_PILOT_SLUGS)[number], string>;

export type JuniorWarmupSlug = keyof typeof JUNIOR_CORE_WARMUP_SRC;

/** Sinematik giriş bandının üst ucu. Mühürlü kasetler bu süreye yakındır. */
export const JUNIOR_WARMUP_MAX_SEC = 10;

/**
 * Kaset bitmez, takılır veya hiç gelmezse sahneye düşme tavanı.
 * Bu süreden sonra hata yazısı görünmez; anlatım 1. adımda açılır.
 */
export const JUNIOR_WARMUP_FAILSAFE_MS = 12_000;

/** Video ile sahne arasındaki yumuşak geçiş. */
export const JUNIOR_WARMUP_FADE_MS = 500;

export function juniorWarmupSrc(lessonKey: string): string | null {
  const slug = juniorCourseSlugFromLessonKey(lessonKey);
  if (!slug || !Object.prototype.hasOwnProperty.call(JUNIOR_CORE_WARMUP_SRC, slug)) {
    return null;
  }
  return resolvePublicMediaUrl(JUNIOR_CORE_WARMUP_SRC[slug as JuniorWarmupSlug]);
}
