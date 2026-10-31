/**
 * Ücretsiz ilk ders vitrini.
 * Oynatıcı adresi kenar kapısında `isAcademyFreePreviewPlayerPath` ile oturumsuzdur.
 * Isınma kaseti yerel `-warmup.mp4` dosyasıdır; sayfa video üretmez.
 */

import { isAcademyMicroVideoBaked } from "@/lib/academy/baked-micro-videos";
import { resolveAcademyCinemaSource } from "@/lib/academy/lesson-cinema";
import { academyLessonWarmupVeoAssetKey } from "@/lib/academy/lesson-veo";
import { academyExamPathFirstLessonKey } from "@/lib/kernel/catalog-ids/free-preview";

export function academyFreePreviewPlayerPath(slug: string): string {
  return `/academy/${slug}/oyna`;
}

/** İlk dersin mühürlü ısınma MP4’si. Bake yoksa kapak posterine düşülmez; sahne basılmaz. */
export function academyFreePreviewWarmupMp4(slug: string): string | null {
  const lessonKey = academyExamPathFirstLessonKey(slug);
  if (!lessonKey) {
    return null;
  }
  const assetKey = academyLessonWarmupVeoAssetKey(lessonKey);
  if (!assetKey || !isAcademyMicroVideoBaked(assetKey)) {
    return null;
  }
  const cinema = resolveAcademyCinemaSource(assetKey);
  if (cinema.kind !== "html5" && cinema.kind !== "hls") {
    return null;
  }
  return cinema.mp4;
}
