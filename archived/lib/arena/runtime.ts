import "server-only";

import type { EscrowStore } from "@/lib/kernel/escrow/types";
import { bindEscrowStore } from "@/lib/kernel/escrow/prisma-store";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { getPrisma } from "@/lib/kernel/db";
import type { ArenaEnginePorts, ArenaMoneyWritePorts } from "@/lib/arena/engine";
import type { ArenaStore } from "@/lib/arena/types";
import { bindArenaStore } from "@/lib/arena/prisma-store";

export function createPrismaArenaPorts(): ArenaEnginePorts & {
  ledger: LedgerStore;
  escrow: EscrowStore;
  catalog: PriceCatalogStore;
  arena: ArenaStore;
} {
  const prisma = getPrisma();
  return {
    ledger: bindLedgerStore(prisma),
    escrow: bindEscrowStore(prisma),
    catalog: createPrismaPriceCatalogStore(),
    arena: bindArenaStore(prisma),
    async runMoneyAtomic<T>(work: (tx: ArenaMoneyWritePorts) => Promise<T>): Promise<T> {
      return prisma.$transaction((tx) =>
        work({
          ledger: bindLedgerStore(tx),
          escrow: bindEscrowStore(tx),
          arena: bindArenaStore(tx),
        }),
      );
    },
  };
}
