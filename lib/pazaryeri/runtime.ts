import "server-only";

import type { EscrowStore } from "@/lib/kernel/escrow/types";
import { createPrismaEscrowStore } from "@/lib/kernel/escrow/prisma-store";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { createPrismaLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { createPrismaCheckoutPriceLockStore } from "@/lib/kernel/pricing/prisma-lock-store";
import type { CheckoutPriceLockStore } from "@/lib/kernel/pricing/lock-store";
import type { PazaryeriEnginePorts } from "@/lib/pazaryeri/engine";
import type { PazaryeriStore } from "@/lib/pazaryeri/types";
import { createPrismaPazaryeriStore } from "@/lib/pazaryeri/prisma-store";

export function createPrismaPazaryeriPorts(): PazaryeriEnginePorts & {
  ledger: LedgerStore;
  escrow: EscrowStore;
  catalog: PriceCatalogStore;
  locks: CheckoutPriceLockStore;
  pazaryeri: PazaryeriStore;
} {
  return {
    ledger: createPrismaLedgerStore(),
    escrow: createPrismaEscrowStore(),
    catalog: createPrismaPriceCatalogStore(),
    locks: createPrismaCheckoutPriceLockStore(),
    pazaryeri: createPrismaPazaryeriStore(),
  };
}
