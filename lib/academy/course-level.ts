/**
 * Client-safe akademi seviye sicili. Sınav şıkları burada yoktur.
 * `lib/academy/seed.ts` aynı anahtarları taşır.
 *
 * Anayasal esneklik:
 * - Seviye etiketi serbest stringdir (Temel / Orta / İleri / Masterclass / Modül-N …).
 * - Her dikeyin zorunlu üç seviyesi yoktur.
 * - Fiyat seviye enum’una kilitli değildir; tutar serbest `amountMinor` (kuruş tamsayısı).
 * - Canlı tutar `PriceCatalogEntry` satırındandır; tohum tutarı yalnız ops soft default’tur.
 */

import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";

/** Yaygın yol haritası etiketleri — anayasal zorunluluk veya kapalı enum değildir. */
export const ACADEMY_COURSE_LEVELS = ["Temel", "Orta", "İleri"] as const;

export type AcademyCommonLevelLabel = (typeof ACADEMY_COURSE_LEVELS)[number];

/** Serbest seviye etiketi — bilinen veya yeni. */
export type AcademyCourseLevel = string;

export type AcademySeedMoney = {
  amountMinor: number;
  minMinor: number;
  maxMinor: number;
};

/**
 * Ops soft tohum tutarı — maktu anayasa bandı değildir.
 * SKU başına `resolveAcademySeedMoney` ile serbest sayı verilebilir.
 * Eğitim ve doğrudan sınav/vize kapıları aynı katalog tutarını paylaşır.
 */

/**
 * @deprecated Maktu bant yok. Geriye dönük import için soft hint; canlı fiyat kilidi değildir.
 * Yeni kod `resolveAcademySeedMoney` kullanır.
 */
export const ACADEMY_LEVEL_PRICE_BANDS: Record<
  AcademyCommonLevelLabel,
  AcademySeedMoney
> = {
  /** Soft hint — canlı tutar SKU `seedAmountMinor` / PriceCatalogEntry’dir. */
  Temel: { amountMinor: 49_000, minMinor: 39_000, maxMinor: 59_000 },
  Orta: { amountMinor: 109_000, minMinor: 89_000, maxMinor: 139_000 },
  İleri: { amountMinor: 289_000, minMinor: 249_000, maxMinor: 389_000 },
};

/**
 * Serbest tohum / katalog tutarı — seviye enum’una kilitli değildir.
 * `amountMinor` pozitif tam sayı (kuruş); min/max opsiyonel penceredir.
 * Bilinen etiketlerde soft hint yalnız tutar verilmediğinde kullanılır.
 */
export function resolveAcademySeedMoney(input: {
  amountMinor?: number;
  minMinor?: number;
  maxMinor?: number;
  level?: string;
}): AcademySeedMoney {
  const soft =
    input.level && isAcademyCommonLevelLabel(input.level)
      ? ACADEMY_LEVEL_PRICE_BANDS[input.level]
      : undefined;
  const amountMinor = input.amountMinor ?? soft?.amountMinor ?? 49_000;
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new Error("seedAmountMinor pozitif tam sayı (kuruş) olmalıdır.");
  }
  const minMinor = input.minMinor ?? soft?.minMinor ?? 1;
  const maxMinor = input.maxMinor ?? soft?.maxMinor ?? Math.max(amountMinor, 50_000_000);
  if (!Number.isInteger(minMinor) || !Number.isInteger(maxMinor)) {
    throw new Error("seedMinMinor / seedMaxMinor tam sayı olmalıdır.");
  }
  if (minMinor > amountMinor || maxMinor < amountMinor) {
    throw new Error("seedAmountMinor min/max penceresinin dışında.");
  }
  return { amountMinor, minMinor, maxMinor };
}

export const ACADEMY_COURSE_LEVEL_BY_SLUG: Record<AcademyCourseTitleSlug, AcademyCourseLevel> = {
  "python-temel": "Temel",
  "fullstack-temel": "Temel",
  "ai-temel": "Temel",
  "ux-temel": "Masterclass",
};

function academyCommonLevelFromSlugSuffix(slug: string): AcademyCommonLevelLabel | null {
  if (slug.endsWith("-ileri")) {
    return "İleri";
  }
  if (slug.endsWith("-orta")) {
    return "Orta";
  }
  if (slug.endsWith("-temel")) {
    return "Temel";
  }
  return null;
}

export function academyCourseLevelBySlug(slug: string): AcademyCourseLevel | null {
  return (
    ACADEMY_COURSE_LEVEL_BY_SLUG[slug as AcademyCourseTitleSlug] ??
    academyCommonLevelFromSlugSuffix(slug)
  );
}

/** Boş olmayan seviye etiketi — kapalı Temel/Orta/İleri enum’u değildir. */
export function isAcademyCourseLevel(value: string): value is AcademyCourseLevel {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 64;
}

export function isAcademyCommonLevelLabel(value: string): value is AcademyCommonLevelLabel {
  return (ACADEMY_COURSE_LEVELS as readonly string[]).includes(value);
}

export function academyCourseLevelTone(level: AcademyCourseLevel): "emerald" | "safir" | "violet" {
  if (level === "Temel") {
    return "emerald";
  }
  if (level === "Orta") {
    return "safir";
  }
  if (level === "İleri") {
    return "violet";
  }
  return "safir";
}
