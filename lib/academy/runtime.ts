import "server-only";

import type { AcademyEnginePorts } from "@/lib/academy/engine";
import { bindAcademyStore } from "@/lib/academy/prisma-store";
import { getPrisma } from "@/lib/kernel/db";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { bindCheckoutPriceLockStore } from "@/lib/kernel/pricing/prisma-lock-store";

export function createPrismaAcademyPorts(): AcademyEnginePorts {
  const prisma = getPrisma();
  return {
    ledger: bindLedgerStore(prisma),
    catalog: createPrismaPriceCatalogStore(),
    locks: bindCheckoutPriceLockStore(prisma),
    academy: bindAcademyStore(prisma),
    async runPurchaseAtomic(work) {
      return prisma.$transaction((tx) =>
        work({
          ledger: bindLedgerStore(tx),
          locks: bindCheckoutPriceLockStore(tx),
          academy: bindAcademyStore(tx),
        }),
      );
    },
  };
}
