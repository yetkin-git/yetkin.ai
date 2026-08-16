import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";
import type { EscrowHoldRecord, EscrowStore } from "@/lib/kernel/escrow/types";

function toHold(row: {
  id: string;
  walletId: string;
  userId: string;
  referenceKey: string;
  status: "PENDING" | "RELEASED" | "REFUNDED";
  currencyCode: string;
  grossMinor: number;
  holdMinor: number;
  netMinor: number;
  holdBps: number;
  createdAt: Date;
  releasedAt: Date | null;
  refundedAt: Date | null;
  expiresAt: Date | null;
}): EscrowHoldRecord {
  return {
    id: row.id,
    walletId: row.walletId,
    userId: row.userId,
    referenceKey: row.referenceKey,
    status: row.status,
    currencyCode: parseCurrencyCode(row.currencyCode),
    grossMinor: toAmountMinor(row.grossMinor),
    holdMinor: toAmountMinor(row.holdMinor),
    netMinor: toAmountMinor(row.netMinor),
    holdBps: row.holdBps,
    createdAt: row.createdAt,
    releasedAt: row.releasedAt,
    refundedAt: row.refundedAt,
    expiresAt: row.expiresAt,
  };
}

export type EscrowWriteDb = Pick<PrismaClient, "escrowHold">;

export function bindEscrowStore(db: EscrowWriteDb): EscrowStore {
  return {
    async findByReferenceKey(referenceKey) {
      const row = await db.escrowHold.findUnique({ where: { referenceKey } });
      return row ? toHold(row) : null;
    },
    async findById(id) {
      const row = await db.escrowHold.findUnique({ where: { id } });
      return row ? toHold(row) : null;
    },
    async insertHold(input) {
      const row = await db.escrowHold.create({
        data: {
          id: input.id,
          walletId: input.walletId,
          userId: input.userId,
          referenceKey: input.referenceKey,
          currencyCode: input.currencyCode,
          grossMinor: input.grossMinor,
          holdMinor: input.holdMinor,
          netMinor: input.netMinor,
          holdBps: input.holdBps,
          expiresAt: input.expiresAt,
        },
      });
      return toHold(row);
    },
    async markReleased(id, at) {
      const row = await db.escrowHold.update({
        where: { id },
        data: { status: "RELEASED", releasedAt: at },
      });
      return toHold(row);
    },
    async markRefunded(id, at) {
      const row = await db.escrowHold.update({
        where: { id },
        data: { status: "REFUNDED", refundedAt: at },
      });
      return toHold(row);
    },
    async freezeExpiry(id) {
      const row = await db.escrowHold.update({
        where: { id },
        data: { expiresAt: null },
      });
      return toHold(row);
    },
    async listExpiredPending(now) {
      const rows = await db.escrowHold.findMany({
        where: { status: "PENDING", expiresAt: { lte: now } },
      });
      return rows.map(toHold);
    },
  };
}

export function createPrismaEscrowStore(): EscrowStore {
  return bindEscrowStore(getPrisma());
}
