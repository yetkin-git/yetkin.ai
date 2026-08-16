import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";
import type { CatalogWriteStore } from "@/lib/kernel/admin/catalog-write";
import type { SealedCatalogEntry } from "@/lib/kernel/admin/types";

const CATALOG_SELECT = {
  id: true,
  moduleKey: true,
  unitKey: true,
  unitType: true,
  amountMinor: true,
  currencyCode: true,
  isActive: true,
  minMinor: true,
  maxMinor: true,
  description: true,
  updatedBy: true,
  updatedAt: true,
} as const;

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
  description: string | null;
  updatedBy: string | null;
  updatedAt: Date;
}): SealedCatalogEntry {
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
    description: row.description,
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt,
  };
}

export function createPrismaCatalogWriteStore(): CatalogWriteStore {
  const prisma = getPrisma();
  return {
    async findById(id) {
      const row = await prisma.priceCatalogEntry.findUnique({
        where: { id },
        select: CATALOG_SELECT,
      });
      return row ? toEntry(row) : null;
    },
    async findByModuleUnit(moduleKey, unitKey) {
      const row = await prisma.priceCatalogEntry.findUnique({
        where: { moduleKey_unitKey: { moduleKey, unitKey } },
        select: CATALOG_SELECT,
      });
      return row ? toEntry(row) : null;
    },
    async updateAmount(input) {
      const row = await prisma.priceCatalogEntry.update({
        where: { id: input.id },
        data: {
          amountMinor: input.amountMinor,
          updatedBy: input.updatedBy,
        },
        select: CATALOG_SELECT,
      });
      return toEntry(row);
    },
  };
}
