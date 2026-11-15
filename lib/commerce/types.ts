export const COMMERCE_MARKETS = ["trendyol", "hepsiburada", "amazon"] as const;

export type CommerceMarket = (typeof COMMERCE_MARKETS)[number];

export type StoreStatus = "DRAFT" | "ACTIVE";
export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type VariantStatus = "DRAFT" | "ACTIVE" | "PASSIVE";
export type CatalogSource = "MANUAL" | "MANUAL_CSV" | "TEZGAH_PAZARYERI";
export type InventoryDirection = "IN" | "OUT";
export type InventoryType = "INBOUND" | "SALE" | "ADJUSTMENT" | "RETURN";
export type CatalogMode = "draft" | "active";

export type CatalogAttribute = {
  column: string;
  value: string;
};

export type StoreRow = {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  status: StoreStatus;
  currencyCode: "TRY";
  whatsappE164: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductRow = {
  id: string;
  storeId: string;
  title: string;
  description: string;
  category: string;
  attributes: CatalogAttribute[];
  otherNote: string;
  listingMarket: CommerceMarket | null;
  source: CatalogSource;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type VariantRow = {
  id: string;
  storeId: string;
  productId: string;
  sku: string;
  barcode: string | null;
  amountMinor: number | null;
  onHandQty: number;
  safetyBuffer: number;
  status: VariantStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type MovementRow = {
  id: string;
  storeId: string;
  variantId: string;
  actorUserId: string;
  type: InventoryType;
  direction: InventoryDirection;
  quantity: number;
  onHandAfter: number;
  note: string;
  idempotencyKey: string;
  createdAt: Date;
};

export type MoveCommand = {
  id: string;
  storeId: string;
  variantId: string;
  actorUserId: string;
  type: InventoryType;
  direction: InventoryDirection;
  quantity: number;
  note: string;
  idempotencyKey: string;
};

export type MoveResult =
  | { outcome: "applied" | "replay"; movement: MovementRow; variant: VariantRow }
  | { outcome: "rejected" }
  | { outcome: "missing" };

export type CommerceFailure = {
  ok: false;
  status: 400 | 404 | 409 | 422;
  error: string;
};

export type CommerceResult<T extends Record<string, unknown>> =
  | { ok: true; data: T }
  | CommerceFailure;

export function commerceFail(status: CommerceFailure["status"], error: string): CommerceFailure {
  return { ok: false, status, error };
}

export const COMMERCE_INT_MAX = 2_147_483_647;
