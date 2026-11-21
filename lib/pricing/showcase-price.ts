/**
 * Kamu fiyat yüzeyi. Satış tutarı kod sabiti değildir.
 * Canlı tutar yalnız aktif `PriceCatalogEntry.amountMinor` satırıdır.
 * Katalog satırı yoksa tohum fiyat `honesty: "live"` olmaz.
 * Satışa kapalı kart tutar basmaz.
 */

import { COURSE_REGISTRY } from "@yetkin/kernel/catalog-ids/course-registry";
import { academyCourseSaleOpen, academyMediaSealedWavCount } from "@/lib/academy/pilot-sku";
import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinorCompact } from "@/lib/kernel/money/format";

export type PriceHonesty = "live" | "planned";

export const PUBLIC_PRICE_PREPARING_LABEL = "Hazırlanıyor" as const;
export const PUBLIC_COMMERCE_PLANNED_LABEL = "Yakında / Katalogda Açılıyor" as const;
/** Katalog tutarı henüz açık olmayan satır. Tutar basılmaz; self-servis talep formu açıktır. */
export const PUBLIC_PREORDER_LABEL = "Kurumsal Tanımlama" as const;
/** Canlı YetkinCV kartı. Satın alma değildir. */
export const PUBLIC_FREE_EVALUATION_LABEL = "Ücretsiz Değerlendirme" as const;
/** Canlı kurumsal kart. Katalog tutarı değildir; teklif sayfasına gider. */
export const PUBLIC_KURUMSAL_QUOTE_LABEL = "Kurumsal Teklif" as const;

export type ShowcasePrice = {
  honesty: PriceHonesty;
  amountMinor: AmountMinor | null;
  label: string;
};

export function publicAcademyProofCounts(): {
  paths: number;
  lessons: number;
  sealedAudio: number;
} {
  const paths = COURSE_REGISTRY.filter(
    (row) => row.audience === "adult" && row.lessonKeys.length > 0,
  );
  const lessons = paths.reduce((total, row) => total + row.lessonKeys.length, 0);
  return {
    paths: paths.length,
    lessons,
    sealedAudio: academyMediaSealedWavCount(),
  };
}

/**
 * Akademi kartı. `lessonKeys` boş, yayın kapalı veya satış kapısı kapalıysa tutar yok.
 * Canlı tutar yalnız katalog satırıdır. Satır yoksa tohum fiyat canlı etiketi almaz.
 */
export function academyShowcasePrice(input: {
  slug: string;
  catalogAmountMinor: number | null;
  isPublished: boolean;
}): ShowcasePrice {
  const card = COURSE_REGISTRY.find((row) => row.slug === input.slug);
  const catalog =
    input.catalogAmountMinor != null &&
    Number.isInteger(input.catalogAmountMinor) &&
    input.catalogAmountMinor > 0
      ? input.catalogAmountMinor
      : null;
  const closed =
    !card ||
    card.audience !== "adult" ||
    card.lessonKeys.length === 0 ||
    !input.isPublished ||
    !academyCourseSaleOpen(input.slug) ||
    catalog == null;
  if (closed || catalog == null) {
    return {
      honesty: "planned",
      amountMinor: null,
      label: PUBLIC_PRICE_PREPARING_LABEL,
    };
  }
  const amountMinor = toAmountMinor(catalog);
  return {
    honesty: "live",
    amountMinor,
    label: formatMinorCompact(amountMinor, SETTLEMENT_CURRENCY),
  };
}

export function commerceMonthlyShowcase(
  entry: { amountMinor: AmountMinor; isActive: boolean } | null,
): ShowcasePrice {
  if (entry && entry.isActive && entry.amountMinor > 0) {
    return {
      honesty: "live",
      amountMinor: entry.amountMinor,
      label: formatMinorCompact(entry.amountMinor, SETTLEMENT_CURRENCY),
    };
  }
  return {
    honesty: "planned",
    amountMinor: null,
    label: PUBLIC_COMMERCE_PLANNED_LABEL,
  };
}
