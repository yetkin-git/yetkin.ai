import "server-only";

import { randomUUID } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import {
  channelEventKey,
  commitChannelEvent,
  newLedgerId,
  type ChannelCommitInput,
  type ChannelCommitResult,
  type StockProductLock,
  type StockUnitOfWork,
  type StockVariantLock,
  type VariantMovementInput,
  type VariantMovementResult,
  type VariantStockPush,
} from "@/lib/commerce/channel-stock-engine";
import { movementAllowed, nextVariantStatus, sellableQty } from "@/lib/commerce/inventory-gate";
import { channelListingSaleMinor } from "@/lib/commerce/listing-price";
import { applyBundleMemberPlans, BundleMemberStockError } from "@/lib/commerce/set-stock";
import { getPrisma } from "@/lib/kernel/db";

function isUnique(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002";
}

/**
 * Ürünün onaylı stoğunu varyant toplamına çeker.
 *
 * Çağıran ürün satırını kilitlemiştir. Tek yazıcı burasıdır: ürün toplamı
 * **her zaman** varyantların toplamıdır, ayrı türetilmiş hedef değil.
 */
async function syncApprovedTotal(tx: Prisma.TransactionClient, productId: string): Promise<number> {
  const agg = await tx.commerceVariant.aggregate({
    where: { productId },
    _sum: { onHandQty: true },
  });
  const total = Math.max(0, agg._sum.onHandQty ?? 0);
  await tx.commerceProduct.update({ where: { id: productId }, data: { approvedStockQty: total } });
  return total;
}

/**
 * SKU / barkod ile **spesifik varyantı** çözer.
 * Barkod en güçlü sinyaldir (pazaryeri barkodu); sonra varyant SKU'su; en son
 * ürünün kendi SKU'su tek varyantlı kartlarda işe yarar.
 */
function pickVariant(
  variants: readonly (StockVariantLock & { sku: string })[],
  productSku: string,
  sku: string,
  barcode: string | null,
): StockVariantLock | null {
  if (barcode) {
    const byBarcode = variants.find((row) => row.barcode && row.barcode === barcode);
    if (byBarcode) {
      return byBarcode;
    }
  }
  const bySku = variants.find((row) => row.sku === sku);
  if (bySku) {
    return bySku;
  }
  if (productSku && variants.length === 1 && variants[0]!.sku === productSku) {
    return variants[0]!;
  }
  // Ürün SKU'su tek varyanta denk geliyorsa (kart SKU'su = varyant SKU'su).
  const byProductSku = variants.find((row) => row.sku === productSku);
  return byProductSku ?? null;
}

async function moveVariantRow(tx: Prisma.TransactionClient, input: VariantMovementInput): Promise<VariantMovementResult> {
  const rows = await tx.$queryRaw<
    Array<{
      id: string;
      on_hand_qty: number;
      safety_buffer: number;
      status: string;
      amount_minor: number | null;
      barcode: string | null;
    }>
  >`
    SELECT id, on_hand_qty, safety_buffer, status, amount_minor, barcode
    FROM commerce_variants
    WHERE id = ${input.variantId} AND product_id = ${input.productId}
    FOR UPDATE
  `;
  const row = rows[0];
  if (!row) {
    return { outcome: "missing", onHandAfter: 0, productStockAfter: 0, sellableAfter: 0 };
  }
  const priorMovement = await tx.inventoryTransaction.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    select: { onHandAfter: true },
  });
  if (priorMovement) {
    const productStockAfter = await tx.commerceVariant
      .aggregate({ where: { productId: input.productId }, _sum: { onHandQty: true } })
      .then((agg) => Math.max(0, agg._sum.onHandQty ?? 0));
    return {
      outcome: "replay",
      onHandAfter: priorMovement.onHandAfter,
      productStockAfter,
      sellableAfter: sellableQty(priorMovement.onHandAfter, row.safety_buffer),
    };
  }
  if (
    !movementAllowed({
      type: input.type,
      direction: input.direction,
      onHandQty: row.on_hand_qty,
      safetyBuffer: row.safety_buffer,
      quantity: input.quantity,
    })
  ) {
    return {
      outcome: "rejected",
      onHandAfter: row.on_hand_qty,
      productStockAfter: 0,
      sellableAfter: sellableQty(row.on_hand_qty, row.safety_buffer),
    };
  }
  const onHandAfter = input.direction === "IN" ? row.on_hand_qty + input.quantity : row.on_hand_qty - input.quantity;
  const status = nextVariantStatus({
    status: row.status as "DRAFT" | "ACTIVE" | "PASSIVE",
    type: input.type,
    direction: input.direction,
    nextOnHandQty: onHandAfter,
    safetyBuffer: row.safety_buffer,
    amountMinor: row.amount_minor,
    barcode: row.barcode,
  });
  await tx.commerceVariant.update({
    where: { id: input.variantId },
    data: { onHandQty: onHandAfter, status },
  });
  await tx.inventoryTransaction.create({
    data: {
      id: randomUUID(),
      storeId: input.storeId,
      variantId: input.variantId,
      actorUserId: input.actorUserId,
      type: input.type,
      direction: input.direction,
      quantity: input.quantity,
      onHandAfter,
      note: input.note.slice(0, 500),
      idempotencyKey: input.idempotencyKey,
    },
  });
  const productStockAfter = await syncApprovedTotal(tx, input.productId);
  return {
    outcome: "applied",
    onHandAfter,
    productStockAfter,
    sellableAfter: sellableQty(onHandAfter, row.safety_buffer),
  };
}

