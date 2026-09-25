import { randomUUID } from "node:crypto";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { ConflictError } from "@/lib/kernel/http/errors";
import {
  formatPaytrReturnAmount,
  requestPaytrRefund,
  type PaytrRefundCallResult,
} from "@/lib/kernel/payments/paytr/refund";

export const WALLET_CARD_REFUND_PURPOSE = "wallet-card-refund" as const;

export const WALLET_REFUND_NONE = "İade edilecek kullanılmamış bakiye yok.";
export const WALLET_REFUND_IN_PROGRESS = "Kart iadesi sürüyor. Biraz sonra yenile.";
export const WALLET_REFUND_UNCOVERED =
  "Bakiyenin kart siparişine bağlanamayan kısmı var. İade talebi kayda geçti; bakiye düşmedi.";

export type WalletCardRefundStatus = "PENDING" | "ACCEPTED" | "SUCCEEDED" | "FAILED" | "REQUESTED";

export type RefundableCardOrder = {
  merchantOid: string;
  amountMinor: number;
};

export type WalletCardRefundSlice = {
  merchantOid: string;
  amountMinor: number;
};

/**
 * Kullanılmamış bakiye, en yeni CLEARED siparişten geriye doğru karta bölünür.
 * Siparişte daha önce iade edilmiş kuruş oda bırakmaz.
 */
export function allocateUnusedBalanceRefund(
  balanceMinor: number,
  ordersNewestFirst: readonly RefundableCardOrder[],
  alreadyReservedMinorByOid: Readonly<Record<string, number>>,
): WalletCardRefundSlice[] {
  let remaining = balanceMinor;
  const slices: WalletCardRefundSlice[] = [];
  for (const order of ordersNewestFirst) {
    if (remaining <= 0) {
      break;
    }
    const reserved = alreadyReservedMinorByOid[order.merchantOid] ?? 0;
    const room = order.amountMinor - reserved;
    if (room <= 0) {
      continue;
    }
    const take = Math.min(room, remaining);
    slices.push({ merchantOid: order.merchantOid, amountMinor: take });
    remaining -= take;
  }
  return slices;
}

export function walletCardRefundLedgerKey(refundId: string): string {
  return `${WALLET_CARD_REFUND_PURPOSE}:${refundId}`;
}

export type WalletCardRefundRow = {
  id: string;
  merchantOid: string | null;
  amountMinor: number;
  status: WalletCardRefundStatus;
};

export type WalletCardRefundStore = {
  lockBalanceMinor(userId: string): Promise<number>;
  listClearedOrders(userId: string): Promise<RefundableCardOrder[]>;
  sumReservedByOid(userId: string): Promise<Record<string, number>>;
  listOpen(userId: string): Promise<WalletCardRefundRow[]>;
  insert(input: {
    userId: string;
    merchantOid: string | null;
    amountMinor: number;
    status: WalletCardRefundStatus;
    idempotencyKey: string;
    detail?: string | null;
  }): Promise<WalletCardRefundRow>;
  mark(
    id: string,
    status: WalletCardRefundStatus,
    detail: string | null,
    settled: boolean,
  ): Promise<void>;
};

export type WalletCardRefundPorts = {
  refunds: WalletCardRefundStore;
  ledger: LedgerStore;
  callPaytr?: (input: { merchantOid: string; amountMinor: number }) => Promise<PaytrRefundCallResult>;
  paytrConfigured?: boolean;
};

export type WalletCardRefundResult = {
  refundedMinor: number;
  requestedMinor: number;
  balanceMinor: number;
  slices: number;
};

function assertNoOpenRefund(open: readonly WalletCardRefundRow[]): void {
  if (open.some((row) => row.status === "PENDING" || row.status === "ACCEPTED")) {
    throw new ConflictError(WALLET_REFUND_IN_PROGRESS);
  }
}

