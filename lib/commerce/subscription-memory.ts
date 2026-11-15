import type { CommerceSubscriptionRow, CommerceSubscriptionStore } from "@/lib/commerce/subscription";

function clone(row: CommerceSubscriptionRow): CommerceSubscriptionRow {
  return {
    ...row,
    appliedMerchantOids: [...row.appliedMerchantOids],
    expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export function createMemoryCommerceSubscriptionStore(): CommerceSubscriptionStore {
  const rows: CommerceSubscriptionRow[] = [];
  return {
    async findByStoreId(storeId) {
      const row = rows.find((item) => item.storeId === storeId);
      return row ? clone(row) : null;
    },
    async save(row) {
      const index = rows.findIndex((item) => item.storeId === row.storeId);
      const next = clone(row);
      if (index >= 0) {
        rows[index] = next;
      } else {
        rows.push(next);
      }
      return clone(next);
    },
  };
}
