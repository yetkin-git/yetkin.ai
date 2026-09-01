/**
 * Akademi kartı — dürüst iki kapı (eğitim vs doğrudan sınav/vize).
 * Faz 1 kasa UI yalnız `training` basar; `exam` satırı motor sicilinde donuk kalır.
 * Client-safe: fiyat bandı `course-level` SSOT'tan gelir; bu dosya yol dili taşır.
 * Baraj sayısı `ACADEMY_EXAM_PASS_SCORE` (70) ile hizalıdır; exam motorunu import etmez.
 */

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
 * Her dikey eğitim kartında sunulan iki seçenek.
 * Aynı seviye fiyatı; ürün vaadi ayrılır.
 */
export const ACADEMY_CARD_OFFER_PATHS: readonly AcademyCardOfferPath[] = [
  {
    path: "training",
    cta: "Eğitimi Satın Al & Öğren",
    summary:
      "Video, doküman ve uygulamalı dersler. Sertifika test barajından (70+) sonra basılır.",
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

export function academyCardOfferPaths(): readonly AcademyCardOfferPath[] {
  return ACADEMY_CARD_OFFER_PATHS;
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
