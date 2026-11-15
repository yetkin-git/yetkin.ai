import "server-only";

import {
  getTrendyolCredential,
  listTrendyolListings,
} from "@/lib/commerce/marketplace-service";
import { createPrismaMarketplaceRepository } from "@/lib/commerce/marketplace-prisma";
import type { CommerceChannelName } from "@/lib/commerce/marketplace-types";
import { createPrismaCommerceRepository } from "@/lib/commerce/prisma-repository";
import {
  getCommerceProduct,
  getCommerceStore,
  listCommerceInventory,
  listCommerceProducts,
  listCommerceStores,
} from "@/lib/commerce/service";
import { readCommerceMonthlyAmount } from "@/lib/commerce/paytr-license-bridge";
import { commerceLicenseActive } from "@/lib/commerce/subscription";
import { createPrismaCommerceSubscriptionStore } from "@/lib/commerce/subscription-prisma";
import type {
  CockpitChannel,
  CockpitLicense,
  CockpitMovement,
  CockpitProduct,
  CockpitRead,
  CockpitStore,
  CockpitVariant,
} from "@/lib/commerce/cockpit-types";
import { readBillingInfo } from "@/lib/kernel/identity/billing-info-write";
import { createPrismaBillingInfoStore } from "@/lib/kernel/identity/prisma-billing-info-store";
import { isPrismaClientError, isPrismaUnavailableError } from "@/lib/kernel/db-errors";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isDown(error: unknown): boolean {
  if (isPrismaUnavailableError(error) || isPrismaClientError(error)) {
    return true;
  }
  return error instanceof Error && error.message === "DATABASE_URL tanımlı değil.";
}

