import "server-only";

import { randomUUID } from "node:crypto";
import { buildCareerDeskPackage, isCareerDeskKind, type CareerDeskKind } from "@/lib/career/desk-brief";
import { deliverChannelReply } from "@/lib/commerce/channel-adapters";
import { broadcastStockToChannels } from "@/lib/commerce/channel-broadcast";
import { signedChannelMessageRequest, type ChannelMessagePayload } from "@/lib/commerce/channel-message";
import { postCommerceChannelMessage } from "@/lib/commerce/channel-message-handler";
import { liveChannelMessageDeps } from "@/lib/commerce/channel-message-live";
import { postCommerceChannelWebhook } from "@/lib/commerce/channel-webhook-handler";
import { liveBroadcastDeps, liveChannelWebhookDeps } from "@/lib/commerce/channel-webhook-live";
import { signedChannelWebhookRequest, type ChannelWebhookPayload } from "@/lib/commerce/channel-webhook";
import {
  formatTripleCredential,
  isMarketplaceChannel,
  parseTripleCredential,
  readChannelCredentialFields,
  supplierIdShape,
  webhookSecretFromBroadcastKey,
  type ChannelCredentialFields,
} from "@/lib/commerce/channel-credentials";
import { composeCardReply, type ReplyAttribute, type ReplyCard } from "@/lib/commerce/reply-facts";
import {
  sealCommerceCredential,
  CommerceCredentialSealError,
  openCommerceCredential,
  supplierHint,
} from "@/lib/commerce/credential-seal";
import { commerceSimulationAllowed } from "@/lib/commerce/simulation-gate";
import { consumeCommerceTrialQuota } from "@/lib/commerce/subscription-fair-use";
import { ecommerceCardToDraftProduct } from "@/lib/commerce/ecommerce-bridge";
import { postCommerceInventory, createCommerceProduct, createCommerceStore } from "@/lib/commerce/service";
import type { CommerceRepository } from "@/lib/commerce/repository";
import {
  POOL_STORE_NAME,
  channelComingSoon,
  channelNeedsKey,
  isOsChannelKind,
  pickPoolStore,
  type OsChannelKind,
} from "@/lib/commerce/os-rules";
import {
  effectiveApprovedQty,
  effectiveSku,
  resolveInboundVariant,
  syncApprovedStockFromVariants,
} from "@/lib/commerce/stock-sync";
import { commerceLicenseActive } from "@/lib/commerce/subscription";
import { createPrismaCommerceSubscriptionStore } from "@/lib/commerce/subscription-prisma";
import { commerceFail, type CommerceResult } from "@/lib/commerce/types";
import { invokeLlm } from "@/lib/kernel/ai/llm-gateway";
import { resolveProductModel } from "@/lib/kernel/ai/product-models";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { getPrisma } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";

const MISSING = "Kayıt bulunamadı.";

function isUnique(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002";
}

function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    return null;
  }
  return trimmed;
}

async function ensurePoolStore(
  repo: CommerceRepository,
  userId: string,
): Promise<{ id: string } | CommerceResult<Record<string, unknown>>> {
  const stores = await repo.listStores(userId);
  const existing = pickPoolStore(stores);
  if (existing) {
    return { id: existing.id };
  }
  const created = await createCommerceStore(repo, userId, { name: POOL_STORE_NAME });
  if (!created.ok) {
    return created;
  }
  const id = created.data.store.id;
  if (typeof id !== "string") {
    return commerceFail(422, "Havuz mağazası açılamadı.");
  }
  return { id };
}

function poolId(
  value: { id: string } | CommerceResult<Record<string, unknown>>,
): { ok: true; id: string } | Extract<CommerceResult<Record<string, unknown>>, { ok: false }> {
  if ("ok" in value) {
    if (value.ok) {
      return commerceFail(422, "Havuz mağazası açılamadı.");
    }
    return value;
  }
  return { ok: true, id: value.id };
}

/** Ürün ve tüm varyantları. Onaylı stok ve SKU kararları bütün varyantlara bakar. */
async function ownedProduct(userId: string, productId: string) {
  return getPrisma().commerceProduct.findFirst({
    where: { id: productId, store: { ownerUserId: userId } },
    include: { variants: { orderBy: { createdAt: "asc" } } },
  });
}

/**
 * Onaylı stoğu varyant toplamına çeker. Ürün satırı önce kilitlenir; böylece eşzamanlı
 * bir stok hareketi toplamı yarım okumaz. Yeni onaylı adedi döner.
 */
