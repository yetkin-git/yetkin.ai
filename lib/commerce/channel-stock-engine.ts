import { randomUUID } from "node:crypto";
import { CRITICAL_STOCK_ALERT, OVERSELL_ALERT, type ChannelOrderEvent } from "@/lib/commerce/channel-webhook";
import { isCriticalStock, type OsChannelKind } from "@/lib/commerce/os-rules";

export type StockProductLock = {
  id: string;
  storeId: string;
  sku: string;
  approvedStockQty: number;
  criticalStockQty: number;
};

export type StockLedgerSnap = {
  id: string;
  type: "INBOUND_DRAFT" | "INBOUND_APPROVED" | "CHANNEL_SALE" | "RETURN_RESTOCK";
  quantity: number;
  stockAfter: number;
  note: string;
  idempotencyKey: string;
  externalOrderId: string;
};

export type StockOrderSnap = {
  id: string;
  orderStatus: "OPEN" | "CANCELLED" | "RETURNED" | null;
};

export type StockInboxInsert = {
  storeId: string;
  productId: string;
  channel: OsChannelKind;
  kind: "ORDER" | "STOCK_ALERT";
  externalRef: string;
  customerLabel: string;
  body: string;
  priority: number;
  orderStatus: "OPEN" | "CANCELLED" | "RETURNED" | null;
};

export interface StockUnitOfWork {
  lockProductBySku(storeId: string, sku: string): Promise<StockProductLock | null>;
  findByIdempotency(key: string): Promise<StockLedgerSnap | null>;
  findSale(storeId: string, channel: OsChannelKind, externalOrderId: string): Promise<StockLedgerSnap | null>;
  sumRestocked(storeId: string, channel: OsChannelKind, externalOrderId: string): Promise<number>;
  insertLedger(row: {
    storeId: string;
    productId: string;
    actorUserId: string;
    type: "CHANNEL_SALE" | "RETURN_RESTOCK";
    channel: OsChannelKind;
    quantity: number;
    stockAfter: number;
    note: string;
    idempotencyKey: string;
    externalOrderId: string;
  }): Promise<StockLedgerSnap>;
  setApprovedStock(productId: string, quantity: number): Promise<void>;
  insertInbox(row: StockInboxInsert): Promise<void>;
  findOrder(storeId: string, channel: OsChannelKind, externalOrderId: string): Promise<StockOrderSnap | null>;
  updateOrder(id: string, status: "CANCELLED" | "RETURNED"): Promise<void>;
}

export type ChannelCommitInput = {
  storeId: string;
  actorUserId: string;
  sku: string;
  channel: OsChannelKind;
  eventType: ChannelOrderEvent;
  quantity: number;
  externalOrderId: string;
  customerLabel: string;
};

export type ChannelCommitOk = {
  ok: true;
  replayed: boolean;
  ledgerId: string;
  productId: string;
  externalOrderId: string;
  eventType: ChannelOrderEvent;
  stockAfter: number;
  oversell: boolean;
  orderStatus: "OPEN" | "CANCELLED" | "RETURNED";
};

export type ChannelCommitResult =
  | ChannelCommitOk
  | { ok: false; status: 404 | 409 | 422; error: string };

const INT_MAX = 2_147_483_647;

export function channelEventKey(
  storeId: string,
  channel: OsChannelKind,
  externalOrderId: string,
  eventType: ChannelOrderEvent,
): string {
  return `os-wh:${storeId}:${channel}:${externalOrderId}:${eventType}`;
}

export function stockNote(eventType: ChannelOrderEvent, requested: number, applied: number): string {
  return `event=${eventType} requested=${requested} applied=${applied}`;
}

export function readApplied(note: string, saleQuantity: number): number {
  const match = /(?:^|\s)applied=(\d+)(?:\s|$)/.exec(note);
  if (match?.[1]) {
    return Number(match[1]);
  }
  return saleQuantity < 0 ? Math.abs(saleQuantity) : 0;
}

/** Satış istenen adedi negatife yazar. Onaylı stok 0'ın altına inmez. */
export function planChannelSale(
  current: number,
  critical: number,
  requested: number,
): { applied: number; stockAfter: number; exhausted: boolean; critical: boolean } {
  const applied = Math.max(0, Math.min(current, requested));
  const stockAfter = current - applied;
  return {
    applied,
    stockAfter,
    exhausted: requested > current || stockAfter === 0,
    critical: stockAfter > 0 && isCriticalStock(stockAfter, critical),
  };
}

function replay(row: StockLedgerSnap, eventType: ChannelOrderEvent): ChannelCommitOk {
  const orderStatus =
    eventType === "ORDER_CANCELLED" ? "CANCELLED" : eventType === "ORDER_RETURNED" ? "RETURNED" : "OPEN";
  return {
    ok: true,
    replayed: true,
    ledgerId: row.id,
    productId: "",
    externalOrderId: row.externalOrderId,
    eventType,
    stockAfter: row.stockAfter,
    oversell: false,
    orderStatus,
  };
}

function clip(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}