async function debitAccepted(
  ports: WalletCardRefundPorts,
  userId: string,
  row: WalletCardRefundRow,
): Promise<void> {
  await appendLedgerEntry(ports.ledger, {
    userId,
    currencyCode: SETTLEMENT_CURRENCY,
    amountMinor: toPositiveAmountMinor(row.amountMinor),
    direction: "DEBIT",
    label: "Karta iade",
    purpose: WALLET_CARD_REFUND_PURPOSE,
    idempotencyKey: walletCardRefundLedgerKey(row.id),
  });
  await ports.refunds.mark(row.id, "SUCCEEDED", null, true);
}

/**
 * Kullanılmamış cüzdan bakiyesini PayTR iade servisine böler.
 * Kart onayından önce defter düşmez. Kimlik yoksa talep satırı açılır, bakiye durur.
 */
export async function refundUnusedWalletBalance(
  ports: WalletCardRefundPorts,
  userId: string,
): Promise<WalletCardRefundResult> {
  const open = await ports.refunds.listOpen(userId);
  const accepted = open.filter((row) => row.status === "ACCEPTED");
  for (const row of accepted) {
    await debitAccepted(ports, userId, row);
  }
  assertNoOpenRefund(await ports.refunds.listOpen(userId));

  const balanceMinor = await ports.refunds.lockBalanceMinor(userId);
  if (balanceMinor <= 0) {
    throw new ConflictError(WALLET_REFUND_NONE);
  }

  const orders = await ports.refunds.listClearedOrders(userId);
  const reserved = await ports.refunds.sumReservedByOid(userId);
  const slices = allocateUnusedBalanceRefund(balanceMinor, orders, reserved);
  const covered = slices.reduce((sum, slice) => sum + slice.amountMinor, 0);
  const uncovered = balanceMinor - covered;
  const configured = ports.paytrConfigured !== false;
  const callPaytr = ports.callPaytr ?? requestPaytrRefund;

  if (!configured || slices.length === 0) {
    const requestAmount = balanceMinor;
    await ports.refunds.insert({
      userId,
      merchantOid: slices[0]?.merchantOid ?? null,
      amountMinor: requestAmount,
      status: "REQUESTED",
      idempotencyKey: `${WALLET_CARD_REFUND_PURPOSE}:request:${userId}:${randomUUID()}`,
      detail: slices.length === 0 ? "card_order_missing" : "paytr_unconfigured",
    });
    return {
      refundedMinor: 0,
      requestedMinor: balanceMinor,
      balanceMinor,
      slices: 0,
    };
  }

  let refundedMinor = 0;
  for (const slice of slices) {
    formatPaytrReturnAmount(slice.amountMinor);
    const row = await ports.refunds.insert({
      userId,
      merchantOid: slice.merchantOid,
      amountMinor: slice.amountMinor,
      status: "PENDING",
      idempotencyKey: `${WALLET_CARD_REFUND_PURPOSE}:${slice.merchantOid}:${randomUUID()}`,
    });
    const paytr = await callPaytr({ merchantOid: slice.merchantOid, amountMinor: slice.amountMinor });
    if (!paytr.ok) {
      await ports.refunds.mark(row.id, "FAILED", paytr.message, true);
      break;
    }
    await ports.refunds.mark(row.id, "ACCEPTED", paytr.returnAmount, false);
    await debitAccepted(ports, userId, { ...row, status: "ACCEPTED" });
    refundedMinor += slice.amountMinor;
  }

  if (uncovered > 0) {
    await ports.refunds.insert({
      userId,
      merchantOid: null,
      amountMinor: uncovered,
      status: "REQUESTED",
      idempotencyKey: `${WALLET_CARD_REFUND_PURPOSE}:uncovered:${userId}:${randomUUID()}`,
      detail: WALLET_REFUND_UNCOVERED,
    });
  }

  const nextBalance = await ports.refunds.lockBalanceMinor(userId);
  return {
    refundedMinor,
    requestedMinor: uncovered,
    balanceMinor: nextBalance,
    slices: slices.length,
  };
}
