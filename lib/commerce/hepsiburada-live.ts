import "server-only";

import { createPrismaCommerceRepository } from "@/lib/commerce/prisma-repository";
import { createPrismaMarketplaceRepository } from "@/lib/commerce/marketplace-prisma";
import { recordFulfillmentQuiet } from "@/lib/commerce/fulfillment-service";
import type { HepsiburadaPorts } from "@/lib/commerce/hepsiburada-sync";
import { liveCommerceOutgoingLicense } from "@/lib/commerce/trendyol-live";

export function liveHepsiburadaPorts(): HepsiburadaPorts {
  return {
    commerce: createPrismaCommerceRepository(),
    marketplace: createPrismaMarketplaceRepository(),
    env: process.env,
    now: () => new Date(),
    license: liveCommerceOutgoingLicense(),
    recordFulfillment: recordFulfillmentQuiet,
  };
}
