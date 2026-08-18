import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import { emitTransactionNotice } from "@/lib/kernel/observability/transaction-notice";

export type PaymentOrderSnapshot = {
  id: string;
  userId: string;
  merchantOid: string;
  amountMinor: number;
  currencyCode: CurrencyCode;
  status: "PENDING" | "PAID" | "FAILED" | "CLEARED";
  createdAt: Date;
};

export type PaymentOrderStore = {
  findByMerchantOid(merchantOid: string): Promise<PaymentOrderSnapshot | null>;
  markPaid(id: string, at: Date): Promise<PaymentOrderSnapshot>;
  markCleared(id: string, at: Date): Promise<PaymentOrderSnapshot>;
  markFailed(id: string, at: Date): Promise<PaymentOrderSnapshot>;
  listUnclearedPaid(now: Date): Promise<PaymentOrderSnapshot[]>;
};

export type ClearPaymentOrderWritePorts = {
  ledger: LedgerStore;
  orders: PaymentOrderStore;
};

export type ClearPaymentOrderPorts = ClearPaymentOrderWritePorts & {
  runClearingAtomic?: <T>(work: (tx: ClearPaymentOrderWritePorts) => Promise<T>) => Promise<T>;
};

export type ClearPaymentOrderResult = {
  order: PaymentOrderSnapshot;
  applied: boolean;
};

export type ClearSuccessfulPaymentOrderOptions = {
  expectedAmountMinor?: number;
};

export function assertPaymentOrderAmountMatches(
  orderAmountMinor: number,
  expectedAmountMinor: number,
): void {
  if (orderAmountMinor !== expectedAmountMinor) {
    throw new Error("Ödeme tutarı sipariş ile eşleşmiyor.");
  }
}

async function withClearingAtomic<T>(
  ports: ClearPaymentOrderPorts,
  work: (tx: ClearPaymentOrderWritePorts) => Promise<T>,
): Promise<T> {
  if (ports.runClearingAtomic) {
    return ports.runClearingAtomic(work);
  }
  return work({ ledger: ports.ledger, orders: ports.orders });
}

/**
 * PayTR webhook birincil; Inngest yedek yalnız PSP doğrulamasından sonra.
 * Aynı merchantOid ikinci kez bakiyeyi değiştirmez.
 * Prisma: payment_orders FOR UPDATE + LedgerEntry.idempotency_key unique
 * (`wallet-top-up:{merchantOid}`) + CLEARED kısa devre.
 * Ledger CREDIT + markPaid + markCleared aynı store biriminde (Prisma: $transaction).
 */
export async function clearSuccessfulPaymentOrder(
  ports: ClearPaymentOrderPorts,
  merchantOid: string,
  now: Date = new Date(),
  options: ClearSuccessfulPaymentOrderOptions = {},
): Promise<ClearPaymentOrderResult> {
  return withClearingAtomic(ports, async (tx) => {
    const order = await tx.orders.findByMerchantOid(merchantOid);
    if (!order) {
      throw new Error("Ödeme emri bulunamadı.");
    }
    if (order.status === "CLEARED") {
      return { order, applied: false };
    }
    if (order.status === "FAILED") {
      throw new Error("Başarısız ödeme emri temizlenemez.");
    }
    if (options.expectedAmountMinor != null) {
      assertPaymentOrderAmountMatches(order.amountMinor, options.expectedAmountMinor);
    }

    const amountMinor = toPositiveAmountMinor(order.amountMinor);
    await appendLedgerEntry(tx.ledger, {
      userId: order.userId,
      currencyCode: order.currencyCode,
      amountMinor,
      direction: "CREDIT",
      label: "Cüzdan yükleme",
      purpose: "wallet-top-up",
      idempotencyKey: `wallet-top-up:${order.merchantOid}`,
    });

    const paid = order.status === "PAID" ? order : await tx.orders.markPaid(order.id, now);
    const cleared = await tx.orders.markCleared(paid.id, now);
    emitTransactionNotice({
      kind: "wallet_cleared",
      userId: cleared.userId,
      amountMinor,
      reference: cleared.merchantOid,
      applied: true,
    });
    return { order: cleared, applied: true };
  });
}

export async function failPaymentOrder(
  orders: PaymentOrderStore,
  merchantOid: string,
  now: Date = new Date(),
): Promise<{ order: PaymentOrderSnapshot; applied: boolean }> {
  const order = await orders.findByMerchantOid(merchantOid);
  if (!order) {
    throw new Error("Ödeme emri bulunamadı.");
  }
  if (order.status === "FAILED") {
    return { order, applied: false };
  }
  if (order.status === "CLEARED") {
    throw new Error("Temizlenmiş ödeme emri başarısız işaretlenemez.");
  }
  if (order.status === "PAID") {
    throw new Error("Ödenmiş emir bu yoldan başarısız işaretlenemez.");
  }
  const failed = await orders.markFailed(order.id, now);
  return { order: failed, applied: true };
}