function recordOf(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function text(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function optionalText(record: Record<string, unknown>, key: string): string | null | undefined {
  const value = record[key];
  if (value == null) {
    return null;
  }
  return typeof value === "string" ? value : undefined;
}

function whole(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function parseStore(value: unknown): CockpitStore | null {
  const record = recordOf(value);
  if (!record) {
    return null;
  }
  const id = text(record, "id");
  const name = text(record, "name");
  const slug = text(record, "slug");
  const status = text(record, "status");
  const currencyCode = text(record, "currencyCode");
  const whatsapp = optionalText(record, "whatsappE164");
  const createdAt = text(record, "createdAt");
  const updatedAt = text(record, "updatedAt");
  if (!id || !name || !slug || !createdAt || !updatedAt || whatsapp === undefined) {
    return null;
  }
  if (status !== "DRAFT" && status !== "ACTIVE") {
    return null;
  }
  if (currencyCode !== "TRY") {
    return null;
  }
  return { id, name, slug, status, currencyCode, whatsappE164: whatsapp, createdAt, updatedAt };
}

function parseVariant(value: unknown): CockpitVariant | null {
  const record = recordOf(value);
  if (!record) {
    return null;
  }
  const id = text(record, "id");
  const productId = text(record, "productId");
  const sku = text(record, "sku");
  const barcode = optionalText(record, "barcode");
  const amountMinor = record.amountMinor == null ? null : whole(record, "amountMinor");
  const onHandQty = whole(record, "onHandQty");
  const safetyBuffer = whole(record, "safetyBuffer");
  const sellableQty = whole(record, "sellableQty");
  const status = text(record, "status");
  const updatedAt = text(record, "updatedAt");
  if (!id || !productId || !sku || barcode === undefined || onHandQty == null || safetyBuffer == null) {
    return null;
  }
  if (sellableQty == null || !updatedAt) {
    return null;
  }
  if (record.amountMinor != null && amountMinor == null) {
    return null;
  }
  if (status !== "DRAFT" && status !== "ACTIVE" && status !== "PASSIVE") {
    return null;
  }
  return {
    id,
    productId,
    sku,
    barcode,
    amountMinor,
    onHandQty,
    safetyBuffer,
    sellableQty,
    status,
    updatedAt,
  };
}

function parseProduct(value: unknown): CockpitProduct | null {
  const record = recordOf(value);
  if (!record) {
    return null;
  }
  const id = text(record, "id");
  const storeId = text(record, "storeId");
  const title = text(record, "title");
  const description = text(record, "description");
  const category = text(record, "category");
  const other = text(record, "other");
  const source = text(record, "source");
  const status = text(record, "status");
  const updatedAt = text(record, "updatedAt");
  const market = record.listingMarket;
  if (!id || !storeId || !title || description == null || !category || other == null || !source || !status || !updatedAt) {
    return null;
  }
  if (source !== "MANUAL" && source !== "MANUAL_CSV" && source !== "TEZGAH_PAZARYERI") {
    return null;
  }
  if (status !== "DRAFT" && status !== "ACTIVE" && status !== "ARCHIVED") {
    return null;
  }
  if (market != null && market !== "trendyol" && market !== "hepsiburada" && market !== "amazon") {
    return null;
  }
  if (!Array.isArray(record.attributes) || !Array.isArray(record.variants)) {
    return null;
  }
  const attributes = [];
  for (const item of record.attributes) {
    const row = recordOf(item);
    const column = row ? text(row, "column") : null;
    const cell = row ? text(row, "value") : null;
    if (!column || !cell) {
      return null;
    }
    attributes.push({ column, value: cell });
  }
  const variants = [];
  for (const item of record.variants) {
    const variant = parseVariant(item);
    if (!variant) {
      return null;
    }
    variants.push(variant);
  }
  return {
    id,
    storeId,
    title,
    description,
    category,
    attributes,
    other,
    listingMarket: market == null ? null : market,
    source,
    status,
    updatedAt,
    variants,
  };
}

function parseMovement(value: unknown): CockpitMovement | null {
  const record = recordOf(value);
  if (!record) {
    return null;
  }
  const id = text(record, "id");
  const type = text(record, "type");
  const direction = text(record, "direction");
  const quantity = whole(record, "quantity");
  const onHandAfter = whole(record, "onHandAfter");
  const note = text(record, "note");
  const createdAt = text(record, "createdAt");
  const variant = parseVariant(record.variant);
  if (!id || !type || !direction || quantity == null || onHandAfter == null || note == null || !createdAt || !variant) {
    return null;
  }
  return { id, type, direction, quantity, onHandAfter, note, createdAt, variant };
}

async function readDown<T>(run: () => Promise<CockpitRead<T>>): Promise<CockpitRead<T>> {
  try {
    return await run();
  } catch (error) {
    if (isDown(error)) {
      return { kind: "down" };
    }
    throw error;
  }
}

export async function loadOwnerStores(userId: string): Promise<CockpitRead<CockpitStore[]>> {
  return readDown<CockpitStore[]>(async () => {
    const result = await listCommerceStores(createPrismaCommerceRepository(), userId);
    if (!result.ok) {
      return { kind: "down" };
    }
    const stores: CockpitStore[] = [];
    for (const row of result.data.stores) {
      const store = parseStore(row);
      if (!store) {
        return { kind: "down" };
      }
      stores.push(store);
    }
    return { kind: "ok", value: stores };
  });
}

export async function loadOwnerStore(userId: string, storeId: string): Promise<CockpitRead<CockpitStore>> {
  if (!ID.test(storeId)) {
    return { kind: "missing" };
  }
  return readDown<CockpitStore>(async () => {
    const result = await getCommerceStore(createPrismaCommerceRepository(), userId, storeId);
    if (!result.ok) {
      return result.status === 404 ? { kind: "missing" } : { kind: "down" };
    }
    const store = parseStore(result.data.store);
    return store ? { kind: "ok", value: store } : { kind: "down" };
  });
}

export async function loadOwnerProducts(userId: string, storeId: string): Promise<CockpitRead<CockpitProduct[]>> {
  if (!ID.test(storeId)) {
    return { kind: "missing" };
  }
  return readDown<CockpitProduct[]>(async () => {
    const result = await listCommerceProducts(createPrismaCommerceRepository(), userId, storeId);
    if (!result.ok) {
      return result.status === 404 ? { kind: "missing" } : { kind: "down" };
    }
    const products: CockpitProduct[] = [];
    for (const row of result.data.products) {
      const product = parseProduct(row);
      if (!product) {
        return { kind: "down" };
      }
      products.push(product);
    }
    return { kind: "ok", value: products };
  });
}

export async function loadOwnerProduct(
  userId: string,
  storeId: string,
  productId: string,
): Promise<CockpitRead<CockpitProduct>> {
  if (!ID.test(storeId) || !ID.test(productId)) {
    return { kind: "missing" };
  }
  return readDown<CockpitProduct>(async () => {
    const result = await getCommerceProduct(createPrismaCommerceRepository(), userId, storeId, productId);
    if (!result.ok) {
      return result.status === 404 ? { kind: "missing" } : { kind: "down" };
    }
    const product = parseProduct(result.data.product);
    return product ? { kind: "ok", value: product } : { kind: "down" };
  });
}

export async function loadOwnerInventory(
  userId: string,
  storeId: string,
  variantId?: string,
): Promise<CockpitRead<CockpitMovement[]>> {
  if (!ID.test(storeId) || (variantId != null && variantId !== "" && !ID.test(variantId))) {
    return { kind: "missing" };
  }
  return readDown<CockpitMovement[]>(async () => {
    const result = await listCommerceInventory(
      createPrismaCommerceRepository(),
      userId,
      storeId,
      variantId || undefined,
    );
    if (!result.ok) {
      return result.status === 404 ? { kind: "missing" } : { kind: "down" };
    }
    const movements: CockpitMovement[] = [];
    for (const row of result.data.movements) {
      const movement = parseMovement(row);
      if (!movement) {
        return { kind: "down" };
      }
      movements.push(movement);
    }
    return { kind: "ok", value: movements };
  });
}

export async function loadOwnerLicense(userId: string, storeId: string): Promise<CockpitRead<CockpitLicense>> {
  if (!ID.test(storeId)) {
    return { kind: "missing" };
  }
  return readDown<CockpitLicense>(async () => {
    const row = await createPrismaCommerceSubscriptionStore().findByStoreId(storeId);
    const amountMinor = await readCommerceMonthlyAmount(createPrismaPriceCatalogStore());
    const billing = await readBillingInfo(createPrismaBillingInfoStore(), userId);
    const now = new Date();
    let phase: CockpitLicense["phase"] = "absent";
    if (row && commerceLicenseActive(row, now)) {
      phase = "open";
    } else if (row?.status === "ACTIVE") {
      phase = "closed";
    } else if (row) {
      phase = "pending";
    }
    return {
      kind: "ok",
      value: {
        phase,
        expiresAt: row?.expiresAt ? row.expiresAt.toISOString() : null,
        amountMinor,
        billingReady: billing != null,
      },
    };
  });
}

export async function loadOwnerChannel(
  userId: string,
  storeId: string,
  channel: CommerceChannelName,
): Promise<CockpitRead<CockpitChannel>> {
  if (!ID.test(storeId)) {
    return { kind: "missing" };
  }
  return readDown<CockpitChannel>(async () => {
    const commerce = createPrismaCommerceRepository();
    const marketplace = createPrismaMarketplaceRepository();
    const credential = await getTrendyolCredential(commerce, marketplace, userId, storeId, channel);
    if (!credential.ok && credential.status !== 404) {
      return { kind: "down" };
    }
    const listings = await listTrendyolListings(commerce, marketplace, userId, storeId, channel);
    if (!listings.ok) {
      return listings.status === 404 ? { kind: "missing" } : { kind: "down" };
    }
    return {
      kind: "ok",
      value: {
        credential: credential.ok
          ? { supplierHint: credential.data.credential.supplierHint, updatedAt: credential.data.credential.updatedAt }
          : null,
        listings: listings.data.listings,
      },
    };
  });
}
