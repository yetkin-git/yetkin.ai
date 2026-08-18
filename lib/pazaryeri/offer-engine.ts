import { randomUUID } from "node:crypto";
import { createEscrowHold, resolvePlatformTreasuryUserId } from "@/lib/kernel/escrow";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { HOLD_BPS_DEFAULT, resolveHoldBps } from "@/lib/kernel/pricing/hold-bps";
import {
  assertAmountWithinCatalogBand,
  requireActiveCatalogEntry,
} from "@/lib/kernel/pricing/catalog-band";
import { splitGross } from "@/lib/kernel/escrow/split";
import {
  buildPriceLockKey,
  computePriceLockExpiresAt,
} from "@/lib/kernel/pricing/price-lock";
import { pazaryeriOfferUnitKey, pazaryeriOrderReferenceKey } from "@/lib/pazaryeri/fsm";
import { assertCashPathAllowedForCategory, listingCatalogUnitKey } from "@/lib/pazaryeri/category";
import type { PazaryeriEnginePorts } from "@/lib/pazaryeri/engine";
import {
  PAZARYERI_MODULE_KEY,
  type MarketplaceOfferRecord,
  type MarketplaceOrderRecord,
} from "@/lib/pazaryeri/types";

export type SubmitMarketplaceOfferCommand = {
  productId: string;
  buyerUserId: string;
  amountMinor: number;
  now?: Date;
};

export type DecideMarketplaceOfferCommand = {
  offerId: string;
  actorUserId: string;
  decision: "accept" | "reject";
  platformUserId?: string;
  holdBps?: number;
  now?: Date;
};

export type MarketplaceOfferDecisionResult = {
  applied: boolean;
  offer: MarketplaceOfferRecord;
  order: MarketplaceOrderRecord | null;
};

async function requireListedProduct(ports: PazaryeriEnginePorts, productId: string) {
  const product = (await ports.pazaryeri.getProduct(productId)) ?? (await ports.pazaryeri.getProductBySlug(productId));
  if (!product) {
    throw new Error("Ürün bulunamadı.");
  }
  if (product.status !== "LISTED") {
    throw new Error("Ürün satışa kapalı.");
  }
  return product;
}

export async function submitMarketplaceOffer(
  ports: PazaryeriEnginePorts,
  command: SubmitMarketplaceOfferCommand,
): Promise<{ applied: boolean; offer: MarketplaceOfferRecord }> {
  const product = await requireListedProduct(ports, command.productId);
  assertCashPathAllowedForCategory(product.category);
  if (!product.isOfferAllowed) {
    throw new Error("Bu ilan teklife kapalı.");
  }
  if (product.userId === command.buyerUserId) {
    throw new Error("Kendi ilana teklif verilemez.");
  }
  const existingOrder = await ports.pazaryeri.getOrderByBuyerAndProduct(command.buyerUserId, product.id);
  if (existingOrder) {
    throw new Error("Bu ilan için sipariş zaten var.");
  }
  const open = await ports.pazaryeri.getOpenOfferByBuyerAndProduct(command.buyerUserId, product.id);
  if (open) {
    return { applied: false, offer: open };
  }

  const catalog = await requireActiveCatalogEntry(
    ports.catalog,
    PAZARYERI_MODULE_KEY,
    listingCatalogUnitKey(product.category),
  );
  const amountMinor = assertAmountWithinCatalogBand(command.amountMinor, catalog);
  if (amountMinor > product.amountMinor) {
    throw new Error("Teklif ilan tutarını aşamaz.");
  }
  if (product.currencyCode !== SETTLEMENT_CURRENCY || catalog.currencyCode !== SETTLEMENT_CURRENCY) {
    throw new Error("Gün 0 settlement yalnızca TRY.");
  }

  const now = command.now ?? new Date();
  const offer = await ports.pazaryeri.insertOffer({
    id: randomUUID(),
    productId: product.id,
    userId: command.buyerUserId,
    sellerUserId: product.userId,
    amountMinor,
    currencyCode: product.currencyCode,
    status: "OPEN",
    escrowHoldId: null,
    orderId: null,
    createdAt: now,
    updatedAt: now,
  });
  return { applied: true, offer };
}

