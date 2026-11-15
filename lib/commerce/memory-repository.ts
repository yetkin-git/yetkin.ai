import {
  movementAllowed,
  nextOnHandQty,
  nextVariantStatus,
} from "@/lib/commerce/inventory-gate";
import { CommerceWriteConflict, type CommerceRepository } from "@/lib/commerce/repository";
import type {
  MoveCommand,
  MoveResult,
  MovementRow,
  ProductRow,
  StoreRow,
  VariantRow,
} from "@/lib/commerce/types";

type MemoryState = {
  stores: StoreRow[];
  products: ProductRow[];
  variants: VariantRow[];
  movements: MovementRow[];
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

function exclusive(tails: Map<string, Promise<void>>, key: string, fn: () => Promise<MoveResult>): Promise<MoveResult> {
  const previous = tails.get(key) ?? Promise.resolve();
  const run = previous.then(fn, fn);
  tails.set(
    key,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );
  return run;
}

function bind(
  state: MemoryState,
  tails: Map<string, Promise<void>>,
  nested: boolean,
  queue: { chain: Promise<void> },
): CommerceRepository {
  const repo: CommerceRepository = {
    transaction(fn) {
      if (nested) {
        return fn(repo);
      }
      const run = queue.chain.then(async () => {
        const snapshot = clone(state);
        try {
          return await fn(bind(state, tails, true, queue));
        } catch (error) {
          state.stores = snapshot.stores;
          state.products = snapshot.products;
          state.variants = snapshot.variants;
          state.movements = snapshot.movements;
          throw error;
        }
      });
      queue.chain = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    },
    async listStores(ownerUserId) {
      return state.stores
        .filter((store) => store.ownerUserId === ownerUserId)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
        .map((store) => clone(store));
    },
    async findStoreForOwner(ownerUserId, storeId) {
      const store = state.stores.find((row) => row.id === storeId && row.ownerUserId === ownerUserId);
      return store ? clone(store) : null;
    },
    async findStoreById(storeId) {
      const store = state.stores.find((row) => row.id === storeId);
      return store ? clone(store) : null;
    },
    async slugTaken(slug) {
      return state.stores.some((store) => store.slug === slug);
    },
    async insertStore(row) {
      if (state.stores.some((store) => store.slug === row.slug)) {
        throw new CommerceWriteConflict("slug");
      }
      state.stores.push(clone(row));
      return clone(row);
    },
    async updateStore(row) {
      const index = state.stores.findIndex((store) => store.id === row.id);
      const current = state.stores[index];
      if (!current) {
        throw new Error("Mağaza yok.");
      }
      if (state.stores.some((store) => store.slug === row.slug && store.id !== row.id)) {
        throw new CommerceWriteConflict("slug");
      }
      state.stores[index] = clone(row);
      return clone(row);
    },
    async listProducts(storeId) {
      return state.products
        .filter((product) => product.storeId === storeId)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
        .map((product) => ({
          product: clone(product),
          variants: state.variants.filter((variant) => variant.productId === product.id).map((variant) => clone(variant)),
        }));
    },
    async findProduct(storeId, productId) {
      const product = state.products.find((row) => row.id === productId && row.storeId === storeId);
      if (!product) {
        return null;
      }
      return {
        product: clone(product),
        variants: state.variants
          .filter((variant) => variant.productId === product.id && variant.storeId === storeId)
          .map((variant) => clone(variant)),
      };
    },
    async insertProduct(row) {
      state.products.push(clone(row));
      return clone(row);
    },
    async updateProduct(row) {
      const index = state.products.findIndex((product) => product.id === row.id && product.storeId === row.storeId);
      if (index < 0) {
        throw new Error("Kart yok.");
      }
      state.products[index] = clone(row);
      return clone(row);
    },
    async findVariant(storeId, variantId) {
      const variant = state.variants.find((row) => row.id === variantId && row.storeId === storeId);
      return variant ? clone(variant) : null;
    },
    async skuTaken(storeId, sku, exceptVariantId) {
      return state.variants.some(
        (variant) => variant.storeId === storeId && variant.sku === sku && variant.id !== exceptVariantId,
      );
    },
    async barcodeTaken(storeId, barcode, exceptVariantId) {
      return state.variants.some(
        (variant) =>
          variant.storeId === storeId && variant.barcode === barcode && variant.id !== exceptVariantId,
      );
    },
    async insertVariant(row) {
      if (await repo.skuTaken(row.storeId, row.sku)) {
        throw new CommerceWriteConflict("sku");
      }
      if (row.barcode && (await repo.barcodeTaken(row.storeId, row.barcode))) {
        throw new CommerceWriteConflict("barcode");
      }
      state.variants.push(clone(row));
      return clone(row);
    },
    async updateVariant(row) {
      if (await repo.skuTaken(row.storeId, row.sku, row.id)) {
        throw new CommerceWriteConflict("sku");
      }
      if (row.barcode && (await repo.barcodeTaken(row.storeId, row.barcode, row.id))) {
        throw new CommerceWriteConflict("barcode");
      }
      const index = state.variants.findIndex((variant) => variant.id === row.id && variant.storeId === row.storeId);
      const current = state.variants[index];
      if (!current) {
        throw new Error("Varyant yok.");
      }
      if (current.onHandQty !== row.onHandQty) {
        throw new Error("Stok varyant yamasından yazılamaz.");
      }
      state.variants[index] = clone(row);
      return clone(row);
    },
    async listMovements(storeId, variantId) {
      return state.movements
        .filter((movement) => movement.storeId === storeId && (!variantId || movement.variantId === variantId))
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
        .map((movement) => clone(movement));
    },
    async findMovementForOwner(ownerUserId, idempotencyKey) {
      const movement = state.movements.find((row) => row.idempotencyKey === idempotencyKey);
      if (!movement) {
        return null;
      }
      const store = state.stores.find((row) => row.id === movement.storeId && row.ownerUserId === ownerUserId);
      return store ? clone(movement) : null;
    },
    applyMovement(command) {
      return exclusive(tails, command.variantId, async () => applyMemoryMovement(state, command));
    },
  };
  return repo;
}

function applyMemoryMovement(state: MemoryState, command: MoveCommand): MoveResult {
  const existing = state.movements.find((row) => row.idempotencyKey === command.idempotencyKey);
  if (existing) {
    const store = state.stores.find(
      (row) => row.id === existing.storeId && row.ownerUserId === command.actorUserId,
    );
    const variant = state.variants.find((row) => row.id === existing.variantId && row.storeId === existing.storeId);
    if (!store || !variant) {
      return { outcome: "missing" };
    }
    return { outcome: "replay", movement: clone(existing), variant: clone(variant) };
  }
  const store = state.stores.find((row) => row.id === command.storeId && row.ownerUserId === command.actorUserId);
  const index = state.variants.findIndex((row) => row.id === command.variantId && row.storeId === command.storeId);
  const variant = state.variants[index];
  if (!store || !variant) {
    return { outcome: "missing" };
  }
  if (
    !movementAllowed({
      type: command.type,
      direction: command.direction,
      onHandQty: variant.onHandQty,
      safetyBuffer: variant.safetyBuffer,
      quantity: command.quantity,
    })
  ) {
    return { outcome: "rejected" };
  }
  const onHandAfter = nextOnHandQty(variant.onHandQty, command.direction, command.quantity);
  const status = nextVariantStatus({
    status: variant.status,
    type: command.type,
    direction: command.direction,
    nextOnHandQty: onHandAfter,
    safetyBuffer: variant.safetyBuffer,
    amountMinor: variant.amountMinor,
    barcode: variant.barcode,
  });
  const next: VariantRow = {
    ...variant,
    onHandQty: onHandAfter,
    status,
    updatedAt: new Date(),
  };
  state.variants[index] = next;
  const movement: MovementRow = {
    id: command.id,
    storeId: command.storeId,
    variantId: command.variantId,
    actorUserId: command.actorUserId,
    type: command.type,
    direction: command.direction,
    quantity: command.quantity,
    onHandAfter,
    note: command.note,
    idempotencyKey: command.idempotencyKey,
    createdAt: new Date(),
  };
  state.movements.push(movement);
  return { outcome: "applied", movement: clone(movement), variant: clone(next) };
}

export function createMemoryCommerceRepository(): CommerceRepository {
  return bind({ stores: [], products: [], variants: [], movements: [] }, new Map(), false, {
    chain: Promise.resolve(),
  });
}
