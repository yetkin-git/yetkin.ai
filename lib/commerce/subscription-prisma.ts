import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import type { CommerceSubscriptionRow, CommerceSubscriptionStore } from "@/lib/commerce/subscription";

function fromRow(row: {
  id: string;
  storeId: string;
  ownerUserId: string;
  status: CommerceSubscriptionRow["status"];
  listPriceMinor: number;
  appliedMerchantOids: string[];
  expiresAt: Date | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  paytrUtoken: string;
  paytrCtoken: string;
  dunningAttempts: number;
  lastDunningAt: Date | null;
  trialPending: boolean;
  trialQuestionsUsed: number;
  trialOptimizationsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}): CommerceSubscriptionRow {
  return row;
}

function writeData(row: CommerceSubscriptionRow) {
  return {
    ownerUserId: row.ownerUserId,
    status: row.status,
    listPriceMinor: row.listPriceMinor,
    appliedMerchantOids: row.appliedMerchantOids,
    expiresAt: row.expiresAt,
    trialEndsAt: row.trialEndsAt ?? null,
    currentPeriodEnd: row.currentPeriodEnd ?? row.expiresAt,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd ?? false,
    paytrUtoken: row.paytrUtoken ?? "",
    paytrCtoken: row.paytrCtoken ?? "",
    dunningAttempts: row.dunningAttempts ?? 0,
    lastDunningAt: row.lastDunningAt ?? null,
    trialPending: row.trialPending ?? false,
    trialQuestionsUsed: row.trialQuestionsUsed ?? 0,
    trialOptimizationsUsed: row.trialOptimizationsUsed ?? 0,
  };
}

export function createPrismaCommerceSubscriptionStore(): CommerceSubscriptionStore {
  const db = getPrisma();
  return {
    async findByStoreId(storeId) {
      const row = await db.commerceSubscription.findUnique({ where: { storeId } });
      return row ? fromRow(row) : null;
    },
    async save(row) {
      const saved = await db.commerceSubscription.upsert({
        where: { storeId: row.storeId },
        create: {
          id: row.id,
          storeId: row.storeId,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          ...writeData(row),
        },
        update: writeData(row),
      });
      return fromRow(saved);
    },
  };
}
