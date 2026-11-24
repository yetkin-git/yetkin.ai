import { randomUUID } from "node:crypto";
import { CRITICAL_STOCK_ALERT, OVERSELL_ALERT, type ChannelOrderEvent } from "@/lib/commerce/channel-webhook";
import { isCriticalStock, type OsChannelKind } from "@/lib/commerce/os-rules";

/** Kanal satışının yazılacağı **spesifik** varyant. Ürün seviyesinde dağıtım yoktur. */
export type StockVariantLock = {
  id: string;
  sku: string;
  barcode: string | null;
  onHandQty: number;
  safetyBuffer: number;
  status: string;
  amountMinor: number | null;
};

export type StockProductLock = {
  id: string;
  storeId: string;
  sku: string;
  criticalStockQty: number;
  /** SKU / barkod ile eşleşen varyant. Ürün bulundu ama varyant çözülemediyse null. */
  variant: StockVariantLock | null;
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

export type VariantMovementInput = {
  storeId: string;
  productId: string;
  variantId: string;
  actorUserId: string;
  type: "SALE" | "RETURN" | "ADJUSTMENT";
  direction: "IN" | "OUT";
  quantity: number;
  note: string;
  idempotencyKey: string;
};

export type VariantStockPush = {
  variantId: string;
  onHandAfter: number;
  amountMinor: number | null;
  variantAmountMinor?: number | null;
};

export type VariantMovementResult = {
  outcome: "applied" | "replay" | "rejected" | "missing";
  /** Varyantın hareket sonrası eldeki adedi. */
  onHandAfter: number;
  /** Ürünün tüm varyantlar toplamı — `approved_stock_qty` ile senkron. */
  productStockAfter: number;
  /** Varyantta elde kalan satılabilir adet (eldeli − güvenlik payı). */
  sellableAfter: number;
  /** Stoğu değişen varyantlar (satılan kart ve set üyeleri). */
  pushes?: VariantStockPush[];
};

export interface StockUnitOfWork {
  /** Ürün satırını kilitler ve SKU / barkod ile **spesifik varyantı** çözer. */
  lockProductBySku(
    storeId: string,
    sku: string,
    barcode?: string | null,
  ): Promise<StockProductLock | null>;
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
  /**
   * Varyant bazlı stok hareketi. Ürünün `approved_stock_qty` değeri hareketten
   * sonra **tüm varyantların toplamına** senkronize edilir. İlk varyanta dağıtım yoktur.
   */
  applyVariantMovement(input: VariantMovementInput): Promise<VariantMovementResult>;
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
  /** Pazaryeri barkodu. Verilirse SKU'dan önce denenir: barkod varyantı belirler. */
  barcode?: string | null;
};

export type ChannelCommitOk = {
  ok: true;
  replayed: boolean;
  ledgerId: string;
  productId: string;
  /** Stoktan düşülen varyant. Ürün seviyesi değil, satılan **beden/barkod**. */
  variantId: string;
  variantSku: string;
  externalOrderId: string;
  eventType: ChannelOrderEvent;
  stockAfter: number;
  oversell: boolean;
  orderStatus: "OPEN" | "CANCELLED" | "RETURNED";
  /** Pazaryeri ilanı PENDING olan varyantlar. Boşsa alan yazılmaz. */
  queuedPushes?: VariantStockPush[];
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

/** Defter notu. Varyant kimliği notta durur; iade aynı varyanta geri yazar. */
export function stockNote(
  eventType: ChannelOrderEvent,
  requested: number,
  applied: number,
  variantId = "",
): string {
  const base = `event=${eventType} requested=${requested} applied=${applied}`;
  return variantId ? `${base} variant=${variantId}` : base;
}

export function readApplied(note: string, saleQuantity: number): number {
  const match = /(?:^|\s)applied=(\d+)(?:\s|$)/.exec(note);
  if (match?.[1]) {
    return Number(match[1]);
  }
  return saleQuantity < 0 ? Math.abs(saleQuantity) : 0;
}

/** Defter notundaki varyant kimliği. Eski fişlerde yoksa boş metin. */
export function readVariantId(note: string): string {
  const match = /(?:^|\s)variant=([A-Za-z0-9_-]{1,64})(?:\s|$)/.exec(note);
  return match?.[1] ?? "";
}

/**
 * Satış planı — **varyantın** eldeki adedi ve güvenlik payı üzerinden.
 * `planChannelSale` ürün toplamı içindir; kanal satışı bu fonksiyonu kullanır.
 */
export function planVariantSale(
  onHandQty: number,
  safetyBuffer: number,
  requested: number,
): { applied: number; onHandAfter: number; sellableAfter: number; exhausted: boolean; short: boolean } {
  const sellable = Math.max(0, onHandQty - Math.max(0, safetyBuffer));
  const applied = Math.max(0, Math.min(sellable, requested));
  const onHandAfter = onHandQty - applied;
  return {
    applied,
    onHandAfter,
    sellableAfter: Math.max(0, onHandAfter - Math.max(0, safetyBuffer)),
    exhausted: applied < requested || onHandAfter <= 0,
    short: requested > sellable,
  };
}

/** Ürün toplamı üzerinden satış planı (eski sözleşme; ürün seviyesi çağrılar için). */
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
    variantId: readVariantId(row.note),
    variantSku: "",
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
  const product = await uow.lockProductBySku(input.storeId, input.sku, input.barcode ?? null);
  if (!product || product.storeId !== input.storeId) {
    return { ok: false, status: 404, error: "Ürün bulunamadı." };
  }
  const variant = product.variant;
  if (!variant) {
    // Ürün var, satılan beden yok. Rastgele bir varyanta yazmak aşırı satış demektir.
    return { ok: false, status: 422, error: "Varyant kimliği eşleşmedi." };
  }
  const key = channelEventKey(input.storeId, input.channel, input.externalOrderId, input.eventType);
  const existing = await uow.findByIdempotency(key);
  if (existing) {
    return replay(existing, input.eventType);
  }

  if (input.eventType === "ORDER_CREATED") {
    const plan = planVariantSale(variant.onHandQty, variant.safetyBuffer, input.quantity);
    if (plan.applied < 1) {
      // Hiç düşülemeyecek satışta defter yazılmaz; aşırı satış uyarısı düşer.
      await uow.insertInbox({
        storeId: input.storeId,
        productId: product.id,
        channel: input.channel,
        kind: "STOCK_ALERT",
        externalRef: input.externalOrderId,
        customerLabel: OVERSELL_ALERT,
        body: clip(
          `${OVERSELL_ALERT}. ${variant.sku} için istenen ${input.quantity}, satılabilir ${Math.max(0, variant.onHandQty - variant.safetyBuffer)}.`,
          2000,
        ),
        priority: 100,
        orderStatus: null,
      });
      return { ok: false, status: 409, error: OVERSELL_ALERT };
    }
    const moved = await uow.applyVariantMovement({
      storeId: input.storeId,
      productId: product.id,
      variantId: variant.id,
      actorUserId: input.actorUserId,
      type: "SALE",
      direction: "OUT",
      quantity: plan.applied,
      note: stockNote(input.eventType, input.quantity, plan.applied, variant.id),
      idempotencyKey: key,
    });
    const ledger = await uow.insertLedger({
      storeId: input.storeId,
      productId: product.id,
      actorUserId: input.actorUserId,
      type: "CHANNEL_SALE",
      channel: input.channel,
      quantity: -plan.applied,
      stockAfter: moved.productStockAfter,
      note: stockNote(input.eventType, input.quantity, plan.applied, variant.id),
      idempotencyKey: key,
      externalOrderId: input.externalOrderId,
    });
    await uow.insertInbox({
      storeId: input.storeId,
      productId: product.id,
      channel: input.channel,
      kind: "ORDER",
      externalRef: input.externalOrderId,
      customerLabel: input.customerLabel,
      body: clip(`${input.quantity} adet. ${variant.sku || input.sku}.`, 2000),
      priority: 0,
      orderStatus: "OPEN",
    });
    const critical = isCriticalStock(moved.productStockAfter, product.criticalStockQty);
    if (plan.short || moved.outcome === "rejected") {
      const criticalLine = product.criticalStockQty > 0 ? " Kritik stok eşiği aşıldı." : "";
      await uow.insertInbox({
        storeId: input.storeId,
        productId: product.id,
        channel: input.channel,
        kind: "STOCK_ALERT",
        externalRef: input.externalOrderId,
        customerLabel: OVERSELL_ALERT,
        body: clip(
          `${OVERSELL_ALERT}.${criticalLine} İstenen ${input.quantity}, düşülen ${plan.applied}, ${variant.sku} kalan ${moved.onHandAfter}.`,
          2000,
        ),
        priority: 100,
        orderStatus: null,
      });
    } else if (critical) {
      await uow.insertInbox({
        storeId: input.storeId,
        productId: product.id,
        channel: input.channel,
        kind: "STOCK_ALERT",
        externalRef: input.externalOrderId,
        customerLabel: CRITICAL_STOCK_ALERT,
        body: clip(
          `${CRITICAL_STOCK_ALERT}. Kalan ${moved.productStockAfter}, eşik ${product.criticalStockQty}.`,
          2000,
        ),
        priority: 80,
        orderStatus: null,
      });
    }
    return attachQueue(
      {
        ok: true,
        replayed: false,
        ledgerId: ledger.id,
        productId: product.id,
        variantId: variant.id,
        variantSku: variant.sku,
        externalOrderId: input.externalOrderId,
        eventType: input.eventType,
        stockAfter: moved.productStockAfter,
        oversell: plan.short,
        orderStatus: "OPEN",
      },
      moved.pushes,
    );
  }

  const sale = await uow.findSale(input.storeId, input.channel, input.externalOrderId);
  if (!sale) {
    return { ok: false, status: 409, error: "Satış fişi yok." };
  }
  const applied = readApplied(sale.note, sale.quantity);
  const already = await uow.sumRestocked(input.storeId, input.channel, input.externalOrderId);
  const room = Math.max(0, applied - already);
  const restock = Math.min(input.quantity, room);
  let productStockAfter = 0;
  let variantOnHandAfter = variant.onHandQty;
  let movedPushes: VariantStockPush[] | undefined;
  if (restock > 0) {
    const moved = await uow.applyVariantMovement({
      storeId: input.storeId,
      productId: product.id,
      variantId: variant.id,
      actorUserId: input.actorUserId,
      type: "RETURN",
      direction: "IN",
      quantity: restock,
      note: stockNote(input.eventType, input.quantity, restock, variant.id),
      idempotencyKey: key,
    });
    if (moved.outcome === "rejected" || moved.outcome === "missing") {
      return { ok: false, status: 422, error: "İade stoğu yazılamadı." };
    }
    productStockAfter = moved.productStockAfter;
    variantOnHandAfter = moved.onHandAfter;
    movedPushes = moved.pushes;
    if (productStockAfter > INT_MAX) {
      return { ok: false, status: 422, error: "Stok tavanı aşıldı." };
    }
  }
  const orderStatus = input.eventType === "ORDER_CANCELLED" ? "CANCELLED" : "RETURNED";
  const ledger = await uow.insertLedger({
    storeId: input.storeId,
    productId: product.id,
    actorUserId: input.actorUserId,
    type: "RETURN_RESTOCK",
    channel: input.channel,
    quantity: restock,
    stockAfter: productStockAfter,
    note: stockNote(input.eventType, input.quantity, restock, variant.id),
    idempotencyKey: key,
    externalOrderId: input.externalOrderId,
  });
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
  return attachQueue(
    {
      ok: true,
      replayed: false,
      ledgerId: ledger.id,
      productId: product.id,
      variantId: variant.id,
      variantSku: variant.sku,
      externalOrderId: input.externalOrderId,
      eventType: input.eventType,
      stockAfter: productStockAfter || variantOnHandAfter,
      oversell: false,
      orderStatus,
    },
    restock > 0 ? movedPushes : undefined,
  );
}

function attachQueue(row: ChannelCommitOk, pushes: VariantStockPush[] | undefined): ChannelCommitOk {
  if (!pushes || pushes.length === 0) {
    return row;
  }
  return { ...row, queuedPushes: pushes };
}

export function newLedgerId(): string {
  return randomUUID();
}
