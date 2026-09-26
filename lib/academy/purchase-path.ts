/**
 * Akademi kartı — dürüst iki kapı (eğitim vs doğrudan sınav/vize).
 * Faz 1 kasa UI yalnız `training` basar; `exam` satırı motor sicilinde donuk kalır.
 * Client-safe: fiyat bandı `course-level` SSOT'tan gelir; bu dosya yol dili taşır.
 * Baraj sayısı `ACADEMY_EXAM_PASS_SCORE` (70) ile hizalıdır; exam motorunu import etmez.
 */

import { academyCourseHasSealedAudio } from "@/lib/academy/pilot-sku";
import { academyCourseOffersFreePreview } from "@/lib/kernel/catalog-ids/free-preview";

export { academyCourseOffersFreePreview };

export const ACADEMY_PURCHASE_PATHS = ["training", "exam"] as const;

export type AcademyPurchasePath = (typeof ACADEMY_PURCHASE_PATHS)[number];

export type AcademyCardOfferPath = {
  path: AcademyPurchasePath;
  /** Kısa CTA — kart / satın alma yüzeyi. */
  cta: string;
  /** Adaya dürüst özet — ne dahil, ne değil. */
  summary: string;
};

/**
 * Vitrin dürüstlük kilidi — Aşama 1 makale + mühürlü karaoke overlay.
 * Mühürlü ses SKU'larında karaoke; mühürsüz compact yazılıdır.
 * Ses vaadi yalnız mühürlü SKU'dadır. Video/WebM vaadi yoktur. Kanon 13 SKU vitrin vaadi değildir.
 */
export const ACADEMY_TRAINING_OFFER_SUMMARY_SEALED =
  "Sesli Anlatım + Sınav + Sertifika";
export const ACADEMY_TRAINING_OFFER_SUMMARY_WRITTEN =
  "Makale / Okuma Metni + Uygulamalı Senaryolar + Sınav + Sertifika";

export const ACADEMY_CARD_OFFER_PATHS: readonly AcademyCardOfferPath[] = [
  {
    path: "training",
    cta: "Eğitimi Satın Al",
    summary: ACADEMY_TRAINING_OFFER_SUMMARY_WRITTEN,
  },
  {
    path: "exam",
    cta: "Testi eğitim bitince aç",
    summary:
      "Test, dersler bitmeden açılmaz. Belge 70+ puanla gelir.",
  },
] as const;

export function isAcademyPurchasePath(value: string): value is AcademyPurchasePath {
  return (ACADEMY_PURCHASE_PATHS as readonly string[]).includes(value);
}

export function academyCardOfferPaths(courseSlug?: string): readonly AcademyCardOfferPath[] {
  if (!courseSlug) {
    return ACADEMY_CARD_OFFER_PATHS;
  }
  const trainingSummary = academyCourseHasSealedAudio(courseSlug)
    ? ACADEMY_TRAINING_OFFER_SUMMARY_SEALED
    : ACADEMY_TRAINING_OFFER_SUMMARY_WRITTEN;
  return ACADEMY_CARD_OFFER_PATHS.map((offer) =>
    offer.path === "training" ? { ...offer, summary: trainingSummary } : offer,
  );
}

/** SETTLED sonrası yön — eğitim oynatıcı veya sınav kapısı. */
export function academyPurchaseSuccessHref(
  courseSlug: string,
  path: AcademyPurchasePath,
): string {
  if (path === "exam") {
    return `/academy/${courseSlug}?gate=exam`;
  }
  return `/academy/${courseSlug}/oyna`;
}

/**
 * Ücretsiz önizleme — yalnız hazırlık şeridi.
 * `01_office_ai-1` … `01_office_ai-6` (k1, g1, w1 dahil) satın alma olmadan kilitlidir.
 */
export const ACADEMY_FREE_PREVIEW_LESSON_KEY = "01_office_ai-0" as const;

export function isAcademyFreePreviewLessonKey(lessonKey: string): boolean {
  return lessonKey.trim() === ACADEMY_FREE_PREVIEW_LESSON_KEY;
}

/** Satın alma yokken ana ders ödeme duvarındadır. Hazırlık şeridi açık kalır. */
export function isAcademyLessonPaywalled(
  courseSlug: string,
  lessonKey: string,
  purchased: boolean,
): boolean {
  if (purchased) {
    return false;
  }
  if (!academyCourseOffersFreePreview(courseSlug)) {
    return true;
  }
  return !isAcademyFreePreviewLessonKey(lessonKey);
}
