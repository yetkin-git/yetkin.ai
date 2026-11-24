import "server-only";

import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import {
  INVENTORY_MOVE_SQL,
  type InventoryMoveSqlRow,
} from "@/lib/commerce/inventory-sql";
import { getPrisma } from "@/lib/kernel/db";
import { CommerceWriteConflict, type CommerceRepository } from "@/lib/commerce/repository";
import type {
  CatalogAttribute,
  CatalogSource,
  CommerceMarket,
  InventoryDirection,
  InventoryType,
  MoveCommand,
  MoveResult,
  MovementRow,
  ProductRow,
  ProductStatus,
  StoreRow,
  StoreStatus,
  VariantRow,
  VariantStatus,
} from "@/lib/commerce/types";

type CommerceDb = {
  commerceStore: PrismaClient["commerceStore"];
  commerceProduct: PrismaClient["commerceProduct"];
  commerceVariant: PrismaClient["commerceVariant"];
  inventoryTransaction: PrismaClient["inventoryTransaction"];
  $queryRawUnsafe: PrismaClient["$queryRawUnsafe"];
  $transaction?: PrismaClient["$transaction"];
};

function readAttributes(value: Prisma.JsonValue): CatalogAttribute[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const attributes: CatalogAttribute[] = [];
  for (const item of value) {
    if (item == null || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const column = "column" in item && typeof item.column === "string" ? item.column : "";
    const cell = "value" in item && typeof item.value === "string" ? item.value : "";
    if (column && cell) {
      attributes.push({ column, value: cell });
    }
  }
  return attributes;
}

function readMarket(value: string | null): CommerceMarket | null {
  if (value === "trendyol" || value === "hepsiburada" || value === "amazon") {
    return value;
  }
  return null;
}

function storeFrom(row: {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  status: StoreStatus;
  currencyCode: string;
  whatsappE164: string | null;
  createdAt: Date;
  updatedAt: Date;
}): StoreRow {
  if (row.currencyCode !== "TRY") {
    throw new Error("Mağaza para birimi TRY olmalıdır.");
  }
  return { ...row, currencyCode: "TRY" };
}

function productFrom(row: {
  id: string;
  storeId: string;
  title: string;
  description: string;
  category: string;
  attributes: Prisma.JsonValue;
  otherNote: string;
  listingMarket: string | null;
  source: CatalogSource;
  status: ProductStatus;
  approvedStockQty: number;
  createdAt: Date;
  updatedAt: Date;
}): ProductRow {
  return {
    ...row,
    attributes: readAttributes(row.attributes),
    listingMarket: readMarket(row.listingMarket),
  };
}

function variantFrom(row: {
  id: string;
  storeId: string;
  productId: string;
  sku: string;
  barcode: string | null;
  amountMinor: number | null;
  onHandQty: number;
  safetyBuffer: number;
  status: VariantStatus;
  createdAt: Date;
  updatedAt: Date;
}): VariantRow {
  return row;
}

function movementFrom(row: {
  id: string;
  storeId: string;
  variantId: string;
  actorUserId: string;
  type: InventoryType;
  direction: InventoryDirection;
  quantity: number;
  onHandAfter: number;
  note: string;
  idempotencyKey: string;
  createdAt: Date;
}): MovementRow {
  return row;
}

function rethrowConflict(error: unknown): never {
  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
    const meta = "meta" in error && error.meta && typeof error.meta === "object" ? error.meta : null;
    const target = meta && "target" in meta ? meta.target : "";
    const text = Array.isArray(target) ? target.join(",") : String(target);
    if (text.includes("barcode")) {
      throw new CommerceWriteConflict("barcode");
    }
    if (text.includes("slug")) {
      throw new CommerceWriteConflict("slug");
    }
    throw new CommerceWriteConflict("sku");
  }
  throw error;
}

/** Hareketin ürün satırını kilitler. Kardeş varyant yazımları bu kilitte sıraya girer. */
const PRODUCT_LOCK_SQL = `
SELECT p.id
FROM commerce_products p
INNER JOIN commerce_variants v ON v.product_id = p.id
WHERE v.id = $1
FOR UPDATE OF p
`;

/**
 * Tek stok hareketi. Ürün kilidi önce alınır, ardından `INVENTORY_MOVE_SQL` çalışır.
 * SQL içindeki onaylı stok toplamı bu kilitten sonra okunur; kardeş yazımı kaybolmaz.
 * Çağıran bir işlem içinde değilse `applyMovement` kendi işlemini açar.
 */
async function moveInventory(db: CommerceDb, command: MoveCommand): Promise<MoveResult> {
  await db.$queryRawUnsafe(PRODUCT_LOCK_SQL, command.variantId);
  const rows = await db.$queryRawUnsafe<InventoryMoveSqlRow[]>(
    INVENTORY_MOVE_SQL,
    command.idempotencyKey,
    command.variantId,
    command.storeId,
    command.actorUserId,
    command.direction,
    command.type,
    command.quantity,
    command.note,
    command.id,
  );
  const row = rows.find((item) => item.outcome === "applied" || item.outcome === "replay") ?? rows[0];
  if (!row || row.outcome === "missing") {
    return { outcome: "missing" };
  }
  if (row.outcome === "rejected" || !row.id || !row.variant_id || !row.store_id) {
    return { outcome: "rejected" };
  }
  const variant = await db.commerceVariant.findFirst({
    where: { id: row.variant_id, storeId: row.store_id },
  });
  if (!variant || row.type == null || row.direction == null || row.quantity == null || row.on_hand_after == null) {
    return { outcome: "missing" };
  }
  const movement = movementFrom({
    id: row.id,
    storeId: row.store_id,
    variantId: row.variant_id,
    actorUserId: row.actor_user_id ?? command.actorUserId,
    type: row.type as InventoryType,
    direction: row.direction as InventoryDirection,
    quantity: row.quantity,
    onHandAfter: row.on_hand_after,
    note: row.note ?? "",
    idempotencyKey: row.idempotency_key ?? command.idempotencyKey,
    createdAt: row.created_at ?? new Date(),
  });
  const result: MoveResult = {
    outcome: row.outcome,
    movement,
    variant: variantFrom(variant),
  };
  return result;
}

