import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";
import type { PriceCatalogEntrySnapshot, PriceCatalogStore } from "@/lib/kernel/pricing/catalog";

function toEntry(row: {
  id: string;
  moduleKey: string;
  unitKey: string;
  unitType: "MINOR" | "BPS";
  amountMinor: number;
  currencyCode: string;
  isActive: boolean;
  minMinor: number | null;
  maxMinor: number | null;
}): PriceCatalogEntrySnapshot {
  return {
    id: row.id,
    moduleKey: row.moduleKey,
    unitKey: row.unitKey,
    unitType: row.unitType,
    amountMinor: toAmountMinor(row.amountMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
    isActive: row.isActive,
    minMinor: row.minMinor == null ? null : toAmountMinor(row.minMinor),
    maxMinor: row.maxMinor == null ? null : toAmountMinor(row.maxMinor),
  };
}

export function createPrismaPriceCatalogStore(): PriceCatalogStore {
  const prisma = getPrisma();
  return {
    async findActiveEntry(moduleKey, unitKey) {
      const row = await prisma.priceCatalogEntry.findUnique({
        where: { moduleKey_unitKey: { moduleKey, unitKey } },
      });
      if (!row || !row.isActive) {
        return null;
      }
      return toEntry(row);
    },
  };
}