export async function decideMarketplaceOffer(
  ports: PazaryeriEnginePorts,
  command: DecideMarketplaceOfferCommand,
): Promise<MarketplaceOfferDecisionResult> {
  const offer = await ports.pazaryeri.getOffer(command.offerId);
  if (!offer) {
    throw new Error("Teklif bulunamadı.");
  }
  if (offer.status === "ACCEPTED") {
    const order = offer.orderId ? await ports.pazaryeri.getOrder(offer.orderId) : null;
    return { applied: false, offer, order };
  }
  if (offer.status === "REJECTED") {
    return { applied: false, offer, order: null };
  }
  if (offer.sellerUserId !== command.actorUserId) {
    throw new Error("Teklifi yalnız satıcı karara bağlar.");
  }

  const gateProduct =
    (await ports.pazaryeri.getProduct(offer.productId)) ??
    (await ports.pazaryeri.getProductBySlug(offer.productId));
  if (gateProduct) {
    assertCashPathAllowedForCategory(gateProduct.category);
  }

  const now = command.now ?? new Date();
  if (command.decision === "reject") {
    const next = await ports.pazaryeri.updateOffer(offer.id, { status: "REJECTED", updatedAt: now });
    return { applied: true, offer: next, order: null };
  }

  const product = await requireListedProduct(ports, offer.productId);
  assertCashPathAllowedForCategory(product.category);
  const existingOrder = await ports.pazaryeri.getOrderByBuyerAndProduct(offer.userId, product.id);
  if (existingOrder) {
    throw new Error("Bu alıcı için sipariş zaten var.");
  }

  const holdBps = resolveHoldBps(command.holdBps ?? HOLD_BPS_DEFAULT);
  const split = splitGross({
    grossMinor: offer.amountMinor,
    holdBps,
    currencyCode: offer.currencyCode,
  });
  const platformUserId = command.platformUserId ?? resolvePlatformTreasuryUserId();
  if (platformUserId === offer.userId || platformUserId === product.userId) {
    throw new Error("Platform hazinesi alıcı veya satıcı ile çakışamaz.");
  }

  const orderId = randomUUID();
  const unitKey = pazaryeriOfferUnitKey(offer.id);
  const lock = await ports.locks.upsertLock({
    userId: offer.userId,
    lockKey: buildPriceLockKey(PAZARYERI_MODULE_KEY, unitKey),
    moduleKey: PAZARYERI_MODULE_KEY,
    unitKey,
    amountMinor: offer.amountMinor,
    currencyCode: offer.currencyCode,
    catalogMinor: offer.amountMinor,
    expiresAt: computePriceLockExpiresAt(now),
    consumedAt: null,
  });

  const { hold } = await createEscrowHold(
    { ledger: ports.ledger, escrow: ports.escrow },
    {
      userId: offer.userId,
      referenceKey: pazaryeriOrderReferenceKey(orderId),
      grossMinor: split.grossMinor,
      holdBps: split.holdBps,
      currencyCode: split.currencyCode,
      now,
    },
  );

  const order = await ports.pazaryeri.insertOrder({
    id: orderId,
    productId: product.id,
    userId: offer.userId,
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
  await ports.locks.markConsumed(lock.id, now);
  const accepted = await ports.pazaryeri.updateOffer(offer.id, {
    status: "ACCEPTED",
    escrowHoldId: hold.id,
    orderId: order.id,
    updatedAt: now,
  });
  await ports.pazaryeri.rejectOpenOffersForProduct(product.id, offer.id, now);
  return { applied: true, offer: accepted, order };
}
