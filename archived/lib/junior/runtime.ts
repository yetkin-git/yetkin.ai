import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import type { JuniorAllowanceWritePorts, JuniorEnginePorts } from "@/lib/junior/engine";
import { bindJuniorStore } from "@/lib/junior/prisma-store";

export function createPrismaJuniorPorts(): JuniorEnginePorts {
  const prisma = getPrisma();
  return {
    junior: bindJuniorStore(prisma),
    ledger: bindLedgerStore(prisma),
    async runMoneyAtomic<T>(work: (tx: JuniorAllowanceWritePorts) => Promise<T>): Promise<T> {
      return prisma.$transaction((tx) =>
        work({
          junior: bindJuniorStore(tx),
          ledger: bindLedgerStore(tx),
        }),
      );
    },
  };
}
