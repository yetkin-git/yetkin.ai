import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";
import type {
  AppendLedgerCommand,
  LedgerEntryRecord,
  LedgerStore,
  WalletSnapshot,
} from "@/lib/kernel/ledger/types";
import type { AmountMinor } from "@/lib/kernel/money/amount-minor";

function toSnapshot(row: {
  id: string;
  userId: string;
  currencyCode: string;
  amountMinor: number;
}): WalletSnapshot {
  return {
    id: row.id,
    userId: row.userId,
    currencyCode: parseCurrencyCode(row.currencyCode),
    amountMinor: toAmountMinor(row.amountMinor),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

export type LedgerWriteDb = Pick<PrismaClient, "wallet" | "ledgerEntry" | "$queryRaw">;

type LockedWalletRow = {
  id: string;
  user_id: string;
  currency_code: string;
  amount_minor: number;
};

async function selectWalletForUpdate(
  db: LedgerWriteDb,
  userId: string,
  currencyCode: string,
): Promise<LockedWalletRow | null> {
  const rows = await db.$queryRaw<LockedWalletRow[]>`
    SELECT id, user_id, currency_code, amount_minor
    FROM wallets
    WHERE user_id = ${userId} AND currency_code = ${currencyCode}
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

export function bindLedgerStore(db: LedgerWriteDb): LedgerStore {
  return {
    async lockWallet(userId, currencyCode) {
      const locked = await selectWalletForUpdate(db, userId, currencyCode);
      if (locked) {
        return toSnapshot({
          id: locked.id,
          userId: locked.user_id,
          currencyCode: locked.currency_code,
          amountMinor: locked.amount_minor,
        });
      }
      try {
        const created = await db.wallet.create({
          data: { userId, currencyCode, amountMinor: 0 },
        });
        const afterCreate = await selectWalletForUpdate(db, userId, currencyCode);
        if (afterCreate) {
          return toSnapshot({
            id: afterCreate.id,
            userId: afterCreate.user_id,
            currencyCode: afterCreate.currency_code,
            amountMinor: afterCreate.amount_minor,
          });
        }
        return toSnapshot(created);
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error;
        }
      }
      const raced = await selectWalletForUpdate(db, userId, currencyCode);
      if (!raced) {
        throw new Error("Cüzdan kilitlenemedi.");
      }
      return toSnapshot({
        id: raced.id,
        userId: raced.user_id,
        currencyCode: raced.currency_code,
        amountMinor: raced.amount_minor,
      });
    },
    async findByIdempotencyKey(idempotencyKey) {
      const row = await db.ledgerEntry.findUnique({ where: { idempotencyKey } });
      if (!row) {
        return null;
      }
      const record: LedgerEntryRecord = {
        id: row.id,
        walletId: row.walletId,
        userId: row.userId,
        amountMinor: toAmountMinor(row.amountMinor),
        currencyCode: parseCurrencyCode(row.currencyCode),
        direction: row.direction,
        label: row.label,
        purpose: row.purpose,
        idempotencyKey: row.idempotencyKey,
        createdAt: row.createdAt,
      };
      return record;
    },
    async insertEntry(wallet, command: AppendLedgerCommand, nextBalance: AmountMinor) {
      await db.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          userId: command.userId,
          amountMinor: command.amountMinor,
          currencyCode: command.currencyCode,
          direction: command.direction,
          label: command.label,
          purpose: command.purpose,
          idempotencyKey: command.idempotencyKey,
        },
      });
      await db.wallet.update({
        where: { id: wallet.id },
        data: { amountMinor: nextBalance },
      });
    },
  };
}

export function createPrismaLedgerStore(): LedgerStore {
  return bindLedgerStore(getPrisma());
}
