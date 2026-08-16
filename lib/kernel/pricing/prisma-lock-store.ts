import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";
import type { CheckoutPriceLockStore } from "@/lib/kernel/pricing/lock-store";
import type { CheckoutPriceLockSnapshot } from "@/lib/kernel/pricing/price-lock";

function toLock(row: {
  id: string;
  userId: string;
  lockKey: string;
  moduleKey: string;
  unitKey: string;
  amountMinor: number;
  currencyCode: string;
  catalogMinor: number;
  expiresAt: Date;
  consumedAt: Date | null;
}): CheckoutPriceLockSnapshot {
  return {
    id: row.id,
    userId: row.userId,
    lockKey: row.lockKey,
    moduleKey: row.moduleKey,
    unitKey: row.unitKey,
    amountMinor: toAmountMinor(row.amountMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
    catalogMinor: toAmountMinor(row.catalogMinor),
    expiresAt: row.expiresAt,
    consumedAt: row.consumedAt,
  };
}

export type CheckoutPriceLockWriteDb = Pick<PrismaClient, "checkoutPriceLock">;

export function bindCheckoutPriceLockStore(db: CheckoutPriceLockWriteDb): CheckoutPriceLockStore {
  return {
    async findById(id) {
      const row = await db.checkoutPriceLock.findUnique({ where: { id } });
      return row ? toLock(row) : null;
    },
    async findByUserAndLockKey(userId, lockKey) {
      const row = await db.checkoutPriceLock.findUnique({
        where: { userId_lockKey: { userId, lockKey } },
      });
      return row ? toLock(row) : null;
    },
    async upsertLock(input) {
      const row = await db.checkoutPriceLock.upsert({
        where: { userId_lockKey: { userId: input.userId, lockKey: input.lockKey } },
        create: {
          id: input.id,
          userId: input.userId,
          lockKey: input.lockKey,
          moduleKey: input.moduleKey,
          unitKey: input.unitKey,
          amountMinor: input.amountMinor,
          currencyCode: input.currencyCode,
          catalogMinor: input.catalogMinor,
          expiresAt: input.expiresAt,
          consumedAt: input.consumedAt ?? null,
        },
        update: {
          moduleKey: input.moduleKey,
          unitKey: input.unitKey,
          amountMinor: input.amountMinor,
          currencyCode: input.currencyCode,
          catalogMinor: input.catalogMinor,
          expiresAt: input.expiresAt,
          consumedAt: input.consumedAt ?? null,
        },
      });
      return toLock(row);
    },
    async markConsumed(id, at) {
      const row = await db.checkoutPriceLock.update({
        where: { id },
        data: { consumedAt: at },
      });
      return toLock(row);
    },
  };
}

export function createPrismaCheckoutPriceLockStore(): CheckoutPriceLockStore {
  return bindCheckoutPriceLockStore(getPrisma());
}
