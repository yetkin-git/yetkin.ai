/**
 * Tek stok gerçeği yardımcıları.
 *
 * Onaylı ürün stoğu (`commerce_products.approved_stock_qty`) varyantların eldeki
 * adetlerinin toplamıdır. Yazım yolları (`INVENTORY_MOVE_SQL`, bellek deposu,
 * kanal satışı, onay) bu dosyadaki kuralları kullanır.
 *
 * Bu dosya veritabanı istemcisi içermez; yalnız tip import eder. İstemci
 * tarafında ve testlerde serbestçe okunabilir.
 */
import type { Prisma } from "@/generated/prisma/client";

/** Veritabanı işlemcisi: yalnız varyant okuma ve ürün yazma gerekir. */
export type StockSyncClient = Pick<Prisma.TransactionClient, "commerceVariant" | "commerceProduct">;

/** Eldeki adetlerin toplamı. Veritabanındaki `SUM(on_hand_qty)` ile aynı tanım. */
export function sumVariantOnHand(variants: readonly { onHandQty: number }[]): number {
  let total = 0;
  for (const row of variants) {
    total += row.onHandQty;
  }
  return total;
}

/** Ürün SKU'su boşsa ilk dolu varyant SKU'su. Hiçbiri yoksa boş metin. */
export function effectiveSku(productSku: string, variants: readonly { sku: string }[]): string {
  const own = productSku.trim();
  if (own) {
    return own;
  }
  for (const row of variants) {
    const sku = row.sku.trim();
    if (sku) {
      return sku;
    }
  }
  return "";
}

/**
 * Kanala ve kokpite giden onaylı adet. Onaylı alan doluysa o; sıfırsa varyant toplamı.
 * Eski, varyantla eşitlenmemiş kartlar için yedek yoldur.
 */
export function effectiveApprovedQty(approvedStockQty: number, variants: readonly { onHandQty: number }[]): number {
  return approvedStockQty > 0 ? approvedStockQty : Math.max(0, sumVariantOnHand(variants));
}

/** Onay ve kanal artışı hedefi: ilk aktif varyant; aktif yoksa ilk varyant. */
export function inboundTargetVariant<T extends { status: string }>(variants: readonly T[]): T | undefined {
  return variants.find((row) => row.status === "ACTIVE") ?? variants[0];
}

const RESTOCK_VARIANT_NOTE = /^variant:([A-Za-z0-9_-]{1,64})$/;

/** RESTOCK taslağının hedef varyantı. Onay bu notu okur. */
export function restockTargetNote(variantId: string): string {
  return `variant:${variantId}`;
}

export function readRestockTargetVariantId(note: string): string | null {
  const match = RESTOCK_VARIANT_NOTE.exec(note.trim());
  return match?.[1] ?? null;
}

/** Taslak beden satılmaz. Durum yazılmamış eski çağrılar aday kalır. */
function restockEligible(status: string | undefined): boolean {
  if (status == null || status === "") {
    return true;
  }
  return status === "ACTIVE" || status === "PASSIVE";
}

/**
 * Kritik stok girişi hangi bedene yazılır.
 * Yalnız ACTIVE ve PASSIVE. En düşük satılabilir adet kazanır; eşitlikte listedeki ilk beden kalır.
 */
export function criticalRestockVariantId(
  variants: readonly { id?: string; onHandQty: number; safetyBuffer?: number; status?: string }[],
): string | null {
  let chosen: { id: string; sellable: number } | null = null;
  for (const row of variants) {
    if (!row.id || !restockEligible(row.status)) {
      continue;
    }
    const sellable = row.onHandQty - (row.safetyBuffer ?? 0);
    if (!chosen || sellable < chosen.sellable) {
      chosen = { id: row.id, sellable };
    }
  }
  return chosen?.id ?? null;
}

/**
 * Taslak onayı. Not hedef varyant taşıyorsa o beden; taşıyorsa ve yoksa red.
 * Not boşsa ilk aktif beden.
 */
export function resolveInboundVariant<T extends { id: string; status: string }>(
  variants: readonly T[],
  note: string,
): { ok: true; variant: T } | { ok: false; reason: "none" | "missing-target" } {
  const targetId = readRestockTargetVariantId(note);
  if (targetId) {
    const variant = variants.find((row) => row.id === targetId);
    return variant ? { ok: true, variant } : { ok: false, reason: "missing-target" };
  }
  const variant = inboundTargetVariant(variants);
  return variant ? { ok: true, variant } : { ok: false, reason: "none" };
}

/** `inboundTargetVariant` ile aynı seçimin dizin karşılığı. Liste boşsa 0. */
export function inboundTargetIndex(variants: readonly { status?: string }[]): number {
  const active = variants.findIndex((row) => row.status === "ACTIVE");
  return active >= 0 ? active : 0;
}

/**
 * Onaylı stok hedefini varyantlara dağıtır. Girdi `createdAt` artan sıradadır.
 *
 * - Hedef toplamdan küçükse fark ilk varyanttan başlayarak düşülür; her varyant
 *   0'ın altına inmez, kalan fark sonrakine geçer.
 * - Hedef toplamdan büyükse fark tek bir varyanta eklenir: ilk aktif varyant, yoksa ilk.
 * - Varyant yoksa boş liste döner; çağıran ürün alanını hedefe çeker.
 *
 * Dönen dizi girdiyle aynı sırada, yeni eldeki adetleri verir.
 *
 * **Yalnız ürün seviyesi onay/stok girişi** için. Kanal satışı bu yolu kullanmaz:
 * satılan beden bilinmeden dağıtım yapmak aşırı satış üretir (bkz. `channel-stock-engine.ts`).
 */
export function distributeApprovedTarget(
  variants: readonly { onHandQty: number; status?: string }[],
  target: number,
): number[] {
  const next = variants.map((row) => row.onHandQty);
  if (next.length === 0) {
    return next;
  }
  const goal = Math.max(0, Math.trunc(target) || 0);
  const delta = goal - sumVariantOnHand(variants);
  if (delta > 0) {
    const index = inboundTargetIndex(variants);
    next[index] = (next[index] ?? 0) + delta;
  } else if (delta < 0) {
    let remaining = -delta;
    for (let index = 0; index < next.length && remaining > 0; index += 1) {
      const current = Math.max(0, next[index] ?? 0);
      const take = Math.min(current, remaining);
      next[index] = current - take;
      remaining -= take;
    }
  }
  return next;
}

/**
 * Ürünün onaylı stoğunu varyant toplamına çeker ve yeni değeri döner.
 *
 * Çağıran, ürün satırını bu işlemden önce kilitlemiş olmalıdır
 * (`SELECT ... FOR UPDATE`). Aksi hâlde eşzamanlı bir varyant yazımı kaybolabilir.
 */
export async function syncApprovedStockFromVariants(tx: StockSyncClient, productId: string): Promise<number> {
  const variants = await tx.commerceVariant.findMany({
    where: { productId },
    select: { onHandQty: true },
  });
  const total = Math.max(0, sumVariantOnHand(variants));
  await tx.commerceProduct.update({
    where: { id: productId },
    data: { approvedStockQty: total },
  });
  return total;
}
