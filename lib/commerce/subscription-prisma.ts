import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import type { CommerceSubscriptionRow, CommerceSubscriptionStore } from "@/lib/commerce/subscription";

function fromRow(row: {
  id: string;
  storeId: string;
  ownerUserId: string;
  status: "PENDING" | "ACTIVE";
  listPriceMinor: number;
  appliedMerchantOids: string[];
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): CommerceSubscriptionRow {
  return row;
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
          ownerUserId: row.ownerUserId,
          status: row.status,
          listPriceMinor: row.listPriceMinor,
          appliedMerchantOids: row.appliedMerchantOids,
          expiresAt: row.expiresAt,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        },
        update: {
          ownerUserId: row.ownerUserId,
          status: row.status,
          listPriceMinor: row.listPriceMinor,
          appliedMerchantOids: row.appliedMerchantOids,
          expiresAt: row.expiresAt,
        },
      });
      return fromRow(saved);
    },
  };
}
