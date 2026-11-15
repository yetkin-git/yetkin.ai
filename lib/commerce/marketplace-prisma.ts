import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { MarketplaceConflict, type ListingSyncPatch, type MarketplaceRepository } from "@/lib/commerce/marketplace-repository";
import type {
  ChannelListingRow,
  CommerceChannelName,
  ListingSyncStatus,
  MarketplaceCredentialRow,
  WebhookReceiptRow,
  WebhookReceiptStatus,
} from "@/lib/commerce/marketplace-types";

type MarketplaceDb = {
  commerceMarketplaceCredential: PrismaClient["commerceMarketplaceCredential"];
  commerceChannelListing: PrismaClient["commerceChannelListing"];
  commerceMarketplaceWebhookReceipt: PrismaClient["commerceMarketplaceWebhookReceipt"];
};

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function uniqueTarget(error: unknown): string {
  if (typeof error !== "object" || error === null || !("meta" in error)) {
    return "";
  }
  const meta = error.meta;
  if (!meta || typeof meta !== "object" || !("target" in meta)) {
    return "";
  }
  const target = meta.target;
  return Array.isArray(target) ? target.join(",") : String(target);
}

function credentialFrom(row: {
  id: string;
  storeId: string;
  channel: CommerceChannelName;
  supplierHint: string;
  supplierSeal: string;
  apiKeySeal: string;
  apiSecretSeal: string;
  createdAt: Date;
  updatedAt: Date;
}): MarketplaceCredentialRow {
  return row;
}

