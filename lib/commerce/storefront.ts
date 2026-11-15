import { sellableQty } from "@/lib/commerce/inventory-gate";
import type { ProductStatus, StoreStatus, VariantStatus } from "@/lib/commerce/types";

export type StorefrontStore = {
  id: string;
  name: string;
  slug: string;
  status: StoreStatus;
  whatsappE164: string | null;
};

export type StorefrontProduct = {
  id: string;
  storeId: string;
  title: string;
  description: string;
  category: string;
  status: ProductStatus;
};

export type StorefrontVariant = {
  id: string;
  productId: string;
  sku: string;
  amountMinor: number | null;
  onHandQty: number;
  safetyBuffer: number;
  status: VariantStatus;
};

export type StorefrontLine = {
  productId: string;
  title: string;
  description: string;
  category: string;
  variantId: string;
  sku: string;
  amountMinor: number;
  sellableQty: number;
  orderUrl: string | null;
};

export type StorefrontView = {
  name: string;
  slug: string;
  lines: StorefrontLine[];
};

export function whatsappOrderUrl(e164: string, title: string, sku: string): string {
  const text = `${title} ${sku}`.replace(/\s+/g, " ").trim().slice(0, 300);
  return `https://wa.me/${e164}?text=${encodeURIComponent(text)}`;
}

export function formatTryMinor(amountMinor: number): string {
  const abs = Math.abs(amountMinor);
  const lira = Math.floor(abs / 100).toLocaleString("tr-TR");
  const kurus = String(abs % 100).padStart(2, "0");
  const sign = amountMinor < 0 ? "-" : "";
  return `${sign}${lira},${kurus} TRY`;
}

/**
 * Aktif mağaza, aktif ürün, fiyatlı aktif varyant ve satılabilir adet.
 * Lisans bu projeksiyona girmez. Ham stok ve güvenlik payı çıkmaz.
 */
export function projectStorefront(input: {
  store: StorefrontStore;
  products: readonly StorefrontProduct[];
  variants: readonly StorefrontVariant[];
}): StorefrontView | null {
  if (input.store.status !== "ACTIVE") {
    return null;
  }
  const lines: StorefrontLine[] = [];
  for (const product of input.products) {
    if (product.storeId !== input.store.id || product.status !== "ACTIVE") {
      continue;
    }
    for (const variant of input.variants) {
      if (variant.productId !== product.id || variant.status !== "ACTIVE" || variant.amountMinor == null) {
        continue;
      }
      const available = sellableQty(variant.onHandQty, variant.safetyBuffer);
      if (available <= 0) {
        continue;
      }
      lines.push({
        productId: product.id,
        title: product.title,
        description: product.description,
        category: product.category,
        variantId: variant.id,
        sku: variant.sku,
        amountMinor: variant.amountMinor,
        sellableQty: available,
        orderUrl: input.store.whatsappE164
          ? whatsappOrderUrl(input.store.whatsappE164, product.title, variant.sku)
          : null,
      });
    }
  }
  return { name: input.store.name, slug: input.store.slug, lines };
}
