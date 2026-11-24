import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { prefillFromStore, type StoreHibePrefill } from "@/lib/yetkinhibe/store-prefill";

const STORE_ID = /^[A-Za-z0-9_-]{8,80}$/;

/** Mağaza sahibi değilsen ön doldurma yoktur. Başka hesabın kategorisi okunmaz. */
export async function readStoreHibePrefill(userId: string, storeId: string): Promise<StoreHibePrefill | null> {
  const id = storeId.trim();
  if (!STORE_ID.test(id)) {
    return null;
  }
  try {
    const store = await getPrisma().commerceStore.findFirst({
      where: { id, ownerUserId: userId },
      select: {
        name: true,
        products: {
          select: { category: true },
          orderBy: { createdAt: "desc" },
          take: 80,
        },
      },
    });
    if (!store) {
      return null;
    }
    return prefillFromStore({
      storeName: store.name,
      categories: store.products.map((row) => row.category),
    });
  } catch {
    return null;
  }
}
