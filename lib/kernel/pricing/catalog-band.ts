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

export const CATALOG_WRITE_BAND_UNDEFINED =
  "Katalog taban/tavan bandı tanımsız. Sessiz zam yok.";

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

/**
 * Super Admin MINOR yazımı — taban ve tavan zorunlu (fail-closed).
 * BPS `escrow:hold` bu kapıdan geçmez; hold bps kod bandı ayrıdır.
 */
export function assertCatalogWriteAmountWithinBand(
  amountMinor: number,
  entry: PriceCatalogEntrySnapshot,
): AmountMinor {
  if (entry.unitType !== "MINOR") {
    return toPositiveAmountMinor(amountMinor);
  }
  if (entry.minMinor == null || entry.maxMinor == null) {
    throw new Error(CATALOG_WRITE_BAND_UNDEFINED);
  }
  return assertAmountWithinCatalogBand(amountMinor, entry);
}
