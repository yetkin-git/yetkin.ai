import { ledgerSignedMinor } from "@/lib/kernel/ledger/display";
import {
  recordPaymentAnomaly,
  type PaymentAnomalyStore,
} from "@/lib/kernel/payments/anomaly";
import { WALLET_TOP_UP_PURPOSE } from "@/lib/kernel/payments/clearing";
import { logEvent } from "@/lib/kernel/observability/log";

export type WalletLedgerBalanceRow = {
  walletId: string;
  userId: string;
  currencyCode: string;
  amountMinor: number;
};

export type LedgerDirectionSumRow = {
  walletId: string;
  direction: "CREDIT" | "DEBIT";
  amountMinor: number;
};

export type ClearedPaymentOrderRow = {
  id: string;
  merchantOid: string;
  amountMinor: number;
  currencyCode: string;
};

export type WalletTopUpCreditRow = {
  idempotencyKey: string;
  amountMinor: number;
  currencyCode: string;
  direction: "CREDIT" | "DEBIT";
  purpose: string;
};

export type WalletLedgerDrift = {
  walletId: string;
  userId: string;
  currencyCode: string;
  amountMinor: number;
  ledgerSignedMinor: number;
};

export type ClearedOrderDrift = {
  merchantOid: string;
  orderId: string | null;
  orderMinor: number | null;
  creditMinor: number | null;
  reason: "missing_credit" | "amount_mismatch" | "orphan_credit";
};

export type LedgerReconciliationSnapshot = {
  wallets: readonly WalletLedgerBalanceRow[];
  ledgerSums: readonly LedgerDirectionSumRow[];
  clearedOrders: readonly ClearedPaymentOrderRow[];
  topUpCredits: readonly WalletTopUpCreditRow[];
};

export type LedgerReconciliationPorts = {
  loadSnapshot(): Promise<LedgerReconciliationSnapshot>;
  anomalies: PaymentAnomalyStore;
};

export type LedgerReconciliationScanResult = {
  walletsScanned: number;
  clearedOrdersScanned: number;
  walletDrifts: number;
  clearedOrderDrifts: number;
  anomaliesWritten: number;
};

function signedSumForWallet(
  ledgerSums: readonly LedgerDirectionSumRow[],
  walletId: string,
): number {
  let signed = 0;
  for (const row of ledgerSums) {
    if (row.walletId !== walletId) {
      continue;
    }
    signed += ledgerSignedMinor(row.direction, row.amountMinor);
  }
  return signed;
}

export function evaluateWalletLedgerInvariant(
  wallets: readonly WalletLedgerBalanceRow[],
  ledgerSums: readonly LedgerDirectionSumRow[],
): WalletLedgerDrift[] {
  const drifts: WalletLedgerDrift[] = [];
  for (const wallet of wallets) {
    const ledgerTotal = signedSumForWallet(ledgerSums, wallet.walletId);
    if (wallet.amountMinor !== ledgerTotal) {
      drifts.push({
        walletId: wallet.walletId,
        userId: wallet.userId,
        currencyCode: wallet.currencyCode,
        amountMinor: wallet.amountMinor,
        ledgerSignedMinor: ledgerTotal,
      });
    }
  }
  return drifts;
}

export function evaluateClearedPaymentOrderInvariant(
  orders: readonly ClearedPaymentOrderRow[],
  credits: readonly WalletTopUpCreditRow[],
): ClearedOrderDrift[] {
  const drifts: ClearedOrderDrift[] = [];
  const creditByOid = new Map<string, WalletTopUpCreditRow>();
  for (const credit of credits) {
    if (credit.purpose !== WALLET_TOP_UP_PURPOSE || credit.direction !== "CREDIT") {
      continue;
    }
    const prefix = `${WALLET_TOP_UP_PURPOSE}:`;
    if (!credit.idempotencyKey.startsWith(prefix)) {
      continue;
    }
    const merchantOid = credit.idempotencyKey.slice(prefix.length);
    creditByOid.set(merchantOid, credit);
  }

  const seen = new Set<string>();
  for (const order of orders) {
    seen.add(order.merchantOid);
    const credit = creditByOid.get(order.merchantOid);
    if (!credit) {
      drifts.push({
        merchantOid: order.merchantOid,
        orderId: order.id,
        orderMinor: order.amountMinor,
        creditMinor: null,
        reason: "missing_credit",
      });
      continue;
    }
    if (credit.amountMinor !== order.amountMinor || credit.currencyCode !== order.currencyCode) {
      drifts.push({
        merchantOid: order.merchantOid,
        orderId: order.id,
        orderMinor: order.amountMinor,
        creditMinor: credit.amountMinor,
        reason: "amount_mismatch",
      });
    }
  }

  for (const [merchantOid, credit] of creditByOid) {
    if (seen.has(merchantOid)) {
      continue;
    }
    drifts.push({
      merchantOid,
      orderId: null,
      orderMinor: null,
      creditMinor: credit.amountMinor,
      reason: "orphan_credit",
    });
  }
  return drifts;
}

