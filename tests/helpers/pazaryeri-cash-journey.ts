import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { PAZARYERI_MODULE_KEY, PAZARYERI_LISTING_FLOOR_UNIT_KEY } from "@/lib/pazaryeri/types";
import {
  confirmMarketplaceDelivery,
  lockMarketplaceProductPrice,
  purchaseMarketplaceProduct,
} from "@/lib/pazaryeri/engine";
import { createMemoryLedgerStore, createMemoryEscrowStore, type MemoryLedgerStore } from "./memory-money";
import {
  createMemoryPazaryeriStore,
  memoryDigitalProduct,
  memoryServiceProduct,
} from "./memory-pazaryeri";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "./memory-pricing";
import type { MarketplaceOrderRecord } from "@/lib/pazaryeri/types";
import type { EscrowHoldRecord } from "@/lib/kernel/escrow/types";

export const E2E_PAZARYERI_BUYER_ID = "e2e-yetkinilan-buyer";
export const E2E_PAZARYERI_SELLER_ID = "e2e-yetkinilan-seller";
export const E2E_PAZARYERI_PLATFORM_ID = PLATFORM_TREASURY_USER_ID;
export const E2E_PAZARYERI_START_MINOR = 100_000;
export const E2E_PAZARYERI_PRICE_MINOR = 10_000;

export type PazaryeriDualCashJourneyResult = {
  ledger: MemoryLedgerStore;
  digital: {
    order: MarketplaceOrderRecord;
    firstApplied: boolean;
    replayApplied: boolean;
  };
  service: {
    orderAfterPurchase: MarketplaceOrderRecord;
    orderAfterConfirm: MarketplaceOrderRecord;
    holdAfterPurchase: EscrowHoldRecord | null;
    holdAfterConfirm: EscrowHoldRecord | null;
  };
  buyerBalanceAfter: number;
  sellerBalanceAfter: number;
  platformBalanceAfter: number;
};

function world() {
  const ledger = createMemoryLedgerStore([
    { userId: E2E_PAZARYERI_BUYER_ID, amountMinor: E2E_PAZARYERI_START_MINOR },
    { userId: E2E_PAZARYERI_SELLER_ID, amountMinor: 0 },
    { userId: E2E_PAZARYERI_PLATFORM_ID, amountMinor: 0 },
  ]);
  return {
    ledger,
    catalog: createMemoryPriceCatalogStore([
      {
        moduleKey: PAZARYERI_MODULE_KEY,
        unitKey: PAZARYERI_LISTING_FLOOR_UNIT_KEY,
        amountMinor: 1_000,
        minMinor: 1_000,
        maxMinor: 2_000_000,
      },
    ]),
    locks: createMemoryCheckoutPriceLockStore(),
    escrow: createMemoryEscrowStore(),
    pazaryeri: createMemoryPazaryeriStore(),
  };
}

/**
 * Yetkinİlan çift nakit yolu (bellek): dijital SETTLED + hizmet hold → DELIVERED.
 * Canlı Postgres/Auth istemez.
 */
export async function runPazaryeriDualCashJourney(): Promise<PazaryeriDualCashJourneyResult> {
  const ports = world();
  const now = new Date("2026-08-15T20:00:00.000Z");

  const digitalProduct = await ports.pazaryeri.insertProduct(
    memoryDigitalProduct({
      id: "e2e-digital-1",
      userId: E2E_PAZARYERI_SELLER_ID,
      slug: "e2e-rail-sablon",
    }),
  );
  const digitalLock = await lockMarketplaceProductPrice(ports, {
    productId: digitalProduct.id,
    userId: E2E_PAZARYERI_BUYER_ID,
    now,
  });
  const digitalFirst = await purchaseMarketplaceProduct(ports, {
    productId: digitalProduct.id,
    userId: E2E_PAZARYERI_BUYER_ID,
    lockId: digitalLock.lock.id,
    platformUserId: E2E_PAZARYERI_PLATFORM_ID,
    now,
  });
  const digitalReplay = await purchaseMarketplaceProduct(ports, {
    productId: digitalProduct.id,
    userId: E2E_PAZARYERI_BUYER_ID,
    platformUserId: E2E_PAZARYERI_PLATFORM_ID,
    now,
  });

  const serviceProduct = await ports.pazaryeri.insertProduct(
    memoryServiceProduct({
      id: "e2e-service-1",
      userId: E2E_PAZARYERI_SELLER_ID,
      slug: "e2e-kod-inceleme",
    }),
  );
  const serviceLock = await lockMarketplaceProductPrice(ports, {
    productId: serviceProduct.id,
    userId: E2E_PAZARYERI_BUYER_ID,
    now,
  });
  const servicePurchased = await purchaseMarketplaceProduct(ports, {
    productId: serviceProduct.id,
    userId: E2E_PAZARYERI_BUYER_ID,
    lockId: serviceLock.lock.id,
    platformUserId: E2E_PAZARYERI_PLATFORM_ID,
    now,
  });
  const holdAfterPurchase = servicePurchased.order.escrowHoldId
    ? await ports.escrow.findById(servicePurchased.order.escrowHoldId)
    : null;
  const serviceConfirmed = await confirmMarketplaceDelivery(ports, {
    orderId: servicePurchased.order.id,
    actorUserId: E2E_PAZARYERI_BUYER_ID,
    platformUserId: E2E_PAZARYERI_PLATFORM_ID,
  });
  const holdAfterConfirm = serviceConfirmed.order.escrowHoldId
    ? await ports.escrow.findById(serviceConfirmed.order.escrowHoldId)
    : null;

  return {
    ledger: ports.ledger,
    digital: {
      order: digitalFirst.order,
      firstApplied: digitalFirst.applied,
      replayApplied: digitalReplay.applied,
    },
    service: {
      orderAfterPurchase: servicePurchased.order,
      orderAfterConfirm: serviceConfirmed.order,
      holdAfterPurchase,
      holdAfterConfirm,
    },
    buyerBalanceAfter: ports.ledger.snapshot(E2E_PAZARYERI_BUYER_ID).amountMinor,
    sellerBalanceAfter: ports.ledger.snapshot(E2E_PAZARYERI_SELLER_ID).amountMinor,
    platformBalanceAfter: ports.ledger.snapshot(E2E_PAZARYERI_PLATFORM_ID).amountMinor,
  };
}
