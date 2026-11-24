import { randomUUID } from "node:crypto";
import {
  CommerceCredentialSealError,
  sealCommerceCredential,
  supplierHint,
} from "@/lib/commerce/credential-seal";
import { MarketplaceConflict, type MarketplaceRepository } from "@/lib/commerce/marketplace-repository";
import { liveStoreLicense } from "@/lib/commerce/store-license";
import { supplierIdShape } from "@/lib/commerce/channel-credentials";
import {
  COMMERCE_CHANNEL,
  listingView,
  maskedCredential,
  type CommerceChannelName,
  type ListingView,
  type MaskedTrendyolCredential,
} from "@/lib/commerce/marketplace-types";
import type { CommerceRepository } from "@/lib/commerce/repository";
import { commerceFail, type CommerceResult } from "@/lib/commerce/types";

const MISSING = "Kayıt bulunamadı.";

function recordOf(raw: unknown): Record<string, unknown> | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  return raw as Record<string, unknown>;
}

function readSupplier(value: unknown, channel: CommerceChannelName): string | null {
  if (typeof value !== "string") {
    return null;
  }
  return supplierIdShape(channel, value) ? value : null;
}

function readSecret(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 1 || value.length > 256 || value.trim() !== value) {
    return null;
  }
  if (/[\u0000-\u001f\u007f]/.test(value)) {
    return null;
  }
  return value;
}

function readRemoteBarcode(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const text = value.trim();
  if (text.length < 1 || text.length > 40 || /[\u0000-\u001f\u007f]/.test(text)) {
    return null;
  }
  return text;
}

function readOptionalId(value: unknown): string | null | undefined {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value !== "string" || value.length < 1 || value.length > 64 || /[\u0000-\u001f\u007f]/.test(value)) {
    return undefined;
  }
  return value;
}