function listingFrom(row: {
  id: string;
  storeId: string;
  variantId: string;
  channel: CommerceChannelName;
  sku: string;
  barcode: string;
  remoteBarcode: string;
  remoteProductId: string | null;
  syncStatus: ListingSyncStatus;
  lastError: string;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ChannelListingRow {
  return row;
}

function receiptFrom(row: {
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
}): WebhookReceiptRow {
  return row;
}

export function createPrismaMarketplaceRepository(db: MarketplaceDb = getPrisma()): MarketplaceRepository {
  return {
    async upsertCredential(row) {
      const current = await db.commerceMarketplaceCredential.findUnique({
        where: { storeId_channel: { storeId: row.storeId, channel: row.channel } },
      });
      if (current) {
        const updated = await db.commerceMarketplaceCredential.update({
          where: { id: current.id },
          data: {
            supplierHint: row.supplierHint,
            supplierSeal: row.supplierSeal,
            apiKeySeal: row.apiKeySeal,
            apiSecretSeal: row.apiSecretSeal,
          },
        });
        return credentialFrom(updated);
      }
      try {
        const created = await db.commerceMarketplaceCredential.create({
          data: {
            id: row.id,
            storeId: row.storeId,
            channel: row.channel,
            supplierHint: row.supplierHint,
            supplierSeal: row.supplierSeal,
            apiKeySeal: row.apiKeySeal,
            apiSecretSeal: row.apiSecretSeal,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          },
        });
        return credentialFrom(created);
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error;
        }
        const again = await db.commerceMarketplaceCredential.findUnique({
          where: { storeId_channel: { storeId: row.storeId, channel: row.channel } },
        });
        if (!again) {
          throw error;
        }
        const updated = await db.commerceMarketplaceCredential.update({
          where: { id: again.id },
          data: {
            supplierHint: row.supplierHint,
            supplierSeal: row.supplierSeal,
            apiKeySeal: row.apiKeySeal,
            apiSecretSeal: row.apiSecretSeal,
          },
        });
        return credentialFrom(updated);
      }
    },
    async deleteCredential(storeId, channel) {
      const result = await db.commerceMarketplaceCredential.deleteMany({
        where: { storeId, channel },
      });
      return result.count > 0;
    },
    async findCredential(storeId, channel) {
      const row = await db.commerceMarketplaceCredential.findUnique({
        where: { storeId_channel: { storeId, channel } },
      });
      return row ? credentialFrom(row) : null;
    },
    async listCredentialsByHint(supplierHint, channel) {
      const rows = await db.commerceMarketplaceCredential.findMany({
        where: { channel, supplierHint },
      });
      return rows.map(credentialFrom);
    },
    async listCredentials(channel) {
      const rows = await db.commerceMarketplaceCredential.findMany({ where: { channel } });
      return rows.map(credentialFrom);
    },
    async upsertListing(row) {
      const current = await db.commerceChannelListing.findUnique({
        where: { variantId_channel: { variantId: row.variantId, channel: row.channel } },
      });
      const data = {
        sku: row.sku,
        barcode: row.barcode,
        remoteBarcode: row.remoteBarcode,
        remoteProductId: row.remoteProductId,
        syncStatus: "PENDING" as const,
        lastError: "",
        lastSyncedAt: null,
      };
      try {
        if (current) {
          const updated = await db.commerceChannelListing.update({ where: { id: current.id }, data });
          return listingFrom(updated);
        }
        const created = await db.commerceChannelListing.create({
          data: {
            id: row.id,
            storeId: row.storeId,
            variantId: row.variantId,
            channel: row.channel,
            ...data,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          },
        });
        return listingFrom(created);
      } catch (error) {
        if (isUniqueViolation(error) && uniqueTarget(error).includes("remote_barcode")) {
          throw new MarketplaceConflict("remote-barcode");
        }
        throw error;
      }
    },
    async deleteListing(storeId, variantId, channel) {
      const result = await db.commerceChannelListing.deleteMany({
        where: { storeId, variantId, channel },
      });
      return result.count > 0;
    },
    async findListingByVariant(storeId, variantId, channel) {
      const row = await db.commerceChannelListing.findFirst({
        where: { storeId, variantId, channel },
      });
      return row ? listingFrom(row) : null;
    },
    async findListingByRemoteBarcode(storeId, remoteBarcode, channel) {
      const row = await db.commerceChannelListing.findUnique({
        where: {
          storeId_channel_remoteBarcode: { storeId, channel, remoteBarcode },
        },
      });
      return row ? listingFrom(row) : null;
    },
    async findListingById(listingId) {
      const row = await db.commerceChannelListing.findUnique({ where: { id: listingId } });
      return row ? listingFrom(row) : null;
    },
    async listListings(storeId, channel) {
      const rows = await db.commerceChannelListing.findMany({
        where: { storeId, channel },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(listingFrom);
    },
    async listVariantListings(storeId, variantId) {
      const rows = await db.commerceChannelListing.findMany({
        where: { storeId, variantId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(listingFrom);
    },
    async markListing(listingId, patch: ListingSyncPatch) {
      const current = await db.commerceChannelListing.findUnique({ where: { id: listingId }, select: { id: true } });
      if (!current) {
        return null;
      }
      const updated = await db.commerceChannelListing.update({
        where: { id: listingId },
        data: {
          syncStatus: patch.syncStatus,
          lastError: patch.lastError,
          lastSyncedAt: patch.lastSyncedAt,
        },
      });
      return listingFrom(updated);
    },
    async findReceipt(storeId, externalOrderId, lineId, channel) {
      const row = await db.commerceMarketplaceWebhookReceipt.findUnique({
        where: {
          storeId_channel_externalOrderId_lineId: {
            storeId,
            channel,
            externalOrderId,
            lineId,
          },
        },
      });
      return row ? receiptFrom(row) : null;
    },
    async insertReceipt(row) {
      try {
        const created = await db.commerceMarketplaceWebhookReceipt.create({
          data: {
            id: row.id,
            storeId: row.storeId,
            variantId: row.variantId,
            channel: row.channel,
            externalOrderId: row.externalOrderId,
            lineId: row.lineId,
            status: row.status,
            quantity: row.quantity,
            note: row.note,
            createdAt: row.createdAt,
          },
        });
        return receiptFrom(created);
      } catch (error) {
        if (isUniqueViolation(error)) {
          return "conflict";
        }
        throw error;
      }
    },
  };
}
