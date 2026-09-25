import "server-only";

import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { getPaytrCheckoutCredentials } from "@/lib/kernel/payments/paytr/checkout";
import {
  refundUnusedWalletBalance,
  type WalletCardRefundPorts,
  type WalletCardRefundRow,
  type WalletCardRefundStatus,
  type WalletCardRefundStore,
} from "@/lib/kernel/payments/wallet-card-refund";

type RefundDb = {
  id: string;
  merchant_oid: string | null;
  amount_minor: number;
  status: string;
};

function toRow(row: RefundDb): WalletCardRefundRow {
  return {
    id: row.id,
    merchantOid: row.merchant_oid,
    amountMinor: Number(row.amount_minor),
    status: row.status as WalletCardRefundStatus,
  };
}

type RefundSql = Pick<PrismaClient, "$queryRaw" | "$executeRaw">;

export function bindWalletCardRefundStore(db: RefundSql): WalletCardRefundStore {
  return {
    async lockBalanceMinor(userId) {
      const rows = await db.$queryRaw<{ amount_minor: number }[]>`
        SELECT amount_minor
        FROM wallets
        WHERE user_id = ${userId} AND currency_code = ${SETTLEMENT_CURRENCY}
        FOR UPDATE
      `;
      return Number(rows[0]?.amount_minor ?? 0);
    },
    async listClearedOrders(userId) {
      const rows = await db.$queryRaw<{ merchant_oid: string; amount_minor: number }[]>`
        SELECT merchant_oid, amount_minor
        FROM payment_orders
        WHERE user_id = ${userId}
          AND status = 'CLEARED'
          AND currency_code = ${SETTLEMENT_CURRENCY}
        ORDER BY cleared_at DESC NULLS LAST, created_at DESC
      `;
      return rows.map((row) => ({
        merchantOid: row.merchant_oid,
        amountMinor: Number(row.amount_minor),
      }));
    },
    async sumReservedByOid(userId) {
      const rows = await db.$queryRaw<{ merchant_oid: string; reserved: number }[]>`
        SELECT merchant_oid, COALESCE(SUM(amount_minor), 0)::int AS reserved
        FROM wallet_card_refunds
        WHERE user_id = ${userId}
          AND merchant_oid IS NOT NULL
          AND status IN ('PENDING', 'ACCEPTED', 'SUCCEEDED')
        GROUP BY merchant_oid
      `;
      const map: Record<string, number> = {};
      for (const row of rows) {
        map[row.merchant_oid] = Number(row.reserved);
      }
      return map;
    },
    async listOpen(userId) {
      const rows = await db.$queryRaw<RefundDb[]>`
        SELECT id, merchant_oid, amount_minor, status
        FROM wallet_card_refunds
        WHERE user_id = ${userId}
          AND status IN ('PENDING', 'ACCEPTED')
        ORDER BY created_at ASC
      `;
      return rows.map(toRow);
    },
    async insert(input) {
      const id = randomUUID();
      const rows = await db.$queryRaw<RefundDb[]>`
        INSERT INTO wallet_card_refunds (
          id, user_id, merchant_oid, amount_minor, currency_code, status, idempotency_key, detail, created_at
        )
        VALUES (
          ${id},
          ${input.userId},
          ${input.merchantOid},
          ${input.amountMinor},
          ${SETTLEMENT_CURRENCY},
          ${input.status},
          ${input.idempotencyKey},
          ${input.detail ?? null},
          NOW()
        )
        RETURNING id, merchant_oid, amount_minor, status
      `;
      const row = rows[0];
      if (!row) {
        throw new Error("İade kaydı yazılamadı.");
      }
      return toRow(row);
    },
    async mark(id, status, detail, settled) {
      if (settled) {
        await db.$executeRaw`
          UPDATE wallet_card_refunds
          SET status = ${status}, detail = ${detail}, settled_at = NOW()
          WHERE id = ${id}
        `;
        return;
      }
      await db.$executeRaw`
        UPDATE wallet_card_refunds
        SET status = ${status}, detail = ${detail}
        WHERE id = ${id}
      `;
    },
  };
}

export async function refundUnusedWalletBalanceForUser(userId: string): Promise<
  Awaited<ReturnType<typeof refundUnusedWalletBalance>>
> {
  const prisma = getPrisma();
  return prisma.$transaction(
    async (tx) => {
      const ports: WalletCardRefundPorts = {
        refunds: bindWalletCardRefundStore(tx),
        ledger: bindLedgerStore(tx) as LedgerStore,
        paytrConfigured: getPaytrCheckoutCredentials() != null,
      };
      return refundUnusedWalletBalance(ports, userId);
    },
    { maxWait: 10_000, timeout: 20_000 },
  );
}
