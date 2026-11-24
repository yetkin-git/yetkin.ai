export const COMMERCE_CHANNELS = ["TRENDYOL", "HEPSIBURADA"] as const;

export type CommerceChannelName = (typeof COMMERCE_CHANNELS)[number];

/** Trendyol çağrılarının kanalı. Hepsiburada `HEPSIBURADA` geçirir. */
export const COMMERCE_CHANNEL = "TRENDYOL" satisfies CommerceChannelName;

export type ListingSyncStatus = "PENDING" | "SYNCED" | "FAILED";

export type WebhookReceiptStatus = "APPLIED" | "STOCK_SHORT";

export type MarketplaceCredentialRow = {
  id: string;
  storeId: string;
  channel: CommerceChannelName;
  supplierHint: string;
  supplierSeal: string;
  apiKeySeal: string;
  apiSecretSeal: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ChannelListingRow = {
  id: string;
  storeId: string;
  variantId: string;
  channel: CommerceChannelName;
  sku: string;
  barcode: string;
  remoteBarcode: string;
  remoteProductId: string | null;
  /** Kanal satış fiyatı. Boşsa varyant fiyatı geçerlidir. */
  priceMinor?: number | null;
  syncStatus: ListingSyncStatus;
  lastError: string;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type WebhookReceiptRow = {
  id: string;
  storeId: string;
  variantId: string;
  channel: CommerceChannelName;
  externalOrderId: string;
  lineId: string;
  status: WebhookReceiptStatus;
  quantity: number;
  note: string;
  createdAt: Date;
};

export type MaskedTrendyolCredential = {
  channel: CommerceChannelName;
  sealed: true;
  supplierHint: string;
  updatedAt: string;
};

export type ListingView = {
  id: string;
  variantId: string;
  channel: CommerceChannelName;
  sku: string;
  barcode: string;
  remoteBarcode: string;
  remoteProductId: string | null;
  syncStatus: ListingSyncStatus;
  lastError: string;
  lastSyncedAt: string | null;
  updatedAt: string;
};

export function maskedCredential(row: MarketplaceCredentialRow): MaskedTrendyolCredential {
  return {
    channel: row.channel,
    sealed: true,
    supplierHint: row.supplierHint,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function listingView(row: ChannelListingRow): ListingView {
  return {
    id: row.id,
    variantId: row.variantId,
    channel: row.channel,
    sku: row.sku,
    barcode: row.barcode,
    remoteBarcode: row.remoteBarcode,
    remoteProductId: row.remoteProductId,
    syncStatus: row.syncStatus,
    lastError: row.lastError,
    lastSyncedAt: row.lastSyncedAt ? row.lastSyncedAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}
