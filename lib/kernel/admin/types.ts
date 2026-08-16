import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import type { PriceCatalogUnitType } from "@/lib/kernel/pricing/catalog";

/** PriceCatalogEntry satırının Super Admin projeksiyonu. Yazma PATCH /api/admin/catalog. */
export type SealedCatalogEntry = {
  id: string;
  moduleKey: string;
  unitKey: string;
  unitType: PriceCatalogUnitType;
  amountMinor: AmountMinor;
  currencyCode: CurrencyCode;
  isActive: boolean;
  minMinor: AmountMinor | null;
  maxMinor: AmountMinor | null;
  description: string | null;
  updatedBy: string | null;
  updatedAt: Date;
};

export type AdminCatalogBoard =
  | { access: "forbidden" }
  | { access: "unavailable" }
  | { access: "ok"; entries: SealedCatalogEntry[] };

export type CatalogModuleGroup = {
  moduleKey: string;
  entries: SealedCatalogEntry[];
};

export const ADMIN_SURFACE_PATH = "/admin" as const;
export const CATALOG_WRITE_PATH = "/api/admin/catalog" as const;