async function syncOwnedApprovedStock(productId: string): Promise<number> {
  return getPrisma().$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM commerce_products WHERE id = ${productId} FOR UPDATE`;
    return syncApprovedStockFromVariants(tx, productId);
  });
}

async function stampConnected(userId: string): Promise<number> {
  const db = getPrisma();
  const connected = await db.salesChannel.findMany({
    where: { store: { ownerUserId: userId }, status: "CONNECTED" },
    select: { id: true, kind: true },
  });
  if (connected.length === 0) {
    return 0;
  }
  const now = new Date();
  await db.salesChannel.updateMany({
    where: { id: { in: connected.map((row) => row.id) } },
    data: { lastSyncedAt: now, lastError: "" },
  });
  const listingKinds = connected
    .map((row) => row.kind)
    .filter((kind): kind is "TRENDYOL" | "HEPSIBURADA" => kind === "TRENDYOL" || kind === "HEPSIBURADA");
  if (listingKinds.length > 0) {
    await db.commerceChannelListing.updateMany({
      where: { store: { ownerUserId: userId }, channel: { in: listingKinds } },
      data: { syncStatus: "PENDING", lastError: "" },
    });
  }
  return connected.length;
}

export async function importPoolProduct(
  repo: CommerceRepository,
  userId: string,
  raw: { title: string; category: string; description: string },
  httpKey: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const draft = ecommerceCardToDraftProduct(raw);
  if (!draft.ok) {
    return commerceFail(422, draft.error);
  }
  const pool = poolId(await ensurePoolStore(repo, userId));
  if (!pool.ok) {
    return pool;
  }
  const created = await createCommerceProduct(repo, userId, pool.id, draft.body, httpKey);
  if (!created.ok) {
    return created;
  }
  const productId = created.data.product.id;
  const storeId = created.data.product.storeId;
  if (typeof productId !== "string" || typeof storeId !== "string") {
    return commerceFail(422, "Havuz kartı okunamadı.");
  }
  try {
    const row = await repo.findProduct(storeId, productId);
    const variant = row?.variants[0];
    await getPrisma().commerceProduct.update({
      where: { id: productId },
      data: {
        source: "TEZGAH_PAZARYERI",
        sku: variant?.sku ?? "",
        basePriceMinor: variant?.amountMinor && variant.amountMinor > 0 ? variant.amountMinor : 0,
        approvedStockQty: 0,
        criticalStockQty: 5,
      },
    });
  } catch (error) {
    logEvent({
      level: "warn",
      event: "commerce.os.pool_stamp",
      reason: "stamp_failed",
      errorName: error instanceof Error ? error.name : "Error",
    });
  }
  return {
    ok: true,
    data: {
      productId,
      storeId,
      message: draft.trimmed
        ? "Ürün kartı E-Ticaret havuzuna yazıldı. Açıklama 4000 karakterde kesildi."
        : "Ürün kartı E-Ticaret havuzuna yazıldı.",
    },
  };
}

export async function draftInbound(
  userId: string,
  productId: string,
  quantity: number,
  httpKey: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1_000_000) {
    return commerceFail(422, "Adet 1 ile 1000000 arasında olmalıdır.");
  }
  const product = await ownedProduct(userId, productId);
  if (!product) {
    return commerceFail(404, MISSING);
  }
  const open = await getPrisma().stockLedger.findFirst({
    where: { productId: product.id, type: "INBOUND_DRAFT", settledBy: { is: null } },
    select: { id: true, quantity: true },
  });
  if (open) {
    return commerceFail(409, "Bu üründe onay bekleyen taslak var.");
  }
  try {
    const row = await getPrisma().stockLedger.create({
      data: {
        id: randomUUID(),
        storeId: product.storeId,
        productId: product.id,
        actorUserId: userId,
        type: "INBOUND_DRAFT",
        channel: "OWN_STORE",
        quantity,
        stockAfter: effectiveApprovedQty(product.approvedStockQty, product.variants),
        note: "",
        idempotencyKey: `os-draft:${httpKey}`,
      },
    });
    return { ok: true, data: { draftId: row.id, quantity: row.quantity, message: "Taslak stok yazıldı." } };
  } catch (error) {
    if (!isUnique(error)) {
      throw error;
    }
    const prior = await getPrisma().stockLedger.findUnique({ where: { idempotencyKey: `os-draft:${httpKey}` } });
    if (!prior || prior.productId !== product.id) {
      return commerceFail(409, "Bu anahtar başka bir fişe bağlı.");
    }
    return { ok: true, data: { draftId: prior.id, quantity: prior.quantity, message: "Taslak stok yazıldı." } };
  }
}

export async function approveInbound(
  repo: CommerceRepository,
  userId: string,
  productId: string,
  draftId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const product = await ownedProduct(userId, productId);
  if (!product) {
    return commerceFail(404, MISSING);
  }
  const draft = await getPrisma().stockLedger.findFirst({
    where: { id: draftId, productId: product.id, type: "INBOUND_DRAFT" },
  });
  if (!draft) {
    return commerceFail(404, "Taslak stok yok.");
  }
  const settled = await getPrisma().stockLedger.findFirst({
    where: { settlesLedgerId: draft.id },
    select: { id: true },
  });
  if (settled) {
    return commerceFail(409, "Bu taslak onaylandı.");
  }
  // RESTOCK taslağı hedef varyantı notta taşır. Not yoksa ilk aktif beden (yoksa ilk varyant).
  const resolved = resolveInboundVariant(product.variants, draft.note);
  if (!resolved.ok) {
    return commerceFail(
      422,
      resolved.reason === "missing-target" ? "Hedef varyant bu üründe yok." : "Varyant yok. Stok girilemedi.",
    );
  }
  const variant = resolved.variant;
  const moved = await postCommerceInventory(
    repo,
    userId,
    product.storeId,
    {
      variantId: variant.id,
      type: "INBOUND",
      direction: "IN",
      quantity: draft.quantity,
      note: "Onaylı stok",
    },
    draft.id,
  );
  if (!moved.ok) {
    return moved;
  }
  const stockAfter = await syncOwnedApprovedStock(product.id);
  try {
    await getPrisma().stockLedger.create({
      data: {
        id: randomUUID(),
        storeId: product.storeId,
        productId: product.id,
        actorUserId: userId,
        type: "INBOUND_APPROVED",
        channel: "OWN_STORE",
        quantity: draft.quantity,
        stockAfter,
        note: "",
        idempotencyKey: `os-approve:${draft.id}`,
        settlesLedgerId: draft.id,
      },
    });
  } catch (error) {
    if (!isUnique(error)) {
      throw error;
    }
  }
  let fanout = 0;
  try {
    const rows = await broadcastStockToChannels(product.id, null, liveBroadcastDeps());
    fanout = rows.length;
  } catch (error) {
    logEvent({
      level: "warn",
      event: "commerce.os.stock_broadcast",
      reason: "approve_failed",
      errorName: error instanceof Error ? error.name : "Error",
    });
  }
  return {
    ok: true,
    data: {
      approvedStockQty: stockAfter,
      message:
        fanout > 0
          ? "Merkez stok güncellendi. Bağlı kanallara eşitleme kaydı düştü."
          : "Merkez stok güncellendi. Bağlı kanal yok.",
    },
  };
}

/**
 * Kokpit kimlik girişi tek sözleşmedir (P0.3).
 *
 * - Trendyol / Hepsiburada: üç parçalı (Satıcı ID, API Key, API Secret) zorunlu.
 * - Pazaryeri olmayan kanal (vitrin): anahtar yok.
 * - Eski tek alan `satıcı:anahtar:sır` de kabul edilir; düz tek parça anahtar **reddedilir**
 *   (çünkü pazaryeri `Bearer <uzun-metin>` ile 401 döner).
 */
function readChannelCredential(
  kind: OsChannelKind,
  apiKeyRaw: unknown,
  supplierIdRaw: unknown,
  apiSecretRaw: unknown,
): { ok: true; apiKey: string; supplierId: string | null; apiSecret: string | null } | { ok: false; error: string } {
  if (!channelNeedsKey(kind)) {
    return { ok: true, apiKey: "", supplierId: null, apiSecret: null };
  }
  if (!isMarketplaceChannel(kind)) {
    const apiKey = text(apiKeyRaw, 8, 200);
    if (!apiKey) {
      return { ok: false, error: "API anahtarı 8 ile 200 karakter olmalıdır." };
    }
    return { ok: true, apiKey, supplierId: null, apiSecret: null };
  }
  const rawText = typeof apiKeyRaw === "string" ? apiKeyRaw.trim() : "";
  const separated = readChannelCredentialFields(kind, {
    supplierId: supplierIdRaw,
    apiKey: apiKeyRaw,
    apiSecret: apiSecretRaw,
  });
  if (separated.ok) {
    const fields: ChannelCredentialFields = separated.fields;
    return { ok: true, apiKey: fields.apiKey, supplierId: fields.supplierId, apiSecret: fields.apiSecret };
  }
  const triple = rawText ? parseTripleCredential(rawText) : null;
  if (triple && supplierIdShape(kind, triple.supplierId)) {
    return { ok: true, apiKey: triple.apiKey, supplierId: triple.supplierId, apiSecret: triple.apiSecret };
  }
  return { ok: false, error: separated.error };
}

export async function connectChannel(
  repo: CommerceRepository,
  userId: string,
  kindRaw: string,
  connect: boolean,
  apiKeyRaw: unknown,
  supplierIdRaw?: unknown,
  apiSecretRaw?: unknown,
): Promise<CommerceResult<Record<string, unknown>>> {
  if (!isOsChannelKind(kindRaw)) {
    return commerceFail(422, "Kanal geçersiz.");
  }
  const kind: OsChannelKind = kindRaw;
  if (connect && channelComingSoon(kind)) {
    return commerceFail(422, "Bu kanal yakında.");
  }
  const pool = poolId(await ensurePoolStore(repo, userId));
  if (!pool.ok) {
    return pool;
  }
  const db = getPrisma();
  if (!connect) {
    await db.salesChannel.upsert({
      where: { storeId_kind: { storeId: pool.id, kind } },
      create: {
        id: randomUUID(),
        storeId: pool.id,
        kind,
        status: "DISCONNECTED",
        apiKeyHint: "",
        apiKeySeal: "",
        lastError: "",
      },
      update: { status: "DISCONNECTED", apiKeyHint: "", apiKeySeal: "", lastError: "" },
    });
    if (isMarketplaceChannel(kind)) {
      try {
        await db.commerceMarketplaceCredential.deleteMany({ where: { storeId: pool.id, channel: kind } });
      } catch (error) {
        logEvent({
          level: "warn",
          event: "commerce.os.channel_disconnect",
          action: kind,
          reason: "vault_clear_failed",
          errorName: error instanceof Error ? error.name : "Error",
        });
      }
    }
    return { ok: true, data: { status: "DISCONNECTED", message: "Kanal bağlantısı kesildi." } };
  }
  // Lisans kapısı sunucuda. Arayüzdeki düğme tek başına koruma değildir. Bağlantı kesme her zaman açıktır.
  const subscription = await createPrismaCommerceSubscriptionStore().findByStoreId(pool.id);
  if (!commerceLicenseActive(subscription, new Date())) {
    return commerceFail(403, "Kanal bağlamak için aktif lisans gerekir.");
  }
  const credential = readChannelCredential(kind, apiKeyRaw, supplierIdRaw, apiSecretRaw);
  if (!credential.ok) {
    return commerceFail(422, credential.error);
  }
  let apiKeySeal = "";
  let apiKeyHint = "";
  if (channelNeedsKey(kind)) {
    // Yayın adaptörü `satıcı:anahtar:sır` üçlüsünü açar. Pazaryeri kanalında mühür bu üçlüdür.
    const broadcastPlain =
      isMarketplaceChannel(kind) && credential.supplierId && credential.apiSecret
        ? formatTripleCredential({
            supplierId: credential.supplierId,
            apiKey: credential.apiKey,
            apiSecret: credential.apiSecret,
          })
        : credential.apiKey;
    try {
      apiKeySeal = sealCommerceCredential(broadcastPlain, "apiKey", pool.id, process.env, kind);
    } catch (error) {
      if (!(error instanceof CommerceCredentialSealError)) {
        throw error;
      }
      return commerceFail(422, "Kanal anahtarı kasaya yazılamadı.");
    }
    apiKeyHint = credential.apiKey.slice(-4);
  }
  await db.salesChannel.upsert({
    where: { storeId_kind: { storeId: pool.id, kind } },
    create: {
      id: randomUUID(),
      storeId: pool.id,
      kind,
      status: "CONNECTED",
      apiKeyHint,
      apiKeySeal,
      lastError: "",
    },
    update: { status: "CONNECTED", apiKeyHint, apiKeySeal, lastError: "" },
  });

  // Tek kimlik kasası (P0.3): pazaryeri kanalı aynı anda `commerce_marketplace_credentials`
  // satırına yazılır. Kokpitte "Bağla" diyen satıcı, sipariş çeken cron'un okuduğu
  // satırı yazar. Mağaza masasının kanal sayfası ayrıca durur; sipariş kimliği bu satırdır.
  if (isMarketplaceChannel(kind) && credential.supplierId && credential.apiSecret) {
    try {
      await db.commerceMarketplaceCredential.upsert({
        where: { storeId_channel: { storeId: pool.id, channel: kind } },
        create: {
          id: randomUUID(),
          storeId: pool.id,
          channel: kind,
          supplierHint: supplierHint(credential.supplierId),
          supplierSeal: sealCommerceCredential(credential.supplierId, "supplier", pool.id, process.env, kind),
          apiKeySeal: sealCommerceCredential(credential.apiKey, "apiKey", pool.id, process.env, kind),
          apiSecretSeal: sealCommerceCredential(credential.apiSecret, "apiSecret", pool.id, process.env, kind),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          supplierHint: supplierHint(credential.supplierId),
          supplierSeal: sealCommerceCredential(credential.supplierId, "supplier", pool.id, process.env, kind),
          apiKeySeal: sealCommerceCredential(credential.apiKey, "apiKey", pool.id, process.env, kind),
          apiSecretSeal: sealCommerceCredential(credential.apiSecret, "apiSecret", pool.id, process.env, kind),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if (!(error instanceof CommerceCredentialSealError)) {
        throw error;
      }
      return commerceFail(422, "Kanal kimliği kasaya yazılamadı.");
    }
  }
  return {
    ok: true,
    data: {
      status: "CONNECTED",
      hint: apiKeyHint,
      message: isMarketplaceChannel(kind)
        ? "Kanal bağlandı. Sipariş çekme bu kimlikle çalışır."
        : "Kanal bağlandı.",
    },
  };
}

export async function syncCatalog(userId: string): Promise<CommerceResult<Record<string, unknown>>> {
  const stamped = await stampConnected(userId);
  if (stamped === 0) {
    return commerceFail(422, "Bağlı kanal yok.");
  }
  return {
    ok: true,
    data: {
      synced: stamped,
      message: "Güncelleme kuyruğa alındı; periyodik senkronizasyonda işlenecek.",
    },
  };
}

export async function recordQuestion(
  userId: string,
  productId: string,
  channelRaw: string,
  bodyRaw: unknown,
  labelRaw: unknown,
): Promise<CommerceResult<Record<string, unknown>>> {
  if (!isOsChannelKind(channelRaw)) {
    return commerceFail(422, "Kanal geçersiz.");
  }
  const body = text(bodyRaw, 2, 2000);
  if (!body) {
    return commerceFail(422, "Soru 2 ile 2000 karakter olmalıdır.");
  }
  const label = text(labelRaw, 1, 80) ?? "Müşteri";
  const product = await ownedProduct(userId, productId);
  if (!product) {
    return commerceFail(404, MISSING);
  }
  const entry = await getPrisma().commerceInboxEntry.create({
    data: {
      id: randomUUID(),
      storeId: product.storeId,
      productId: product.id,
      channel: channelRaw,
      kind: "QUESTION",
      customerLabel: label,
      body,
    },
  });
  return { ok: true, data: { entryId: entry.id, message: "Soru gelen kutuya yazıldı." } };
}

function isAnswerableKind(kind: string): boolean {
  return kind === "QUESTION" || kind === "CUSTOMER_QUESTION" || kind === "PRODUCT_REVIEW";
}

function replyCardOf(product: {
  title: string;
  description: string;
  otherNote: string;
  attributes: unknown;
  approvedStockQty: number;
  criticalStockQty: number;
}): ReplyCard {
  const attributes: ReplyAttribute[] = [];
  if (Array.isArray(product.attributes)) {
    for (const item of product.attributes) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const column = (item as { column?: unknown }).column;
      const value = (item as { value?: unknown }).value;
      if (typeof column === "string" && typeof value === "string") {
        attributes.push({ column, value });
      }
    }
  }
  return {
    title: product.title,
    description: product.description,
    otherNote: product.otherNote,
    attributes,
    approvedStockQty: product.approvedStockQty,
    criticalStockQty: product.criticalStockQty,
  };
}

export async function suggestReply(
  userId: string,
  entryId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const entry = await getPrisma().commerceInboxEntry.findFirst({
    where: { id: entryId, store: { ownerUserId: userId } },
    include: { product: true },
  });
  if (!entry || !isAnswerableKind(entry.kind) || !entry.product) {
    return commerceFail(404, MISSING);
  }
  if (entry.messageStatus === "ANSWERED" || entry.replySentAt) {
    return commerceFail(409, "Yanıt gönderildi.");
  }
  const quota = await consumeCommerceTrialQuota(entry.storeId, "question");
  if (!quota.ok) {
    return commerceFail(422, quota.error);
  }
  const card = replyCardOf(entry.product);
  const reply = await composeCardReply(card, entry.body, async (prompt) => {
    const llm = await invokeLlm({
      role: "LITE_STREAM",
      model: await resolveProductModel("textEasy"),
      system: prompt.system,
      user: prompt.user,
      temperature: 0.2,
      maxOutputTokens: 280,
      rateLimit: {
        identifier: userId,
        scope: "commerce-os-reply",
        limit: 30,
        windowMs: 3_600_000,
      },
      billing: {
        userId,
        source: AI_TOKEN_SOURCES.COMMERCE,
        recordUsage: true,
      },
    });
    return llm?.text ?? null;
  });
  if (reply.trim().length < 2) {
    return commerceFail(422, "Yanıt önerilemedi.");
  }
  await getPrisma().commerceInboxEntry.update({
    where: { id: entry.id },
    data: { replyBody: reply, messageStatus: "DRAFT" },
  });
  return {
    ok: true,
    data: { reply, status: "DRAFT", message: "Yanıt taslağı ürün kartından yazıldı. Kanala gitmedi." },
  };
}

async function markReplyPending(entryId: string) {
  await getPrisma().commerceInboxEntry.update({
    where: { id: entryId },
    data: { messageStatus: "PENDING_CREDENTIALS", replySentAt: null },
  });
}

export async function sendChannelReply(
  userId: string,
  entryId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const entry = await getPrisma().commerceInboxEntry.findFirst({
    where: { id: entryId, store: { ownerUserId: userId } },
  });
  if (!entry || !isAnswerableKind(entry.kind)) {
    return commerceFail(404, MISSING);
  }
  if (entry.messageStatus === "ANSWERED" || entry.replySentAt) {
    return commerceFail(409, "Yanıt gönderildi.");
  }
  if (entry.replyBody.trim().length < 2) {
    return commerceFail(422, "Önce yanıt taslağı.");
  }
  let apiKey: string | null = null;
  if (channelNeedsKey(entry.channel)) {
    const channel = await getPrisma().salesChannel.findUnique({
      where: { storeId_kind: { storeId: entry.storeId, kind: entry.channel } },
      select: { status: true, apiKeySeal: true },
    });
    if (!channel || channel.status !== "CONNECTED" || !channel.apiKeySeal.startsWith("ccred1:")) {
      await markReplyPending(entry.id);
      return {
        ok: true,
        data: { status: "PENDING_CREDENTIALS", message: "Kimlik yok. Yanıt kanala gitmedi." },
      };
    }
    try {
      apiKey = openCommerceCredential(channel.apiKeySeal, "apiKey", entry.storeId, process.env, entry.channel).trim();
    } catch (error) {
      if (!(error instanceof CommerceCredentialSealError)) {
        throw error;
      }
      await markReplyPending(entry.id);
      return {
        ok: true,
        data: { status: "PENDING_CREDENTIALS", message: "Kimlik kasası kapalı. Yanıt kanala gitmedi." },
      };
    }
    if (!apiKey) {
      await markReplyPending(entry.id);
      return {
        ok: true,
        data: { status: "PENDING_CREDENTIALS", message: "Kimlik yok. Yanıt kanala gitmedi." },
      };
    }
  }
  const outcome = await deliverChannelReply(entry.channel, {
    externalMessageId: entry.externalRef || entry.id,
    body: entry.replyBody,
    apiKey,
    fetchImpl: (url, init) => fetch(url, init),
  });
  if (outcome.status === "PENDING_CREDENTIALS") {
    await markReplyPending(entry.id);
    return {
      ok: true,
      data: { status: "PENDING_CREDENTIALS", message: "Kimlik yok. Yanıt kanala gitmedi." },
    };
  }
  if (outcome.status !== "PUSHED") {
    return commerceFail(422, "Kanal yanıtı iletmedi.");
  }
  const sentAt = new Date();
  await getPrisma().commerceInboxEntry.update({
    where: { id: entry.id },
    data: { messageStatus: "ANSWERED", replySentAt: sentAt },
  });
  return { ok: true, data: { status: "ANSWERED", message: "Yanıt kanala iletildi." } };
}

export async function simulateTrendyolUnitSale(
  userId: string,
  productId: string | null,
): Promise<CommerceResult<Record<string, unknown>>> {
  if (!commerceSimulationAllowed()) {
    return commerceFail(403, "Simülasyon bu ortamda kapalı.");
  }
  const product = productId
    ? await ownedProduct(userId, productId)
    : await getPrisma().commerceProduct.findFirst({
        where: {
          store: { ownerUserId: userId },
          OR: [{ sku: { not: "" } }, { variants: { some: { sku: { not: "" } } } }],
        },
        orderBy: { createdAt: "asc" },
        include: { variants: { orderBy: { createdAt: "asc" } } },
      });
  if (!product) {
    return commerceFail(404, MISSING);
  }
  // Simülasyon **gerçek bir varyantı** hedefler: çok bedenli üründe ürün SKU'su
  // tek başına bedeni belirlemez ve stok köprüsü 422 döner.
  const target = product.variants.find((row) => row.sku.trim() !== "") ?? null;
  const sku = target?.sku.trim() || effectiveSku(product.sku, product.variants);
  if (!sku) {
    return commerceFail(422, "SKU yok.");
  }
  const payload: ChannelWebhookPayload = {
    storeId: product.storeId,
    sku,
    externalOrderId: `SIM-${randomUUID()}`,
    eventType: "ORDER_CREATED",
    quantity: 1,
    customerLabel: "Simülasyon",
    ...(target?.barcode ? { barcode: target.barcode } : {}),
  };
  const signed = await trendyolWebhookSecret(userId, product.storeId);
  if (!signed.ok) {
    return signed;
  }
  const response = await postCommerceChannelWebhook(
    liveChannelWebhookDeps(),
    signedChannelWebhookRequest({
      channel: "trendyol",
      secret: signed.secret,
      payload,
      simOwner: signed.simOwner,
    }),
    "trendyol",
  );
  const json = (await response.json()) as { ok?: boolean; error?: string; data?: Record<string, unknown> };
  if (!response.ok || json.ok !== true || !json.data) {
    const status = response.status;
    const mapped = status === 400 || status === 404 || status === 409 || status === 422 ? status : 422;
    return commerceFail(mapped, typeof json.error === "string" ? json.error : "Simülasyon işlenmedi.");
  }
  const stockAfter = json.data.stockAfter;
  const oversell = json.data.oversell === true;
  const stockLabel = typeof stockAfter === "number" ? String(stockAfter) : "güncellendi";
  return {
    ok: true,
    data: {
      ...json.data,
      message: oversell
        ? `Örnek Trendyol siparişi işlendi. Stok ${typeof stockAfter === "number" ? stockAfter : 0}. Aşırı Satış / Stok Tükendi Uyarısı.`
        : `Örnek Trendyol siparişi işlendi. Stok ${stockLabel}. ${simulationBroadcastNote(json.data)}`,
    },
  };
}

/** Simülasyon yanıtındaki yayın sonucu. PUSHED olmayan kanal "gitti" sayılmaz. */
export function simulationBroadcastNote(data: Record<string, unknown>): string {
  const rows = Array.isArray(data.broadcast) ? data.broadcast : [];
  const statuses = rows.flatMap((row) => {
    if (row == null || typeof row !== "object") {
      return [];
    }
    const status = (row as { status?: unknown }).status;
    return typeof status === "string" ? [status] : [];
  });
  if (statuses.length === 0) {
    return "Başka kanala yayın satırı düşmedi.";
  }
  const pushed = statuses.filter((status) => status === "PUSHED").length;
  if (pushed === statuses.length) {
    return `${pushed} kanala stok yayını gitti.`;
  }
  return `${pushed} kanal yayını aldı. ${statuses.length - pushed} kanal bekliyor veya reddetti.`;
}

async function trendyolWebhookSecret(
  _userId: string,
  storeId: string,
): Promise<{ ok: true; secret: string; simOwner?: string } | Extract<CommerceResult<Record<string, unknown>>, { ok: false }>> {
  const channel = await getPrisma().salesChannel.findUnique({
    where: { storeId_kind: { storeId, kind: "TRENDYOL" } },
    select: { apiKeySeal: true },
  });
  let secret = "";
  let simOwner: string | undefined;
  if (channel?.apiKeySeal.startsWith("ccred1:")) {
    try {
      secret = webhookSecretFromBroadcastKey(
        openCommerceCredential(channel.apiKeySeal, "apiKey", storeId, process.env, "TRENDYOL"),
      );
    } catch (error) {
      if (!(error instanceof CommerceCredentialSealError)) {
        throw error;
      }
      if (/yok|32 bayt/.test(error.message)) {
        return commerceFail(422, "Kimlik kasası kapalı.");
      }
    }
  }
  if (!secret) {
    secret =
      process.env.COMMERCE_WEBHOOK_SECRET_TRENDYOL?.trim() || process.env.COMMERCE_OS_WEBHOOK_SECRET?.trim() || "";
  }
  if (!secret) {
    return commerceFail(403, "Webhook sırrı yok.");
  }
  return { ok: true, secret, simOwner };
}

export async function simulateTrendyolQuestion(
  userId: string,
  productId: string | null,
): Promise<CommerceResult<Record<string, unknown>>> {
  if (!commerceSimulationAllowed()) {
    return commerceFail(403, "Simülasyon bu ortamda kapalı.");
  }
  const product = productId
    ? await ownedProduct(userId, productId)
    : await getPrisma().commerceProduct.findFirst({
        where: {
          store: { ownerUserId: userId },
          OR: [{ sku: { not: "" } }, { variants: { some: { sku: { not: "" } } } }],
        },
        orderBy: { createdAt: "asc" },
        include: { variants: { orderBy: { createdAt: "asc" } } },
      });
  if (!product) {
    return commerceFail(404, MISSING);
  }
  const sku = effectiveSku(product.sku, product.variants);
  if (!sku) {
    return commerceFail(422, "SKU yok.");
  }
  const payload: ChannelMessagePayload = {
    storeId: product.storeId,
    sku,
    externalProductId: "",
    externalMessageId: `SIM-${randomUUID()}`,
    eventType: "CUSTOMER_QUESTION",
    body: "Bu ürünün ölçüsü ve kullanım talimatı nedir?",
    customerLabel: "Simülasyon",
  };
  const signed = await trendyolWebhookSecret(userId, product.storeId);
  if (!signed.ok) {
    return signed;
  }
  const response = await postCommerceChannelMessage(
    liveChannelMessageDeps(),
    signedChannelMessageRequest({
      channel: "trendyol",
      secret: signed.secret,
      payload,
      simOwner: signed.simOwner,
    }),
    "trendyol",
  );
  const json = (await response.json()) as { ok?: boolean; error?: string; data?: Record<string, unknown> };
  if (!response.ok || json.ok !== true || !json.data) {
    const status = response.status;
    const mapped = status === 400 || status === 404 || status === 409 || status === 422 ? status : 422;
    return commerceFail(mapped, typeof json.error === "string" ? json.error : "Soru simülasyonu işlenmedi.");
  }
  return {
    ok: true,
    data: {
      ...json.data,
      message: "Örnek Trendyol müşteri sorusu gelen kutuya yazıldı.",
    },
  };
}

export async function dropExpertTask(
  userId: string,
  productId: string,
  taskKind: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  if (!isCareerDeskKind(taskKind)) {
    return commerceFail(422, "Görev türü geçersiz.");
  }
  const product = await ownedProduct(userId, productId);
  if (!product) {
    return commerceFail(404, MISSING);
  }
  const kind: CareerDeskKind = taskKind;
  const pack = buildCareerDeskPackage({
    kind,
    productTitle: product.title,
    sku: effectiveSku(product.sku, product.variants),
    approvedStockQty: effectiveApprovedQty(product.approvedStockQty, product.variants),
  });
  const existing = await getPrisma().careerDeskTask.findUnique({
    where: { userId_productId_kind: { userId, productId: product.id, kind } },
    select: { id: true, inboxEntryId: true },
  });
  if (existing) {
    return {
      ok: true,
      data: {
        entryId: existing.inboxEntryId,
        taskId: existing.id,
        href: pack.href,
        replayed: true,
        message: "Görev paketi çalışma odasında duruyor. Kamu ilanı açılmadı.",
      },
    };
  }
  const entryId = randomUUID();
  const entry = await getPrisma().commerceInboxEntry.create({
    data: {
      id: entryId,
      storeId: product.storeId,
      productId: product.id,
      channel: "OWN_STORE",
      kind: "EXPERT_TASK",
      body: pack.brief,
      expertStatus: "OPEN",
    },
  });
  try {
    const task = await getPrisma().careerDeskTask.create({
      data: {
        id: randomUUID(),
        userId,
        productId: product.id,
        inboxEntryId: entry.id,
        kind,
        title: pack.title,
        brief: pack.brief,
      },
    });
    return {
      ok: true,
      data: {
        entryId: entry.id,
        taskId: task.id,
        href: pack.href,
        message: "Görev paketi Kariyer çalışma odasına yazıldı. Kamu ilanı açılmadı.",
      },
    };
  } catch (error) {
    if (!isUnique(error)) {
      throw error;
    }
    const raced = await getPrisma().careerDeskTask.findUnique({
      where: { userId_productId_kind: { userId, productId: product.id, kind } },
      select: { id: true, inboxEntryId: true },
    });
    return {
      ok: true,
      data: {
        entryId: raced?.inboxEntryId ?? entry.id,
        taskId: raced?.id ?? "",
        href: pack.href,
        replayed: true,
        message: "Görev paketi çalışma odasında duruyor. Kamu ilanı açılmadı.",
      },
    };
  }
}
