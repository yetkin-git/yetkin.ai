import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import {
  PAZARYERI_ASSET_FLOOR_UNIT_KEY,
  PAZARYERI_DOPING_UNIT_KEY,
  PAZARYERI_LISTING_FLOOR_UNIT_KEY,
  PAZARYERI_MODULE_KEY,
} from "@/lib/pazaryeri/types";
import {
  listMarketplaceProduct,
  lockMarketplaceProductPrice,
  purchaseMarketplaceProduct,
} from "@/lib/pazaryeri/engine";
import { decideMarketplaceOffer, submitMarketplaceOffer } from "@/lib/pazaryeri/offer-engine";
import { purchaseMarketplaceDoping } from "@/lib/pazaryeri/doping-engine";
import {
  ASSET_VITRINE_ONLY_ERROR,
  settlementKindForCategory,
} from "@/lib/pazaryeri/category";
import { createMemoryLedgerStore, createMemoryEscrowStore } from "../helpers/memory-money";
import {
  createMemoryPazaryeriStore,
  memoryDigitalProduct,
  memoryRealEstateProduct,
  memoryVehicleProduct,
} from "../helpers/memory-pazaryeri";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "buyer-1";
const SELLER = "seller-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const ASSET_PRICE = 100_000;
const OFFER = 80_000;
const DOPING = 5_000;

function world(sellerBalance = 50_000, buyerBalance = 1_000_000) {
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: buyerBalance },
    { userId: SELLER, amountMinor: sellerBalance },
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
    {
      moduleKey: PAZARYERI_MODULE_KEY,
      unitKey: PAZARYERI_ASSET_FLOOR_UNIT_KEY,
      amountMinor: 100_000,
      minMinor: 10_000,
      maxMinor: 2_000_000_000,
    },
    {
      moduleKey: PAZARYERI_MODULE_KEY,
      unitKey: PAZARYERI_DOPING_UNIT_KEY,
      amountMinor: DOPING,
      minMinor: DOPING,
      maxMinor: DOPING,
    },
  ]);
  const locks = createMemoryCheckoutPriceLockStore();
  const escrow = createMemoryEscrowStore();
  const pazaryeri = createMemoryPazaryeriStore();
  return { ledger, catalog, locks, escrow, pazaryeri };
}

