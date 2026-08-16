import type { CurrencyCode } from "@/lib/kernel/money/currency";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { PriceCatalogUnitType } from "@/lib/kernel/pricing/catalog";

/**
 * Ops katalog sicili (S35-A). Motor bu sayıları import-time fiyat olarak kullanmaz;
 * canlı tutar `PriceCatalogEntry` satırından okunur (S11-A).
 */
export type RequiredCatalogDefinition = {
  moduleKey: string;
  unitKey: string;
  unitType: PriceCatalogUnitType;
  currencyCode: CurrencyCode;
  seedAmountMinor: number;
  seedMinMinor: number | null;
  seedMaxMinor: number | null;
  description: string;
};

export const REQUIRED_CATALOG_DEFINITIONS: readonly RequiredCatalogDefinition[] = [
  {
    moduleKey: "studio",
    unitKey: "generation:text",
    unitType: "MINOR",
    currencyCode: SETTLEMENT_CURRENCY,
    seedAmountMinor: 100,
    seedMinMinor: 100,
    seedMaxMinor: null,
    description: "Studio metin üretim tabanı — debit = max(taban, token) (S32-A).",
  },
  {
    moduleKey: "studio",
    unitKey: "generation:image",
    unitType: "MINOR",
    currencyCode: SETTLEMENT_CURRENCY,
    seedAmountMinor: 250,
    seedMinMinor: 250,
    seedMaxMinor: null,
    description: "Studio görsel üretim tabanı — debit = max(taban, token) (S32-A).",
  },
  {
    moduleKey: "devlabs",
    unitKey: "generation:code",
    unitType: "MINOR",
    currencyCode: SETTLEMENT_CURRENCY,
    seedAmountMinor: 150,
    seedMinMinor: 150,
    seedMaxMinor: null,
    description: "DevLabs kod üretim tabanı — debit = max(taban, token) (S32-A). Exec yoktur.",
  },
  {
    moduleKey: "kurumsal",
    unitKey: "job-posting:floor",
    unitType: "MINOR",
    currencyCode: SETTLEMENT_CURRENCY,
    seedAmountMinor: 1_000,
    seedMinMinor: 1_000,
    seedMaxMinor: 2_000_000,
    description: "Kurumsal mühürlü ilan bütçe tabanı / tavanı.",
  },
  {
    moduleKey: "arena",
    unitKey: "tender-pool:floor",
    unitType: "MINOR",
    currencyCode: SETTLEMENT_CURRENCY,
    seedAmountMinor: 10_000,
    seedMinMinor: 10_000,
    seedMaxMinor: 2_000_000,
    description: "Arena ihale ödül havuzu tabanı / tavanı.",
  },
  {
    moduleKey: "pazaryeri",
    unitKey: "listing:floor",
    unitType: "MINOR",
    currencyCode: SETTLEMENT_CURRENCY,
    seedAmountMinor: 1_000,
    seedMinMinor: 1_000,
    seedMaxMinor: 2_000_000,
    description: "Yetkinİlan dijital/hizmet ilan fiyat tabanı / tavanı.",
  },
  {
    moduleKey: "pazaryeri",
    unitKey: "listing:asset-floor",
    unitType: "MINOR",
    currencyCode: SETTLEMENT_CURRENCY,
    seedAmountMinor: 100_000,
    seedMinMinor: 10_000,
    seedMaxMinor: 2_000_000_000,
    description: "Yetkinİlan emlak/vasıta ilan fiyat tabanı / tavanı (S61-A). Tavan Int32 güvenli ₺20M.",
  },
  {
    moduleKey: "pazaryeri",
    unitKey: "doping:boost",
    unitType: "MINOR",
    currencyCode: SETTLEMENT_CURRENCY,
    seedAmountMinor: 5_000,
    seedMinMinor: 5_000,
    seedMaxMinor: 5_000,
    description: "Yetkinİlan ilan doping / öne çıkarma ücreti (S61-A, S11-A).",
  },
] as const;

export function catalogDefinitionKey(definition: Pick<RequiredCatalogDefinition, "moduleKey" | "unitKey">): string {
  return `${definition.moduleKey}:${definition.unitKey}`;
}
