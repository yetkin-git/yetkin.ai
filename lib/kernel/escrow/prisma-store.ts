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

export type EscrowWriteDb = Pick<PrismaClient, "escrowHold" | "$queryRaw">;

type LockedHoldRow = {
  id: string;
  wallet_id: string;
  user_id: string;
  reference_key: string;
  status: "PENDING" | "RELEASED" | "REFUNDED";
  currency_code: string;
  gross_minor: number;
  hold_minor: number;
  net_minor: number;
  hold_bps: number;
  created_at: Date;
  released_at: Date | null;
  refunded_at: Date | null;
  expires_at: Date | null;
};

async function selectHoldForUpdate(
  db: EscrowWriteDb,
  referenceKey: string,
): Promise<LockedHoldRow | null> {
  const rows = await db.$queryRaw<LockedHoldRow[]>`
    SELECT id, wallet_id, user_id, reference_key, status, currency_code,
           gross_minor, hold_minor, net_minor, hold_bps,
           created_at, released_at, refunded_at, expires_at
    FROM escrow_holds
    WHERE reference_key = ${referenceKey}
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

function toHoldFromLocked(row: LockedHoldRow): EscrowHoldRecord {
  return toHold({
    id: row.id,
    walletId: row.wallet_id,
    userId: row.user_id,
    referenceKey: row.reference_key,
    status: row.status,
    currencyCode: row.currency_code,
    grossMinor: row.gross_minor,
    holdMinor: row.hold_minor,
    netMinor: row.net_minor,
    holdBps: row.hold_bps,
    createdAt: row.created_at,
    releasedAt: row.released_at,
    refundedAt: row.refunded_at,
    expiresAt: row.expires_at,
  });
}

export function bindEscrowStore(db: EscrowWriteDb): EscrowStore {
  return {
    async findByReferenceKey(referenceKey) {
      const row = await db.escrowHold.findUnique({ where: { referenceKey } });
      return row ? toHold(row) : null;
    },
    async lockByReferenceKey(referenceKey) {
      const row = await selectHoldForUpdate(db, referenceKey);
      return row ? toHoldFromLocked(row) : null;
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
      const result = await db.escrowHold.updateMany({
        where: { id, status: "PENDING" },
        data: { status: "RELEASED", releasedAt: at },
      });
      if (result.count !== 1) {
        throw new Error("Emanet PENDING değilken serbest bırakılamaz.");
      }
      const row = await db.escrowHold.findUnique({ where: { id } });
      if (!row) {
        throw new Error("Emanet yok.");
      }
      return toHold(row);
    },
    async markRefunded(id, at) {
      const result = await db.escrowHold.updateMany({
        where: { id, status: "PENDING" },
        data: { status: "REFUNDED", refundedAt: at },
      });
      if (result.count !== 1) {
        throw new Error("Emanet PENDING değilken iade edilemez.");
      }
      const row = await db.escrowHold.findUnique({ where: { id } });
      if (!row) {
        throw new Error("Emanet yok.");
      }
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
    async listPendingExpiringSoon(now, until) {
      const rows = await db.escrowHold.findMany({
        where: { status: "PENDING", expiresAt: { gt: now, lte: until } },
        take: 50,
        orderBy: { expiresAt: "asc" },
      });
      return rows.map(toHold);
    },
  };
}

export function createPrismaEscrowStore(): EscrowStore {
  return bindEscrowStore(getPrisma());
}
