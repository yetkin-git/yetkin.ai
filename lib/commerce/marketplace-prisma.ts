import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { MarketplaceConflict, type ListingSyncPatch, type MarketplaceRepository } from "@/lib/commerce/marketplace-repository";
import {
  COMMERCE_CHANNEL,
  type ChannelListingRow,
  type ListingSyncStatus,
  type MarketplaceCredentialRow,
  type WebhookReceiptRow,
  type WebhookReceiptStatus,
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
  supplierHint: string;
  supplierSeal: string;
  apiKeySeal: string;
  apiSecretSeal: string;
  createdAt: Date;
  updatedAt: Date;
}): MarketplaceCredentialRow {
  return { ...row, channel: COMMERCE_CHANNEL };
}

function listingFrom(row: {
  id: string;
  storeId: string;
  variantId: string;
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
  return { ...row, channel: COMMERCE_CHANNEL };
}

function receiptFrom(row: {
  id: string;
  storeId: string;
  variantId: string;
  externalOrderId: string;
  lineId: string;
  status: WebhookReceiptStatus;
  quantity: number;
  note: string;
  createdAt: Date;
}): WebhookReceiptRow {
  return { ...row, channel: COMMERCE_CHANNEL };
}

export function createPrismaMarketplaceRepository(db: MarketplaceDb = getPrisma()): MarketplaceRepository {
  return {
    async upsertCredential(row) {
      const current = await db.commerceMarketplaceCredential.findUnique({
        where: { storeId_channel: { storeId: row.storeId, channel: COMMERCE_CHANNEL } },
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
            channel: COMMERCE_CHANNEL,
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
          where: { storeId_channel: { storeId: row.storeId, channel: COMMERCE_CHANNEL } },
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
    async deleteCredential(storeId) {
      const result = await db.commerceMarketplaceCredential.deleteMany({
        where: { storeId, channel: COMMERCE_CHANNEL },
      });
      return result.count > 0;
    },
    async findCredential(storeId) {
      const row = await db.commerceMarketplaceCredential.findUnique({
        where: { storeId_channel: { storeId, channel: COMMERCE_CHANNEL } },
      });
      return row ? credentialFrom(row) : null;
    },
    async listCredentialsByHint(supplierHint) {
      const rows = await db.commerceMarketplaceCredential.findMany({
        where: { channel: COMMERCE_CHANNEL, supplierHint },
      });
      return rows.map(credentialFrom);
    },
    async listTrendyolCredentials() {
      const rows = await db.commerceMarketplaceCredential.findMany({ where: { channel: COMMERCE_CHANNEL } });
      return rows.map(credentialFrom);
    },
    async upsertListing(row) {
      const current = await db.commerceChannelListing.findUnique({
        where: { variantId_channel: { variantId: row.variantId, channel: COMMERCE_CHANNEL } },
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
            channel: COMMERCE_CHANNEL,
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
    async deleteListing(storeId, variantId) {
      const result = await db.commerceChannelListing.deleteMany({
        where: { storeId, variantId, channel: COMMERCE_CHANNEL },
      });
      return result.count > 0;
    },
    async findListingByVariant(storeId, variantId) {
      const row = await db.commerceChannelListing.findFirst({
        where: { storeId, variantId, channel: COMMERCE_CHANNEL },
      });
      return row ? listingFrom(row) : null;
    },
    async findListingByRemoteBarcode(storeId, remoteBarcode) {
      const row = await db.commerceChannelListing.findUnique({
        where: {
          storeId_channel_remoteBarcode: { storeId, channel: COMMERCE_CHANNEL, remoteBarcode },
        },
      });
      return row ? listingFrom(row) : null;
    },
    async findListingById(listingId) {
      const row = await db.commerceChannelListing.findUnique({ where: { id: listingId } });
      return row ? listingFrom(row) : null;
    },
    async listListings(storeId) {
      const rows = await db.commerceChannelListing.findMany({
        where: { storeId, channel: COMMERCE_CHANNEL },
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
    async findReceipt(storeId, externalOrderId, lineId) {
      const row = await db.commerceMarketplaceWebhookReceipt.findUnique({
        where: {
          storeId_channel_externalOrderId_lineId: {
            storeId,
            channel: COMMERCE_CHANNEL,
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
            channel: COMMERCE_CHANNEL,
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
