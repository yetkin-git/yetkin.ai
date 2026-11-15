import type {
  ChannelListingRow,
  ListingSyncStatus,
  MarketplaceCredentialRow,
  WebhookReceiptRow,
} from "@/lib/commerce/marketplace-types";

export class MarketplaceConflict extends Error {
  constructor(readonly conflict: "remote-barcode") {
    super(conflict);
    this.name = "MarketplaceConflict";
  }
}

export type ListingSyncPatch = {
  syncStatus: ListingSyncStatus;
  lastError: string;
  lastSyncedAt: Date | null;
};

export type MarketplaceRepository = {
  upsertCredential(row: MarketplaceCredentialRow): Promise<MarketplaceCredentialRow>;
  deleteCredential(storeId: string): Promise<boolean>;
  findCredential(storeId: string): Promise<MarketplaceCredentialRow | null>;
  listCredentialsByHint(supplierHint: string): Promise<MarketplaceCredentialRow[]>;
  listTrendyolCredentials(): Promise<MarketplaceCredentialRow[]>;
  upsertListing(row: ChannelListingRow): Promise<ChannelListingRow>;
  deleteListing(storeId: string, variantId: string): Promise<boolean>;
  findListingByVariant(storeId: string, variantId: string): Promise<ChannelListingRow | null>;
  findListingByRemoteBarcode(storeId: string, remoteBarcode: string): Promise<ChannelListingRow | null>;
  findListingById(listingId: string): Promise<ChannelListingRow | null>;
  listListings(storeId: string): Promise<ChannelListingRow[]>;
  markListing(listingId: string, patch: ListingSyncPatch): Promise<ChannelListingRow | null>;
  findReceipt(storeId: string, externalOrderId: string, lineId: string): Promise<WebhookReceiptRow | null>;
  insertReceipt(row: WebhookReceiptRow): Promise<WebhookReceiptRow | "conflict">;
};
