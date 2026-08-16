import "server-only";

import type { DevLabsBenchPorts } from "@/lib/devlabs/bench";
import type { DevLabsStore } from "@/lib/devlabs/types";
import { createPrismaDevLabsStore } from "@/lib/devlabs/prisma-store";
import { createPrismaLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { createPrismaAiTokenUsageStore } from "@/lib/kernel/ai/prisma-usage-store";

export function createPrismaDevLabsPorts(): DevLabsBenchPorts & { devlabs: DevLabsStore } {
  return {
    devlabs: createPrismaDevLabsStore(),
    ledger: createPrismaLedgerStore(),
    catalog: createPrismaPriceCatalogStore(),
    usage: createPrismaAiTokenUsageStore(),
  };
}
