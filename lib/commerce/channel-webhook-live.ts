import "server-only";

import { broadcastStockToChannels, type BroadcastDeps } from "@/lib/commerce/channel-broadcast";
import { commitChannelOrderPrisma } from "@/lib/commerce/channel-stock-prisma";
import type { ChannelWebhookDeps } from "@/lib/commerce/channel-webhook-handler";
import { COMMERCE_CREDENTIAL_SEAL_PREFIX, openCommerceCredential } from "@/lib/commerce/credential-seal";
import { channelNeedsKey } from "@/lib/commerce/os-rules";
import { getPrisma } from "@/lib/kernel/db";

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

export function liveBroadcastDeps(): BroadcastDeps {
  const db = getPrisma();
  return {
    loadProduct: (productId) =>
      db.commerceProduct.findUnique({
        where: { id: productId },
        select: { id: true, storeId: true, sku: true, approvedStockQty: true },
      }),
    loadChannels: async (storeId) => {
      const rows = await db.salesChannel.findMany({ where: { storeId } });
      return rows.map((row) => ({
        id: row.id,
        kind: row.kind,
        status: row.status,
        apiKey: channelNeedsKey(row.kind) ? openKey(row.apiKeySeal, storeId, row.kind) : null,
      }));
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
    commit: (input) => commitChannelOrderPrisma(input),
    broadcast: (productId, excludeChannel) =>
      broadcastStockToChannels(productId, excludeChannel, liveBroadcastDeps()),
  };
}
