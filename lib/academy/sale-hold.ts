import "server-only";

import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { ensureAcademyProductionDiskProbe } from "@/lib/academy/production-seal-disk";
import { academyCourseVoiceTextSealed } from "@/lib/academy/production-standard";

/**
 * Kapalı kayıt kartının açık nedeni. Satın alınabilir kartta cümle yoktur.
 * Sinema katmanı (ısınma, görsel, müzik) bu cümleye girmez; satış ses ve metni okur.
 */
export function academyPublicSaleHold(course: {
  slug: string;
  isPublished: boolean;
  priceMinor: number | null;
  purchasable: boolean;
}): string | null {
  if (course.purchasable) {
    return null;
  }
  ensureAcademyProductionDiskProbe();
  const keys = curriculumLessonKeysForSlug(course.slug);
  const voiceTextReady = keys.length > 0 && academyCourseVoiceTextSealed(course.slug, keys);
  const parts: string[] = [];
  if (!course.isPublished) {
    parts.push("yayın durumu kapalı");
  }
  if (course.priceMinor == null || course.priceMinor <= 0) {
    parts.push("fiyat satırı eksik");
  }
  if (!voiceTextReady) {
    parts.push("ses veya metin mührü eksik");
  }
  if (parts.length === 0) {
    return "Kayıt kapalı. Satış kapısı bu kartta açık değil.";
  }
  return `Kayıt kapalı: ${parts.join(", ")}.`;
}
