import type { CommerceChannelName } from "@/lib/commerce/marketplace-types";
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
  deleteCredential(storeId: string, channel: CommerceChannelName): Promise<boolean>;
  findCredential(storeId: string, channel: CommerceChannelName): Promise<MarketplaceCredentialRow | null>;
  listCredentialsByHint(supplierHint: string, channel: CommerceChannelName): Promise<MarketplaceCredentialRow[]>;
  listCredentials(channel: CommerceChannelName): Promise<MarketplaceCredentialRow[]>;
  upsertListing(row: ChannelListingRow): Promise<ChannelListingRow>;
  deleteListing(storeId: string, variantId: string, channel: CommerceChannelName): Promise<boolean>;
  findListingByVariant(storeId: string, variantId: string, channel: CommerceChannelName): Promise<ChannelListingRow | null>;
  findListingByRemoteBarcode(
    storeId: string,
    remoteBarcode: string,
    channel: CommerceChannelName,
  ): Promise<ChannelListingRow | null>;
  findListingById(listingId: string): Promise<ChannelListingRow | null>;
  listListings(storeId: string, channel: CommerceChannelName): Promise<ChannelListingRow[]>;
  listVariantListings(storeId: string, variantId: string): Promise<ChannelListingRow[]>;
  markListing(listingId: string, patch: ListingSyncPatch): Promise<ChannelListingRow | null>;
  findReceipt(
    storeId: string,
    externalOrderId: string,
    lineId: string,
    channel: CommerceChannelName,
  ): Promise<WebhookReceiptRow | null>;
  insertReceipt(row: WebhookReceiptRow): Promise<WebhookReceiptRow | "conflict">;
};
