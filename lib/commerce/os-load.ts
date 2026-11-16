import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { isPrismaClientError, isPrismaUnavailableError } from "@/lib/kernel/db-errors";
import { isAdEligibleStock, summarizeExportSupport } from "@/lib/commerce/os-growth";
import { OS_CHANNEL_CATALOG, isCriticalStock, isHighStock, pickPoolStore } from "@/lib/commerce/os-rules";
import type { OsChannelView, OsCockpitView, OsGrantLine, OsInboxView, OsProductView } from "@/lib/commerce/os-types";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";

export type OsLoad = { kind: "ok"; view: OsCockpitView } | { kind: "down" };

function isDown(error: unknown): boolean {
  if (isPrismaUnavailableError(error) || isPrismaClientError(error)) {
    return true;
  }
  return error instanceof Error && error.message === "DATABASE_URL tanımlı değil.";
}

function channelLabel(kind: string): string {
  return OS_CHANNEL_CATALOG.find((row) => row.kind === kind)?.label ?? kind;
}

function inboxTitle(entry: { kind: string; customerLabel: string; externalRef: string }): string {
  if (entry.kind === "STOCK_ALERT") {
    return entry.customerLabel || "Aşırı Satış / Stok Tükendi Uyarısı";
  }
  if (entry.kind === "ORDER") {
    return entry.externalRef ? `Sipariş ${entry.externalRef}` : "Sipariş";
  }
  if (entry.kind === "EXPERT_TASK") {
    return "Uzman görevi";
  }
  if (entry.kind === "PRODUCT_REVIEW") {
    return entry.customerLabel || "Ürün yorumu";
  }
  return entry.customerLabel || "Müşteri sorusu";
}

function messageStatusOf(value: string | null | undefined): OsInboxView["messageStatus"] {
  if (value === "OPEN" || value === "DRAFT" || value === "ANSWERED" || value === "PENDING_CREDENTIALS") {
    return value;
  }
  return null;
}

function answerable(kind: string): boolean {
  return kind === "QUESTION" || kind === "CUSTOMER_QUESTION" || kind === "PRODUCT_REVIEW";
}

function deskStatusOf(kind: string, value: string): OsInboxView["deskStatus"] {
  if (kind !== "EXPERT_TASK") {
    return null;
  }
  if (value === "IN_PROGRESS" || value === "DELIVERED") {
    return value;
  }
  return "OPEN";
}

function orderStatusOf(value: string | null): OsInboxView["orderStatus"] {
  if (value === "OPEN" || value === "CANCELLED" || value === "RETURNED") {
    return value;
  }
  return null;
}

async function readGrants(): Promise<OsCockpitView["grants"]> {
  try {
    const catalog = await loadYetkinhibeGrantCatalog();
    const lines: OsGrantLine[] = [];
    for (const row of catalog) {
      if (row.status !== "ACTIVE" && row.status !== "CLOSING_SOON") {
        continue;
      }
      lines.push({
        title: row.title,
        source: row.sourceLabel,
        remainingDays: row.remainingDays,
        statusLabel: row.status === "CLOSING_SOON" ? "Son günler" : "Açık",
      });
      if (lines.length === 3) {
        break;
      }
    }
    return { ok: true, lines };
  } catch {
    return { ok: false, message: "Hibe taraması şu an okunamadı." };
  }
}

