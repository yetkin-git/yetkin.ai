import "server-only";

import type { EscrowStore } from "@/lib/kernel/escrow/types";
import { bindEscrowStore } from "@/lib/kernel/escrow/prisma-store";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { getPrisma } from "@/lib/kernel/db";
import { createPrismaAiTokenUsageStore } from "@/lib/kernel/ai/prisma-usage-store";
import { paytrMarketplaceSplitPort } from "@/lib/kernel/payments/marketplace-split";
import type { FreelancerEnginePorts } from "@/lib/freelancer/types";
import type { FreelancerStore } from "@/lib/freelancer/types";
import { bindFreelancerStore } from "@/lib/freelancer/prisma-store";

export function createPrismaFreelancerPorts(): FreelancerEnginePorts & {
  ledger: LedgerStore;
  escrow: EscrowStore;
  freelancer: FreelancerStore;
} {
  return {
    ledger: bindLedgerStore(getPrisma()),
    escrow: bindEscrowStore(getPrisma()),
    marketplace: paytrMarketplaceSplitPort,
    freelancer: bindFreelancerStore({
      get freelancerJob() {
        return getPrisma().freelancerJob;
      },
      get freelancerBid() {
        return getPrisma().freelancerBid;
      },
      get freelancerContract() {
        return getPrisma().freelancerContract;
      },
      get freelancerDispute() {
        return getPrisma().freelancerDispute;
      },
      get freelancerContractMessage() {
        return getPrisma().freelancerContractMessage;
      },
      get freelancerSquad() {
        return getPrisma().freelancerSquad;
      },
      get freelancerSquadMember() {
        return getPrisma().freelancerSquadMember;
      },
      get user() {
        return getPrisma().user;
      },
    }),
    usage: createPrismaAiTokenUsageStore(),
    async runAcceptAtomic(work) {
      const prisma = getPrisma();
      return prisma.$transaction((tx) =>
        work({
          ledger: bindLedgerStore(tx),
          escrow: bindEscrowStore(tx),
          freelancer: bindFreelancerStore(tx),
          marketplace: paytrMarketplaceSplitPort,
        }),
      );
    },
    async runReleaseAtomic(work) {
      const prisma = getPrisma();
      return prisma.$transaction((tx) =>
        work({
          ledger: bindLedgerStore(tx),
          escrow: bindEscrowStore(tx),
          freelancer: bindFreelancerStore(tx),
          marketplace: paytrMarketplaceSplitPort,
        }),
      );
    },
  };
}
