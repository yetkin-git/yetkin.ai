import "server-only";

import type { EscrowStore } from "@/lib/kernel/escrow/types";
import { createPrismaEscrowStore } from "@/lib/kernel/escrow/prisma-store";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { createPrismaLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import type { KurumsalEnginePorts } from "@/lib/kurumsal/engine";
import type { KurumsalStore } from "@/lib/kurumsal/types";
import { createPrismaKurumsalStore } from "@/lib/kurumsal/prisma-store";

export function createPrismaKurumsalPorts(): KurumsalEnginePorts & {
  ledger: LedgerStore;
  escrow: EscrowStore;
  catalog: PriceCatalogStore;
  kurumsal: KurumsalStore;
} {
  return {
    ledger: createPrismaLedgerStore(),
    escrow: createPrismaEscrowStore(),
    catalog: createPrismaPriceCatalogStore(),
    kurumsal: createPrismaKurumsalStore(),
  };
}
