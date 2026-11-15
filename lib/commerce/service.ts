import { randomUUID } from "node:crypto";
import { inventoryDirectionMatches, movementAllowed, sellableQty } from "@/lib/commerce/inventory-gate";
import { isInventoryIdempotencyRace } from "@/lib/commerce/inventory-sql";
import { CommerceRollback, CommerceWriteConflict, type CommerceRepository } from "@/lib/commerce/repository";
import {
  commerceFail,
  type CatalogMode,
  type CatalogSource,
  type CommerceMarket,
  type CommerceResult,
  type MovementRow,
  type ProductRow,
  type ProductStatus,
  type StoreRow,
  type StoreStatus,
  type VariantRow,
  type VariantStatus,
} from "@/lib/commerce/types";
import {
  createDraftSku,
  inventoryIdempotencyKey,
  isCommerceMarket,
  parseAttributes,
  parseBarcode,
  parseCatalogCard,
  parseMode,
  parseMovementBody,
  parseSku,
  parseSlug,
  parseStoreName,
  parseVariantBody,
  slugFromName,
  CSV_IMPORT_MAX_ROWS,
  PAZARYERI_IMPORT_MAX_ROWS,
  type ParsedCard,
} from "@/lib/commerce/validate";

const MISSING = "Kayıt bulunamadı.";

function storeJson(store: StoreRow): Record<string, unknown> {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    status: store.status,
    currencyCode: store.currencyCode,
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
  };
}

function variantJson(variant: VariantRow): Record<string, unknown> {
  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    barcode: variant.barcode,
    amountMinor: variant.amountMinor,
    onHandQty: variant.onHandQty,
    safetyBuffer: variant.safetyBuffer,
    sellableQty: sellableQty(variant.onHandQty, variant.safetyBuffer),
    status: variant.status,
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
  };
}

function productJson(product: ProductRow, variants: VariantRow[]): Record<string, unknown> {
  return {
    id: product.id,
    storeId: product.storeId,
    title: product.title,
    description: product.description,
    category: product.category,
    attributes: product.attributes,
    other: product.otherNote,
    listingMarket: product.listingMarket,
    source: product.source,
    status: product.status,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    variants: variants.map(variantJson),
  };
}

function movementJson(movement: MovementRow, variant: VariantRow): Record<string, unknown> {
  return {
    id: movement.id,
    storeId: movement.storeId,
    variantId: movement.variantId,
    type: movement.type,
    direction: movement.direction,
    quantity: movement.quantity,
    onHandAfter: movement.onHandAfter,
    note: movement.note,
    idempotencyKey: movement.idempotencyKey,
    createdAt: movement.createdAt.toISOString(),
    variant: variantJson(variant),
  };
}

function rollback(status: 400 | 404 | 409 | 422, error: string): never {
  throw new CommerceRollback(commerceFail(status, error));
}

async function settle<T extends Record<string, unknown>>(
  repo: CommerceRepository,
  fn: (tx: CommerceRepository) => Promise<CommerceResult<T>>,
): Promise<CommerceResult<T>> {
  try {
    return await repo.transaction(async (tx) => {
      const result = await fn(tx);
      if (!result.ok) {
        throw new CommerceRollback(result);
      }
      return result;
    });
  } catch (error) {
    if (error instanceof CommerceRollback) {
      return error.result as CommerceResult<T>;
    }
    if (error instanceof CommerceWriteConflict) {
      const message =
        error.conflict === "slug"
          ? "Bu adres başka bir mağazada."
          : error.conflict === "barcode"
            ? "Bu barkod mağazada kayıtlı."
            : "Bu SKU mağazada kayıtlı.";
      return commerceFail(409, message);
    }
    throw error;
  }
}

async function requireStore(repo: CommerceRepository, userId: string, storeId: string): Promise<StoreRow> {
  const store = await repo.findStoreForOwner(userId, storeId);
  if (!store) {
    rollback(404, MISSING);
  }
  return store;
}

