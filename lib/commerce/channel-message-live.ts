import "server-only";

import { randomUUID } from "node:crypto";
import type { ChannelMessageDeps } from "@/lib/commerce/channel-message-handler";
import type { ChannelMessageInsert, ChannelMessageRow } from "@/lib/commerce/channel-message-engine";
import { getPrisma } from "@/lib/kernel/db";

export function liveChannelMessageDeps(): ChannelMessageDeps {
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
    messages: {
      findByKey: async (key) => {
        const row = await db.commerceInboxEntry.findUnique({
          where: { idempotencyKey: key },
          select: { id: true, productId: true, kind: true, externalRef: true },
        });
        if (!row || (row.kind !== "CUSTOMER_QUESTION" && row.kind !== "PRODUCT_REVIEW")) {
          return null;
        }
        return {
          id: row.id,
          productId: row.productId,
          eventType: row.kind,
          externalMessageId: row.externalRef,
        } satisfies ChannelMessageRow;
      },
      findProduct: async (storeId, sku, externalProductId) => {
        if (sku) {
          const bySku = await db.commerceProduct.findFirst({
            where: { storeId, OR: [{ sku }, { variants: { some: { sku } } }] },
            select: { id: true },
          });
          if (bySku) {
            return bySku;
          }
        }
        if (!externalProductId) {
          return null;
        }
        const listing = await db.commerceChannelListing.findFirst({
          where: { storeId, remoteProductId: externalProductId },
          select: { variant: { select: { productId: true } } },
        });
        if (listing) {
          return { id: listing.variant.productId };
        }
        return db.commerceProduct.findFirst({
          where: { storeId, id: externalProductId },
          select: { id: true },
        });
      },
      insert: async (row: ChannelMessageInsert) => {
        const created = await db.commerceInboxEntry.create({
          data: {
            id: randomUUID(),
            storeId: row.storeId,
            productId: row.productId,
            channel: row.channel,
            kind: row.eventType,
            externalRef: row.externalMessageId,
            customerLabel: row.customerLabel,
            body: row.body,
            priority: row.priority,
            idempotencyKey: row.idempotencyKey,
            messageStatus: "OPEN",
          },
          select: { id: true, productId: true, kind: true, externalRef: true },
        });
        return {
          id: created.id,
          productId: created.productId,
          eventType: created.kind === "PRODUCT_REVIEW" ? "PRODUCT_REVIEW" : "CUSTOMER_QUESTION",
          externalMessageId: created.externalRef,
        };
      },
    },
  };
}
