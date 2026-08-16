import "server-only";

import type { EscrowStore } from "@/lib/kernel/escrow/types";
import { bindEscrowStore } from "@/lib/kernel/escrow/prisma-store";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { getPrisma } from "@/lib/kernel/db";
import { createPrismaAiTokenUsageStore } from "@/lib/kernel/ai/prisma-usage-store";
import type { FreelancerEnginePorts } from "@/lib/freelancer/types";
import type { FreelancerStore } from "@/lib/freelancer/types";
import { bindFreelancerStore } from "@/lib/freelancer/prisma-store";

export function createPrismaFreelancerPorts(): FreelancerEnginePorts & {
  ledger: LedgerStore;
  escrow: EscrowStore;
  freelancer: FreelancerStore;
} {
  const prisma = getPrisma();
  return {
    ledger: bindLedgerStore(prisma),
    escrow: bindEscrowStore(prisma),
    freelancer: bindFreelancerStore(prisma),
    usage: createPrismaAiTokenUsageStore(),
    async runAcceptAtomic(work) {
      return prisma.$transaction((tx) =>
        work({
          ledger: bindLedgerStore(tx),
          escrow: bindEscrowStore(tx),
          freelancer: bindFreelancerStore(tx),
        }),
      );
    },
  };
}
