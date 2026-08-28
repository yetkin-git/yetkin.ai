import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import type { LlmProviderAdapter } from "@/lib/kernel/ai/types";
import { createMemoryBudgetShieldPort } from "@/lib/kernel/ai/budget-shield";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  refundFreelancerContract,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import {
  approveFreelancerArbitration,
  openFreelancerDispute,
  rebutFreelancerDispute,
  rejectFreelancerArbitration,
  settleHumanReviewDispute,
} from "@/lib/freelancer/dispute-engine";
import { postFreelancerContractMessage } from "@/lib/freelancer/messages";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";
import { createMemoryAiTokenUsageStore } from "../helpers/memory-ai-usage";

const CLIENT = "client-1";
const FREELANCER = "freelancer-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function fakeBrain(text: string): LlmProviderAdapter & { calls: number } {
  const adapter = {
    id: "gemini" as const,
    calls: 0,
    async complete() {
      adapter.calls += 1;
      return {
        text,
        usage: { promptTokens: 20, completionTokens: 10, totalTokens: 30 },
      };
    },
  };
  return adapter;
}

function world(clientBalance = 100_000, llmText?: string) {
  const adapter = fakeBrain(
    llmText ??
      JSON.stringify({
        rationale: "Kısmi teslim; netin yarısı işverene iade edilmelidir.",
        employerRefundBps: 5000,
        arbitrationReady: true,
      }),
  );
  const ledger = createMemoryLedgerStore([
    { userId: CLIENT, amountMinor: clientBalance },
    { userId: FREELANCER, amountMinor: 0 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  return withMemoryAcceptAtomic({
    adapter,
    ledger,
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
    usage: createMemoryAiTokenUsageStore(),
    llmDeps: { providers: { gemini: adapter }, budgetPort: createMemoryBudgetShieldPort() },
  });
}

async function fundedContract(ports: ReturnType<typeof world>) {
  const job = await createFreelancerJob(ports, {
    clientId: CLIENT,
    title: "Landing",
    brief: "Tek sayfa, mühürlü teslim ve test.",
    budgetMinor: 25_000,
  });
  const bid = await submitFreelancerBid(ports, {
    jobId: job.id,
    bidderId: FREELANCER,
    amountMinor: 25_000,
    coverNote: "Teslim 5 gün.",
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

describe("freelancer 2 turlu AI bilirkişi tahkimi", () => {
  it("tur 1 + tur 2 + invokeLlm JSON + çift onay: net bps ile adil split, hold platformda, TTL donar", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    await postFreelancerContractMessage(ports, {
      contractId: contract.id,
      actorUserId: FREELANCER,
      kind: "DELIVERY",
      body: "Taslak teslim, eksik mobil kırılım.",
      artifactUrl: "https://cdn.yetkin.test/draft.zip",
    });
    await postFreelancerContractMessage(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      kind: "REVISION",
      body: "Mobil kırılım ve erişilebilirlik düzeltmesi istiyorum.",
    });

    const opened = await openFreelancerDispute(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      partyAClaim: "Teslim eksik; mobil kırılım yok, iade talep ediyorum.",
    });
    expect(opened.contract.status).toBe("DISPUTED");
    expect(opened.dispute.roundStatus).toBe("ROUND_ONE_SUBMITTED");
    const frozen = await ports.escrow.findById(contract.escrowHoldId);
    expect(frozen?.status).toBe("PENDING");
    expect(frozen?.expiresAt).toBeNull();

    const rebutted = await rebutFreelancerDispute(ports, {
      disputeId: opened.dispute.id,
      actorUserId: FREELANCER,
      partyBRebuttal: "Masaüstü teslim edildi; mobil kapsam dışı bırakılmıştı.",
    });
    expect(ports.adapter.calls).toBe(1);
    expect(rebutted.dispute.roundStatus).toBe("AI_REPORT_READY");
    expect(rebutted.dispute.employerRefundBps).toBe(5000);
    expect(rebutted.dispute.arbitrationReady).toBe(true);
    expect(ports.usage.list()).toHaveLength(1);
    expect(ports.usage.list()[0]?.source).toBe("freelancer");
    expect(ports.usage.list()[0]?.roleKey).toBe("EXECUTIVE_BRAIN");

    await approveFreelancerArbitration(ports, {
      disputeId: opened.dispute.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });
    await approveFreelancerArbitration(ports, {
      disputeId: opened.dispute.id,
      actorUserId: FREELANCER,
      platformUserId: PLATFORM,
    });
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(0);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
    const settledHold = await ports.escrow.findById(contract.escrowHoldId);
    expect(settledHold?.status).toBe("RELEASED");
  });

  it("rapor reddi HUMAN_REVIEW yapar; hold PENDING ve TTL donuk kalır", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    const opened = await openFreelancerDispute(ports, {
      contractId: contract.id,
      actorUserId: FREELANCER,
      partyAClaim: "Kapsam dışı revizyonlar işi kilitlemiştir.",
    });
    await rebutFreelancerDispute(ports, {
      disputeId: opened.dispute.id,
      actorUserId: CLIENT,
      partyBRebuttal: "Brief'te mobil açıkça vardı; teslim eksik.",
    });
    const rejected = await rejectFreelancerArbitration(ports, {
      disputeId: opened.dispute.id,
      actorUserId: CLIENT,
    });
    expect(rejected.dispute.roundStatus).toBe("HUMAN_REVIEW");
    expect(rejected.contract.status).toBe("DISPUTED");
    const hold = await ports.escrow.findById(contract.escrowHoldId);
    expect(hold?.status).toBe("PENDING");
    expect(hold?.expiresAt).toBeNull();

    await expect(
      releaseFreelancerContract(ports, { contractId: contract.id, actorUserId: CLIENT }),
    ).rejects.toThrow();
    await expect(
      refundFreelancerContract(ports, { contractId: contract.id, actorUserId: CLIENT }),
    ).rejects.toThrow();

    const settled = await settleHumanReviewDispute(ports, {
      disputeId: opened.dispute.id,
      actorUserId: "admin-1",
      asSuperAdmin: true,
      employerRefundBps: 2500,
      platformUserId: PLATFORM,
    });
    expect(settled.contract.status).toBe("RELEASED");
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(0);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
  });

  it("gümrük null veya arbitrationReady=false ise HUMAN_REVIEW; hash tiyatrosu yok", async () => {
    const ports = world(
      100_000,
      JSON.stringify({
        rationale: "Kanıt yetersiz, insan incelemesi gerekir.",
        employerRefundBps: 0,
        arbitrationReady: false,
      }),
    );
    const contract = await fundedContract(ports);
    const opened = await openFreelancerDispute(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      partyAClaim: "Teslim yok; iadenin tamamını istiyorum.",
    });
    const result = await rebutFreelancerDispute(ports, {
      disputeId: opened.dispute.id,
      actorUserId: FREELANCER,
      partyBRebuttal: "İş kuyrukta; henüz teslim günü gelmedi.",
    });
    expect(result.dispute.roundStatus).toBe("HUMAN_REVIEW");
    expect(result.dispute.arbitrationReady).toBe(false);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(0);
  });

  it("yüzde 100 işveren iadesi neti alıcıya CREDIT eder; platform payı split portuna gider", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    const opened = await openFreelancerDispute(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      partyAClaim: "Teslim yok; iadenin tamamını istiyorum.",
    });
    await rebutFreelancerDispute(ports, {
      disputeId: opened.dispute.id,
      actorUserId: FREELANCER,
      partyBRebuttal: "İş kuyrukta; henüz teslim günü gelmedi.",
    });
    await rejectFreelancerArbitration(ports, {
      disputeId: opened.dispute.id,
      actorUserId: CLIENT,
    });
    const settled = await settleHumanReviewDispute(ports, {
      disputeId: opened.dispute.id,
      actorUserId: "admin-1",
      asSuperAdmin: true,
      employerRefundBps: 10_000,
      platformUserId: PLATFORM,
    });
    expect(settled.dispute.roundStatus).toBe("SETTLED");
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(0);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
  });
});
