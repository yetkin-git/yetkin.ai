/**
 * Tohum müfredat — CMS yok. Gövde yalnız SETTLED satın alma sonrası API/sayfada açılır.
 * Müze `[slug]/curriculum` kopyalanmaz.
 */

import { computeAcademyCurriculumSeal } from "@/lib/academy/exam";

export type AcademyLessonSeed = {
  key: string;
  order: number;
  title: string;
  body: string;
};

const RAIL_TEMEL_LESSONS: readonly AcademyLessonSeed[] = [
  {
    key: "rail-temel-1",
    order: 1,
    title: "Tek nakit defter: amountMinor",
    body: "Yetkin Rail tutarı float TL olarak tutmaz. Birim amountMinor + currencyCode. Wallet satırı tek bakiyedir; User kolonunda bakiye yoktur. Defter append-only LedgerEntry. İkinci nakit yazıcı (triple-balance, merit-swap) yasaktır.",
  },
  {
    key: "rail-temel-2",
    order: 2,
    title: "CheckoutPriceLock on beş dakika",
    body: "Satış fiyatı kod sabiti değildir; Super Admin katalog SSOT. Satın alma öncesi CheckoutPriceLock katalog tutarını 15 dakika mühürler. Süre dolunca kilit düşer. Kilitsiz debit yok.",
  },
  {
    key: "rail-temel-3",
    order: 3,
    title: "Settlement, emanet yok, sınav belgesi",
    body: "Akademi kurs ödemesinde emanet (escrow) yoktur. Debit sonrası tutar platform hazinesine geçer. Satın alma öğrenme kaydıdır; SHA256 ustalık belgesi müfredat sınavı ≥70 sonrası basılır. Kariyer vizesi belgeye bağlanır.",
  },
];

const RAY_SINYAL_LESSONS: readonly AcademyLessonSeed[] = [
  {
    key: "ray-sinyal-1",
    order: 1,
    title: "Anklaşman (interlocking)",
    body: "Anklaşman çelişen güzergâhları aynı anda kilitlemez. Sinyal ve makas durumu tek emniyet mantığında bağlanır. Hız rekoru veya bilet satışı anklaşman görevi değildir.",
  },
  {
    key: "ray-sinyal-2",
    order: 2,
    title: "Fail-safe sinyal ilkesi",
    body: "Arıza en kısıtlayıcı duruma düşer: kırmızı / dur. Yeşil yakmak fail-safe değildir. Emniyet varsayılanı açık güzergâh değil, kapalı güzergâhtır.",
  },
  {
    key: "ray-sinyal-3",
    order: 3,
    title: "Ray devresi ve kırmızı aspekt",
    body: "Ray devresi kesimde tren varlığını tespit eder. Kırmızı aspekt: dur — güzergâh kapalı veya korunuyor. Geçilebilir anlamı taşımaz.",
  },
];

const LESSONS_BY_SLUG: Record<string, readonly AcademyLessonSeed[]> = {
  "rail-temel": RAIL_TEMEL_LESSONS,
  "rayli-sinyal-emniyet": RAY_SINYAL_LESSONS,
};

export function curriculumForCourseSlug(slug: string): readonly AcademyLessonSeed[] {
  return LESSONS_BY_SLUG[slug] ?? [];
}

export function academyLessonByKey(
  slug: string,
  lessonKey: string,
): AcademyLessonSeed | null {
  return curriculumForCourseSlug(slug).find((lesson) => lesson.key === lessonKey) ?? null;
}

export function isAcademyCurriculumComplete(
  slug: string,
  completedKeys: readonly string[],
): boolean {
  const lessons = curriculumForCourseSlug(slug);
  if (lessons.length === 0) {
    return false;
  }
  const done = new Set(completedKeys);
  return lessons.every((lesson) => done.has(lesson.key));
}

export function nextAcademyLessonKey(
  slug: string,
  completedKeys: readonly string[],
): string | null {
  const done = new Set(completedKeys);
  const next = curriculumForCourseSlug(slug).find((lesson) => !done.has(lesson.key));
  return next?.key ?? null;
}

/** Tohum sırası — hash bu diziyi yer. Tamamlama tarihi sırası kullanılmaz. */
export function orderedAcademyLessonKeys(slug: string): readonly string[] {
  return curriculumForCourseSlug(slug).map((lesson) => lesson.key);
}

/**
 * Tamamlanan anahtarları müfredat sırasına indirger.
 * SKU dışı veya atlanan anahtar mühüre girmez.
 */
export function orderedCompletedAcademyLessonKeys(
  slug: string,
  completedKeys: readonly string[],
): string[] {
  const done = new Set(completedKeys);
  return orderedAcademyLessonKeys(slug).filter((key) => done.has(key));
}

export function academyCurriculumSealForSlug(slug: string): string | null {
  const keys = orderedAcademyLessonKeys(slug);
  if (keys.length === 0) {
    return null;
  }
  return computeAcademyCurriculumSeal(keys);
}

/**
 * Müfredat %100 değilse mühür basılmaz. Tamamlanmış küme tohum sırasına indirgenir.
 */
export function academyCurriculumSealFromCompletions(
  slug: string,
  completedKeys: readonly string[],
): string | null {
  if (!isAcademyCurriculumComplete(slug, completedKeys)) {
    return null;
  }
  return academyCurriculumSealForSlug(slug);
}
