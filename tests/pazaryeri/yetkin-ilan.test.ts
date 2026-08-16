import { describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import {
  PAZARYERI_ASSET_FLOOR_UNIT_KEY,
  PAZARYERI_DOPING_UNIT_KEY,
  PAZARYERI_LISTING_FLOOR_UNIT_KEY,
  PAZARYERI_MODULE_KEY,
} from "@/lib/pazaryeri/types";
import { listMarketplaceProduct } from "@/lib/pazaryeri/engine";
import { decideMarketplaceOffer, submitMarketplaceOffer } from "@/lib/pazaryeri/offer-engine";
import { purchaseMarketplaceDoping } from "@/lib/pazaryeri/doping-engine";
import { createMemoryLedgerStore, createMemoryEscrowStore } from "../helpers/memory-money";
import {
  createMemoryPazaryeriStore,
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

describe("Yetkinİlan — emlak/vasıta, teklif ve doping", () => {
  it("emlak kategorisi TKGM ada-parsel ile listelenir", async () => {
    const ports = world();
    const product = await listMarketplaceProduct(ports, {
      sellerUserId: SELLER,
      title: "Kadıköy örnek daire",
      summary: "3D/TKGM uyumlu örnek emlak ilanı.",
      category: "REAL_ESTATE",
      amountMinor: ASSET_PRICE,
      tkgmBlockParcel: "12/34",
    });
    expect(product.category).toBe("REAL_ESTATE");
    expect(product.kind).toBe("SERVICE");
    expect(product.isOfferAllowed).toBe(true);
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

  it("vasıta kategorisi sigorta kancası ile listelenir", async () => {
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
    expect(product.kind).toBe("SERVICE");
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

  it("alıcı teklif verir, satıcı onayında bakiye emanete kilitlenir", async () => {
    const ports = world();
    const product = await ports.pazaryeri.insertProduct(memoryRealEstateProduct());
    const submitted = await submitMarketplaceOffer(ports, {
      productId: product.id,
      buyerUserId: BUYER,
      amountMinor: OFFER,
    });
    expect(submitted.applied).toBe(true);
    expect(submitted.offer.status).toBe("OPEN");
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(1_000_000);

    const decided = await decideMarketplaceOffer(ports, {
      offerId: submitted.offer.id,
      actorUserId: SELLER,
      decision: "accept",
      platformUserId: PLATFORM,
    });
    expect(decided.applied).toBe(true);
    expect(decided.offer.status).toBe("ACCEPTED");
    expect(decided.order?.status).toBe("AWAITING_DELIVERY");
    expect(decided.order?.escrowHoldId).toBeTruthy();
    expect(decided.order?.amountMinor).toBe(OFFER);
    expect(decided.order?.holdMinor).toBe(8_000);
    expect(decided.order?.netMinor).toBe(72_000);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(920_000);
    expect(ports.ledger.snapshot(SELLER).amountMinor).toBe(50_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);

    const again = await decideMarketplaceOffer(ports, {
      offerId: submitted.offer.id,
      actorUserId: SELLER,
      decision: "accept",
      platformUserId: PLATFORM,
    });
    expect(again.applied).toBe(false);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(920_000);
  });

  it("teklife kapalı ilana teklif yazılmaz", async () => {
    const ports = world();
    const product = await ports.pazaryeri.insertProduct(
      memoryRealEstateProduct({ isOfferAllowed: false }),
    );
    await expect(
      submitMarketplaceOffer(ports, {
        productId: product.id,
        buyerUserId: BUYER,
        amountMinor: OFFER,
      }),
    ).rejects.toThrow(/teklife kapalı/);
  });

  it("doping cüzdan bakiyesini düşer ve ilanı öne çıkarır", async () => {
    const ports = world();
    const product = await ports.pazaryeri.insertProduct(memoryVehicleProduct());
    const boosted = await purchaseMarketplaceDoping(ports, {
      productId: product.id,
      sellerUserId: SELLER,
      platformUserId: PLATFORM,
    });
    expect(boosted.applied).toBe(true);
    expect(boosted.product.isDoped).toBe(true);
    expect(boosted.product.dopedUntil).toBeTruthy();
    expect(boosted.doping.amountMinor).toBe(DOPING);
    expect(ports.ledger.snapshot(SELLER).amountMinor).toBe(45_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(DOPING);

    const listed = await ports.pazaryeri.listListedProducts();
    expect(listed[0]?.id).toBe(product.id);

    await expect(
      purchaseMarketplaceDoping(ports, {
        productId: product.id,
        sellerUserId: SELLER,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(/zaten dopingli/);
    expect(ports.ledger.snapshot(SELLER).amountMinor).toBe(45_000);
  });

  it("yetersiz bakiyede doping yazılmaz", async () => {
    const ports = world(1_000);
    const product = await ports.pazaryeri.insertProduct(memoryVehicleProduct());
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
