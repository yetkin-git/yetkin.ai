import "server-only";

import type { DevLabsBenchPorts, DevLabsSettleWritePorts } from "@/lib/devlabs/bench";
import type { DevLabsStore } from "@/lib/devlabs/types";
import { bindDevLabsStore } from "@/lib/devlabs/prisma-store";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { bindAiTokenUsageStore } from "@/lib/kernel/ai/prisma-usage-store";
import { bindPaidCommandStore } from "@/lib/kernel/ai/prisma-command-store";
import { getPrisma } from "@/lib/kernel/db";

export function createPrismaDevLabsPorts(): DevLabsBenchPorts & { devlabs: DevLabsStore } {
  const prisma = getPrisma();
  return {
    devlabs: bindDevLabsStore(prisma),
    ledger: bindLedgerStore(prisma),
    catalog: createPrismaPriceCatalogStore(),
    usage: bindAiTokenUsageStore(prisma),
    commands: bindPaidCommandStore(prisma),
    async runMoneyAtomic<T>(work: (tx: DevLabsSettleWritePorts) => Promise<T>): Promise<T> {
      return prisma.$transaction((tx) =>
        work({
          ledger: bindLedgerStore(tx),
          usage: bindAiTokenUsageStore(tx),
          devlabs: bindDevLabsStore(tx),
        }),
      );
    },
  };
}
