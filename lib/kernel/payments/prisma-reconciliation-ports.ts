import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";
import { createPrismaPaymentAnomalyStore } from "@/lib/kernel/payments/prisma-anomaly-store";
import { WALLET_TOP_UP_PURPOSE } from "@/lib/kernel/payments/clearing";
import type {
  LedgerReconciliationPorts,
  LedgerReconciliationSnapshot,
} from "@/lib/kernel/payments/ledger-reconciliation";

export type ReconciliationReadDb = Pick<
  PrismaClient,
  "wallet" | "ledgerEntry" | "paymentOrder"
>;

export async function loadLedgerReconciliationSnapshot(
  db: ReconciliationReadDb,
): Promise<LedgerReconciliationSnapshot> {
  const [wallets, ledgerGroups, clearedOrders, topUpCredits] = await Promise.all([
    db.wallet.findMany({
      select: { id: true, userId: true, currencyCode: true, amountMinor: true },
    }),
    db.ledgerEntry.groupBy({
      by: ["walletId", "direction"],
      _sum: { amountMinor: true },
    }),
    db.paymentOrder.findMany({
      where: { status: "CLEARED" },
      select: { id: true, merchantOid: true, amountMinor: true, currencyCode: true },
    }),
    db.ledgerEntry.findMany({
      where: { purpose: WALLET_TOP_UP_PURPOSE, direction: "CREDIT" },
      select: {
        idempotencyKey: true,
        amountMinor: true,
        currencyCode: true,
        direction: true,
        purpose: true,
      },
    }),
  ]);

  return {
    wallets: wallets.map((row) => ({
      walletId: row.id,
      userId: row.userId,
      currencyCode: parseCurrencyCode(row.currencyCode),
      amountMinor: toAmountMinor(row.amountMinor),
    })),
    ledgerSums: ledgerGroups.map((row) => ({
      walletId: row.walletId,
      direction: row.direction,
      amountMinor: toAmountMinor(row._sum.amountMinor ?? 0),
    })),
    clearedOrders: clearedOrders.map((row) => ({
      id: row.id,
      merchantOid: row.merchantOid,
      amountMinor: toAmountMinor(row.amountMinor),
      currencyCode: parseCurrencyCode(row.currencyCode),
    })),
    topUpCredits: topUpCredits.map((row) => ({
      idempotencyKey: row.idempotencyKey,
      amountMinor: toAmountMinor(row.amountMinor),
      currencyCode: parseCurrencyCode(row.currencyCode),
      direction: row.direction,
      purpose: row.purpose,
    })),
  };
}

export function createPrismaLedgerReconciliationPorts(): LedgerReconciliationPorts {
  const prisma = getPrisma();
  return {
    loadSnapshot: () => loadLedgerReconciliationSnapshot(prisma),
    anomalies: createPrismaPaymentAnomalyStore(),
  };
}
