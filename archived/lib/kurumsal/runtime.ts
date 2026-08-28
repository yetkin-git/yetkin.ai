import "server-only";

import type { EscrowStore } from "@/lib/kernel/escrow/types";
import { bindEscrowStore } from "@/lib/kernel/escrow/prisma-store";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { getPrisma } from "@/lib/kernel/db";
import type { KurumsalEnginePorts, KurumsalMoneyWritePorts } from "@/lib/kurumsal/engine";
import type { KurumsalStore } from "@/lib/kurumsal/types";
import { bindKurumsalStore } from "@/lib/kurumsal/prisma-store";

export function createPrismaKurumsalPorts(): KurumsalEnginePorts & {
  ledger: LedgerStore;
  escrow: EscrowStore;
  catalog: PriceCatalogStore;
  kurumsal: KurumsalStore;
} {
  const prisma = getPrisma();
  return {
    ledger: bindLedgerStore(prisma),
    escrow: bindEscrowStore(prisma),
    catalog: createPrismaPriceCatalogStore(),
    kurumsal: bindKurumsalStore(prisma),
    async runMoneyAtomic<T>(work: (tx: KurumsalMoneyWritePorts) => Promise<T>): Promise<T> {
      return prisma.$transaction((tx) =>
        work({
          ledger: bindLedgerStore(tx),
          escrow: bindEscrowStore(tx),
          kurumsal: bindKurumsalStore(tx),
        }),
      );
    },
  };
}
