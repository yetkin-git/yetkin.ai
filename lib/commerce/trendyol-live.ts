import "server-only";

import { createPrismaCommerceRepository } from "@/lib/commerce/prisma-repository";
import { createPrismaMarketplaceRepository } from "@/lib/commerce/marketplace-prisma";
import type { MarketplaceHandlerDeps } from "@/lib/commerce/marketplace-handlers";
import { createPrismaCommerceSubscriptionStore } from "@/lib/commerce/subscription-prisma";
import { commerceLicenseActive } from "@/lib/commerce/subscription";
import type { CommerceOutgoingLicense } from "@/lib/commerce/sync-license";
import { recordFulfillmentQuiet } from "@/lib/commerce/fulfillment-service";
import type { TrendyolPorts } from "@/lib/commerce/trendyol-sync";
import { requireSession } from "@/lib/kernel/auth/session";

export function liveCommerceOutgoingLicense(): CommerceOutgoingLicense {
  const subscriptions = createPrismaCommerceSubscriptionStore();
  return {
    async allowsOutgoing(storeId, now) {
      const row = await subscriptions.findByStoreId(storeId);
      return commerceLicenseActive(row, now);
    },
  };
}

export function liveMarketplaceHandlerDeps(): MarketplaceHandlerDeps {
  return {
    requireSession,
    commerce: createPrismaCommerceRepository,
    marketplace: createPrismaMarketplaceRepository,
    env: process.env,
  };
}

export function liveTrendyolPorts(): TrendyolPorts {
  return {
    commerce: createPrismaCommerceRepository(),
    marketplace: createPrismaMarketplaceRepository(),
    env: process.env,
    now: () => new Date(),
    license: liveCommerceOutgoingLicense(),
    recordFulfillment: recordFulfillmentQuiet,
  };
}