async function pendingListingPush(
  tx: Prisma.TransactionClient,
  storeId: string,
  variantId: string,
  onHandAfter: number,
): Promise<VariantStockPush | null> {
  const updated = await tx.commerceChannelListing.updateMany({
    where: { storeId, variantId, channel: { in: ["TRENDYOL", "HEPSIBURADA"] } },
    data: { syncStatus: "PENDING", lastError: "" },
  });
  if (updated.count < 1) {
    return null;
  }
  const variant = await tx.commerceVariant.findFirst({
    where: { id: variantId, storeId },
    select: {
      amountMinor: true,
      channelListings: { select: { priceMinor: true } },
    },
  });
  const listed = variant?.channelListings.find((row) => typeof row.priceMinor === "number" && row.priceMinor > 0);
  return {
    variantId,
    onHandAfter,
    amountMinor: channelListingSaleMinor(listed ?? null, variant?.amountMinor ?? null),
    variantAmountMinor: variant?.amountMinor ?? null,
  };
}

function createPrismaStockWork(tx: Prisma.TransactionClient): StockUnitOfWork {
  return {
    async lockProductBySku(storeId, sku, barcode) {
      const lookups: Prisma.CommerceProductWhereInput[] = [{ sku }];
      if (barcode) {
        lookups.unshift({ variants: { some: { barcode } } });
      }
      lookups.push({ variants: { some: { sku } } });
      const found = await tx.commerceProduct.findFirst({
        where: { storeId, OR: lookups },
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
          critical_stock_qty: number;
        }>
      >`
        SELECT id, store_id, sku, critical_stock_qty
        FROM commerce_products
        WHERE id = ${found.id}
        FOR UPDATE
      `;
      const row = rows[0];
      if (!row) {
        return null;
      }
      const variants = await tx.commerceVariant.findMany({
        where: { productId: row.id },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          sku: true,
          barcode: true,
          onHandQty: true,
          safetyBuffer: true,
          status: true,
          amountMinor: true,
        },
      });
      const lock: StockProductLock = {
        id: row.id,
        storeId: row.store_id,
        sku: row.sku || sku,
        criticalStockQty: row.critical_stock_qty,
        variant: pickVariant(variants, row.sku, sku, barcode ?? null),
      };
      return lock;
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
    async applyVariantMovement(input) {
      const moved = await moveVariantRow(tx, input);
      const pushes: VariantStockPush[] = [];
      if (moved.outcome === "applied") {
        const queued = await pendingListingPush(tx, input.storeId, input.variantId, moved.onHandAfter);
        if (queued) {
          pushes.push(queued);
        }
      }
      if (moved.outcome !== "applied" || (input.type !== "SALE" && input.type !== "RETURN")) {
        return pushes.length > 0 ? { ...moved, pushes } : moved;
      }
      const product = await tx.commerceProduct.findUnique({
        where: { id: input.productId },
        select: { attributes: true },
      });
      const expanded = await applyBundleMemberPlans({
        attributes: product?.attributes ?? [],
        quantity: input.quantity,
        idempotencyKey: input.idempotencyKey,
        note: input.note,
        apply: async (draw) => {
          const member = await tx.commerceVariant.findFirst({
            where: { id: draw.variantId, storeId: input.storeId },
            select: { productId: true },
          });
          if (!member) {
            return "missing";
          }
          const memberMoved = await moveVariantRow(tx, {
            storeId: input.storeId,
            productId: member.productId,
            variantId: draw.variantId,
            actorUserId: input.actorUserId,
            type: input.type,
            direction: input.direction,
            quantity: draw.quantity,
            note: draw.note,
            idempotencyKey: draw.idempotencyKey,
          });
          if (memberMoved.outcome === "applied") {
            const queued = await pendingListingPush(tx, input.storeId, draw.variantId, memberMoved.onHandAfter);
            if (queued) {
              pushes.push(queued);
            }
          }
          return memberMoved.outcome;
        },
      });
      if (!expanded.ok) {
        throw new BundleMemberStockError(expanded.status === 409 ? 409 : 422, expanded.error);
      }
      return pushes.length > 0 ? { ...moved, pushes } : moved;
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
    const result = await db.$transaction((tx) => commitChannelEvent(createPrismaStockWork(tx), input));
    if (result.ok && result.queuedPushes && result.queuedPushes.length > 0) {
      const { logTrendyolEnqueueFailure, publishAppliedTrendyolStock } = await import("@/lib/commerce/trendyol-publish");
      for (const push of result.queuedPushes) {
        try {
          await publishAppliedTrendyolStock({
            storeId: input.storeId,
            variantId: push.variantId,
            onHandAfter: push.onHandAfter,
            amountMinor: push.amountMinor,
            variantAmountMinor: push.variantAmountMinor,
          });
        } catch (error) {
          logTrendyolEnqueueFailure(error);
        }
      }
    }
    return result;
  } catch (error) {
    if (error instanceof BundleMemberStockError) {
      return { ok: false, status: error.status, error: error.message };
    }
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
      variantId: "",
      variantSku: "",
      externalOrderId: prior.externalOrderId,
      eventType: input.eventType,
      stockAfter: prior.stockAfter,
      oversell: false,
      orderStatus,
    };
  }
}
