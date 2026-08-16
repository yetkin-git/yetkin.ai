import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import type { LlmProviderAdapter } from "@/lib/kernel/ai/types";
import { createMemoryBudgetShieldPort } from "@/lib/kernel/ai/budget-shield";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import {
  approveFreelancerArbitration,
  openFreelancerDispute,
  rebutFreelancerDispute,
} from "@/lib/freelancer/dispute-engine";
import { upsertFreelancerSquad } from "@/lib/freelancer/squad-engine";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";

const CLIENT = "client-1";
const LEAD = "freelancer-lead";
const PARTNER = "freelancer-partner";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function fakeBrain(): LlmProviderAdapter {
  return {
    id: "gemini",
    async complete() {
      return {
        text: JSON.stringify({
          rationale: "Kısmi emek; netin %30'u işverene.",
          employerRefundBps: 3000,
          arbitrationReady: true,
        }),
        usage: { promptTokens: 8, completionTokens: 8, totalTokens: 16 },
      };
    },
  };
}

function world() {
  const ledger = createMemoryLedgerStore([
    { userId: CLIENT, amountMinor: 100_000 },
    { userId: LEAD, amountMinor: 0 },
    { userId: PARTNER, amountMinor: 0 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  return withMemoryAcceptAtomic({
    ledger,
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
    llmDeps: { providers: { gemini: fakeBrain() }, budgetPort: createMemoryBudgetShieldPort() },
  });
}

async function fundedContract(ports: ReturnType<typeof world>) {
  const job = await createFreelancerJob(ports, {
    clientId: CLIENT,
    title: "Takım işi",
    brief: "İki kişi, pay bps ile tek defter.",
    budgetMinor: 10_000,
  });
  const bid = await submitFreelancerBid(ports, {
    jobId: job.id,
    bidderId: LEAD,
    amountMinor: 10_000,
    coverNote: "Takım hazır.",
  });
  const { contract } = await acceptFreelancerBid(ports, {
    jobId: job.id,
    bidId: bid.id,
    actorUserId: CLIENT,
    holdBps: HOLD_BPS_DEFAULT,
    platformUserId: PLATFORM,
  });
  return contract;
}

describe("PROJECT_EPHEMERAL squad hakediş", () => {
  it("shareBps 7000/3000 ile release: net üyelerde, hold platformda, takım dağılır", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    const { squad } = await upsertFreelancerSquad(ports, {
      contractId: contract.id,
      actorUserId: LEAD,
      members: [
        { userId: LEAD, shareBps: 7000 },
        { userId: PARTNER, shareBps: 3000 },
      ],
    });
    expect(squad.kind).toBe("PROJECT_EPHEMERAL");
    expect(squad.status).toBe("ACTIVE");

    await releaseFreelancerContract(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });

    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);
    expect(ports.ledger.snapshot(LEAD).amountMinor).toBe(6_300);
    expect(ports.ledger.snapshot(PARTNER).amountMinor).toBe(2_700);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(1_000);
    const after = await ports.freelancer.getSquadByContractId(contract.id);
    expect(after?.status).toBe("DISBANDED");
  });

  it("pay toplamı 10.000 değilse ve işveren üyeyse reddeder", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    await expect(
      upsertFreelancerSquad(ports, {
        contractId: contract.id,
        actorUserId: LEAD,
        members: [
          { userId: LEAD, shareBps: 5000 },
          { userId: PARTNER, shareBps: 4000 },
        ],
      }),
    ).rejects.toThrow(/10000/);
    await expect(
      upsertFreelancerSquad(ports, {
        contractId: contract.id,
        actorUserId: LEAD,
        members: [
          { userId: LEAD, shareBps: 5000 },
          { userId: CLIENT, shareBps: 5000 },
        ],
      }),
    ).rejects.toThrow(/İşveren/);
  });

  it("tahkim split'inde kalan net shareBps ile üyelere dağılır", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    await upsertFreelancerSquad(ports, {
      contractId: contract.id,
      actorUserId: LEAD,
      members: [
        { userId: LEAD, shareBps: 7000 },
        { userId: PARTNER, shareBps: 3000 },
      ],
    });
    const opened = await openFreelancerDispute(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      partyAClaim: "Teslim kısmi; iade oranı bilirkişide.",
    });
    await rebutFreelancerDispute(ports, {
      disputeId: opened.dispute.id,
      actorUserId: LEAD,
      partyBRebuttal: "Takım emeğinin çoğu teslim edildi.",
    });
    await approveFreelancerArbitration(ports, {
      disputeId: opened.dispute.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });
    await approveFreelancerArbitration(ports, {
      disputeId: opened.dispute.id,
      actorUserId: LEAD,
      platformUserId: PLATFORM,
    });

    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(92_700);
    expect(ports.ledger.snapshot(LEAD).amountMinor).toBe(4_410);
    expect(ports.ledger.snapshot(PARTNER).amountMinor).toBe(1_890);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(1_000);
    const squad = await ports.freelancer.getSquadByContractId(contract.id);
    expect(squad?.status).toBe("DISBANDED");
  });
});
