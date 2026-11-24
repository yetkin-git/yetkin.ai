import "server-only";

import { broadcastStockToChannels, type BroadcastChannel, type BroadcastDeps } from "@/lib/commerce/channel-broadcast";
import { commitChannelOrderPrisma } from "@/lib/commerce/channel-stock-prisma";
import { draftFromChannelEvent } from "@/lib/commerce/fulfillment-rules";
import { recordFulfillmentQuiet } from "@/lib/commerce/fulfillment-service";
import type { ChannelWebhookDeps } from "@/lib/commerce/channel-webhook-handler";
import { formatTripleCredential, isMarketplaceChannel, parseTripleCredential } from "@/lib/commerce/channel-credentials";
import { COMMERCE_CREDENTIAL_SEAL_PREFIX, openCommerceCredential } from "@/lib/commerce/credential-seal";
import { channelNeedsKey } from "@/lib/commerce/os-rules";
import { getPrisma } from "@/lib/kernel/db";
import type { PrismaClient } from "@/generated/prisma/client";

function openKey(seal: string, storeId: string, kind: Parameters<typeof channelNeedsKey>[0]): string | null {
  if (!seal.startsWith(COMMERCE_CREDENTIAL_SEAL_PREFIX)) {
    return null;
  }
  try {
    const opened = openCommerceCredential(seal, "apiKey", storeId, process.env, kind).trim();
    return opened || null;
  } catch {
    return null;
  }
}

/**
 * Yayın anahtarı. Pazaryeri kanalında mühür zaten `satıcı:anahtar:sır` ise o kullanılır.
 * Eski mühür yalnız API anahtarıysa üçlü, `commerce_marketplace_credentials` kasasından kurulur.
 */
async function resolveBroadcastKey(
  db: PrismaClient,
  storeId: string,
  row: { kind: Parameters<typeof channelNeedsKey>[0]; apiKeySeal: string },
): Promise<string | null> {
  if (!channelNeedsKey(row.kind)) {
    return null;
  }
  const opened = openKey(row.apiKeySeal, storeId, row.kind);
  if (opened && parseTripleCredential(opened)) {
    return opened;
  }
  if (!isMarketplaceChannel(row.kind)) {
    return opened;
  }
  const cred = await db.commerceMarketplaceCredential.findUnique({
    where: { storeId_channel: { storeId, channel: row.kind } },
  });
  if (!cred) {
    return opened;
  }
  try {
    const supplierId = openCommerceCredential(cred.supplierSeal, "supplier", storeId, process.env, row.kind).trim();
    const apiKey = openCommerceCredential(cred.apiKeySeal, "apiKey", storeId, process.env, row.kind).trim();
    const apiSecret = openCommerceCredential(cred.apiSecretSeal, "apiSecret", storeId, process.env, row.kind).trim();
    if (!supplierId || !apiKey || !apiSecret) {
      return opened;
    }
    return formatTripleCredential({ supplierId, apiKey, apiSecret });
  } catch {
    return opened;
  }
}

export function liveBroadcastDeps(): BroadcastDeps {
  const db = getPrisma();
  return {
    loadProduct: (productId) =>
      db.commerceProduct.findUnique({
        where: { id: productId },
        select: {
          id: true,
          storeId: true,
          sku: true,
          approvedStockQty: true,
          variants: {
            select: {
              id: true,
              sku: true,
              onHandQty: true,
              safetyBuffer: true,
              status: true,
              barcode: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      }),
    loadChannels: async (storeId) => {
      const rows = await db.salesChannel.findMany({ where: { storeId } });
      const channels: BroadcastChannel[] = [];
      for (const row of rows) {
        channels.push({
          id: row.id,
          kind: row.kind,
          status: row.status,
          apiKey: await resolveBroadcastKey(db, storeId, row),
        });
      }
      return channels;
    },
    loadRemoteBarcode: async (storeId, kind, variantId) => {
      if (kind !== "TRENDYOL" && kind !== "HEPSIBURADA") {
        return null;
      }
      const listing = await db.commerceChannelListing.findUnique({
        where: { variantId_channel: { variantId, channel: kind } },
        select: { remoteBarcode: true },
      });
      const remote = listing?.remoteBarcode.trim() ?? "";
      return remote || null;
    },
    fetchImpl: (url, init) => fetch(url, init),
    mark: async (channelId, outcome) => {
      await db.salesChannel.update({
        where: { id: channelId },
        data:
          outcome.status === "PUSHED"
            ? { lastError: "", lastSyncedAt: new Date() }
            : { lastError: outcome.detail.slice(0, 500) },
      });
    },
  };
}

export function liveChannelWebhookDeps(): ChannelWebhookDeps {
  const db = getPrisma();
  return {
    env: process.env,
    findStore: (storeId) =>
      db.commerceStore.findUnique({
        where: { id: storeId },
        select: { id: true, ownerUserId: true },
      }),
    findChannel: (storeId, kind) =>
      db.salesChannel.findUnique({
        where: { storeId_kind: { storeId, kind } },
        select: { apiKeySeal: true },
      }),
    commit: async (input) => {
      const result = await commitChannelOrderPrisma(input);
      if (result.ok) {
        const draft = draftFromChannelEvent({
          storeId: input.storeId,
          channel: input.channel,
          externalOrderId: input.externalOrderId,
          sku: input.sku,
          variantSku: result.variantSku,
          quantity: input.quantity,
          customerLabel: input.customerLabel,
          eventType: input.eventType,
          now: new Date(),
        });
        if (draft) {
          await recordFulfillmentQuiet(draft);
        }
      }
      return result;
    },
    broadcast: (productId, excludeChannel) =>
      broadcastStockToChannels(productId, excludeChannel, liveBroadcastDeps()),
  };
}
