import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import {
  channelEventKey,
  commitChannelEvent,
  newLedgerId,
  type ChannelCommitInput,
  type ChannelCommitResult,
  type StockUnitOfWork,
} from "@/lib/commerce/channel-stock-engine";
import { getPrisma } from "@/lib/kernel/db";

function isUnique(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002";
}

function createPrismaStockWork(tx: Prisma.TransactionClient): StockUnitOfWork {
  return {
    async lockProductBySku(storeId, sku) {
      const found = await tx.commerceProduct.findFirst({
        where: { storeId, OR: [{ sku }, { variants: { some: { sku } } }] },
        select: { id: true },
      });
      if (!found) {
        return null;
      }
      const rows = await tx.$queryRaw<
        Array<{
          id: string;
          store_id: string;
          sku: string;
          approved_stock_qty: number;
          critical_stock_qty: number;
        }>
      >`
        SELECT id, store_id, sku, approved_stock_qty, critical_stock_qty
        FROM commerce_products
        WHERE id = ${found.id}
        FOR UPDATE
      `;
      const row = rows[0];
      if (!row) {
        return null;
      }
      return {
        id: row.id,
        storeId: row.store_id,
        sku: row.sku || sku,
        approvedStockQty: row.approved_stock_qty,
        criticalStockQty: row.critical_stock_qty,
      };
    },
    async findByIdempotency(key) {
      const row = await tx.stockLedger.findUnique({ where: { idempotencyKey: key } });
      return row
        ? {
            id: row.id,
            type: row.type,
            quantity: row.quantity,
            stockAfter: row.stockAfter,
            note: row.note,
            idempotencyKey: row.idempotencyKey,
            externalOrderId: row.externalOrderId,
          }
        : null;
    },
    async findSale(storeId, channel, externalOrderId) {
      const row = await tx.stockLedger.findFirst({
        where: { storeId, channel, externalOrderId, type: "CHANNEL_SALE" },
      });
      return row
        ? {
            id: row.id,
            type: row.type,
            quantity: row.quantity,
            stockAfter: row.stockAfter,
            note: row.note,
            idempotencyKey: row.idempotencyKey,
            externalOrderId: row.externalOrderId,
          }
        : null;
    },
    async sumRestocked(storeId, channel, externalOrderId) {
      const rows = await tx.stockLedger.findMany({
        where: { storeId, channel, externalOrderId, type: "RETURN_RESTOCK" },
        select: { quantity: true },
      });
      return rows.reduce((sum, row) => sum + Math.max(0, row.quantity), 0);
    },
    async insertLedger(row) {
      const created = await tx.stockLedger.create({
        data: {
          id: newLedgerId(),
          storeId: row.storeId,
          productId: row.productId,
          actorUserId: row.actorUserId,
          type: row.type,
          channel: row.channel,
          quantity: row.quantity,
          stockAfter: row.stockAfter,
          note: row.note,
          idempotencyKey: row.idempotencyKey,
          externalOrderId: row.externalOrderId,
        },
      });
      return {
        id: created.id,
        type: created.type,
        quantity: created.quantity,
        stockAfter: created.stockAfter,
        note: created.note,
        idempotencyKey: created.idempotencyKey,
        externalOrderId: created.externalOrderId,
      };
    },
    async setApprovedStock(productId, quantity) {
      await tx.commerceProduct.update({ where: { id: productId }, data: { approvedStockQty: quantity } });
    },
    async insertInbox(row) {
      await tx.commerceInboxEntry.create({
        data: {
          id: newLedgerId(),
          storeId: row.storeId,
          productId: row.productId,
          channel: row.channel,
          kind: row.kind,
          externalRef: row.externalRef,
          customerLabel: row.customerLabel,
          body: row.body,
          priority: row.priority,
          orderStatus: row.orderStatus,
        },
      });
    },
    async findOrder(storeId, channel, externalOrderId) {
      const row = await tx.commerceInboxEntry.findFirst({
        where: { storeId, channel, kind: "ORDER", externalRef: externalOrderId },
        orderBy: { createdAt: "desc" },
        select: { id: true, orderStatus: true },
      });
      return row ? { id: row.id, orderStatus: row.orderStatus } : null;
    },
    async updateOrder(id, status) {
      await tx.commerceInboxEntry.update({ where: { id }, data: { orderStatus: status } });
    },
  };
}

export async function commitChannelOrderPrisma(input: ChannelCommitInput): Promise<ChannelCommitResult> {
  const db = getPrisma();
  try {
    return await db.$transaction((tx) => commitChannelEvent(createPrismaStockWork(tx), input));
  } catch (error) {
    if (!isUnique(error)) {
      throw error;
    }
    const prior = await db.stockLedger.findUnique({
      where: {
        idempotencyKey: channelEventKey(input.storeId, input.channel, input.externalOrderId, input.eventType),
      },
    });
    if (!prior) {
      throw error;
    }
    const orderStatus =
      input.eventType === "ORDER_CANCELLED" ? "CANCELLED" : input.eventType === "ORDER_RETURNED" ? "RETURNED" : "OPEN";
    return {
      ok: true,
      replayed: true,
      ledgerId: prior.id,
      productId: prior.productId,
      externalOrderId: prior.externalOrderId,
      eventType: input.eventType,
      stockAfter: prior.stockAfter,
      oversell: false,
      orderStatus,
    };
  }
}
