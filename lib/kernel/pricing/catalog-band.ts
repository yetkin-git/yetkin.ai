import { toPositiveAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { PriceCatalogEntrySnapshot, PriceCatalogStore } from "@/lib/kernel/pricing/catalog";

export async function requireActiveCatalogEntry(
  catalog: PriceCatalogStore,
  moduleKey: string,
  unitKey: string,
): Promise<PriceCatalogEntrySnapshot> {
  const entry = await catalog.findActiveEntry(moduleKey, unitKey);
  if (!entry) {
    throw new Error(`Fiyat kataloğu yok: ${moduleKey}/${unitKey}.`);
  }
  return entry;
}

/** Kullanıcı tutarı katalog tabanı–tavan bandında olmalı. Satış fiyatı kod sabiti değildir. */
export function assertAmountWithinCatalogBand(
  amountMinor: number,
  entry: PriceCatalogEntrySnapshot,
): AmountMinor {
  const value = toPositiveAmountMinor(amountMinor);
  const floor = entry.minMinor ?? entry.amountMinor;
  if (value < floor) {
    throw new Error(`Tutar katalog tabanının altında (${floor} minor).`);
  }
  if (entry.maxMinor != null && value > entry.maxMinor) {
    throw new Error(`Tutar katalog tavanını aşar (${entry.maxMinor} minor).`);
  }
  return value;
}
