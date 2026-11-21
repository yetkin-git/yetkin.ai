import "server-only";

import { sellableQty } from "@/lib/commerce/inventory-gate";
import { getPrisma } from "@/lib/kernel/db";

/**
 * Site haritası için kamuya açık vitrin slug'ları.
 *
 * `loadPublicStorefront` (React `cache()`, istek kapsamlı) burada kullanılmaz:
 * site haritası N mağaza için N ayrı sorgu atardı. Tek sorgu, tek projeksiyon.
 *
 * Kural: yalnız `ACTIVE` mağaza. Rafta satılabilir satırı olmayan mağaza da
 * listeye girmez — boş vitrin ince içerik üretir (`/magaza/[slug]` "Rafta henüz
 * satılabilir ürün yok" gövdesini basar).
 *
 * **Fail-safe:** DB yoksa, migration gerideyse veya sorgu hata verirse boş dizi
 * döner. Site haritası üretimi asla bu yüzden düşmez (statik girişler kalır).
 */
export async function listPublicStorefrontSlugs(): Promise<string[]> {
  try {
    const stores = await getPrisma().commerceStore.findMany({
      where: { status: "ACTIVE" },
      select: {
        slug: true,
        products: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            variants: {
              where: { status: "ACTIVE" },
              select: { amountMinor: true, onHandQty: true, safetyBuffer: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 2_000,
    });
    const slugs: string[] = [];
    for (const store of stores) {
      const slug = store.slug.trim();
      if (slug.length === 0) {
        continue;
      }
      const sellable = store.products.some((product) =>
        product.variants.some(
          (variant) =>
            variant.amountMinor !== null &&
            sellableQty(variant.onHandQty, variant.safetyBuffer) > 0,
        ),
      );
      if (sellable) {
        slugs.push(slug);
      }
    }
    return slugs;
  } catch {
    return [];
  }
}
