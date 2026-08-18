import { describe, expect, it } from "vitest";
import { PRICE_LOCK_GRACE_MS } from "@/lib/kernel/pricing/price-lock";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { ASSET_VITRINE_ONLY_ERROR } from "@/lib/pazaryeri/category";
import { PAZARYERI_MODULE_KEY, PAZARYERI_LISTING_FLOOR_UNIT_KEY } from "@/lib/pazaryeri/types";
import {
  confirmMarketplaceDelivery,
  listMarketplaceProduct,
  lockMarketplaceProductPrice,
  purchaseMarketplaceProduct,
  refundMarketplaceOrder,
} from "@/lib/pazaryeri/engine";
import { createMemoryLedgerStore, createMemoryEscrowStore } from "../helpers/memory-money";
import {
  createMemoryPazaryeriStore,
  memoryDigitalProduct,
  memoryRealEstateProduct,
  memoryServiceProduct,
} from "../helpers/memory-pazaryeri";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "buyer-1";
const SELLER = "seller-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const PRICE = 10_000;

function world(buyerBalance = 100_000) {
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: buyerBalance },
    { userId: SELLER, amountMinor: 0 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const catalog = createMemoryPriceCatalogStore([
    {
      moduleKey: PAZARYERI_MODULE_KEY,
      unitKey: PAZARYERI_LISTING_FLOOR_UNIT_KEY,
      amountMinor: 1_000,
      minMinor: 1_000,
      maxMinor: 2_000_000,
    },
  ]);
  const locks = createMemoryCheckoutPriceLockStore();
  const escrow = createMemoryEscrowStore();
  const pazaryeri = createMemoryPazaryeriStore();
  return { ledger, catalog, locks, escrow, pazaryeri };
}

