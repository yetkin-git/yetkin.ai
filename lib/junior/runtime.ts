import "server-only";

import { createPrismaLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import type { JuniorEnginePorts } from "@/lib/junior/engine";
import { createPrismaJuniorStore } from "@/lib/junior/prisma-store";

export function createPrismaJuniorPorts(): JuniorEnginePorts {
  return {
    junior: createPrismaJuniorStore(),
    ledger: createPrismaLedgerStore(),
  };
}
