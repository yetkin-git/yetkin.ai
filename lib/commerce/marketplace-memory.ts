import { MarketplaceConflict, type ListingSyncPatch, type MarketplaceRepository } from "@/lib/commerce/marketplace-repository";
import { COMMERCE_CHANNEL, type ChannelListingRow, type MarketplaceCredentialRow, type WebhookReceiptRow } from "@/lib/commerce/marketplace-types";

type MemoryState = {
  credentials: MarketplaceCredentialRow[];
  listings: ChannelListingRow[];
  receipts: WebhookReceiptRow[];
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function createMemoryMarketplaceRepository(): MarketplaceRepository {
  const state: MemoryState = { credentials: [], listings: [], receipts: [] };
  return {
    async upsertCredential(row) {
      const index = state.credentials.findIndex(
        (item) => item.storeId === row.storeId && item.channel === COMMERCE_CHANNEL,
      );
      if (index >= 0) {
        const current = state.credentials[index]!;
        const next: MarketplaceCredentialRow = {
          ...clone(row),
          id: current.id,
          createdAt: current.createdAt,
        };
        state.credentials[index] = next;
        return clone(next);
      }
      state.credentials.push(clone(row));
      return clone(row);
    },
    async deleteCredential(storeId) {
      const before = state.credentials.length;
      state.credentials = state.credentials.filter(
        (item) => !(item.storeId === storeId && item.channel === COMMERCE_CHANNEL),
      );
      return state.credentials.length !== before;
    },
    async findCredential(storeId) {
      const row = state.credentials.find((item) => item.storeId === storeId && item.channel === COMMERCE_CHANNEL);
      return row ? clone(row) : null;
    },
    async listCredentialsByHint(supplierHint) {
      return state.credentials
        .filter((item) => item.channel === COMMERCE_CHANNEL && item.supplierHint === supplierHint)
        .map((item) => clone(item));
    },
    async listTrendyolCredentials() {
      return state.credentials.filter((item) => item.channel === COMMERCE_CHANNEL).map((item) => clone(item));
    },
    async upsertListing(row) {
      const sameRemote = state.listings.find(
        (item) =>
          item.storeId === row.storeId &&
          item.channel === COMMERCE_CHANNEL &&
          item.remoteBarcode === row.remoteBarcode &&
          item.variantId !== row.variantId,
      );
      if (sameRemote) {
        throw new MarketplaceConflict("remote-barcode");
      }
      const index = state.listings.findIndex(
        (item) => item.storeId === row.storeId && item.variantId === row.variantId && item.channel === COMMERCE_CHANNEL,
      );
      if (index >= 0) {
        const current = state.listings[index]!;
        const next: ChannelListingRow = { ...clone(row), id: current.id, createdAt: current.createdAt };
        state.listings[index] = next;
        return clone(next);
      }
      state.listings.push(clone(row));
      return clone(row);
    },
    async deleteListing(storeId, variantId) {
      const before = state.listings.length;
      state.listings = state.listings.filter(
        (item) => !(item.storeId === storeId && item.variantId === variantId && item.channel === COMMERCE_CHANNEL),
      );
      return state.listings.length !== before;
    },
    async findListingByVariant(storeId, variantId) {
      const row = state.listings.find(
        (item) => item.storeId === storeId && item.variantId === variantId && item.channel === COMMERCE_CHANNEL,
      );
      return row ? clone(row) : null;
    },
    async findListingByRemoteBarcode(storeId, remoteBarcode) {
      const row = state.listings.find(
        (item) => item.storeId === storeId && item.channel === COMMERCE_CHANNEL && item.remoteBarcode === remoteBarcode,
      );
      return row ? clone(row) : null;
    },
    async findListingById(listingId) {
      const row = state.listings.find((item) => item.id === listingId);
      return row ? clone(row) : null;
    },
    async listListings(storeId) {
      return state.listings
        .filter((item) => item.storeId === storeId && item.channel === COMMERCE_CHANNEL)
        .map((item) => clone(item));
    },
    async markListing(listingId, patch: ListingSyncPatch) {
      const index = state.listings.findIndex((item) => item.id === listingId);
      const current = state.listings[index];
      if (!current) {
        return null;
      }
      const next: ChannelListingRow = {
        ...current,
        syncStatus: patch.syncStatus,
        lastError: patch.lastError,
        lastSyncedAt: patch.lastSyncedAt,
        updatedAt: new Date(),
      };
      state.listings[index] = next;
      return clone(next);
    },
    async findReceipt(storeId, externalOrderId, lineId) {
      const row = state.receipts.find(
        (item) =>
          item.storeId === storeId &&
          item.channel === COMMERCE_CHANNEL &&
          item.externalOrderId === externalOrderId &&
          item.lineId === lineId,
      );
      return row ? clone(row) : null;
    },
    async insertReceipt(row) {
      const existing = state.receipts.find(
        (item) =>
          item.storeId === row.storeId &&
          item.channel === row.channel &&
          item.externalOrderId === row.externalOrderId &&
          item.lineId === row.lineId,
      );
      if (existing) {
        return "conflict";
      }
      state.receipts.push(clone(row));
      return clone(row);
    },
  };
}
