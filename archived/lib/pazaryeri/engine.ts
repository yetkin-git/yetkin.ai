import { randomUUID } from "node:crypto";
import {
  createEscrowHold,
  refundEscrowHold,
  releaseEscrowHold,
  resolvePlatformTreasuryUserId,
  type EscrowStore,
} from "@/lib/kernel/escrow";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import {
  buildMarketplaceSplitIntent,
  settleMarketplaceSplit,
} from "@/lib/kernel/payments/marketplace-split";
import { HOLD_BPS_DEFAULT, resolveHoldBps } from "@/lib/kernel/pricing/hold-bps";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import {
  assertAmountWithinCatalogBand,
  requireActiveCatalogEntry,
} from "@/lib/kernel/pricing/catalog-band";
import { splitGross } from "@/lib/kernel/escrow/split";
import { requireOpenCheckoutPriceLock } from "@/lib/kernel/pricing/lock-engine";
import type { CheckoutPriceLockStore } from "@/lib/kernel/pricing/lock-store";
import {
  assertPriceLockAllowsDebit,
  buildPriceLockKey,
  computePriceLockExpiresAt,
  type CheckoutPriceLockSnapshot,
} from "@/lib/kernel/pricing/price-lock";
import {
  canConfirmDelivery,
  canRefundMarketplaceOrder,
  pazaryeriOrderReferenceKey,
  pazaryeriProductUnitKey,
} from "@/lib/pazaryeri/fsm";
import {
  PAZARYERI_MODULE_KEY,
  type MarketplaceOrderRecord,
  type MarketplaceProductCategory,
  type MarketplaceProductKind,
  type MarketplaceProductRecord,
  type PazaryeriStore,
} from "@/lib/pazaryeri/types";
import {
  assertCashPathAllowedForCategory,
  assertCategoryFields,
  assertEidsPublicListingAllowed,
  isAssetCategory,
  listingCatalogUnitKey,
  listingKindForCategory,
  resolveListingCategory,
} from "@/lib/pazaryeri/category";

export type PazaryeriMoneyWritePorts = {
  ledger: LedgerStore;
  escrow: EscrowStore;
  locks: CheckoutPriceLockStore;
  pazaryeri: PazaryeriStore;
};

export type PazaryeriEnginePorts = {
  ledger: LedgerStore;
  escrow: EscrowStore;
  catalog: PriceCatalogStore;
  locks: CheckoutPriceLockStore;
  pazaryeri: PazaryeriStore;
  /**
   * Debit/credit + emanet + fiyat kilidi + sipariş/doping tek atomik birim.
   * Prisma: `$transaction`. Bellek: kuyruk + anlık görüntü.
   */
  runMoneyAtomic?: <T>(work: (tx: PazaryeriMoneyWritePorts) => Promise<T>) => Promise<T>;
};

export async function withPazaryeriMoney<T>(
  ports: PazaryeriEnginePorts,
  work: (tx: PazaryeriMoneyWritePorts) => Promise<T>,
): Promise<T> {
  if (ports.runMoneyAtomic) {
    return ports.runMoneyAtomic(work);
  }
  return work({
    ledger: ports.ledger,
    escrow: ports.escrow,
    locks: ports.locks,
    pazaryeri: ports.pazaryeri,
  });
}

export type ListMarketplaceProductCommand = {
  sellerUserId: string;
  title: string;
  summary: string;
  kind?: MarketplaceProductKind;
  category?: MarketplaceProductCategory;
  amountMinor: number;
  isOfferAllowed?: boolean;
  tkgmBlockParcel?: string | null;
  insuranceQuoteHook?: string | null;
  currencyCode?: CurrencyCode;
  now?: Date;
};

export type LockMarketplaceProductCommand = {
  productId: string;
  userId: string;
  now?: Date;
};

export type PurchaseMarketplaceProductCommand = {
  productId: string;
  userId: string;
  lockId?: string;
  platformUserId?: string;
  holdBps?: number;
  now?: Date;
};

export type MarketplaceOrderActorCommand = {
  orderId: string;
  actorUserId: string;
  platformUserId?: string;
  now?: Date;
};

export type MarketplacePurchaseResult = {
  applied: boolean;
  product: MarketplaceProductRecord;
  order: MarketplaceOrderRecord;
  lock: CheckoutPriceLockSnapshot;
};

