import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode, SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { isProductDoped, isPubliclyListableProduct } from "@/lib/pazaryeri/category";
import type {
  MarketplaceDopingRecord,
  MarketplaceOfferRecord,
  MarketplaceOrderRecord,
  MarketplaceProductRecord,
  PazaryeriPulse,
  PazaryeriStore,
} from "@/lib/pazaryeri/types";

function toProduct(row: {
  id: string;
  userId: string;
  slug: string;
  title: string;
  summary: string;
  kind: MarketplaceProductRecord["kind"];
  category: MarketplaceProductRecord["category"];
  amountMinor: number;
  currencyCode: string;
  status: MarketplaceProductRecord["status"];
  isDoped: boolean;
  isOfferAllowed: boolean;
  tkgmBlockParcel: string | null;
  insuranceQuoteHook: string | null;
  dopedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): MarketplaceProductRecord {
  return {
    ...row,
    amountMinor: toAmountMinor(row.amountMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
  };
}

function toOrder(row: {
  id: string;
  productId: string;
  userId: string;
  sellerUserId: string;
  productTitle: string;
  kind: MarketplaceOrderRecord["kind"];
  priceLockId: string;
  escrowHoldId: string | null;
  amountMinor: number;
  holdMinor: number;
  netMinor: number;
  holdBps: number;
  currencyCode: string;
  status: MarketplaceOrderRecord["status"];
  settledAt: Date | null;
  deliveredAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): MarketplaceOrderRecord {
  return {
    ...row,
    amountMinor: toAmountMinor(row.amountMinor),
    holdMinor: toAmountMinor(row.holdMinor),
    netMinor: toAmountMinor(row.netMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
  };
}

function toOffer(row: {
  id: string;
  productId: string;
  userId: string;
  sellerUserId: string;
  amountMinor: number;
  currencyCode: string;
  status: MarketplaceOfferRecord["status"];
  escrowHoldId: string | null;
  orderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): MarketplaceOfferRecord {
  return {
    ...row,
    amountMinor: toAmountMinor(row.amountMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
  };
}

function toDoping(row: {
  id: string;
  productId: string;
  userId: string;
  amountMinor: number;
  currencyCode: string;
  status: MarketplaceDopingRecord["status"];
  startsAt: Date;
  expiresAt: Date;
  createdAt: Date;
}): MarketplaceDopingRecord {
  return {
    ...row,
    amountMinor: toAmountMinor(row.amountMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
  };
}

export type PazaryeriWriteDb = Pick<
  PrismaClient,
  "marketplaceProduct" | "marketplaceOrder" | "marketplaceOffer" | "marketplaceDoping"
>;

export function bindPazaryeriStore(db: PazaryeriWriteDb): PazaryeriStore {
  return {
    async insertProduct(product) {
      const row = await db.marketplaceProduct.create({
        data: {
          id: product.id,
          userId: product.userId,
          slug: product.slug,
          title: product.title,
          summary: product.summary,
          kind: product.kind,
          category: product.category,
          amountMinor: product.amountMinor,
          currencyCode: product.currencyCode,
          status: product.status,
          isDoped: product.isDoped,
          isOfferAllowed: product.isOfferAllowed,
          tkgmBlockParcel: product.tkgmBlockParcel,
          insuranceQuoteHook: product.insuranceQuoteHook,
          dopedUntil: product.dopedUntil,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      });
      return toProduct(row);
    },
    async getProduct(id) {
      const row = await db.marketplaceProduct.findUnique({ where: { id } });
      return row ? toProduct(row) : null;
    },
    async getProductBySlug(slug) {
      const row = await db.marketplaceProduct.findUnique({ where: { slug } });
      return row ? toProduct(row) : null;
    },
    async listListedProducts() {
      const rows = await db.marketplaceProduct.findMany({
        where: { status: "LISTED" },
        orderBy: [{ isDoped: "desc" }, { dopedUntil: "desc" }, { createdAt: "desc" }],
      });
      return rows
        .map(toProduct)
        .filter(isPubliclyListableProduct)
        .sort((a, b) => Number(isProductDoped(b)) - Number(isProductDoped(a)));
    },
    async listProductsBySeller(userId) {
      const rows = await db.marketplaceProduct.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toProduct);
    },
    async updateProduct(id, patch) {
      const row = await db.marketplaceProduct.update({
        where: { id },
        data: patch,
      });
      return toProduct(row);
    },
    async insertOrder(order) {
      const row = await db.marketplaceOrder.create({
        data: {
          id: order.id,
          productId: order.productId,
          userId: order.userId,
          sellerUserId: order.sellerUserId,
          productTitle: order.productTitle,
          kind: order.kind,
          priceLockId: order.priceLockId,
          escrowHoldId: order.escrowHoldId,
          amountMinor: order.amountMinor,
          holdMinor: order.holdMinor,
          netMinor: order.netMinor,
          holdBps: order.holdBps,
          currencyCode: order.currencyCode,
          status: order.status,
          settledAt: order.settledAt,
          deliveredAt: order.deliveredAt,
          refundedAt: order.refundedAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      });
      return toOrder(row);
    },
    async getOrder(id) {
      const row = await db.marketplaceOrder.findUnique({ where: { id } });
      return row ? toOrder(row) : null;
    },
    async getOrderByEscrowHoldId(escrowHoldId) {
      const row = await db.marketplaceOrder.findUnique({ where: { escrowHoldId } });
      return row ? toOrder(row) : null;
    },
    async getOrderByBuyerAndProduct(userId, productId) {
      const row = await db.marketplaceOrder.findUnique({
        where: { userId_productId: { userId, productId } },
      });
      return row ? toOrder(row) : null;
    },
    async listOrdersForUser(userId) {
      const rows = await db.marketplaceOrder.findMany({
        where: { OR: [{ userId }, { sellerUserId: userId }] },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toOrder);
    },
    async updateOrder(id, patch) {
      const row = await db.marketplaceOrder.update({
        where: { id },
        data: patch,
      });
      return toOrder(row);
    },
    async insertOffer(offer) {
      const row = await db.marketplaceOffer.create({
        data: {
          id: offer.id,
          productId: offer.productId,
          userId: offer.userId,
          sellerUserId: offer.sellerUserId,
          amountMinor: offer.amountMinor,
          currencyCode: offer.currencyCode,
          status: offer.status,
          escrowHoldId: offer.escrowHoldId,
          orderId: offer.orderId,
          createdAt: offer.createdAt,
          updatedAt: offer.updatedAt,
        },
      });
      return toOffer(row);
    },
    async getOffer(id) {
      const row = await db.marketplaceOffer.findUnique({ where: { id } });
      return row ? toOffer(row) : null;
    },
    async getOpenOfferByBuyerAndProduct(userId, productId) {
      const row = await db.marketplaceOffer.findFirst({
        where: { userId, productId, status: "OPEN" },
        orderBy: { createdAt: "desc" },
      });
      return row ? toOffer(row) : null;
    },
    async listOffersForProduct(productId) {
      const rows = await db.marketplaceOffer.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toOffer);
    },
    async updateOffer(id, patch) {
      const row = await db.marketplaceOffer.update({
        where: { id },
        data: patch,
      });
      return toOffer(row);
    },
    async rejectOpenOffersForProduct(productId, exceptOfferId, now) {
      await db.marketplaceOffer.updateMany({
        where: { productId, status: "OPEN", id: { not: exceptOfferId } },
        data: { status: "REJECTED", updatedAt: now },
      });
    },
    async insertDoping(doping) {
      const row = await db.marketplaceDoping.create({
        data: {
          id: doping.id,
          productId: doping.productId,
          userId: doping.userId,
          amountMinor: doping.amountMinor,
          currencyCode: doping.currencyCode,
          status: doping.status,
          startsAt: doping.startsAt,
          expiresAt: doping.expiresAt,
          createdAt: doping.createdAt,
        },
      });
      return toDoping(row);
    },
    async getActiveDopingForProduct(productId, now) {
      const row = await db.marketplaceDoping.findFirst({
        where: { productId, status: "ACTIVE", expiresAt: { gt: now } },
        orderBy: { expiresAt: "desc" },
      });
      return row ? toDoping(row) : null;
    },
    async pulseForUser(userId) {
      const [listedProducts, sold, bought, pendingDelivery, recentSold] = await Promise.all([
        db.marketplaceProduct.count({ where: { userId, status: "LISTED" } }),
        db.marketplaceOrder.count({
          where: { sellerUserId: userId, status: { in: ["SETTLED", "DELIVERED"] } },
        }),
        db.marketplaceOrder.count({ where: { userId } }),
        db.marketplaceOrder.count({
          where: {
            status: "AWAITING_DELIVERY",
            OR: [{ userId }, { sellerUserId: userId }],
          },
        }),
        db.marketplaceOrder.findMany({
          where: { sellerUserId: userId, status: { in: ["SETTLED", "DELIVERED"] } },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
      ]);
      const pulse: PazaryeriPulse = {
        listedProducts,
        ordersSold: sold,
        ordersBought: bought,
        pendingDelivery,
        lastSales: recentSold.map((row) => ({
          title: row.productTitle,
          amountMinor: toAmountMinor(row.amountMinor),
          currencyCode: parseCurrencyCode(row.currencyCode),
        })),
        currencyCode: SETTLEMENT_CURRENCY,
      };
      return pulse;
    },
  };
}

export function createPrismaPazaryeriStore(): PazaryeriStore {
  return bindPazaryeriStore(getPrisma());
}
