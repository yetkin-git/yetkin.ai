import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import { emitTransactionNotice } from "@/lib/kernel/observability/transaction-notice";
import { classifyPaymentOrderPurpose, ledgerCreditLineForOrder, PAYMENT_ORDER_PURPOSE } from "@/lib/kernel/payments/order-purpose";

export const WALLET_TOP_UP_PURPOSE = "wallet-top-up" as const;

export function walletTopUpLedgerIdempotencyKey(merchantOid: string): string {
  return `${WALLET_TOP_UP_PURPOSE}:${merchantOid}`;
}

export class PaymentOrderCasError extends Error {
  readonly expectedStatus: string;
  constructor(expectedStatus: string) {
    super(`Ödeme emri CAS: beklenen ${expectedStatus}.`);
    this.name = "PaymentOrderCasError";
    this.expectedStatus = expectedStatus;
  }
}

export function isPaymentOrderCasError(error: unknown): error is PaymentOrderCasError {
  return error instanceof PaymentOrderCasError;
}

export type PaymentOrderSnapshot = {
  id: string;
  /**
   * Faz 3 / §4.1 — misafir ödeme. Ödeme alınmadan hesap açılmaz; bu yüzden misafir
   * siparişinde `null`'dır. Sahiplik `/claim/[token]` akışında bağlanır. Defter
   * (`appendLedgerEntry`) sahipsiz CREDIT kabul etmez: `null` iken clearing yalnız
   * durum yazar, CREDIT'i claim anına bırakır.
   */
  userId: string | null;
  merchantOid: string;
  amountMinor: number;
  currencyCode: CurrencyCode;
  status: "PENDING" | "PAID" | "FAILED" | "CLEARED";
  createdAt: Date;
  /** Sipariş niyeti. Akademi kasası `academy-license:{slug}`; düz yükleme `wallet-top-up`. */
  purpose?: string;
  consentVersion?: string | null;
  distanceContractAccepted?: boolean | null;
  digitalImmediatePerformanceAccepted?: boolean | null;
};

export type OrderPaymentSnapshot = PaymentOrderSnapshot & { userId: string };

/**
 * Faz 3 / §4.1 — sahipli sipariş daraltması.
 *
 * Misafir siparişinde `userId` null'dır ve hiçbir lisansa bağlanamaz. Dikey
 * kancalar tek satırlık bu kapıyla erken döner; her dosyada `order.userId!`
 * yazmak yerine tip daralması tek yerde durur.
 */
export function isOwnedPaymentOrder(order: PaymentOrderSnapshot): order is OrderPaymentSnapshot {
  return typeof order.userId === "string" && order.userId.length > 0;
}

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
  /**
   * Faz 3 / §4.1 — misafir sipariş. `userId === null` olduğu için defter CREDIT'i
   * **yazılmadı**; sipariş PAID→CLEARED kapandı ama bakiye `/claim/[token]` anında
   * yazılacak. Bu bayrak `true` iken çağıran "para cüzdana düştü" demez.
   */
  awaitingClaim: boolean;
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
 * FAILED satır tutar eşleşirse geç paid recovery (revive + clearing).
 *
 * Faz 3 / §4.1 — misafir siparişinde `userId` null'dır. `appendLedgerEntry` sahipsiz
 * kayıt kabul etmediği için CREDIT **yazılmaz**: durum PAID→CLEARED kapanır,
 * `awaitingClaim = true` döner ve para `/claim/[token]` sahiplenmesinde cüzdana girer.
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
      return { order, applied: false, awaitingClaim: order.userId === null };
    }
    if (options.expectedAmountMinor != null) {
      assertPaymentOrderAmountMatches(order.amountMinor, options.expectedAmountMinor);
    }

    if (order.userId === null) {
      // Misafir: defter sahipsiz satır yazmaz. Yalnız durum kapanır.
      const guestPaid = order.status === "PAID" ? order : await tx.orders.markPaid(order.id, now);
      const guestCleared = await tx.orders.markCleared(guestPaid.id, now);
      return { order: guestCleared, applied: false, awaitingClaim: true };
    }

    const amountMinor = toPositiveAmountMinor(order.amountMinor);
    // Ş3 / B-03 — defter satırı sipariş niyetini taşır. 1.490 TL'lik dosya satışı
    // "Cüzdan yükleme" diye yazılmaz; ürün kendi etiketiyle görünür.
    const line = ledgerCreditLineForOrder({ purpose: order.purpose, merchantOid: order.merchantOid });
    await appendLedgerEntry(tx.ledger, {
      userId: order.userId,
      currencyCode: order.currencyCode,
      amountMinor,
      direction: "CREDIT",
      label: line.label,
      purpose: line.purpose,
      idempotencyKey: line.idempotencyKey,
    });

    const paid = order.status === "PAID" ? order : await tx.orders.markPaid(order.id, now);
    const cleared = await tx.orders.markCleared(paid.id, now);
    // `markCleared` sonrası `userId` hâlâ dolu olmalı (misafir yolu yukarıda döndü).
    const noticeUserId = cleared.userId ?? order.userId;
    if (noticeUserId) {
      // Ürün satışı cüzdan yüklemesi bildirimi basmaz: kullanıcı dosya/paket aldı.
      const productKind =
        classifyPaymentOrderPurpose(cleared.purpose) === PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER ||
        classifyPaymentOrderPurpose(cleared.purpose) === PAYMENT_ORDER_PURPOSE.HIBE_AGENCY ||
        classifyPaymentOrderPurpose(cleared.purpose) === PAYMENT_ORDER_PURPOSE.CAREER_PUBLICATION ||
        classifyPaymentOrderPurpose(cleared.purpose) === PAYMENT_ORDER_PURPOSE.KURUMSAL_SCREENING ||
        classifyPaymentOrderPurpose(cleared.purpose) === PAYMENT_ORDER_PURPOSE.ACADEMY_LICENSE ||
        classifyPaymentOrderPurpose(cleared.purpose) === PAYMENT_ORDER_PURPOSE.JUNIOR_LICENSE;
      emitTransactionNotice({
        kind: productKind ? "product_paid" : "wallet_cleared",
        userId: noticeUserId,
        amountMinor,
        reference: cleared.merchantOid,
        applied: true,
      });
    }
    return { order: cleared, applied: true, awaitingClaim: false };
  });
}

/**
 * FAILED bildirimi. PSP tutarı olmadan CREDIT yazılmaz.
 * Yalnız PENDING kapanır; PAID/CLEARED/FAILED ezilmez.
 */
export async function failPaymentOrder(
  orders: PaymentOrderStore,
  merchantOid: string,
  now: Date = new Date(),
): Promise<{ order: PaymentOrderSnapshot; applied: boolean }> {
  const order = await orders.findByMerchantOid(merchantOid);
  if (!order) {
    throw new Error("Ödeme emri bulunamadı.");
  }
  if (order.status !== "PENDING") {
    return { order, applied: false };
  }
  const failed = await orders.markFailed(order.id, now);
  return { order: failed, applied: true };
}
