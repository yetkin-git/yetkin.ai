import { OFF_201_SKU_SLUG } from "@/lib/academy/curricula/office_ai/off-201";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";

/**
 * OFF-201 katalog yuvası. Tutar bu dosyada yoktur (A1).
 * Satın alma kilidi `PriceCatalogEntry` satırını okur.
 * Satır yoksa fiyat basılmaz; Super Admin satırı açınca kilit o tutarı alır.
 */
export const OFF_201_CATALOG_MODULE_KEY = ACADEMY_MODULE_KEY;
export const OFF_201_CATALOG_UNIT_KEY = `course:${OFF_201_SKU_SLUG}` as const;

export type Off201CatalogSlotRow = {
  moduleKey: string;
  unitKey: string;
  isActive: boolean;
  amountMinor: number;
};

export function off201CatalogPriceIsSet(entries: readonly Off201CatalogSlotRow[]): boolean {
  return entries.some(
    (row) =>
      row.moduleKey === OFF_201_CATALOG_MODULE_KEY &&
      row.unitKey === OFF_201_CATALOG_UNIT_KEY &&
      row.isActive &&
      Number.isInteger(row.amountMinor) &&
      row.amountMinor > 0,
  );
}
