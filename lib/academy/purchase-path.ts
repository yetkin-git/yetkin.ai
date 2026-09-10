/**
 * Akademi kartı — dürüst iki kapı (eğitim vs doğrudan sınav/vize).
 * Faz 1 kasa UI yalnız `training` basar; `exam` satırı motor sicilinde donuk kalır.
 * Client-safe: fiyat bandı `course-level` SSOT'tan gelir; bu dosya yol dili taşır.
 * Baraj sayısı `ACADEMY_EXAM_PASS_SCORE` (70) ile hizalıdır; exam motorunu import etmez.
 */

import { academyCourseHasSealedAudio } from "@/lib/academy/pilot-sku";

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
 * Vitrin dürüstlük kilidi — Aşama 1 vaadi.
 * Mühürlü ses SKU'larında karaoke; diğer compact yazılıdır.
 * Ses vaadi yalnız mühürlü SKU'dadır. Kanon 13 SKU vitrin vaadi değildir.
 */
export const ACADEMY_TRAINING_OFFER_SUMMARY_SEALED =
  "Sesli Anlatım + Kayan Metin (Karaoke) + Sınav + Mühürlü Sertifika";
export const ACADEMY_TRAINING_OFFER_SUMMARY_WRITTEN =
  "Yazılı Compact Dersler + Uygulamalı Senaryolar + Sınav + Mühürlü Sertifika";

export const ACADEMY_CARD_OFFER_PATHS: readonly AcademyCardOfferPath[] = [
  {
    path: "training",
    cta: "Eğitimi Satın Al & Öğren",
    summary: ACADEMY_TRAINING_OFFER_SUMMARY_WRITTEN,
  },
  {
    path: "exam",
    cta: "Doğrudan teste gir ve yetkinlik kazan",
    summary:
      "Dersleri atla; yalnız 70+ barajlı test. Belge ve Kariyer yetkinliği test sonucuna bağlıdır.",
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