async function persistDriftAnomalies(
  anomalies: PaymentAnomalyStore,
  walletDrifts: readonly WalletLedgerDrift[],
  orderDrifts: readonly ClearedOrderDrift[],
  requestId: string,
): Promise<number> {
  let written = 0;
  for (const drift of walletDrifts) {
    const recorded = await recordPaymentAnomaly(anomalies, {
      kind: "wallet_ledger_drift",
      merchantOid: `wallet:${drift.walletId}`,
      expectedMinor: drift.ledgerSignedMinor,
      reportedMinor: drift.amountMinor,
      walletId: drift.walletId,
      requestId,
      detail: {
        userId: drift.userId,
        currencyCode: drift.currencyCode,
        amountMinor: drift.amountMinor,
        ledgerSignedMinor: drift.ledgerSignedMinor,
      },
    });
    if (recorded.inserted) {
      written += 1;
    }
    logEvent({
      level: "error",
      event: recorded.inserted
        ? "ledger.reconciliation.drift"
        : "ledger.reconciliation.drift.replay",
      requestId,
      userId: drift.userId,
      amountMinor: drift.amountMinor,
      reason: "wallet_ledger_drift",
      applied: false,
    });
  }
  for (const drift of orderDrifts) {
    const recorded = await recordPaymentAnomaly(anomalies, {
      kind: "cleared_order_mismatch",
      merchantOid: drift.merchantOid,
      expectedMinor: drift.orderMinor,
      reportedMinor: drift.creditMinor,
      orderId: drift.orderId,
      requestId,
      detail: {
        reason: drift.reason,
        orderMinor: drift.orderMinor,
        creditMinor: drift.creditMinor,
      },
    });
    if (recorded.inserted) {
      written += 1;
    }
    logEvent({
      level: "error",
      event: recorded.inserted
        ? "ledger.reconciliation.drift"
        : "ledger.reconciliation.drift.replay",
      requestId,
      merchantOid: drift.merchantOid,
      orderId: drift.orderId ?? undefined,
      amountMinor: drift.orderMinor ?? drift.creditMinor ?? undefined,
      reason: `cleared_order_mismatch:${drift.reason}`,
      applied: false,
    });
  }
  return written;
}

/**
 * `Wallet.amountMinor == Σ(CREDIT) − Σ(DEBIT)` ve CLEARED PaymentOrder CREDIT uyumu.
 * Sapmada cüzdan düzeltilmez; yalnız anomali + alarm.
 */
export async function runLedgerReconciliationScan(
  ports: LedgerReconciliationPorts,
  requestId: string = "ledger-reconciliation",
): Promise<LedgerReconciliationScanResult> {
  const snapshot = await ports.loadSnapshot();
  const walletDrifts = evaluateWalletLedgerInvariant(snapshot.wallets, snapshot.ledgerSums);
  const orderDrifts = evaluateClearedPaymentOrderInvariant(
    snapshot.clearedOrders,
    snapshot.topUpCredits,
  );
  const anomaliesWritten = await persistDriftAnomalies(
    ports.anomalies,
    walletDrifts,
    orderDrifts,
    requestId,
  );
  return {
    walletsScanned: snapshot.wallets.length,
    clearedOrdersScanned: snapshot.clearedOrders.length,
    walletDrifts: walletDrifts.length,
    clearedOrderDrifts: orderDrifts.length,
    anomaliesWritten,
  };
}

export function ledgerReconciliationScanResult(
  scanned: LedgerReconciliationScanResult,
): LedgerReconciliationScanResult {
  return scanned;
}