function bindPrisma(db: CommerceDb, nested: boolean): CommerceRepository {
  const repo: CommerceRepository = {
    async transaction(fn) {
      if (nested || typeof db.$transaction !== "function") {
        return fn(repo);
      }
      return db.$transaction((tx) => fn(bindPrisma(tx as CommerceDb, true)));
    },
    async listStores(ownerUserId) {
      const rows = await db.commerceStore.findMany({
        where: { ownerUserId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(storeFrom);
    },
    async findStoreForOwner(ownerUserId, storeId) {
      const row = await db.commerceStore.findFirst({ where: { id: storeId, ownerUserId } });
      return row ? storeFrom(row) : null;
    },
    async findStoreById(storeId) {
      const row = await db.commerceStore.findUnique({ where: { id: storeId } });
      return row ? storeFrom(row) : null;
    },
    async slugTaken(slug) {
      const row = await db.commerceStore.findUnique({ where: { slug }, select: { id: true } });
      return row != null;
    },
    async insertStore(row) {
      try {
        const created = await db.commerceStore.create({ data: row });
        return storeFrom(created);
      } catch (error) {
        rethrowConflict(error);
      }
    },
    async updateStore(row) {
      try {
        const updated = await db.commerceStore.update({
          where: { id: row.id },
          data: { name: row.name, slug: row.slug, status: row.status, whatsappE164: row.whatsappE164 },
        });
        return storeFrom(updated);
      } catch (error) {
        rethrowConflict(error);
      }
    },
    async listProducts(storeId) {
      const rows = await db.commerceProduct.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        include: { variants: { orderBy: { createdAt: "asc" } } },
      });
      return rows.map((row) => ({
        product: productFrom(row),
        variants: row.variants.map(variantFrom),
      }));
    },
    async findProduct(storeId, productId) {
      const row = await db.commerceProduct.findFirst({
        where: { id: productId, storeId },
        include: { variants: { orderBy: { createdAt: "asc" } } },
      });
      if (!row) {
        return null;
      }
      return { product: productFrom(row), variants: row.variants.map(variantFrom) };
    },
    async insertProduct(row) {
      const created = await db.commerceProduct.create({
        data: {
          ...row,
          attributes: row.attributes as Prisma.InputJsonValue,
        },
      });
      return productFrom(created);
    },
    async updateProduct(row) {
      const updated = await db.commerceProduct.update({
        where: { id: row.id },
        data: {
          title: row.title,
          description: row.description,
          category: row.category,
          attributes: row.attributes as Prisma.InputJsonValue,
          otherNote: row.otherNote,
          listingMarket: row.listingMarket,
          status: row.status,
        },
      });
      return productFrom(updated);
    },
    async findVariant(storeId, variantId) {
      const row = await db.commerceVariant.findFirst({ where: { id: variantId, storeId } });
      return row ? variantFrom(row) : null;
    },
    async skuTaken(storeId, sku, exceptVariantId) {
      const row = await db.commerceVariant.findFirst({
        where: { storeId, sku, ...(exceptVariantId ? { NOT: { id: exceptVariantId } } : {}) },
        select: { id: true },
      });
      return row != null;
    },
    async barcodeTaken(storeId, barcode, exceptVariantId) {
      const row = await db.commerceVariant.findFirst({
        where: { storeId, barcode, ...(exceptVariantId ? { NOT: { id: exceptVariantId } } : {}) },
        select: { id: true },
      });
      return row != null;
    },
    async insertVariant(row) {
      try {
        const created = await db.commerceVariant.create({ data: row });
        return variantFrom(created);
      } catch (error) {
        rethrowConflict(error);
      }
    },
    async updateVariant(row) {
      const current = await db.commerceVariant.findFirst({ where: { id: row.id, storeId: row.storeId } });
      if (!current) {
        throw new Error("Varyant yok.");
      }
      if (current.onHandQty !== row.onHandQty) {
        throw new Error("Stok varyant yamasından yazılamaz.");
      }
      try {
        const updated = await db.commerceVariant.update({
          where: { id: row.id },
          data: {
            sku: row.sku,
            barcode: row.barcode,
            amountMinor: row.amountMinor,
            safetyBuffer: row.safetyBuffer,
            status: row.status,
          },
        });
        return variantFrom(updated);
      } catch (error) {
        rethrowConflict(error);
      }
    },
    async listMovements(storeId, variantId) {
      const rows = await db.inventoryTransaction.findMany({
        where: { storeId, ...(variantId ? { variantId } : {}) },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(movementFrom);
    },
    async findMovementForOwner(ownerUserId, idempotencyKey) {
      const row = await db.inventoryTransaction.findFirst({
        where: { idempotencyKey, store: { ownerUserId } },
      });
      return row ? movementFrom(row) : null;
    },
    async applyMovement(command) {
      if (nested || typeof db.$transaction !== "function") {
        return moveInventory(db, command);
      }
      return db.$transaction((tx) => moveInventory(tx as CommerceDb, command));
    },
  };
  return repo;
}

export function createPrismaCommerceRepository(): CommerceRepository {
  return bindPrisma(getPrisma(), false);
}