async function uniqueDraftSku(repo: CommerceRepository, storeId: string, preferred: string | null): Promise<string> {
  if (preferred) {
    if (await repo.skuTaken(storeId, preferred)) {
      rollback(409, "Bu SKU mağazada kayıtlı.");
    }
    return preferred;
  }
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const sku = createDraftSku();
    if (!(await repo.skuTaken(storeId, sku))) {
      return sku;
    }
  }
  rollback(409, "Taslak SKU üretilemedi.");
}

async function placeVariant(
  repo: CommerceRepository,
  input: {
    userId: string;
    store: StoreRow;
    productId: string;
    mode: CatalogMode;
    sku: string | null;
    barcode: string | null;
    amountMinor: number | null;
    onHandQty: number;
    safetyBuffer: number;
    httpKey: string;
    index: number;
  },
): Promise<VariantRow> {
  if (input.mode === "active" && input.store.status !== "ACTIVE") {
    rollback(422, "Aktif kart için mağaza açık olmalıdır.");
  }
  const sku = await uniqueDraftSku(repo, input.store.id, input.sku);
  if (input.barcode && (await repo.barcodeTaken(input.store.id, input.barcode))) {
    rollback(409, "Bu barkod mağazada kayıtlı.");
  }
  const now = new Date();
  const variant = await repo.insertVariant({
    id: randomUUID(),
    storeId: input.store.id,
    productId: input.productId,
    sku,
    barcode: input.barcode,
    amountMinor: input.amountMinor,
    onHandQty: 0,
    safetyBuffer: input.safetyBuffer,
    status: input.mode === "active" ? "ACTIVE" : "DRAFT",
    createdAt: now,
    updatedAt: now,
  });
  if (input.mode === "draft") {
    return variant;
  }
  const moved = await repo.applyMovement({
    id: randomUUID(),
    storeId: input.store.id,
    variantId: variant.id,
    actorUserId: input.userId,
    type: "INBOUND",
    direction: "IN",
    quantity: input.onHandQty,
    note: "",
    idempotencyKey: inventoryIdempotencyKey(input.httpKey, input.index),
  });
  if (moved.outcome === "rejected") {
    rollback(409, "Stok tavanı aşıldı.");
  }
  if (moved.outcome === "missing") {
    rollback(404, MISSING);
  }
  return moved.variant;
}

function recordOf(raw: unknown): Record<string, unknown> | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  return raw as Record<string, unknown>;
}

export async function listCommerceStores(
  repo: CommerceRepository,
  userId: string,
): Promise<CommerceResult<{ stores: Record<string, unknown>[] }>> {
  const stores = await repo.listStores(userId);
  return { ok: true, data: { stores: stores.map(storeJson) } };
}

