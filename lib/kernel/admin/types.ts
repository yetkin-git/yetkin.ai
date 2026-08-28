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

export type SealedPriceDecision = {
  id: string;
  catalogEntryId: string;
  moduleKey: string;
  unitKey: string;
  unitType: PriceCatalogUnitType;
  reasonCode: string;
  reason: string;
  oldMinor: AmountMinor;
  newMinor: AmountMinor;
  currencyCode: CurrencyCode;
  actorUserId: string;
  createdAt: Date;
};

export type AdminCatalogBoard =
  | { access: "forbidden" }
  | { access: "unavailable" }
  | { access: "ok"; entries: SealedCatalogEntry[]; decisions: SealedPriceDecision[] };

export type CatalogModuleGroup = {
  moduleKey: string;
  entries: SealedCatalogEntry[];
};

export const ADMIN_SURFACE_PATH = "/admin" as const;
export const CATALOG_WRITE_PATH = "/api/admin/catalog" as const;
/** Admin sığınak yönlendirmeleri — canlı CTA hedefleri. */
export const ADMIN_DASHBOARD_SHELTER_PATH = "/dashboard" as const;
export const ADMIN_ACADEMY_SHELTER_PATH = "/academy" as const;
export const ADMIN_FREELANCER_SHELTER_PATH = "/freelancer" as const;
