import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

export type PriceCatalogUnitType = "MINOR" | "BPS";

export type PriceCatalogEntrySnapshot = {
  id: string;
  moduleKey: string;
  unitKey: string;
  unitType: PriceCatalogUnitType;
  amountMinor: AmountMinor;
  currencyCode: CurrencyCode;
  isActive: boolean;
  minMinor: AmountMinor | null;
  maxMinor: AmountMinor | null;
};

export type PriceCatalogStore = {
  findActiveEntry(moduleKey: string, unitKey: string): Promise<PriceCatalogEntrySnapshot | null>;
  /** Tek SELECT — katalog vitrini N+1 `findActiveEntry` açmaz. */
  listActiveEntries(
    moduleKey: string,
    unitKeys?: readonly string[],
  ): Promise<PriceCatalogEntrySnapshot[]>;
};