export async function getTrendyolCredential(
  commerce: CommerceRepository,
  marketplace: MarketplaceRepository,
  userId: string,
  storeId: string,
  channel: CommerceChannelName = COMMERCE_CHANNEL,
): Promise<CommerceResult<{ credential: MaskedTrendyolCredential }>> {
  const store = await commerce.findStoreForOwner(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const row = await marketplace.findCredential(storeId, channel);
  if (!row) {
    return commerceFail(404, MISSING);
  }
  return { ok: true, data: { credential: maskedCredential(row) } };
}

export async function putTrendyolCredential(
  commerce: CommerceRepository,
  marketplace: MarketplaceRepository,
  env: NodeJS.ProcessEnv,
  userId: string,
  storeId: string,
  raw: unknown,
  channel: CommerceChannelName = COMMERCE_CHANNEL,
  license: { allowsOutgoing: (storeId: string, now: Date) => Promise<boolean> } = liveStoreLicense,
): Promise<CommerceResult<{ credential: MaskedTrendyolCredential }>> {
  const store = await commerce.findStoreForOwner(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  // P0.4 — çift taraflı lisans kapısı. Kokpit kapısı (`connectChannel`) 403 dönerken
  // klasik kimlik masası açık kalırsa satıcı lisanssız kimlik yazar ve ekranında
  // "kaydedildi" görür. Bu yüzden kimlik yazan **her** yol aynı kapıdan geçer.
  const licensed = await license.allowsOutgoing(storeId, new Date());
  if (!licensed) {
    return commerceFail(403, "Kanal bağlamak için aktif lisans gerekir.");
  }
  const body = recordOf(raw);
  const supplierId = body ? readSupplier(body.supplierId, channel) : null;
  const apiKey = body ? readSecret(body.apiKey) : null;
  const apiSecret = body ? readSecret(body.apiSecret) : null;
  if (!supplierId || !apiKey || !apiSecret) {
    return commerceFail(422, "Kimlik alanları geçersiz.");
  }
  const now = new Date();
  const row = await marketplace.upsertCredential({
    id: randomUUID(),
    storeId,
    channel,
    supplierHint: supplierHint(supplierId),
    supplierSeal: sealCommerceCredential(supplierId, "supplier", storeId, env, channel),
    apiKeySeal: sealCommerceCredential(apiKey, "apiKey", storeId, env, channel),
    apiSecretSeal: sealCommerceCredential(apiSecret, "apiSecret", storeId, env, channel),
    createdAt: now,
    updatedAt: now,
  });
  return { ok: true, data: { credential: maskedCredential(row) } };
}

export async function deleteTrendyolCredential(
  commerce: CommerceRepository,
  marketplace: MarketplaceRepository,
  userId: string,
  storeId: string,
  channel: CommerceChannelName = COMMERCE_CHANNEL,
): Promise<CommerceResult<{ removed: true }>> {
  const store = await commerce.findStoreForOwner(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const removed = await marketplace.deleteCredential(storeId, channel);
  if (!removed) {
    return commerceFail(404, MISSING);
  }
  return { ok: true, data: { removed: true } };
}

export async function listTrendyolListings(
  commerce: CommerceRepository,
  marketplace: MarketplaceRepository,
  userId: string,
  storeId: string,
  channel: CommerceChannelName = COMMERCE_CHANNEL,
): Promise<CommerceResult<{ listings: ListingView[] }>> {
  const store = await commerce.findStoreForOwner(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const rows = await marketplace.listListings(storeId, channel);
  return { ok: true, data: { listings: rows.map(listingView) } };
}

export async function putTrendyolListing(
  commerce: CommerceRepository,
  marketplace: MarketplaceRepository,
  userId: string,
  storeId: string,
  raw: unknown,
  channel: CommerceChannelName = COMMERCE_CHANNEL,
): Promise<CommerceResult<{ listing: ListingView }>> {
  const store = await commerce.findStoreForOwner(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const body = recordOf(raw);
  const variantId = body && typeof body.variantId === "string" ? body.variantId : "";
  const remoteBarcode = body ? readRemoteBarcode(body.remoteBarcode) : null;
  const remoteProductId = body ? readOptionalId(body.remoteProductId) : null;
  if (!variantId || variantId.length > 64 || !remoteBarcode || remoteProductId === undefined) {
    return commerceFail(422, "Eşleme alanları geçersiz.");
  }
  const variant = await commerce.findVariant(storeId, variantId);
  if (!variant) {
    return commerceFail(404, MISSING);
  }
  if (variant.status !== "ACTIVE" || !variant.barcode || variant.amountMinor == null) {
    return commerceFail(422, "Eşleme için varyant aktif, barkodlu ve fiyatlı olmalıdır.");
  }
  const now = new Date();
  try {
    const row = await marketplace.upsertListing({
      id: randomUUID(),
      storeId,
      variantId: variant.id,
      channel,
      sku: variant.sku,
      barcode: variant.barcode,
      remoteBarcode,
      remoteProductId,
      syncStatus: "PENDING",
      lastError: "",
      lastSyncedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true, data: { listing: listingView(row) } };
  } catch (error) {
    if (error instanceof MarketplaceConflict) {
      return commerceFail(409, channel === "HEPSIBURADA" ? "Bu Hepsiburada barkodu eşlenmiş." : "Bu Trendyol barkodu eşlenmiş.");
    }
    if (error instanceof CommerceCredentialSealError) {
      throw error;
    }
    throw error;
  }
}

export async function deleteTrendyolListing(
  commerce: CommerceRepository,
  marketplace: MarketplaceRepository,
  userId: string,
  storeId: string,
  variantId: string,
  channel: CommerceChannelName = COMMERCE_CHANNEL,
): Promise<CommerceResult<{ removed: true }>> {
  const store = await commerce.findStoreForOwner(userId, storeId);
  if (!store || !variantId) {
    return commerceFail(404, MISSING);
  }
  const removed = await marketplace.deleteListing(storeId, variantId, channel);
  if (!removed) {
    return commerceFail(404, MISSING);
  }
  return { ok: true, data: { removed: true } };
}
