import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";
import type {
  ClearPaymentOrderPorts,
  PaymentOrderSnapshot,
  PaymentOrderStore,
} from "@/lib/kernel/payments/clearing";

export type PaymentOrderWriteDb = Pick<PrismaClient, "paymentOrder">;

function toOrder(row: {
  id: string;
  userId: string;
  merchantOid: string;
  amountMinor: number;
  currencyCode: string;
  status: PaymentOrderSnapshot["status"];
  createdAt: Date;
}): PaymentOrderSnapshot {
  return {
    id: row.id,
    userId: row.userId,
    merchantOid: row.merchantOid,
    amountMinor: row.amountMinor,
    currencyCode: parseCurrencyCode(row.currencyCode),
    status: row.status,
    createdAt: row.createdAt,
  };
}

export function bindPaymentOrderStore(db: PaymentOrderWriteDb): PaymentOrderStore {
  return {
    async findByMerchantOid(merchantOid) {
      const row = await db.paymentOrder.findUnique({ where: { merchantOid } });
      return row ? toOrder(row) : null;
    },
    async markPaid(id, at) {
      const row = await db.paymentOrder.update({
        where: { id },
        data: { status: "PAID", paidAt: at },
      });
      return toOrder(row);
    },
    async markCleared(id, at) {
      const row = await db.paymentOrder.update({
        where: { id },
        data: { status: "CLEARED", clearedAt: at, clearingStatus: "cleared" },
      });
      return toOrder(row);
    },
    async markFailed(id, at) {
      const row = await db.paymentOrder.update({
        where: { id },
        data: { status: "FAILED", updatedAt: at },
      });
      return toOrder(row);
    },
    async listUnclearedPaid() {
      const rows = await db.paymentOrder.findMany({ where: { status: "PAID" } });
      return rows.map(toOrder);
    },
  };
}

export function createPrismaPaymentOrderStore(): PaymentOrderStore {
  return bindPaymentOrderStore(getPrisma());
}

export function createPrismaClearingPorts(): ClearPaymentOrderPorts {
  const prisma = getPrisma();
  return {
    ledger: bindLedgerStore(prisma),
    orders: bindPaymentOrderStore(prisma),
    async runClearingAtomic(work) {
      return prisma.$transaction((tx) =>
        work({
          ledger: bindLedgerStore(tx),
          orders: bindPaymentOrderStore(tx),
        }),
      );
    },
  };
}
