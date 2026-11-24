import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { isPrismaClientError, isPrismaUnavailableError } from "@/lib/kernel/db-errors";
import { defaultsForChannel } from "@/lib/commerce/economics-defaults";
import { isAdEligibleStock, summarizeExportSupport } from "@/lib/commerce/os-growth";
import {
  OS_CHANNEL_CATALOG,
  commercePlanTitle,
  isCriticalStock,
  isHighStock,
  normalizeCommercePlan,
  selectCockpitStore,
} from "@/lib/commerce/os-rules";
import type { OsChannelView, OsCockpitView, OsGrantLine, OsInboxView, OsProductView } from "@/lib/commerce/os-types";
import { effectiveApprovedQty, effectiveSku } from "@/lib/commerce/stock-sync";
import { selectVerifiedGrantRibbon } from "@/lib/commerce/grant-ribbon";
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
    const now = new Date();
    const catalog = await loadYetkinhibeGrantCatalog(now);
    const lines: OsGrantLine[] = selectVerifiedGrantRibbon(catalog, now);
    return { ok: true, lines };
  } catch {
    return { ok: false, message: "Hibe taraması şu an okunamadı." };
  }
}

export async function loadOsCockpit(userId: string, preferredStoreId?: string | null): Promise<OsLoad> {
  try {
    const db = getPrisma();
    const stores = await db.commerceStore.findMany({
      where: { ownerUserId: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, slug: true, planCode: true },
    });
    const pool = selectCockpitStore(stores, preferredStoreId);
    const [products, channelRows, entries, receipts, channelEconomics] = await Promise.all([
      pool == null
        ? Promise.resolve([])
        : db.commerceProduct.findMany({
            where: { storeId: pool.id },
            orderBy: { createdAt: "desc" },
            include: {
              variants: {
                orderBy: { createdAt: "asc" },
                include: {
                  unitEconomics: {
                    select: { costMinor: true, desiGrams: true, vatBps: true, costIncludesVat: true },
                  },
                },
              },
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
      pool
        ? db.commerceInboxEntry.findMany({
            where: { storeId: pool.id },
            orderBy: { createdAt: "desc" },
            take: 40,
            include: { product: { select: { id: true, title: true } } },
          })
        : Promise.resolve([]),
      pool
        ? db.commerceMarketplaceWebhookReceipt.findMany({
            where: { storeId: pool.id },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: { variant: { select: { product: { select: { id: true, title: true } } } } },
          })
        : Promise.resolve([]),
      pool
        ? db.commerceChannelEconomics.findUnique({
            where: { storeId_channel: { storeId: pool.id, channel: "TRENDYOL" } },
            select: {
              commissionBps: true,
              cargoMinorPerOrder: true,
              returnRateBps: true,
              adCostMinorPerOrder: true,
            },
          })
        : Promise.resolve(null),
    ]);

    const productViews: OsProductView[] = products.map((product) => {
      const variant = product.variants[0] ?? null;
      const draft = product.stockLedgers[0] ?? null;
      const priceMinor = product.basePriceMinor > 0 ? product.basePriceMinor : (variant?.amountMinor ?? 0);
      // Gösterilen onaylı adet: alan doluysa o, sıfırsa varyant toplamı. Eşik ve reklam kararları bu sayıdan okunur.
      const approved = effectiveApprovedQty(product.approvedStockQty, product.variants);
      return {
        id: product.id,
        storeId: product.storeId,
        title: product.title,
        sku: effectiveSku(product.sku, product.variants),
        category: product.category,
        priceMinor,
        approvedStockQty: approved,
        criticalStockQty: product.criticalStockQty,
        critical: isCriticalStock(approved, product.criticalStockQty),
        highStock: isHighStock(approved, product.criticalStockQty),
        adEligible: isAdEligibleStock(approved, product.criticalStockQty),
        variantId: variant?.id ?? null,
        variantCount: product.variants.length,
        variants: product.variants.map((row) => ({
          id: row.id,
          sku: row.sku,
          barcode: row.barcode,
          amountMinor: row.amountMinor,
          onHandQty: row.onHandQty,
          safetyBuffer: row.safetyBuffer,
          status: row.status,
          sellableQty: Math.max(0, row.onHandQty - row.safetyBuffer),
          hasEconomics: row.unitEconomics != null,
          costMinor: row.unitEconomics?.costMinor ?? null,
          desiGrams: row.unitEconomics?.desiGrams ?? null,
          vatBps: row.unitEconomics?.vatBps ?? null,
          costIncludesVat: row.unitEconomics?.costIncludesVat === true,
        })),
        pendingDraft: draft ? { id: draft.id, quantity: draft.quantity } : null,
      };
    });

    const channels: OsChannelView[] = OS_CHANNEL_CATALOG.map((item) => {
      const row = channelRows.find((channel) => channel.kind === item.kind);
      return {
        kind: item.kind,
        label: item.label,
        needsKey: item.needsKey,
        comingSoon: item.comingSoon,
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
        stores: stores.map((store) => {
          const planCode = normalizeCommercePlan(store.planCode);
          return {
            id: store.id,
            name: store.name,
            slug: store.slug,
            planCode,
            planTitle: commercePlanTitle(planCode),
          };
        }),
        selectedStoreId: pool?.id ?? null,
        grants,
        exportSupport,
        trendyolEconomics: channelEconomics
          ? {
              commissionBps: channelEconomics.commissionBps,
              cargoMinorPerOrder: channelEconomics.cargoMinorPerOrder,
              returnRateBps: channelEconomics.returnRateBps,
              adCostMinorPerOrder: channelEconomics.adCostMinorPerOrder,
            }
          : defaultsForChannel("TRENDYOL"),
      },
    };
  } catch (error) {
    if (isDown(error)) {
      return { kind: "down" };
    }
    throw error;
  }
}