export async function createCommerceStore(
  repo: CommerceRepository,
  userId: string,
  raw: unknown,
): Promise<CommerceResult<{ store: Record<string, unknown> }>> {
  const body = recordOf(raw);
  const name = body ? parseStoreName(body.name) : null;
  if (!name) {
    return commerceFail(422, "Mağaza adı 1 ile 80 karakter olmalıdır.");
  }
  const slugField = body?.slug;
  const requested =
    slugField == null || slugField === "" ? null : typeof slugField === "string" ? parseSlug(slugField) : null;
  if (slugField != null && slugField !== "" && !requested) {
    return commerceFail(422, "Adres küçük harf, rakam ve tek tire olmalıdır.");
  }
  return settle(repo, async (tx) => {
    let slug = requested;
    if (!slug) {
      const base = slugFromName(name);
      if (!parseSlug(base)) {
        rollback(422, "Mağaza adı adres üretmiyor.");
      }
      slug = base;
      let suffix = 2;
      while (await tx.slugTaken(slug)) {
        const tail = `-${suffix}`;
        slug = `${base.slice(0, 48 - tail.length)}${tail}`;
        suffix += 1;
        if (suffix > 100 || !parseSlug(slug)) {
          rollback(409, "Bu adres başka bir mağazada.");
        }
      }
    } else if (await tx.slugTaken(slug)) {
      rollback(409, "Bu adres başka bir mağazada.");
    }
    const now = new Date();
    const store = await tx.insertStore({
      id: randomUUID(),
      ownerUserId: userId,
      name,
      slug,
      status: "DRAFT",
      currencyCode: "TRY",
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true, data: { store: storeJson(store) } };
  });
}

export async function getCommerceStore(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
): Promise<CommerceResult<{ store: Record<string, unknown> }>> {
  const store = await repo.findStoreForOwner(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  return { ok: true, data: { store: storeJson(store) } };
}

export async function patchCommerceStore(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
  raw: unknown,
): Promise<CommerceResult<{ store: Record<string, unknown> }>> {
  const body = recordOf(raw);
  if (!body) {
    return commerceFail(422, "Mağaza gövdesi geçersiz.");
  }
  const name = body.name == null ? null : parseStoreName(body.name);
  const slug = body.slug == null ? null : typeof body.slug === "string" ? parseSlug(body.slug) : null;
  const status = body.status;
  if (body.name != null && !name) {
    return commerceFail(422, "Mağaza adı 1 ile 80 karakter olmalıdır.");
  }
  if (body.slug != null && !slug) {
    return commerceFail(422, "Adres küçük harf, rakam ve tek tire olmalıdır.");
  }
  if (status != null && status !== "DRAFT" && status !== "ACTIVE") {
    return commerceFail(422, "Mağaza durumu taslak veya açık olmalıdır.");
  }
  if (name == null && slug == null && status == null) {
    return commerceFail(422, "Değişecek alan yok.");
  }
  return settle(repo, async (tx) => {
    const current = await requireStore(tx, userId, storeId);
    if (slug && slug !== current.slug && (await tx.slugTaken(slug))) {
      rollback(409, "Bu adres başka bir mağazada.");
    }
    const now = new Date();
    const next: StoreRow = {
      ...current,
      name: name ?? current.name,
      slug: slug ?? current.slug,
      status: (status as StoreStatus | null) ?? current.status,
      updatedAt: now,
    };
    const saved = await tx.updateStore(next);
    return { ok: true, data: { store: storeJson(saved) } };
  });
}

export async function listCommerceProducts(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
): Promise<CommerceResult<{ products: Record<string, unknown>[] }>> {
  const store = await repo.findStoreForOwner(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const rows = await repo.listProducts(storeId);
  return { ok: true, data: { products: rows.map((row) => productJson(row.product, row.variants)) } };
}

export async function getCommerceProduct(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
  productId: string,
): Promise<CommerceResult<{ product: Record<string, unknown> }>> {
  const store = await repo.findStoreForOwner(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const row = await repo.findProduct(storeId, productId);
  if (!row) {
    return commerceFail(404, MISSING);
  }
  return { ok: true, data: { product: productJson(row.product, row.variants) } };
}

async function writeProduct(
  tx: CommerceRepository,
  input: {
    userId: string;
    storeId: string;
    source: CatalogSource;
    mode: CatalogMode;
    card: ParsedCard;
    listingMarket: CommerceMarket | null;
    httpKey: string;
    index: number;
  },
): Promise<Record<string, unknown>> {
  const store = await requireStore(tx, input.userId, input.storeId);
  const now = new Date();
  const product = await tx.insertProduct({
    id: randomUUID(),
    storeId: store.id,
    title: input.card.title,
    description: input.card.description,
    category: input.card.category,
    attributes: input.card.attributes,
    otherNote: input.card.other,
    listingMarket: input.listingMarket,
    source: input.source,
    status: input.mode === "active" ? "ACTIVE" : "DRAFT",
    createdAt: now,
    updatedAt: now,
  });
  const variant = await placeVariant(tx, {
    userId: input.userId,
    store,
    productId: product.id,
    mode: input.mode,
    sku: input.card.sku,
    barcode: input.card.barcode,
    amountMinor: input.card.amountMinor,
    onHandQty: input.card.onHandQty,
    safetyBuffer: input.card.safetyBuffer,
    httpKey: input.httpKey,
    index: input.index,
  });
  return productJson(product, [variant]);
}

export async function createCommerceProduct(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
  raw: unknown,
  httpKey: string,
): Promise<CommerceResult<{ product: Record<string, unknown> }>> {
  const body = recordOf(raw);
  const mode = body ? parseMode(body.mode) : null;
  if (!body || !mode) {
    return commerceFail(422, "Kart modu taslak veya aktif olmalıdır.");
  }
  const card = parseCatalogCard(mode, raw);
  if (!card.ok) {
    return commerceFail(422, card.error);
  }
  const marketRaw = body.listingMarket;
  if (marketRaw != null && (typeof marketRaw !== "string" || !isCommerceMarket(marketRaw))) {
    return commerceFail(422, "Pazaryeri etiketi geçersiz.");
  }
  return settle(repo, async (tx) => {
    const product = await writeProduct(tx, {
      userId,
      storeId,
      source: "MANUAL",
      mode,
      card: card.value,
      listingMarket: typeof marketRaw === "string" ? marketRaw : null,
      httpKey,
      index: 0,
    });
    return { ok: true, data: { product } };
  });
}

export async function patchCommerceProduct(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
  productId: string,
  raw: unknown,
): Promise<CommerceResult<{ product: Record<string, unknown> }>> {
  const body = recordOf(raw);
  if (!body) {
    return commerceFail(422, "Kart gövdesi geçersiz.");
  }
  return settle(repo, async (tx) => {
    await requireStore(tx, userId, storeId);
    const current = await tx.findProduct(storeId, productId);
    if (!current) {
      rollback(404, MISSING);
    }
    const title = body.title == null ? current.product.title : typeof body.title === "string" ? body.title.trim() : "";
    const description =
      body.description == null
        ? current.product.description
        : typeof body.description === "string"
          ? body.description.trim()
          : "";
    const category =
      body.category == null ? current.product.category : typeof body.category === "string" ? body.category.trim() : "";
    const other =
      body.other == null ? current.product.otherNote : typeof body.other === "string" ? body.other.trim() : null;
    if (title.length < 1 || title.length > 200 || description.length < 1 || description.length > 4_000) {
      rollback(422, "Başlık veya açıklama sınır dışında.");
    }
    if (category.length < 1 || category.length > 80 || other == null || other.length > 500) {
      rollback(422, "Kategori veya not sınır dışında.");
    }
    let attributes = current.product.attributes;
    if (body.attributes != null) {
      const parsed = parseAttributes(body.attributes);
      if (!parsed.ok) {
        rollback(422, parsed.error);
      }
      attributes = parsed.value;
    }
    const status = body.status == null ? current.product.status : body.status;
    if (status !== "DRAFT" && status !== "ACTIVE" && status !== "ARCHIVED") {
      rollback(422, "Kart durumu geçersiz.");
    }
    const saved = await tx.updateProduct({
      ...current.product,
      title,
      description,
      category,
      otherNote: other,
      attributes,
      status: status as ProductStatus,
      updatedAt: new Date(),
    });
    const fresh = await tx.findProduct(storeId, productId);
    return { ok: true, data: { product: productJson(saved, fresh?.variants ?? current.variants) } };
  });
}

export async function createCommerceVariant(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
  productId: string,
  raw: unknown,
  httpKey: string,
): Promise<CommerceResult<{ variant: Record<string, unknown> }>> {
  const body = recordOf(raw);
  const mode = body ? parseMode(body.mode) : null;
  if (!mode) {
    return commerceFail(422, "Varyant modu taslak veya aktif olmalıdır.");
  }
  const stock = parseVariantBody(mode, raw);
  if (!stock.ok) {
    return commerceFail(422, stock.error);
  }
  return settle(repo, async (tx) => {
    const store = await requireStore(tx, userId, storeId);
    const product = await tx.findProduct(storeId, productId);
    if (!product) {
      rollback(404, MISSING);
    }
    const variant = await placeVariant(tx, {
      userId,
      store,
      productId,
      mode,
      sku: stock.value.sku,
      barcode: stock.value.barcode,
      amountMinor: stock.value.amountMinor,
      onHandQty: stock.value.onHandQty,
      safetyBuffer: stock.value.safetyBuffer,
      httpKey,
      index: 0,
    });
    return { ok: true, data: { variant: variantJson(variant) } };
  });
}

export async function patchCommerceVariant(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
  variantId: string,
  raw: unknown,
): Promise<CommerceResult<{ variant: Record<string, unknown> }>> {
  const body = recordOf(raw);
  if (!body) {
    return commerceFail(422, "Varyant gövdesi geçersiz.");
  }
  if ("onHandQty" in body) {
    return commerceFail(422, "Stok bu yoldan yazılmaz.");
  }
  return settle(repo, async (tx) => {
    await requireStore(tx, userId, storeId);
    const current = await tx.findVariant(storeId, variantId);
    if (!current) {
      rollback(404, MISSING);
    }
    const sku = body.sku == null ? current.sku : typeof body.sku === "string" ? parseSku(body.sku) : null;
    if (!sku) {
      rollback(422, "SKU büyük harf, rakam ve . _ - içerir. En çok 64 karakter.");
    }
    let barcode = current.barcode;
    if (body.barcode === null) {
      barcode = null;
    } else if (body.barcode != null) {
      barcode = typeof body.barcode === "string" ? parseBarcode(body.barcode) : null;
      if (!barcode) {
        rollback(422, "Barkod 8, 12, 13 veya 14 rakam olmalıdır.");
      }
    }
    let amountMinor = current.amountMinor;
    if (body.amountMinor === null) {
      amountMinor = null;
    } else if (body.amountMinor != null) {
      if (typeof body.amountMinor !== "number" || !Number.isInteger(body.amountMinor) || body.amountMinor < 0) {
        rollback(422, "Fiyat kuruş tam sayısı olmalıdır.");
      }
      amountMinor = body.amountMinor;
    }
    let safetyBuffer = current.safetyBuffer;
    if (body.safetyBuffer != null) {
      if (typeof body.safetyBuffer !== "number" || !Number.isInteger(body.safetyBuffer) || body.safetyBuffer < 0) {
        rollback(422, "Emniyet tamponu tam sayı olmalıdır.");
      }
      safetyBuffer = body.safetyBuffer;
    }
    if (current.status === "ACTIVE" && (barcode == null || amountMinor == null)) {
      rollback(422, "Açık varyantın barkodu ve fiyatı dolu kalır.");
    }
    if (sku !== current.sku && (await tx.skuTaken(storeId, sku, current.id))) {
      rollback(409, "Bu SKU mağazada kayıtlı.");
    }
    if (barcode && barcode !== current.barcode && (await tx.barcodeTaken(storeId, barcode, current.id))) {
      rollback(409, "Bu barkod mağazada kayıtlı.");
    }
    const saved = await tx.updateVariant({
      ...current,
      sku,
      barcode,
      amountMinor,
      safetyBuffer,
      updatedAt: new Date(),
    });
    return { ok: true, data: { variant: variantJson(saved) } };
  });
}

export async function listCommerceInventory(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
  variantId?: string,
): Promise<CommerceResult<{ movements: Record<string, unknown>[] }>> {
  const store = await repo.findStoreForOwner(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  if (variantId) {
    const variant = await repo.findVariant(storeId, variantId);
    if (!variant) {
      return commerceFail(404, MISSING);
    }
  }
  const movements = await repo.listMovements(storeId, variantId);
  const variants = await repo.listProducts(storeId);
  const byId = new Map(variants.flatMap((row) => row.variants).map((variant) => [variant.id, variant]));
  return {
    ok: true,
    data: {
      movements: movements.flatMap((movement) => {
        const variant = byId.get(movement.variantId);
        return variant ? [movementJson(movement, variant)] : [];
      }),
    },
  };
}

export async function postCommerceInventory(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
  raw: unknown,
  httpKey: string,
): Promise<CommerceResult<{ movement: Record<string, unknown> }>> {
  const parsed = parseMovementBody(raw);
  if (!parsed.ok) {
    return commerceFail(422, parsed.error);
  }
  if (!inventoryDirectionMatches(parsed.value.type, parsed.value.direction)) {
    return commerceFail(422, "Hareket tipi ile yön örtüşmüyor.");
  }
  const key = inventoryIdempotencyKey(httpKey, 0);
  try {
    return await settle(repo, async (tx) => {
      await requireStore(tx, userId, storeId);
      const prior = await tx.findMovementForOwner(userId, key);
      if (prior) {
        if (
          prior.storeId !== storeId ||
          prior.variantId !== parsed.value.variantId ||
          prior.type !== parsed.value.type ||
          prior.direction !== parsed.value.direction ||
          prior.quantity !== parsed.value.quantity
        ) {
          rollback(409, "Idempotency anahtarı başka bir fişe bağlı.");
        }
        const variant = await tx.findVariant(prior.storeId, prior.variantId);
        if (!variant) {
          rollback(404, MISSING);
        }
        return { ok: true, data: { movement: movementJson(prior, variant) } };
      }
      const variant = await tx.findVariant(storeId, parsed.value.variantId);
      if (!variant) {
        rollback(404, MISSING);
      }
      if (
        !movementAllowed({
          type: parsed.value.type,
          direction: parsed.value.direction,
          onHandQty: variant.onHandQty,
          safetyBuffer: variant.safetyBuffer,
          quantity: parsed.value.quantity,
        })
      ) {
        rollback(409, parsed.value.type === "SALE" ? "Satılabilir stok yetmiyor." : "Eldeki stok yetmiyor.");
      }
      const moved = await tx.applyMovement({
        id: randomUUID(),
        storeId,
        variantId: variant.id,
        actorUserId: userId,
        type: parsed.value.type,
        direction: parsed.value.direction,
        quantity: parsed.value.quantity,
        note: parsed.value.note,
        idempotencyKey: key,
      });
      if (moved.outcome === "rejected") {
        rollback(409, parsed.value.type === "SALE" ? "Satılabilir stok yetmiyor." : "Eldeki stok yetmiyor.");
      }
      if (moved.outcome === "missing") {
        rollback(404, MISSING);
      }
      return { ok: true, data: { movement: movementJson(moved.movement, moved.variant) } };
    });
  } catch (error) {
    if (!isInventoryIdempotencyRace(error)) {
      throw error;
    }
    const prior = await repo.findMovementForOwner(userId, key);
    const variant = prior ? await repo.findVariant(prior.storeId, prior.variantId) : null;
    if (!prior || !variant) {
      return commerceFail(404, MISSING);
    }
    return { ok: true, data: { movement: movementJson(prior, variant) } };
  }
}

type ImportRequest = {
  source: CatalogSource;
  maxRows: number;
  marketRequired: boolean;
};

function parseImportRows(
  raw: unknown,
  request: ImportRequest,
):
  | {
      ok: true;
      mode: CatalogMode;
      market: CommerceMarket | null;
      cards: ParsedCard[];
    }
  | { ok: false; error: string } {
  const body = recordOf(raw);
  if (!body) {
    return { ok: false, error: "Aktarma gövdesi geçersiz." };
  }
  const mode = parseMode(body.mode);
  if (!mode) {
    return { ok: false, error: "Aktarma modu taslak veya aktif olmalıdır." };
  }
  const marketRaw = body.market;
  let market: CommerceMarket | null = null;
  if (marketRaw == null || marketRaw === "") {
    if (request.marketRequired) {
      return { ok: false, error: "Pazaryeri seçilmelidir." };
    }
  } else if (typeof marketRaw !== "string" || !isCommerceMarket(marketRaw)) {
    return { ok: false, error: "Pazaryeri etiketi geçersiz." };
  } else {
    market = marketRaw;
  }
  if (!Array.isArray(body.rows) || body.rows.length < 1 || body.rows.length > request.maxRows) {
    return { ok: false, error: `Satır sayısı 1 ile ${request.maxRows} arasında olmalıdır.` };
  }
  const cards: ParsedCard[] = [];
  for (const row of body.rows) {
    const card = parseCatalogCard(mode, row);
    if (!card.ok) {
      return card;
    }
    cards.push(card.value);
  }
  return { ok: true, mode, market, cards };
}

async function replayProducts(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
  keys: string[],
): Promise<Record<string, unknown>[]> {
  const products: Record<string, unknown>[] = [];
  for (const key of keys) {
    const movement = await repo.findMovementForOwner(userId, key);
    if (!movement || movement.storeId !== storeId) {
      rollback(409, "Aktarma yarım kalmış. Yeni bir anahtar kullanın.");
    }
    const variant = await repo.findVariant(storeId, movement.variantId);
    const card = variant ? await repo.findProduct(storeId, variant.productId) : null;
    if (!variant || !card) {
      rollback(404, MISSING);
    }
    products.push(productJson(card.product, [variant]));
  }
  return products;
}

async function importCards(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
  raw: unknown,
  httpKey: string,
  request: ImportRequest,
): Promise<CommerceResult<{ storeId: string; mode: CatalogMode; source: CatalogSource; products: Record<string, unknown>[] }>> {
  const parsed = parseImportRows(raw, request);
  if (!parsed.ok) {
    return commerceFail(422, parsed.error);
  }
  const keys =
    parsed.mode === "active" ? parsed.cards.map((_, index) => inventoryIdempotencyKey(httpKey, index)) : [];
  try {
    return await settle(repo, async (tx) => {
      if (keys.length > 0) {
        const found: MovementRow[] = [];
        for (const key of keys) {
          const movement = await tx.findMovementForOwner(userId, key);
          if (movement) {
            found.push(movement);
          }
        }
        if (found.length === keys.length) {
          const products = await replayProducts(tx, userId, storeId, keys);
          return {
            ok: true,
            data: { storeId, mode: parsed.mode, source: request.source, products },
          };
        }
        if (found.length > 0) {
          rollback(409, "Aktarma yarım kalmış. Yeni bir anahtar kullanın.");
        }
      }
      const products: Record<string, unknown>[] = [];
      for (let index = 0; index < parsed.cards.length; index += 1) {
        const card = parsed.cards[index];
        if (!card) {
          rollback(422, "Kart gövdesi geçersiz.");
        }
        products.push(
          await writeProduct(tx, {
            userId,
            storeId,
            source: request.source,
            mode: parsed.mode,
            card,
            listingMarket: parsed.market,
            httpKey,
            index,
          }),
        );
      }
      return { ok: true, data: { storeId, mode: parsed.mode, source: request.source, products } };
    });
  } catch (error) {
    if (!isInventoryIdempotencyRace(error) || keys.length === 0) {
      throw error;
    }
    const products = await replayProducts(repo, userId, storeId, keys).catch((replayError: unknown) => {
      if (replayError instanceof CommerceRollback) {
        return replayError.result;
      }
      throw replayError;
    });
    if (!Array.isArray(products)) {
      return products;
    }
    return { ok: true, data: { storeId, mode: parsed.mode, source: request.source, products } };
  }
}

export function importPazaryeriCatalog(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
  raw: unknown,
  httpKey: string,
) {
  return importCards(repo, userId, storeId, raw, httpKey, {
    source: "TEZGAH_PAZARYERI",
    maxRows: PAZARYERI_IMPORT_MAX_ROWS,
    marketRequired: true,
  });
}

export function importCsvCatalog(
  repo: CommerceRepository,
  userId: string,
  storeId: string,
  raw: unknown,
  httpKey: string,
) {
  return importCards(repo, userId, storeId, raw, httpKey, {
    source: "MANUAL_CSV",
    maxRows: CSV_IMPORT_MAX_ROWS,
    marketRequired: false,
  });
}

