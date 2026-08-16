import "server-only";

import type { EscrowStore } from "@/lib/kernel/escrow/types";
import { createPrismaEscrowStore } from "@/lib/kernel/escrow/prisma-store";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { createPrismaLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import type { ArenaEnginePorts } from "@/lib/arena/engine";
import type { ArenaStore } from "@/lib/arena/types";
import { createPrismaArenaStore } from "@/lib/arena/prisma-store";

export function createPrismaArenaPorts(): ArenaEnginePorts & {
  ledger: LedgerStore;
  escrow: EscrowStore;
  catalog: PriceCatalogStore;
  arena: ArenaStore;
} {
  return {
    ledger: createPrismaLedgerStore(),
    escrow: createPrismaEscrowStore(),
    catalog: createPrismaPriceCatalogStore(),
    arena: createPrismaArenaStore(),
  };
}
