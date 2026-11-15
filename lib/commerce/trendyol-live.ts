import "server-only";

import { createPrismaCommerceRepository } from "@/lib/commerce/prisma-repository";
import { createPrismaMarketplaceRepository } from "@/lib/commerce/marketplace-prisma";
import type { MarketplaceHandlerDeps } from "@/lib/commerce/marketplace-handlers";
import type { TrendyolPorts } from "@/lib/commerce/trendyol-sync";
import { requireSession } from "@/lib/kernel/auth/session";

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
  };
}