export async function loadOsCockpit(userId: string): Promise<OsLoad> {
  try {
    const db = getPrisma();
    const stores = await db.commerceStore.findMany({
      where: { ownerUserId: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, slug: true },
    });
    const storeIds = stores.map((store) => store.id);
    const pool = pickPoolStore(stores);
    const [products, channelRows, entries, receipts] = await Promise.all([
      storeIds.length === 0
        ? Promise.resolve([])
        : db.commerceProduct.findMany({
            where: { storeId: { in: storeIds } },
            orderBy: { createdAt: "desc" },
            include: {
              variants: { orderBy: { createdAt: "asc" }, take: 1 },
              stockLedgers: {
                where: { type: "INBOUND_DRAFT", settledBy: { is: null } },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          }),
      pool
        ? db.salesChannel.findMany({ where: { storeId: pool.id } })
        : Promise.resolve([]),
      db.commerceInboxEntry.findMany({
        where: { store: { ownerUserId: userId } },
        orderBy: { createdAt: "desc" },
        take: 40,
        include: { product: { select: { id: true, title: true } } },
      }),
      db.commerceMarketplaceWebhookReceipt.findMany({
        where: { store: { ownerUserId: userId } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { variant: { select: { product: { select: { id: true, title: true } } } } },
      }),
    ]);

    const productViews: OsProductView[] = products.map((product) => {
      const variant = product.variants[0] ?? null;
      const draft = product.stockLedgers[0] ?? null;
      const priceMinor = product.basePriceMinor > 0 ? product.basePriceMinor : (variant?.amountMinor ?? 0);
      return {
        id: product.id,
        storeId: product.storeId,
        title: product.title,
        sku: product.sku || variant?.sku || "",
        category: product.category,
        priceMinor,
        approvedStockQty: product.approvedStockQty,
        criticalStockQty: product.criticalStockQty,
        critical: isCriticalStock(product.approvedStockQty, product.criticalStockQty),
        highStock: isHighStock(product.approvedStockQty, product.criticalStockQty),
        adEligible: isAdEligibleStock(product.approvedStockQty, product.criticalStockQty),
        variantId: variant?.id ?? null,
        pendingDraft: draft ? { id: draft.id, quantity: draft.quantity } : null,
      };
    });

    const channels: OsChannelView[] = OS_CHANNEL_CATALOG.map((item) => {
      const row = channelRows.find((channel) => channel.kind === item.kind);
      return {
        kind: item.kind,
        label: item.label,
        needsKey: item.needsKey,
        status: row?.status ?? "DISCONNECTED",
        hint: row?.apiKeyHint ?? "",
        lastError: row?.lastError ?? "",
        lastSyncedAt: row?.lastSyncedAt ? row.lastSyncedAt.toISOString() : null,
      };
    });

    const questions: OsInboxView[] = entries.map((entry) => {
      const kind =
        entry.kind === "ORDER" ||
        entry.kind === "QUESTION" ||
        entry.kind === "EXPERT_TASK" ||
        entry.kind === "STOCK_ALERT" ||
        entry.kind === "CUSTOMER_QUESTION" ||
        entry.kind === "PRODUCT_REVIEW"
          ? entry.kind
          : "QUESTION";
      const status = messageStatusOf(entry.messageStatus);
      const open = status !== "ANSWERED" && entry.replySentAt == null;
      return {
        id: entry.id,
        kind,
        channelLabel: channelLabel(entry.channel),
        title: inboxTitle(entry),
        body: entry.body,
        priority: entry.priority,
        orderStatus: orderStatusOf(entry.orderStatus),
        messageStatus: status,
        productId: entry.product?.id ?? entry.productId,
        productTitle: entry.product?.title ?? null,
        replyBody: entry.replyBody,
        replySentAt: entry.replySentAt ? entry.replySentAt.toISOString() : null,
        createdAt: entry.createdAt.toISOString(),
        canSuggest: answerable(kind) && open && Boolean(entry.productId),
        canSend: answerable(kind) && open && entry.replyBody.trim().length >= 2,
        deskStatus: deskStatusOf(kind, entry.expertStatus),
        deskNote: kind === "EXPERT_TASK" ? entry.expertNote : "",
      };
    });

    const orders: OsInboxView[] = receipts.map((receipt) => ({
      id: `wh:${receipt.id}`,
      kind: "ORDER",
      channelLabel: channelLabel(receipt.channel),
      title: `Sipariş ${receipt.externalOrderId}`,
      body:
        receipt.status === "STOCK_SHORT"
          ? `${receipt.quantity} adet. Stok yetmedi.`
          : `${receipt.quantity} adet. Stok düştü.`,
      priority: 0,
      orderStatus: "OPEN",
      messageStatus: null,
      productId: receipt.variant.product.id,
      productTitle: receipt.variant.product.title,
      replyBody: "",
      replySentAt: null,
      createdAt: receipt.createdAt.toISOString(),
      canSuggest: false,
      canSend: false,
      deskStatus: null,
      deskNote: "",
    }));

    const inbox = [...questions, ...orders]
      .sort((left, right) => right.priority - left.priority || right.createdAt.localeCompare(left.createdAt))
      .slice(0, 40);

    const grants = await readGrants();
    const exportSupport = summarizeExportSupport({
      products: productViews.map((product) => ({
        approvedStockQty: product.approvedStockQty,
        priceMinor: product.priceMinor,
      })),
      lines: grants.ok ? grants.lines : [],
      catalogNote: grants.ok ? null : grants.message,
    });

    return {
      kind: "ok",
      view: {
        products: productViews,
        channels,
        inbox,
        stores: stores.map((store) => ({ id: store.id, name: store.name, slug: store.slug })),
        grants,
        exportSupport,
      },
    };
  } catch (error) {
    if (isDown(error)) {
      return { kind: "down" };
    }
    throw error;
  }
}
