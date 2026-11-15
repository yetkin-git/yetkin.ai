import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import {
  projectStorefront,
  type StorefrontProduct,
  type StorefrontVariant,
  type StorefrontView,
} from "@/lib/commerce/storefront";

/** Kamu vitrin. Sahip oturumu aranmaz. Taslak ve eksik adres aynı boş dönüştür. */
export async function loadPublicStorefront(slug: string): Promise<StorefrontView | null> {
  const store = await getPrisma().commerceStore.findUnique({
    where: { slug },
    include: {
      products: { include: { variants: true } },
    },
  });
  if (!store) {
    return null;
  }
  const products: StorefrontProduct[] = store.products.map((product) => ({
    id: product.id,
    storeId: product.storeId,
    title: product.title,
    description: product.description,
    category: product.category,
    status: product.status,
  }));
  const variants: StorefrontVariant[] = store.products.flatMap((product) =>
    product.variants.map((variant) => ({
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      amountMinor: variant.amountMinor,
      onHandQty: variant.onHandQty,
      safetyBuffer: variant.safetyBuffer,
      status: variant.status,
    })),
  );
  return projectStorefront({
    store: {
      id: store.id,
      name: store.name,
      slug: store.slug,
      status: store.status,
      whatsappE164: store.whatsappE164,
    },
    products,
    variants,
  });
}
