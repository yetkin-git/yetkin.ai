/**
 * Akademi vitrin tutarı — KDV dahil, kuruş tamsayısı.
 * Seviye bandı (Temel ₺490 vb.) uygulanmaz; SKU başına serbest analiz tutarıdır.
 * Canlı kilit ve vitrin `PriceCatalogEntry.amountMinor`. Bu harita tohum SQL / DB yokken soğuk vitrin.
 */

import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";
import { computeWalletShortfallMinor, suggestQuickTopUpAmountMinor } from "@/lib/kernel/payments/quick-top-up";
import { WALLET_TOP_UP_MAX_MINOR, WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";

/**
 * Ops yazma penceresi — ticari taban/tavan değildir.
 * Tohum tutarı bu aralıkta serbestçe durur; kartta görünen rakam `ACADEMY_CATALOG_PRICE_MINOR`.
 */
export const ACADEMY_CATALOG_PRICE_WINDOW = {
  minMinor: 1,
  maxMinor: 50_000_000,
} as const;

/**
 * 20 SKU · KDV dahil liste (kuruş).
 * Gerekçe: `docs/FIYATLANDIRMA_RAPORU.md`
 */
export const ACADEMY_CATALOG_PRICE_MINOR = {
  "ai-agent-temel": 129_000,
  "ai-agent-orta": 159_000,
  "ai-agent-ileri": 199_000,
  "python-temel": 89_000,
  "python-orta": 119_000,
  "python-ileri": 149_000,
  "fullstack-temel": 119_000,
  "fullstack-orta": 149_000,
  "fullstack-ileri": 199_000,
  "security-temel": 129_000,
  "security-orta": 159_000,
  "security-ileri": 199_000,
  "ai-temel": 99_000,
  "ux-temel": 99_000,
  "excel-masterclass": 99_000,
  "google-ads-masterclass": 109_000,
  "meta-ads-masterclass": 109_000,
  "eticaret-masterclass": 99_000,
  "canva-masterclass": 69_000,
  "linkedin-masterclass": 79_000,
} as const satisfies Record<AcademyCourseTitleSlug, number>;

export function academyCatalogPriceMinorForSlug(slug: string): number | null {
  if (slug in ACADEMY_CATALOG_PRICE_MINOR) {
    return ACADEMY_CATALOG_PRICE_MINOR[slug as AcademyCourseTitleSlug];
  }
  return null;
}

/** Liste tutarı PayTR cüzdan bandına sığar — boş cüzdanda iframe = kart. */
export function academyCatalogPriceFitsPaytrBand(amountMinor: number): boolean {
  return (
    Number.isInteger(amountMinor) &&
    amountMinor >= WALLET_TOP_UP_MIN_MINOR &&
    amountMinor <= WALLET_TOP_UP_MAX_MINOR
  );
}

/**
 * Akademi kapısından PayTR’ye gidecek tutar.
 * Cüzdan catalog’u karşılıyorsa 0; boşsa catalog (öneri lift/cap yok, bant içi).
 */
export function academyPaytrTopUpMinor(catalogMinor: number, walletMinor: number): number {
  const shortfall = computeWalletShortfallMinor(catalogMinor, walletMinor);
  if (shortfall === 0) {
    return 0;
  }
  return suggestQuickTopUpAmountMinor(shortfall);
}
