/**
 * Akademi kartı — dürüst iki kapı (eğitim vs doğrudan sınav/vize).
 * Faz 1 kasa UI yalnız `training` basar; `exam` satırı motor sicilinde donuk kalır.
 * Client-safe: fiyat bandı `course-level` SSOT'tan gelir; bu dosya yol dili taşır.
 * Baraj sayısı `ACADEMY_EXAM_PASS_SCORE` (70) ile hizalıdır; exam motorunu import etmez.
 */

import { resolveAcademyEntitlement } from "@/lib/academy/entitlement";
import { academyCourseHasSealedAudio } from "@/lib/academy/pilot-sku";
import {
  academyCourseOffersFreePreview,
  academyExamPathFirstLessonKey,
  isAcademyExamPathFirstLessonKey,
} from "@/lib/kernel/catalog-ids/free-preview";

export {
  academyCourseOffersFreePreview,
  academyExamPathFirstLessonKey,
  isAcademyExamPathFirstLessonKey,
};

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
 * Ücretsiz önizleme.
 * Hazırlık şeridi (`01_office_ai-0`) sınav yolunda değildir; o şerit açık kalır.
 * Sınav yolunun ilk anahtarı her kurs için dinamik açıktır. Ders 2 ve sonrası kilitlidir.
 */
export const ACADEMY_FREE_PREVIEW_LESSON_KEY = "01_office_ai-0" as const;

export function isAcademySalesFunnelLessonKey(lessonKey: string): boolean {
  return isAcademyExamPathFirstLessonKey(lessonKey);
}

export function isAcademyFreePreviewLessonKey(lessonKey: string): boolean {
  const key = lessonKey.trim();
  return key === ACADEMY_FREE_PREVIEW_LESSON_KEY || isAcademyExamPathFirstLessonKey(key);
}

/**
 * Satın alma yokken ders 2+ ödeme duvarındadır.
 * Hazırlık şeridi ve sınav yolunun ilk dersi açık kalır.
 * Karar `resolveAcademyEntitlement`. Yabancı anahtar, satın alındı dense de duvarda kalır.
 * `purchased` çağıranın kurs lisansı bayrağıdır; önizleme dersinin süresini kesmez.
 */
export function isAcademyLessonPaywalled(
  courseSlug: string,
  lessonKey: string,
  purchased: boolean,
): boolean {
  const decision = resolveAcademyEntitlement({
    actor: null,
    purchase: null,
    courseSlug,
    lessonKey,
    now: new Date(0),
  });
  if (!decision.lessonBelongsToCourse) {
    return true;
  }
  if (purchased) {
    return false;
  }
  return decision.paywallLocked;
}
