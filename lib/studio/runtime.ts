import "server-only";

import { bindStudioStore } from "@/lib/studio/prisma-store";
import type { StudioEnginePorts } from "@/lib/studio/engine";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { bindAiTokenUsageStore } from "@/lib/kernel/ai/prisma-usage-store";
import { getPrisma } from "@/lib/kernel/db";

export function createPrismaStudioPorts(): StudioEnginePorts {
  const prisma = getPrisma();
  return {
    ledger: bindLedgerStore(prisma),
    catalog: createPrismaPriceCatalogStore(),
    usage: bindAiTokenUsageStore(prisma),
    studio: bindStudioStore(prisma),
    async runSettleAtomic(work) {
      return prisma.$transaction((tx) =>
        work({
          ledger: bindLedgerStore(tx),
          usage: bindAiTokenUsageStore(tx),
          studio: bindStudioStore(tx),
        }),
      );
    },
  };
}
