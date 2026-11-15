import type { MoveCommand, MoveResult, MovementRow, ProductRow, StoreRow, VariantRow } from "@/lib/commerce/types";

export class CommerceWriteConflict extends Error {
  constructor(readonly conflict: "slug" | "sku" | "barcode") {
    super(conflict);
    this.name = "CommerceWriteConflict";
  }
}

export class CommerceRollback extends Error {
  constructor(readonly result: { ok: false; status: 400 | 404 | 409 | 422; error: string }) {
    super(result.error);
    this.name = "CommerceRollback";
  }
}

export type CommerceRepository = {
  transaction<T>(fn: (repo: CommerceRepository) => Promise<T>): Promise<T>;
  listStores(ownerUserId: string): Promise<StoreRow[]>;
  findStoreForOwner(ownerUserId: string, storeId: string): Promise<StoreRow | null>;
  findStoreById(storeId: string): Promise<StoreRow | null>;
  slugTaken(slug: string): Promise<boolean>;
  insertStore(row: StoreRow): Promise<StoreRow>;
  updateStore(row: StoreRow): Promise<StoreRow>;
  listProducts(storeId: string): Promise<Array<{ product: ProductRow; variants: VariantRow[] }>>;
  findProduct(storeId: string, productId: string): Promise<{ product: ProductRow; variants: VariantRow[] } | null>;
  insertProduct(row: ProductRow): Promise<ProductRow>;
  updateProduct(row: ProductRow): Promise<ProductRow>;
  findVariant(storeId: string, variantId: string): Promise<VariantRow | null>;
  skuTaken(storeId: string, sku: string, exceptVariantId?: string): Promise<boolean>;
  barcodeTaken(storeId: string, barcode: string, exceptVariantId?: string): Promise<boolean>;
  insertVariant(row: VariantRow): Promise<VariantRow>;
  updateVariant(row: VariantRow): Promise<VariantRow>;
  listMovements(storeId: string, variantId?: string): Promise<MovementRow[]>;
  findMovementForOwner(ownerUserId: string, idempotencyKey: string): Promise<MovementRow | null>;
  applyMovement(command: MoveCommand): Promise<MoveResult>;
};