describe("pazaryeri satın alma (dijital anında / hizmet teyidi)", () => {
  it("dijital: alıcı düşer, satıcı net alır, platform hold alır, emanet yoktur", async () => {
    const ports = world();
    const product = await ports.pazaryeri.insertProduct(memoryDigitalProduct());
    const locked = await lockMarketplaceProductPrice(ports, {
      productId: product.id,
      userId: BUYER,
      now: new Date("2026-08-14T00:00:00.000Z"),
    });
    expect(locked.lock.amountMinor).toBe(PRICE);

    const result = await purchaseMarketplaceProduct(ports, {
      productId: product.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
      now: new Date("2026-08-14T00:01:00.000Z"),
    });

    expect(result.applied).toBe(true);
    expect(result.order.status).toBe("SETTLED");
    expect(result.order.escrowHoldId).toBeNull();
    expect(result.order.netMinor).toBe(9_000);
    expect(result.order.holdMinor).toBe(1_000);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(90_000);
    expect(ports.ledger.snapshot(SELLER).amountMinor).toBe(9_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(1_000);

    const again = await purchaseMarketplaceProduct(ports, {
      productId: product.id,
      userId: BUYER,
      platformUserId: PLATFORM,
    });
    expect(again.applied).toBe(false);
    expect(again.order.id).toBe(result.order.id);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(90_000);
  });

  it("hizmet: emanet kilitler, teyit sonrası net satıcıya geçer", async () => {
    const ports = world();
    const product = await ports.pazaryeri.insertProduct(memoryServiceProduct());
    const locked = await lockMarketplaceProductPrice(ports, {
      productId: product.id,
      userId: BUYER,
    });
    const purchased = await purchaseMarketplaceProduct(ports, {
      productId: product.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });

    expect(purchased.order.status).toBe("AWAITING_DELIVERY");
    expect(purchased.order.escrowHoldId).toBeTruthy();
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(90_000);
    expect(ports.ledger.snapshot(SELLER).amountMinor).toBe(0);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);

    const confirmed = await confirmMarketplaceDelivery(ports, {
      orderId: purchased.order.id,
      actorUserId: BUYER,
      platformUserId: PLATFORM,
    });
    expect(confirmed.applied).toBe(true);
    expect(confirmed.order.status).toBe("DELIVERED");
    expect(ports.ledger.snapshot(SELLER).amountMinor).toBe(9_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(1_000);

    const again = await confirmMarketplaceDelivery(ports, {
      orderId: purchased.order.id,
      actorUserId: BUYER,
      platformUserId: PLATFORM,
    });
    expect(again.applied).toBe(false);
  });

  it("hizmet iadesi alıcıya brütü döner", async () => {
    const ports = world();
    const product = await ports.pazaryeri.insertProduct(memoryServiceProduct());
    const locked = await lockMarketplaceProductPrice(ports, {
      productId: product.id,
      userId: BUYER,
    });
    const purchased = await purchaseMarketplaceProduct(ports, {
      productId: product.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    const refunded = await refundMarketplaceOrder(ports, {
      orderId: purchased.order.id,
      actorUserId: BUYER,
    });
    expect(refunded.order.status).toBe("REFUNDED");
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(100_000);
    expect(ports.ledger.snapshot(SELLER).amountMinor).toBe(0);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
  });

  it("süresi dolmuş kilitle debit yok", async () => {
    const ports = world();
    const product = await ports.pazaryeri.insertProduct(memoryDigitalProduct());
    const now = new Date("2026-08-14T00:00:00.000Z");
    const locked = await lockMarketplaceProductPrice(ports, {
      productId: product.id,
      userId: BUYER,
      now,
    });
    await expect(
      purchaseMarketplaceProduct(ports, {
        productId: product.id,
        userId: BUYER,
        lockId: locked.lock.id,
        platformUserId: PLATFORM,
        now: new Date(now.getTime() + PRICE_LOCK_GRACE_MS),
      }),
    ).rejects.toThrow(/süresi doldu|geçerli fiyat kilidi/);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(100_000);
    expect(await ports.pazaryeri.getOrderByBuyerAndProduct(BUYER, product.id)).toBeNull();
  });

  it("yetersiz bakiyede sipariş yazılmaz", async () => {
    const ports = world(1_000);
    const product = await ports.pazaryeri.insertProduct(memoryDigitalProduct());
    const locked = await lockMarketplaceProductPrice(ports, {
      productId: product.id,
      userId: BUYER,
    });
    await expect(
      purchaseMarketplaceProduct(ports, {
        productId: product.id,
        userId: BUYER,
        lockId: locked.lock.id,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow();
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(1_000);
    expect(ports.ledger.snapshot(SELLER).amountMinor).toBe(0);
    expect(await ports.pazaryeri.getOrderByBuyerAndProduct(BUYER, product.id)).toBeNull();
  });

  it("satıcı kendi ürününü alamaz", async () => {
    const ports = world();
    const product = await ports.pazaryeri.insertProduct(memoryDigitalProduct());
    const locked = await lockMarketplaceProductPrice(ports, {
      productId: product.id,
      userId: SELLER,
    });
    await expect(
      purchaseMarketplaceProduct(ports, {
        productId: product.id,
        userId: SELLER,
        lockId: locked.lock.id,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(/Kendi tezgâh/);
  });

  it("katalog yoksa ilan fail-closed durur", async () => {
    const ports = world();
    const emptyCatalog = createMemoryPriceCatalogStore();
    await expect(
      listMarketplaceProduct(
        { ...ports, catalog: emptyCatalog },
        {
          sellerUserId: SELLER,
          title: "PDF şablon seti",
          summary: "Dijital sözleşme şablonları.",
          kind: "DIGITAL_GOOD",
          amountMinor: PRICE,
        },
      ),
    ).rejects.toThrow(/Fiyat kataloğu yok/);
  });

  it("katalog tabanının altındaki fiyat listelenmez", async () => {
    const ports = world();
    await expect(
      listMarketplaceProduct(ports, {
        sellerUserId: SELLER,
        title: "Mini ikon paketi",
        summary: "Dijital ikon seti.",
        kind: "DIGITAL_GOOD",
        amountMinor: 100,
      }),
    ).rejects.toThrow(/taban/);
  });

  it("emlak vitrininde satın alma fail-closed durur; bakiye ve sipariş yazılmaz", async () => {
    const ports = world();
    const product = await ports.pazaryeri.insertProduct(memoryRealEstateProduct());
    await expect(
      purchaseMarketplaceProduct(ports, {
        productId: product.id,
        userId: BUYER,
        platformUserId: PLATFORM,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      purchaseMarketplaceProduct(ports, {
        productId: product.id,
        userId: BUYER,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(ASSET_VITRINE_ONLY_ERROR);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(100_000);
    expect(ports.ledger.snapshot(SELLER).amountMinor).toBe(0);
    expect(await ports.pazaryeri.getOrderByBuyerAndProduct(BUYER, product.id)).toBeNull();
  });
});
