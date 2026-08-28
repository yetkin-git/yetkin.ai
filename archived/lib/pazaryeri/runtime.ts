import "server-only";

import type { EscrowStore } from "@/lib/kernel/escrow/types";
import { bindEscrowStore } from "@/lib/kernel/escrow/prisma-store";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { bindCheckoutPriceLockStore } from "@/lib/kernel/pricing/prisma-lock-store";
import type { CheckoutPriceLockStore } from "@/lib/kernel/pricing/lock-store";
import { getPrisma } from "@/lib/kernel/db";
import type { PazaryeriEnginePorts, PazaryeriMoneyWritePorts } from "@/lib/pazaryeri/engine";
import type { PazaryeriStore } from "@/lib/pazaryeri/types";
import { bindPazaryeriStore } from "@/lib/pazaryeri/prisma-store";

export function createPrismaPazaryeriPorts(): PazaryeriEnginePorts & {
  ledger: LedgerStore;
  escrow: EscrowStore;
  catalog: PriceCatalogStore;
  locks: CheckoutPriceLockStore;
  pazaryeri: PazaryeriStore;
} {
  const prisma = getPrisma();
  return {
    ledger: bindLedgerStore(prisma),
    escrow: bindEscrowStore(prisma),
    catalog: createPrismaPriceCatalogStore(),
    locks: bindCheckoutPriceLockStore(prisma),
    pazaryeri: bindPazaryeriStore(prisma),
    async runMoneyAtomic<T>(work: (tx: PazaryeriMoneyWritePorts) => Promise<T>): Promise<T> {
      return prisma.$transaction((tx) =>
        work({
          ledger: bindLedgerStore(tx),
          escrow: bindEscrowStore(tx),
          locks: bindCheckoutPriceLockStore(tx),
          pazaryeri: bindPazaryeriStore(tx),
        }),
      );
    },
  };
}
