import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { isProductDoped, isPubliclyListableProduct } from "@/lib/pazaryeri/category";
import type { PazaryeriEnginePorts, PazaryeriMoneyWritePorts } from "@/lib/pazaryeri/engine";
import type {
  MarketplaceDopingRecord,
  MarketplaceOfferRecord,
  MarketplaceOrderRecord,
  MarketplaceProductRecord,
  PazaryeriPulse,
  PazaryeriStore,
} from "@/lib/pazaryeri/types";
import {
  createSerializedUnitOfWork,
  type MemoryEscrowStore,
  type MemoryLedgerStore,
} from "./memory-money";
import type { MemoryCheckoutPriceLockStore } from "./memory-pricing";

type PazaryeriMemoryState = {
  products: Array<[string, MarketplaceProductRecord]>;
  orders: Array<[string, MarketplaceOrderRecord]>;
  offers: Array<[string, MarketplaceOfferRecord]>;
  dopings: Array<[string, MarketplaceDopingRecord]>;
};

export type MemoryPazaryeriStore = PazaryeriStore & {
  failNextOrderInsert(): void;
  capture(): PazaryeriMemoryState;
  restore(state: PazaryeriMemoryState): void;
};

export function createMemoryPazaryeriStore(): MemoryPazaryeriStore {
  const products = new Map<string, MarketplaceProductRecord>();
  const orders = new Map<string, MarketplaceOrderRecord>();
  const offers = new Map<string, MarketplaceOfferRecord>();
  const dopings = new Map<string, MarketplaceDopingRecord>();
  let failOrder = false;

  return {
    failNextOrderInsert() {
      failOrder = true;
    },
    capture() {
      return {
        products: [...products.entries()].map(([key, value]) => [key, { ...value }]),
        orders: [...orders.entries()].map(([key, value]) => [key, { ...value }]),
        offers: [...offers.entries()].map(([key, value]) => [key, { ...value }]),
        dopings: [...dopings.entries()].map(([key, value]) => [key, { ...value }]),
      };
    },
    restore(state) {
      products.clear();
      orders.clear();
      offers.clear();
      dopings.clear();
      for (const [key, value] of state.products) {
        products.set(key, { ...value });
      }
      for (const [key, value] of state.orders) {
        orders.set(key, { ...value });
      }
      for (const [key, value] of state.offers) {
        offers.set(key, { ...value });
      }
      for (const [key, value] of state.dopings) {
        dopings.set(key, { ...value });
      }
    },
    async insertProduct(product) {
      products.set(product.id, product);
      return { ...product };
    },
    async getProduct(id) {
      const row = products.get(id);
      return row ? { ...row } : null;
    },
    async getProductBySlug(slug) {
      const found = [...products.values()].find((row) => row.slug === slug);
      return found ? { ...found } : null;
    },
    async listListedProducts() {
      return [...products.values()]
        .filter((row) => isPubliclyListableProduct(row))
        .sort((a, b) => {
          const doped = Number(isProductDoped(b)) - Number(isProductDoped(a));
          if (doped !== 0) {
            return doped;
          }
          return b.createdAt.getTime() - a.createdAt.getTime();
        })
        .map((row) => ({ ...row }));
    },
    async listProductsBySeller(userId) {
      return [...products.values()]
        .filter((row) => row.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async updateProduct(id, patch) {
      const product = products.get(id);
      if (!product) {
        throw new Error("Ürün yok.");
      }
      const next = { ...product, ...patch };
      products.set(id, next);
      return { ...next };
    },
    async insertOrder(order) {
      if (failOrder) {
        failOrder = false;
        throw new Error("Sipariş yazımı düştü.");
      }
      orders.set(order.id, order);
      return { ...order };
    },
    async getOrder(id) {
      const row = orders.get(id);
      return row ? { ...row } : null;
    },
    async getOrderByEscrowHoldId(escrowHoldId) {
      const row = [...orders.values()].find((item) => item.escrowHoldId === escrowHoldId);
      return row ? { ...row } : null;
    },
    async getOrderByBuyerAndProduct(userId, productId) {
      const found = [...orders.values()].find((row) => row.userId === userId && row.productId === productId);
      return found ? { ...found } : null;
    },
    async listOrdersForUser(userId) {
      return [...orders.values()]
        .filter((row) => row.userId === userId || row.sellerUserId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async updateOrder(id, patch) {
      const order = orders.get(id);
      if (!order) {
        throw new Error("Sipariş yok.");
      }
      const next = { ...order, ...patch };
      orders.set(id, next);
      return { ...next };
    },
    async insertOffer(offer) {
      offers.set(offer.id, offer);
      return { ...offer };
    },
    async getOffer(id) {
      const row = offers.get(id);
      return row ? { ...row } : null;
    },
    async getOpenOfferByBuyerAndProduct(userId, productId) {
      const found = [...offers.values()].find(
        (row) => row.userId === userId && row.productId === productId && row.status === "OPEN",
      );
      return found ? { ...found } : null;
    },
    async listOffersForProduct(productId) {
      return [...offers.values()]
        .filter((row) => row.productId === productId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async updateOffer(id, patch) {
      const offer = offers.get(id);
      if (!offer) {
        throw new Error("Teklif yok.");
      }
      const next = { ...offer, ...patch };
      offers.set(id, next);
      return { ...next };
    },
    async rejectOpenOffersForProduct(productId, exceptOfferId, now) {
      for (const [id, offer] of offers) {
        if (offer.productId === productId && offer.status === "OPEN" && offer.id !== exceptOfferId) {
          offers.set(id, { ...offer, status: "REJECTED", updatedAt: now });
        }
      }
    },
    async insertDoping(doping) {
      dopings.set(doping.id, doping);
      return { ...doping };
    },
    async getActiveDopingForProduct(productId, now) {
      const found = [...dopings.values()]
        .filter((row) => row.productId === productId && row.status === "ACTIVE" && row.expiresAt.getTime() > now.getTime())
        .sort((a, b) => b.expiresAt.getTime() - a.expiresAt.getTime())[0];
      return found ? { ...found } : null;
    },
    async pulseForUser(userId) {
      const ownProducts = [...products.values()].filter((row) => row.userId === userId);
      const sold = [...orders.values()].filter(
        (row) => row.sellerUserId === userId && (row.status === "SETTLED" || row.status === "DELIVERED"),
      );
      const bought = [...orders.values()].filter((row) => row.userId === userId);
      const pending = [...orders.values()].filter(
        (row) =>
          row.status === "AWAITING_DELIVERY" && (row.userId === userId || row.sellerUserId === userId),
      );
      const lastSales = [...sold]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3)
        .map((row) => ({
          title: row.productTitle,
          amountMinor: row.amountMinor,
          currencyCode: row.currencyCode,
        }));
      const pulse: PazaryeriPulse = {
        listedProducts: ownProducts.filter((row) => row.status === "LISTED").length,
        ordersSold: sold.length,
        ordersBought: bought.length,
        pendingDelivery: pending.length,
        lastSales,
        currencyCode: SETTLEMENT_CURRENCY,
      };
      return pulse;
    },
  };
}

export function withMemoryPazaryeriAtomic<
  T extends {
    ledger: MemoryLedgerStore;
    escrow: MemoryEscrowStore;
    locks: MemoryCheckoutPriceLockStore;
    pazaryeri: MemoryPazaryeriStore;
  },
>(ports: T): T & Pick<PazaryeriEnginePorts, "runMoneyAtomic"> {
  const uow = createSerializedUnitOfWork();
  return {
    ...ports,
    async runMoneyAtomic<R>(work: (tx: PazaryeriMoneyWritePorts) => Promise<R>): Promise<R> {
      return uow.run([ports.ledger, ports.escrow, ports.locks, ports.pazaryeri], () =>
        work({
          ledger: ports.ledger,
          escrow: ports.escrow,
          locks: ports.locks,
          pazaryeri: ports.pazaryeri,
        }),
      );
    },
  };
}

function productDefaults(): Pick<
  MarketplaceProductRecord,
  | "category"
  | "isDoped"
  | "isOfferAllowed"
  | "tkgmBlockParcel"
  | "insuranceQuoteHook"
  | "dopedUntil"
> {
  return {
    category: "DIGITAL_GOOD",
    isDoped: false,
    isOfferAllowed: false,
    tkgmBlockParcel: null,
    insuranceQuoteHook: null,
    dopedUntil: null,
  };
}

export function memoryDigitalProduct(
  overrides?: Partial<MarketplaceProductRecord>,
): MarketplaceProductRecord {
  const now = new Date("2026-08-14T00:00:00.000Z");
  return {
    id: "product-digital-1",
    userId: "seller-1",
    slug: "rail-sablon-pack",
    title: "Rail şablon paketi",
    summary: "Dijital teslimatlı sözleşme şablonları.",
    kind: "DIGITAL_GOOD",
    amountMinor: toAmountMinor(10_000),
    currencyCode: SETTLEMENT_CURRENCY,
    status: "LISTED",
    createdAt: now,
    updatedAt: now,
    ...productDefaults(),
    ...overrides,
  };
}

export function memoryServiceProduct(
  overrides?: Partial<MarketplaceProductRecord>,
): MarketplaceProductRecord {
  return memoryDigitalProduct({
    id: "product-service-1",
    slug: "kod-inceleme-seansi",
    title: "Kod inceleme seansı",
    summary: "Bir saatlik uzaktan kod inceleme hizmeti.",
    kind: "SERVICE",
    category: "SERVICE",
    ...overrides,
  });
}

export function memoryRealEstateProduct(
  overrides?: Partial<MarketplaceProductRecord>,
): MarketplaceProductRecord {
  return memoryDigitalProduct({
    id: "product-estate-1",
    slug: "kadikoy-ornek-daire",
    title: "Kadıköy örnek daire",
    summary: "3D/TKGM uyumlu örnek emlak ilanı. Yalnız vitrindir.",
    kind: "SERVICE",
    category: "REAL_ESTATE",
    isOfferAllowed: false,
    tkgmBlockParcel: "Ada 12 / Parsel 34",
    amountMinor: toAmountMinor(100_000),
    ...overrides,
  });
}

export function memoryVehicleProduct(
  overrides?: Partial<MarketplaceProductRecord>,
): MarketplaceProductRecord {
  return memoryDigitalProduct({
    id: "product-vehicle-1",
    slug: "ornek-vasita",
    title: "Örnek vasıta",
    summary: "Sigorta uyumlu örnek vasıta ilanı. Yalnız vitrindir.",
    kind: "SERVICE",
    category: "VEHICLE",
    isOfferAllowed: false,
    insuranceQuoteHook: "quick",
    amountMinor: toAmountMinor(100_000),
    ...overrides,
  });
}
