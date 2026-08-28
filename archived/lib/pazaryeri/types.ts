import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

export const PAZARYERI_MODULE_KEY = "pazaryeri" as const;
export const PAZARYERI_LISTING_FLOOR_UNIT_KEY = "listing:floor" as const;
export const PAZARYERI_ASSET_FLOOR_UNIT_KEY = "listing:asset-floor" as const;
export const PAZARYERI_DOPING_UNIT_KEY = "doping:boost" as const;
export const PAZARYERI_DOPING_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type MarketplaceProductKind = "DIGITAL_GOOD" | "SERVICE";
export type MarketplaceProductCategory = "DIGITAL_GOOD" | "SERVICE" | "REAL_ESTATE" | "VEHICLE";
export type MarketplaceProductStatus = "LISTED" | "UNLISTED";
export type MarketplaceOrderStatus = "SETTLED" | "AWAITING_DELIVERY" | "DELIVERED" | "REFUNDED";
export type MarketplaceOfferStatus = "OPEN" | "ACCEPTED" | "REJECTED";
export type MarketplaceDopingStatus = "ACTIVE" | "EXPIRED";

export type MarketplaceProductRecord = {
  id: string;
  userId: string;
  slug: string;
  title: string;
  summary: string;
  kind: MarketplaceProductKind;
  category: MarketplaceProductCategory;
  amountMinor: AmountMinor;
  currencyCode: CurrencyCode;
  status: MarketplaceProductStatus;
  isDoped: boolean;
  isOfferAllowed: boolean;
  tkgmBlockParcel: string | null;
  insuranceQuoteHook: string | null;
  dopedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MarketplaceOrderRecord = {
  id: string;
  productId: string;
  userId: string;
  sellerUserId: string;
  productTitle: string;
  kind: MarketplaceProductKind;
  priceLockId: string;
  escrowHoldId: string | null;
  amountMinor: AmountMinor;
  holdMinor: AmountMinor;
  netMinor: AmountMinor;
  holdBps: number;
  currencyCode: CurrencyCode;
  status: MarketplaceOrderStatus;
  settledAt: Date | null;
  deliveredAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MarketplaceOfferRecord = {
  id: string;
  productId: string;
  userId: string;
  sellerUserId: string;
  amountMinor: AmountMinor;
  currencyCode: CurrencyCode;
  status: MarketplaceOfferStatus;
  escrowHoldId: string | null;
  orderId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MarketplaceDopingRecord = {
  id: string;
  productId: string;
  userId: string;
  amountMinor: AmountMinor;
  currencyCode: CurrencyCode;
  status: MarketplaceDopingStatus;
  startsAt: Date;
  expiresAt: Date;
  createdAt: Date;
};

export type PazaryeriSalePulse = {
  title: string;
  amountMinor: AmountMinor;
  currencyCode: CurrencyCode;
};

export type PazaryeriPulse = {
  listedProducts: number;
  ordersSold: number;
  ordersBought: number;
  pendingDelivery: number;
  lastSales: PazaryeriSalePulse[];
  currencyCode: CurrencyCode;
};

export type PazaryeriStore = {
  insertProduct(product: MarketplaceProductRecord): Promise<MarketplaceProductRecord>;
  getProduct(id: string): Promise<MarketplaceProductRecord | null>;
  getProductBySlug(slug: string): Promise<MarketplaceProductRecord | null>;
  listListedProducts(): Promise<MarketplaceProductRecord[]>;
  listProductsBySeller(userId: string): Promise<MarketplaceProductRecord[]>;
  updateProduct(
    id: string,
    patch: Partial<
      Pick<MarketplaceProductRecord, "isDoped" | "dopedUntil" | "status" | "updatedAt">
    >,
  ): Promise<MarketplaceProductRecord>;
  insertOrder(order: MarketplaceOrderRecord): Promise<MarketplaceOrderRecord>;
  getOrder(id: string): Promise<MarketplaceOrderRecord | null>;
  getOrderByEscrowHoldId(escrowHoldId: string): Promise<MarketplaceOrderRecord | null>;
  getOrderByBuyerAndProduct(userId: string, productId: string): Promise<MarketplaceOrderRecord | null>;
  listOrdersForUser(userId: string): Promise<MarketplaceOrderRecord[]>;
  updateOrder(
    id: string,
    patch: Partial<
      Pick<MarketplaceOrderRecord, "status" | "settledAt" | "deliveredAt" | "refundedAt" | "updatedAt">
    >,
  ): Promise<MarketplaceOrderRecord>;
  insertOffer(offer: MarketplaceOfferRecord): Promise<MarketplaceOfferRecord>;
  getOffer(id: string): Promise<MarketplaceOfferRecord | null>;
  getOpenOfferByBuyerAndProduct(userId: string, productId: string): Promise<MarketplaceOfferRecord | null>;
  listOffersForProduct(productId: string): Promise<MarketplaceOfferRecord[]>;
  updateOffer(
    id: string,
    patch: Partial<
      Pick<MarketplaceOfferRecord, "status" | "escrowHoldId" | "orderId" | "updatedAt">
    >,
  ): Promise<MarketplaceOfferRecord>;
  rejectOpenOffersForProduct(productId: string, exceptOfferId: string, now: Date): Promise<void>;
  insertDoping(doping: MarketplaceDopingRecord): Promise<MarketplaceDopingRecord>;
  getActiveDopingForProduct(productId: string, now: Date): Promise<MarketplaceDopingRecord | null>;
  pulseForUser(userId: string): Promise<PazaryeriPulse>;
};