function slugifyTitle(title: string, id: string): string {
  const ascii = title
    .trim()
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${ascii || "urun"}-${id.slice(0, 8)}`;
}

function debitKey(buyerId: string, productId: string): string {
  return `pazaryeri-purchase-debit:${buyerId}:${productId}`;
}

async function requireListedProduct(
  store: PazaryeriStore,
  productId: string,
): Promise<MarketplaceProductRecord> {
  const product = (await store.getProduct(productId)) ?? (await store.getProductBySlug(productId));
  if (!product) {
    throw new Error("Ürün bulunamadı.");
  }
  if (product.status !== "LISTED") {
    throw new Error("Ürün satışa kapalı.");
  }
  return product;
}

export async function listMarketplaceProduct(
  ports: PazaryeriEnginePorts,
  command: ListMarketplaceProductCommand,
): Promise<MarketplaceProductRecord> {
  const title = command.title.trim();
  const summary = command.summary.trim();
  const category = resolveListingCategory({ category: command.category, kind: command.kind });
  const kind = listingKindForCategory(category);
  const fields = assertCategoryFields({
    category,
    tkgmBlockParcel: command.tkgmBlockParcel,
    insuranceQuoteHook: command.insuranceQuoteHook,
  });
  assertEidsPublicListingAllowed(category);
  const isOfferAllowed = isAssetCategory(category) ? false : (command.isOfferAllowed ?? false);

  const catalog = await requireActiveCatalogEntry(
    ports.catalog,
    PAZARYERI_MODULE_KEY,
    listingCatalogUnitKey(category),
  );
  const amountMinor = assertAmountWithinCatalogBand(command.amountMinor, catalog);
  const currencyCode = command.currencyCode ?? SETTLEMENT_CURRENCY;
  if (currencyCode !== SETTLEMENT_CURRENCY || catalog.currencyCode !== SETTLEMENT_CURRENCY) {
    throw new Error("Gün 0 settlement yalnızca TRY.");
  }

  const now = command.now ?? new Date();
  const id = randomUUID();
  return ports.pazaryeri.insertProduct({
    id,
    userId: command.sellerUserId,
    slug: slugifyTitle(title, id),
    title,
    summary,
    kind,
    category,
    amountMinor,
    currencyCode,
    status: "LISTED",
    isDoped: false,
    isOfferAllowed,
    tkgmBlockParcel: fields.tkgmBlockParcel,
    insuranceQuoteHook: fields.insuranceQuoteHook,
    dopedUntil: null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function lockMarketplaceProductPrice(
  ports: PazaryeriEnginePorts,
  command: LockMarketplaceProductCommand,
): Promise<{ product: MarketplaceProductRecord; lock: CheckoutPriceLockSnapshot }> {
  const product = await requireListedProduct(ports.pazaryeri, command.productId);
  assertCashPathAllowedForCategory(product.category);
  const catalog = await requireActiveCatalogEntry(
    ports.catalog,
    PAZARYERI_MODULE_KEY,
    listingCatalogUnitKey(product.category),
  );
  assertAmountWithinCatalogBand(product.amountMinor, catalog);
  if (product.currencyCode !== SETTLEMENT_CURRENCY || catalog.currencyCode !== SETTLEMENT_CURRENCY) {
    throw new Error("Gün 0 settlement yalnızca TRY.");
  }

  const now = command.now ?? new Date();
  const unitKey = pazaryeriProductUnitKey(product.id);
  const lockKey = buildPriceLockKey(PAZARYERI_MODULE_KEY, unitKey);
  const existing = await ports.locks.findByUserAndLockKey(command.userId, lockKey);
  const reusable = existing ? assertPriceLockAllowsDebit(existing, now) : null;
  if (existing && reusable?.ok && existing.amountMinor === product.amountMinor) {
    return { product, lock: existing };
  }

  const lock = await ports.locks.upsertLock({
    id: existing?.id,
    userId: command.userId,
    lockKey,
    moduleKey: PAZARYERI_MODULE_KEY,
    unitKey,
    amountMinor: product.amountMinor,
    currencyCode: product.currencyCode,
    catalogMinor: product.amountMinor,
    expiresAt: computePriceLockExpiresAt(now),
    consumedAt: null,
  });
  return { product, lock };
}

export async function purchaseMarketplaceProduct(
  ports: PazaryeriEnginePorts,
  command: PurchaseMarketplaceProductCommand,
): Promise<MarketplacePurchaseResult> {
  const product = await requireListedProduct(ports.pazaryeri, command.productId);
  assertCashPathAllowedForCategory(product.category);
  if (product.userId === command.userId) {
    throw new Error("Kendi tezgâhtan satın alınamaz.");
  }

  const existing = await ports.pazaryeri.getOrderByBuyerAndProduct(command.userId, product.id);
  if (existing) {
    const lock = await ports.locks.findById(existing.priceLockId);
    return {
      applied: false,
      product,
      order: existing,
      lock: lock ?? {
        id: existing.priceLockId,
        userId: command.userId,
        lockKey: buildPriceLockKey(PAZARYERI_MODULE_KEY, pazaryeriProductUnitKey(product.id)),
        moduleKey: PAZARYERI_MODULE_KEY,
        unitKey: pazaryeriProductUnitKey(product.id),
        amountMinor: existing.amountMinor,
        currencyCode: existing.currencyCode,
        catalogMinor: existing.amountMinor,
        expiresAt: existing.createdAt,
        consumedAt: existing.createdAt,
      },
    };
  }

  const now = command.now ?? new Date();
  const holdBps = resolveHoldBps(command.holdBps ?? HOLD_BPS_DEFAULT);
  const split = splitGross({
    grossMinor: product.amountMinor,
    holdBps,
    currencyCode: product.currencyCode,
  });
  const platformUserId = command.platformUserId ?? resolvePlatformTreasuryUserId();
  if (platformUserId === command.userId || platformUserId === product.userId) {
    throw new Error("Platform hazinesi alıcı veya satıcı ile çakışamaz.");
  }

  return withPazaryeriMoney(ports, async (tx) => {
    const raced = await tx.pazaryeri.getOrderByBuyerAndProduct(command.userId, product.id);
    if (raced) {
      const racedLock = await tx.locks.findById(raced.priceLockId);
      return {
        applied: false,
        product,
        order: raced,
        lock: racedLock ?? {
          id: raced.priceLockId,
          userId: command.userId,
          lockKey: buildPriceLockKey(PAZARYERI_MODULE_KEY, pazaryeriProductUnitKey(product.id)),
          moduleKey: PAZARYERI_MODULE_KEY,
          unitKey: pazaryeriProductUnitKey(product.id),
          amountMinor: raced.amountMinor,
          currencyCode: raced.currencyCode,
          catalogMinor: raced.amountMinor,
          expiresAt: raced.createdAt,
          consumedAt: raced.createdAt,
        },
      };
    }

    const lock = await requireOpenCheckoutPriceLock(
      { locks: tx.locks },
      {
        userId: command.userId,
        moduleKey: PAZARYERI_MODULE_KEY,
        unitKey: pazaryeriProductUnitKey(product.id),
        lockId: command.lockId,
        now,
      },
    );
    if (lock.amountMinor !== product.amountMinor) {
      throw new Error("Fiyat kilidi ilan tutarı ile uyuşmuyor.");
    }

    if (product.kind === "DIGITAL_GOOD") {
      await appendLedgerEntry(tx.ledger, {
        userId: command.userId,
        currencyCode: split.currencyCode,
        amountMinor: split.grossMinor,
        direction: "DEBIT",
        label: "Yetkinİlan dijital satın alma",
        purpose: "pazaryeri-purchase",
        idempotencyKey: debitKey(command.userId, product.id),
      });
      await settleMarketplaceSplit(
        buildMarketplaceSplitIntent({
          referenceKey: `pazaryeri:${product.id}:${command.userId}`,
          currencyCode: split.currencyCode,
          legs: [
            { role: "artisan", userId: product.userId, amountMinor: split.netMinor },
            { role: "platform", userId: platformUserId, amountMinor: split.holdMinor },
          ],
        }),
      );

      const order = await tx.pazaryeri.insertOrder({
        id: randomUUID(),
        productId: product.id,
        userId: command.userId,
        sellerUserId: product.userId,
        productTitle: product.title,
        kind: product.kind,
        priceLockId: lock.id,
        escrowHoldId: null,
        amountMinor: split.grossMinor,
        holdMinor: split.holdMinor,
        netMinor: split.netMinor,
        holdBps: split.holdBps,
        currencyCode: split.currencyCode,
        status: "SETTLED",
        settledAt: now,
        deliveredAt: now,
        refundedAt: null,
        createdAt: now,
        updatedAt: now,
      });
      await tx.locks.markConsumed(lock.id, now);
      return { applied: true, product, order, lock };
    }

    const orderId = randomUUID();
    const { hold } = await createEscrowHold(
      { ledger: tx.ledger, escrow: tx.escrow },
      {
        userId: command.userId,
        referenceKey: pazaryeriOrderReferenceKey(orderId),
        grossMinor: split.grossMinor,
        holdBps: split.holdBps,
        currencyCode: split.currencyCode,
        now,
        funding: "psp",
      },
    );

    const order = await tx.pazaryeri.insertOrder({
      id: orderId,
      productId: product.id,
      userId: command.userId,
      sellerUserId: product.userId,
      productTitle: product.title,
      kind: product.kind,
      priceLockId: lock.id,
      escrowHoldId: hold.id,
      amountMinor: split.grossMinor,
      holdMinor: split.holdMinor,
      netMinor: split.netMinor,
      holdBps: split.holdBps,
      currencyCode: split.currencyCode,
      status: "AWAITING_DELIVERY",
      settledAt: null,
      deliveredAt: null,
      refundedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    await tx.locks.markConsumed(lock.id, now);
    return { applied: true, product, order, lock };
  });
}

export async function confirmMarketplaceDelivery(
  ports: PazaryeriEnginePorts,
  command: MarketplaceOrderActorCommand,
): Promise<{ applied: boolean; order: MarketplaceOrderRecord }> {
  const order = await ports.pazaryeri.getOrder(command.orderId);
  if (!order) {
    throw new Error("Sipariş bulunamadı.");
  }
  if (order.status === "DELIVERED") {
    return { applied: false, order };
  }
  if (!canConfirmDelivery(order, command.actorUserId)) {
    throw new Error("Teslimat teyidi yalnızca alıcı ve bekleyen hizmet siparişinde açılır.");
  }
  if (!order.escrowHoldId) {
    throw new Error("Hizmet siparişinde emanet kilidi yok.");
  }

  const now = command.now ?? new Date();
  const platformUserId = command.platformUserId ?? resolvePlatformTreasuryUserId();
  return withPazaryeriMoney(ports, async (tx) => {
    const current = await tx.pazaryeri.getOrder(order.id);
    if (!current) {
      throw new Error("Sipariş bulunamadı.");
    }
    if (current.status === "DELIVERED") {
      return { applied: false, order: current };
    }
    if (!canConfirmDelivery(current, command.actorUserId)) {
      throw new Error("Teslimat teyidi yalnızca alıcı ve bekleyen hizmet siparişinde açılır.");
    }
    if (!current.escrowHoldId) {
      throw new Error("Hizmet siparişinde emanet kilidi yok.");
    }

    await releaseEscrowHold(
      { ledger: tx.ledger, escrow: tx.escrow },
      {
        referenceKey: pazaryeriOrderReferenceKey(current.id),
        payeeUserId: current.sellerUserId,
        platformUserId,
        now,
      },
    );

    const next = await tx.pazaryeri.updateOrder(current.id, {
      status: "DELIVERED",
      settledAt: now,
      deliveredAt: now,
      updatedAt: now,
    });
    return { applied: true, order: next };
  });
}

export async function refundMarketplaceOrder(
  ports: PazaryeriEnginePorts,
  command: MarketplaceOrderActorCommand,
): Promise<{ applied: boolean; order: MarketplaceOrderRecord }> {
  const order = await ports.pazaryeri.getOrder(command.orderId);
  if (!order) {
    throw new Error("Sipariş bulunamadı.");
  }
  if (order.status === "REFUNDED") {
    return { applied: false, order };
  }
  if (!canRefundMarketplaceOrder(order, command.actorUserId)) {
    throw new Error("İade yalnızca alıcının bekleyen hizmet siparişinde açılır.");
  }

  const now = command.now ?? new Date();
  return withPazaryeriMoney(ports, async (tx) => {
    const current = await tx.pazaryeri.getOrder(order.id);
    if (!current) {
      throw new Error("Sipariş bulunamadı.");
    }
    if (current.status === "REFUNDED") {
      return { applied: false, order: current };
    }
    if (!canRefundMarketplaceOrder(current, command.actorUserId)) {
      throw new Error("İade yalnızca alıcının bekleyen hizmet siparişinde açılır.");
    }

    await refundEscrowHold(
      { ledger: tx.ledger, escrow: tx.escrow },
      { referenceKey: pazaryeriOrderReferenceKey(current.id), now },
    );

    const next = await tx.pazaryeri.updateOrder(current.id, {
      status: "REFUNDED",
      refundedAt: now,
      updatedAt: now,
    });
    return { applied: true, order: next };
  });
}
