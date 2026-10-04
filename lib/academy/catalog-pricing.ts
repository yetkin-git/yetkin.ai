/**
 * Akademi vitrin tutarı — KDV dahil, kuruş tamsayısı.
 * Seviye bandı uygulanmaz; SKU başına serbest analiz tutarıdır.
 * Canlı kilit `PriceCatalogEntry.amountMinor`. Bu harita yalnız tohumdur.
 * Vitrin ve JSON-LD, katalog satırı yokken bu sayıyı basmaz. Satır varsa bu harita onu ezmez.
 *
 * 13 kanon SKU fiyatı dondurulmuştur. Katman 1 ₺890–1.290, Katman 2 ₺2.900–7.500,
 * Katman 3 PayTR cüzdan tavanına (₺20.000) sığan kurumsal bant.
 */

import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";
import { COURSE_REGISTRY } from "@yetkin/kernel/catalog-ids/course-registry";
import { computeWalletShortfallMinor, suggestQuickTopUpAmountMinor } from "@/lib/kernel/payments/quick-top-up";
import { WALLET_TOP_UP_MAX_MINOR, WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";

/**
 * Ops yazma penceresi — ticari taban/tavan değildir.
 * Tohum tutarı bu aralıkta durur. Karttaki rakam katalog satırındandır.
 */
export const ACADEMY_CATALOG_PRICE_WINDOW = {
  minMinor: 1,
  maxMinor: 50_000_000,
} as const;

/**
 * KDV dahil liste (kuruş). 13 kanon SKU.
 * Amiral: ₺890. E-ticaret: ₺990. Masterclass (04/05): ₺1.290.
 */
export const ACADEMY_CATALOG_PRICE_MINOR = Object.fromEntries(
  COURSE_REGISTRY.filter((row) => row.canon).map((row) => [row.slug, row.priceSeedMinor]),
) as Record<AcademyCourseTitleSlug, number>;

/**
 * Eski soğuk yedek. Vitrin bunu basmaz.
 * Katalog satırı yokken kart `pricePending` gösterir. Satır varsa `PriceCatalogEntry` keser.
 */
export const OFF_201_CATALOG_READER_DEFAULT_MINOR = null;

/**
 * OFF-201 lansman tohumu — KDV dahil ₺1.290.
 * Canlı kilit `PriceCatalogEntry` `course:01_office_ai_ileri` satırıdır.
 * Super Admin satırı yazdıysa tohum o tutarı ezmez.
 */
const off201PriceSeedMinor = COURSE_REGISTRY.find((row) => row.slug === "01_office_ai_ileri")?.priceSeedMinor;
if (off201PriceSeedMinor == null) {
  throw new Error("OFF-201 tohum fiyatı kartta yok.");
}

export const OFF_201_LAUNCH_PRICE_MINOR = off201PriceSeedMinor;

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
