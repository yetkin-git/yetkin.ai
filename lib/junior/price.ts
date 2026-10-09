import "server-only";

import { formatMinorCompact } from "@/lib/kernel/money/format";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import type { PriceCatalogEntrySnapshot, PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";

/** Anayasa A1. Satış fiyatının evi `price_catalog_entries` satırı `cat_junior_yearly`. */
export const JUNIOR_YEARLY_CATALOG_ID = "cat_junior_yearly";

export const JUNIOR_YEARLY_MODULE_KEY = "junior";

export const JUNIOR_YEARLY_UNIT_KEY = "yearly";

export type JuniorYearlyPrice = {
  id: string;
  amountMinor: number;
  currencyCode: CurrencyCode;
  label: string;
};

export function juniorYearlyPriceFromEntry(
  entry: PriceCatalogEntrySnapshot | null,
): JuniorYearlyPrice | null {
  if (!entry || !entry.isActive) {
    return null;
  }
  if (entry.id !== JUNIOR_YEARLY_CATALOG_ID) {
    return null;
  }
  if (entry.moduleKey !== JUNIOR_YEARLY_MODULE_KEY || entry.unitKey !== JUNIOR_YEARLY_UNIT_KEY) {
    return null;
  }
  if (entry.unitType !== "MINOR") {
    return null;
  }
  return {
    id: entry.id,
    amountMinor: entry.amountMinor,
    currencyCode: entry.currencyCode,
    label: formatMinorCompact(entry.amountMinor, entry.currencyCode),
  };
}

export async function readJuniorYearlyPrice(
  store: PriceCatalogStore = createPrismaPriceCatalogStore(),
): Promise<JuniorYearlyPrice | null> {
  const entry = await store.findActiveEntry(JUNIOR_YEARLY_MODULE_KEY, JUNIOR_YEARLY_UNIT_KEY);
  return juniorYearlyPriceFromEntry(entry);
}