export async function commitChannelEvent(uow: StockUnitOfWork, input: ChannelCommitInput): Promise<ChannelCommitResult> {
  const product = await uow.lockProductBySku(input.storeId, input.sku);
  if (!product || product.storeId !== input.storeId) {
    return { ok: false, status: 404, error: "Ürün bulunamadı." };
  }
  const key = channelEventKey(input.storeId, input.channel, input.externalOrderId, input.eventType);
  const existing = await uow.findByIdempotency(key);
  if (existing) {
    return replay(existing, input.eventType);
  }

  if (input.eventType === "ORDER_CREATED") {
    const plan = planChannelSale(product.approvedStockQty, product.criticalStockQty, input.quantity);
    const ledger = await uow.insertLedger({
      storeId: input.storeId,
      productId: product.id,
      actorUserId: input.actorUserId,
      type: "CHANNEL_SALE",
      channel: input.channel,
      quantity: -input.quantity,
      stockAfter: plan.stockAfter,
      note: stockNote(input.eventType, input.quantity, plan.applied),
      idempotencyKey: key,
      externalOrderId: input.externalOrderId,
    });
    await uow.setApprovedStock(product.id, plan.stockAfter);
    await uow.insertInbox({
      storeId: input.storeId,
      productId: product.id,
      channel: input.channel,
      kind: "ORDER",
      externalRef: input.externalOrderId,
      customerLabel: input.customerLabel,
      body: clip(`${input.quantity} adet. ${product.sku || input.sku}.`, 2000),
      priority: 0,
      orderStatus: "OPEN",
    });
    if (plan.exhausted) {
      const criticalLine =
        product.criticalStockQty > 0 ? " Kritik stok eşiği aşıldı." : "";
      await uow.insertInbox({
        storeId: input.storeId,
        productId: product.id,
        channel: input.channel,
        kind: "STOCK_ALERT",
        externalRef: input.externalOrderId,
        customerLabel: OVERSELL_ALERT,
        body: clip(
          `${OVERSELL_ALERT}.${criticalLine} İstenen ${input.quantity}, düşülen ${plan.applied}, kalan ${plan.stockAfter}.`,
          2000,
        ),
        priority: 100,
        orderStatus: null,
      });
    } else if (plan.critical) {
      await uow.insertInbox({
        storeId: input.storeId,
        productId: product.id,
        channel: input.channel,
        kind: "STOCK_ALERT",
        externalRef: input.externalOrderId,
        customerLabel: CRITICAL_STOCK_ALERT,
        body: clip(`${CRITICAL_STOCK_ALERT}. Kalan ${plan.stockAfter}, eşik ${product.criticalStockQty}.`, 2000),
        priority: 80,
        orderStatus: null,
      });
    }
    return {
      ok: true,
      replayed: false,
      ledgerId: ledger.id,
      productId: product.id,
      externalOrderId: input.externalOrderId,
      eventType: input.eventType,
      stockAfter: plan.stockAfter,
      oversell: plan.exhausted,
      orderStatus: "OPEN",
    };
  }

  const sale = await uow.findSale(input.storeId, input.channel, input.externalOrderId);
  if (!sale) {
    return { ok: false, status: 409, error: "Satış fişi yok." };
  }
  const applied = readApplied(sale.note, sale.quantity);
  const already = await uow.sumRestocked(input.storeId, input.channel, input.externalOrderId);
  const room = Math.max(0, applied - already);
  const restock = Math.min(input.quantity, room);
  const stockAfter = product.approvedStockQty + restock;
  if (stockAfter > INT_MAX) {
    return { ok: false, status: 422, error: "Stok tavanı aşıldı." };
  }
  const orderStatus = input.eventType === "ORDER_CANCELLED" ? "CANCELLED" : "RETURNED";
  const ledger = await uow.insertLedger({
    storeId: input.storeId,
    productId: product.id,
    actorUserId: input.actorUserId,
    type: "RETURN_RESTOCK",
    channel: input.channel,
    quantity: restock,
    stockAfter,
    note: stockNote(input.eventType, input.quantity, restock),
    idempotencyKey: key,
    externalOrderId: input.externalOrderId,
  });
  if (restock > 0) {
    await uow.setApprovedStock(product.id, stockAfter);
  }
  const order = await uow.findOrder(input.storeId, input.channel, input.externalOrderId);
  if (order) {
    await uow.updateOrder(order.id, orderStatus);
  } else {
    await uow.insertInbox({
      storeId: input.storeId,
      productId: product.id,
      channel: input.channel,
      kind: "ORDER",
      externalRef: input.externalOrderId,
      customerLabel: input.customerLabel,
      body: clip(`${input.quantity} adet. ${orderStatus}.`, 2000),
      priority: 0,
      orderStatus,
    });
  }
  return {
    ok: true,
    replayed: false,
    ledgerId: ledger.id,
    productId: product.id,
    externalOrderId: input.externalOrderId,
    eventType: input.eventType,
    stockAfter,
    oversell: false,
    orderStatus,
  };
}

export function newLedgerId(): string {
  return randomUUID();
}