describe("Yetkinİlan — emlak/vasıta vitrin, teklif ve doping kapısı", () => {
  it("settlementKindForCategory emlak/vasıtayı SERVICE (emanet) saymaz", () => {
    expect(settlementKindForCategory("DIGITAL_GOOD")).toBe("DIGITAL_GOOD");
    expect(settlementKindForCategory("SERVICE")).toBe("SERVICE");
    expect(() => settlementKindForCategory("REAL_ESTATE")).toThrow(ForbiddenError);
    expect(() => settlementKindForCategory("VEHICLE")).toThrow(ASSET_VITRINE_ONLY_ERROR);
  });

  it("emlak kategorisi TKGM ada-parsel ile vitrin olarak listelenir", async () => {
    const ports = world();
    const product = await listMarketplaceProduct(ports, {
      sellerUserId: SELLER,
      title: "Kadıköy örnek daire",
      summary: "3D/TKGM uyumlu örnek emlak ilanı.",
      category: "REAL_ESTATE",
      amountMinor: ASSET_PRICE,
      tkgmBlockParcel: "12/34",
      isOfferAllowed: true,
    });
    expect(product.category).toBe("REAL_ESTATE");
    expect(product.isOfferAllowed).toBe(false);
    expect(product.tkgmBlockParcel).toBe("Ada 12 / Parsel 34");
  });

  it("emlak ilanı ada-parsel olmadan reddedilir", async () => {
    const ports = world();
    await expect(
      listMarketplaceProduct(ports, {
        sellerUserId: SELLER,
        title: "Kadıköy örnek daire",
        summary: "Ada parsel eksik emlak ilanı.",
        category: "REAL_ESTATE",
        amountMinor: ASSET_PRICE,
      }),
    ).rejects.toThrow(/TKGM ada-parsel/);
  });

  it("vasıta kategorisi sigorta kancası ile vitrin olarak listelenir", async () => {
    const ports = world();
    const product = await listMarketplaceProduct(ports, {
      sellerUserId: SELLER,
      title: "Örnek vasıta",
      summary: "Sigorta uyumlu örnek vasıta ilanı.",
      category: "VEHICLE",
      amountMinor: ASSET_PRICE,
      insuranceQuoteHook: "Hepiyi",
    });
    expect(product.category).toBe("VEHICLE");
    expect(product.isOfferAllowed).toBe(false);
    expect(product.insuranceQuoteHook).toBe("hepiyi");
  });

  it("vasıta ilanı sigorta kancası olmadan reddedilir", async () => {
    const ports = world();
    await expect(
      listMarketplaceProduct(ports, {
        sellerUserId: SELLER,
        title: "Örnek vasıta",
        summary: "Sigorta kancası eksik vasıta ilanı.",
        category: "VEHICLE",
        amountMinor: ASSET_PRICE,
      }),
    ).rejects.toThrow(/sigorta kancası/);
  });

  it("emlak ilanında satın alma, fiyat kilidi ve teklif fail-closed 403 durur", async () => {
    const ports = world();
    const product = await ports.pazaryeri.insertProduct(
      memoryRealEstateProduct({ isOfferAllowed: true }),
    );
    await expect(
      lockMarketplaceProductPrice(ports, { productId: product.id, userId: BUYER }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      purchaseMarketplaceProduct(ports, {
        productId: product.id,
        userId: BUYER,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(ASSET_VITRINE_ONLY_ERROR);
    await expect(
      submitMarketplaceOffer(ports, {
        productId: product.id,
        buyerUserId: BUYER,
        amountMinor: OFFER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(1_000_000);
    expect(await ports.pazaryeri.getOrderByBuyerAndProduct(BUYER, product.id)).toBeNull();
    expect(await ports.pazaryeri.getOpenOfferByBuyerAndProduct(BUYER, product.id)).toBeNull();
  });

  it("eski açık teklif emlak ilanında kabul veya red ile emanete kilitlenmez", async () => {
    const ports = world();
    const product = await ports.pazaryeri.insertProduct(memoryRealEstateProduct());
    const leftover = await ports.pazaryeri.insertOffer({
      id: "offer-legacy-1",
      productId: product.id,
      userId: BUYER,
      sellerUserId: SELLER,
      amountMinor: toAmountMinor(OFFER),
      currencyCode: product.currencyCode,
      status: "OPEN",
      escrowHoldId: null,
      orderId: null,
      createdAt: new Date("2026-08-14T00:00:00.000Z"),
      updatedAt: new Date("2026-08-14T00:00:00.000Z"),
    });
    await expect(
      decideMarketplaceOffer(ports, {
        offerId: leftover.id,
        actorUserId: SELLER,
        decision: "accept",
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(ASSET_VITRINE_ONLY_ERROR);
    await expect(
      decideMarketplaceOffer(ports, {
        offerId: leftover.id,
        actorUserId: SELLER,
        decision: "reject",
        platformUserId: PLATFORM,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(1_000_000);
    expect((await ports.pazaryeri.getOffer(leftover.id))?.status).toBe("OPEN");
  });

  it("vasıta ilanında doping fail-closed durur; dijital ilanda doping çalışır", async () => {
    const ports = world();
    const vehicle = await ports.pazaryeri.insertProduct(memoryVehicleProduct());
    await expect(
      purchaseMarketplaceDoping(ports, {
        productId: vehicle.id,
        sellerUserId: SELLER,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(ASSET_VITRINE_ONLY_ERROR);
    expect(ports.ledger.snapshot(SELLER).amountMinor).toBe(50_000);
    expect((await ports.pazaryeri.getProduct(vehicle.id))?.isDoped).toBe(false);

    const digital = await ports.pazaryeri.insertProduct(memoryDigitalProduct());
    const boosted = await purchaseMarketplaceDoping(ports, {
      productId: digital.id,
      sellerUserId: SELLER,
      platformUserId: PLATFORM,
    });
    expect(boosted.applied).toBe(true);
    expect(boosted.product.isDoped).toBe(true);
    expect(boosted.doping.amountMinor).toBe(DOPING);
    expect(ports.ledger.snapshot(SELLER).amountMinor).toBe(45_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(DOPING);
  });

  it("yetersiz bakiyede dijital doping yazılmaz", async () => {
    const ports = world(1_000);
    const product = await ports.pazaryeri.insertProduct(memoryDigitalProduct());
    await expect(
      purchaseMarketplaceDoping(ports, {
        productId: product.id,
        sellerUserId: SELLER,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow();
    expect(ports.ledger.snapshot(SELLER).amountMinor).toBe(1_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
    expect((await ports.pazaryeri.getProduct(product.id))?.isDoped).toBe(false);
  });
});
