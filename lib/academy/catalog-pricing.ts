/**
 * Akademi vitrin tutarı — KDV dahil, kuruş tamsayısı.
 * Seviye bandı uygulanmaz; SKU başına serbest analiz tutarıdır.
 * Canlı kilit ve vitrin `PriceCatalogEntry.amountMinor`. Bu harita tohum SQL / DB yokken soğuk vitrin.
 *
 * 13 kanon SKU fiyatı dondurulmuştur. Katman 1 ₺490–1.490, Katman 2 ₺2.900–7.500,
 * Katman 3 PayTR cüzdan tavanına (₺20.000) sığan kurumsal bant.
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
 * KDV dahil liste (kuruş). 13 kanon SKU.
 * Amiral: ₺890. E-ticaret: ₺990.
 */
export const ACADEMY_CATALOG_PRICE_MINOR = {
  "01_office_ai": 89_000,
  "02_ecommerce_ai": 99_000,
  "03_social_media_ai": 89_000,
  "04_chatbot_nocode": 129_000,
  "05_prompt_practice": 49_000,
  "06_n8n_automation": 390_000,
  "07_langgraph_agents": 590_000,
  "08_production_rag": 690_000,
  "09_nextjs_ai": 490_000,
  "10_data_analytics_ai": 349_000,
  "11_llm_redteam": 1_500_000,
  "12_onprem_finetune": 1_900_000,
  "13_ai_governance": 1_500_000,
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
