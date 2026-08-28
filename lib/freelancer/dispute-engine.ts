import { randomUUID } from "node:crypto";
import { invokeLlm } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { ForbiddenError, NotFoundError } from "@/lib/kernel/http/errors";
import { isSuperAdminUser } from "@/lib/kernel/auth/super-admin";
import {
  freezeEscrowHoldExpiry,
  releaseEscrowHoldToPayees,
  resolvePlatformTreasuryUserId,
} from "@/lib/kernel/escrow";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  buildArbitrationPayees,
  FREELANCER_ARBITRATION_SYSTEM,
  parseArbitrationReportJson,
} from "@/lib/freelancer/arbitration";
import { counterpartyUserId, resolveFreelancerEscrowReferenceKey } from "@/lib/freelancer/fsm";
import { disbandFreelancerSquad, loadActiveSquadMembers } from "@/lib/freelancer/squad-engine";
import type {
  FreelancerContractRecord,
  FreelancerDisputeRecord,
  FreelancerEnginePorts,
} from "@/lib/freelancer/types";

export type OpenDisputeCommand = {
  contractId: string;
  actorUserId: string;
  partyAClaim: string;
  now?: Date;
};

export type DisputeActorCommand = {
  disputeId?: string;
  contractId?: string;
  actorUserId: string;
  now?: Date;
};

export type RebutDisputeCommand = DisputeActorCommand & {
  partyBRebuttal: string;
};

export type HumanSettleCommand = DisputeActorCommand & {
  employerRefundBps: number;
  asSuperAdmin?: boolean;
  platformUserId?: string;
};

async function requireContractParty(
  ports: FreelancerEnginePorts,
  contractId: string,
  actorUserId: string,
): Promise<FreelancerContractRecord> {
  const contract = await ports.freelancer.getContract(contractId);
  if (!contract) {
    throw new NotFoundError("Sözleşme bulunamadı.");
  }
  if (actorUserId !== contract.clientId && actorUserId !== contract.freelancerId) {
    throw new ForbiddenError("Yalnız sözleşme tarafları işlem yapabilir.");
  }
  return contract;
}

async function requireDispute(
  ports: FreelancerEnginePorts,
  command: DisputeActorCommand,
): Promise<{ contract: FreelancerContractRecord; dispute: FreelancerDisputeRecord }> {
  const contractId = command.contractId;
  const dispute = command.disputeId
    ? await ports.freelancer.getDispute(command.disputeId)
    : contractId
      ? await ports.freelancer.getDisputeByContractId(contractId)
      : null;
  if (!dispute) {
    throw new Error("Anlaşmazlık bulunamadı.");
  }
  const contract = await requireContractParty(ports, dispute.contractId, command.actorUserId);
  return { contract, dispute };
}

export async function openFreelancerDispute(
  ports: FreelancerEnginePorts,
  command: OpenDisputeCommand,
): Promise<{ contract: FreelancerContractRecord; dispute: FreelancerDisputeRecord }> {
  const contract = await requireContractParty(ports, command.contractId, command.actorUserId);
  const existing = await ports.freelancer.getDisputeByContractId(contract.id);
  if (existing) {
    return { contract, dispute: existing };
  }
  if (contract.status !== "FUNDED") {
    throw new Error("Anlaşmazlık yalnızca fonlanmış sözleşmede açılır.");
  }
  const claim = command.partyAClaim.trim();
  if (claim.length < 8) {
    throw new Error("İddia en az 8 karakter olmalıdır.");
  }

  const now = command.now ?? new Date();
  await freezeEscrowHoldExpiry(ports, {
    referenceKey: await resolveFreelancerEscrowReferenceKey(
      (key) => ports.escrow.findByReferenceKey(key),
      { jobId: contract.jobId, contractId: contract.id },
    ),
  });
  const updated = await ports.freelancer.updateContract(contract.id, {
    status: "DISPUTED",
    updatedAt: now,
  });
  const dispute = await ports.freelancer.insertDispute({
    id: randomUUID(),
    contractId: contract.id,
    initiatorUserId: command.actorUserId,
    clientId: contract.clientId,
    freelancerId: contract.freelancerId,
    partyAClaim: claim,
    partyBRebuttal: null,
    roundStatus: "ROUND_ONE_SUBMITTED",
    employerRefundBps: null,
    rationale: null,
    arbitrationReady: false,
    reportJson: null,
    clientApprovedAt: null,
    freelancerApprovedAt: null,
    rejectedByUserId: null,
    settledAt: null,
    createdAt: now,
    updatedAt: now,
  });
  return { contract: updated, dispute };
}

export async function rebutFreelancerDispute(
  ports: FreelancerEnginePorts,
  command: RebutDisputeCommand,
): Promise<{ contract: FreelancerContractRecord; dispute: FreelancerDisputeRecord }> {
  const { contract, dispute } = await requireDispute(ports, command);
  if (dispute.roundStatus === "AI_REPORT_READY" || dispute.roundStatus === "SETTLED") {
    return { contract, dispute };
  }
  if (dispute.roundStatus !== "ROUND_ONE_SUBMITTED") {
    throw new Error("Karşı cevap bu turda alınamaz.");
  }
  if (command.actorUserId === dispute.initiatorUserId) {
    throw new Error("Karşı cevabı yalnızca diğer taraf yazar.");
  }
  counterpartyUserId({
    actorUserId: command.actorUserId,
    clientId: contract.clientId,
    freelancerId: contract.freelancerId,
  });
  const rebuttal = command.partyBRebuttal.trim();
  if (rebuttal.length < 8) {
    throw new Error("Karşı cevap en az 8 karakter olmalıdır.");
  }
  const now = command.now ?? new Date();
  const submitted = await ports.freelancer.updateDispute(dispute.id, {
    partyBRebuttal: rebuttal,
    roundStatus: "ROUND_TWO_SUBMITTED",
    updatedAt: now,
  });
  return adjudicateFreelancerDispute(ports, {
    disputeId: submitted.id,
    actorUserId: command.actorUserId,
    now,
  });
}

export async function adjudicateFreelancerDispute(
  ports: FreelancerEnginePorts,
  command: DisputeActorCommand,
): Promise<{ contract: FreelancerContractRecord; dispute: FreelancerDisputeRecord }> {
  const { contract, dispute } = await requireDispute(ports, command);
  if (dispute.roundStatus === "AI_REPORT_READY" || dispute.roundStatus === "SETTLED") {
    return { contract, dispute };
  }
  if (dispute.roundStatus === "HUMAN_REVIEW") {
    return { contract, dispute };
  }
  if (!dispute.partyAClaim || !dispute.partyBRebuttal) {
    throw new Error("İki tur tamamlanmadan bilirkişi çalışmaz.");
  }

  const now = command.now ?? new Date();
  const invoke = ports.invokeLlm ?? invokeLlm;
  const llm = await invoke(
    {
      role: "EXECUTIVE_BRAIN",
      system: FREELANCER_ARBITRATION_SYSTEM,
      user: JSON.stringify({
        contractTitle: contract.id,
        partyAClaim: dispute.partyAClaim,
        partyBRebuttal: dispute.partyBRebuttal,
        netMinor: contract.netMinor,
        holdMinor: contract.holdMinor,
        currencyCode: contract.currencyCode,
      }),
      responseJson: true,
      rateLimit: { identifier: dispute.initiatorUserId, scope: "freelancer-arbitration" },
      billing: {
        userId: dispute.initiatorUserId,
        source: AI_TOKEN_SOURCES.FREELANCER,
        recordUsage: false,
      },
    },
    ports.llmDeps,
  );

  if (!llm) {
    return {
      contract,
      dispute: await ports.freelancer.updateDispute(dispute.id, {
        roundStatus: "HUMAN_REVIEW",
        arbitrationReady: false,
        updatedAt: now,
      }),
    };
  }

  if (ports.usage) {
    await ports.usage.insert({
      id: randomUUID(),
      userId: dispute.initiatorUserId,
      source: AI_TOKEN_SOURCES.FREELANCER,
      provider: llm.provider,
      model: llm.model,
      roleKey: "EXECUTIVE_BRAIN",
      promptTokens: llm.usage.promptTokens,
      completionTokens: llm.usage.completionTokens,
      totalTokens: llm.usage.totalTokens,
      costMinor: toAmountMinor(0),
      currencyCode: SETTLEMENT_CURRENCY,
      idempotencyKey: `freelancer-arbitration:${dispute.id}`,
      createdAt: now,
    });
  }

  const report = parseArbitrationReportJson(llm.text);
  if (!report || !report.arbitrationReady) {
    return {
      contract,
      dispute: await ports.freelancer.updateDispute(dispute.id, {
        roundStatus: "HUMAN_REVIEW",
        rationale: report?.rationale ?? null,
        employerRefundBps: report?.employerRefundBps ?? null,
        arbitrationReady: false,
        reportJson: llm.text,
        updatedAt: now,
      }),
    };
  }

  return {
    contract,
    dispute: await ports.freelancer.updateDispute(dispute.id, {
      roundStatus: "AI_REPORT_READY",
      rationale: report.rationale,
      employerRefundBps: report.employerRefundBps,
      arbitrationReady: true,
      reportJson: llm.text,
      updatedAt: now,
    }),
  };
}

async function settleDisputeSplit(
  ports: FreelancerEnginePorts,
  input: {
    contract: FreelancerContractRecord;
    dispute: FreelancerDisputeRecord;
    employerRefundBps: number;
    now: Date;
    platformUserId?: string;
  },
): Promise<{ contract: FreelancerContractRecord; dispute: FreelancerDisputeRecord }> {
  if (input.dispute.roundStatus === "SETTLED" || input.contract.status === "RELEASED") {
    return { contract: input.contract, dispute: input.dispute };
  }
  const squadMembers = await loadActiveSquadMembers(ports, input.contract.id);
  const { payees, allowPayerCredit } = buildArbitrationPayees({
    clientId: input.contract.clientId,
    freelancerId: input.contract.freelancerId,
    netMinor: input.contract.netMinor,
    employerRefundBps: input.employerRefundBps,
    squadMembers,
  });

  await releaseEscrowHoldToPayees(
    { ledger: ports.ledger, escrow: ports.escrow, marketplace: ports.marketplace },
    {
      referenceKey: await resolveFreelancerEscrowReferenceKey(
        (key) => ports.escrow.findByReferenceKey(key),
        { jobId: input.contract.jobId, contractId: input.contract.id },
      ),
      payees,
      platformUserId: input.platformUserId ?? resolvePlatformTreasuryUserId(),
      now: input.now,
      allowPayerCredit,
    },
  );
  await disbandFreelancerSquad(ports, input.contract.id, input.now);
  const contract = await ports.freelancer.updateContract(input.contract.id, {
    status: "RELEASED",
    releasedAt: input.now,
    updatedAt: input.now,
  });
  const dispute = await ports.freelancer.updateDispute(input.dispute.id, {
    roundStatus: "SETTLED",
    employerRefundBps: input.employerRefundBps,
    settledAt: input.now,
    updatedAt: input.now,
  });
  return { contract, dispute };
}

export async function approveFreelancerArbitration(
  ports: FreelancerEnginePorts,
  command: DisputeActorCommand & { platformUserId?: string },
): Promise<{ contract: FreelancerContractRecord; dispute: FreelancerDisputeRecord }> {
  const { contract, dispute } = await requireDispute(ports, command);
  if (dispute.roundStatus === "SETTLED") {
    return { contract, dispute };
  }
  if (dispute.roundStatus !== "AI_REPORT_READY" || dispute.employerRefundBps == null) {
    throw new Error("Onay yalnız hazır bilirkişi raporunda yapılır.");
  }
  const now = command.now ?? new Date();
  const patch =
    command.actorUserId === contract.clientId
      ? { clientApprovedAt: dispute.clientApprovedAt ?? now, updatedAt: now }
      : { freelancerApprovedAt: dispute.freelancerApprovedAt ?? now, updatedAt: now };
  const next = await ports.freelancer.updateDispute(dispute.id, patch);
  const bothApproved = Boolean(next.clientApprovedAt && next.freelancerApprovedAt);
  if (!bothApproved) {
    return { contract, dispute: next };
  }
  return settleDisputeSplit(ports, {
    contract,
    dispute: next,
    employerRefundBps: next.employerRefundBps ?? dispute.employerRefundBps,
    now,
    platformUserId: command.platformUserId,
  });
}

export async function rejectFreelancerArbitration(
  ports: FreelancerEnginePorts,
  command: DisputeActorCommand,
): Promise<{ contract: FreelancerContractRecord; dispute: FreelancerDisputeRecord }> {
  const { contract, dispute } = await requireDispute(ports, command);
  if (dispute.roundStatus === "HUMAN_REVIEW" || dispute.roundStatus === "SETTLED") {
    return { contract, dispute };
  }
  if (dispute.roundStatus !== "AI_REPORT_READY") {
    throw new Error("Red yalnız hazır bilirkişi raporunda yapılır.");
  }
  const now = command.now ?? new Date();
  return {
    contract,
    dispute: await ports.freelancer.updateDispute(dispute.id, {
      roundStatus: "HUMAN_REVIEW",
      rejectedByUserId: command.actorUserId,
      updatedAt: now,
    }),
  };
}

export async function settleHumanReviewDispute(
  ports: FreelancerEnginePorts,
  command: HumanSettleCommand,
): Promise<{ contract: FreelancerContractRecord; dispute: FreelancerDisputeRecord }> {
  const dispute = command.disputeId
    ? await ports.freelancer.getDispute(command.disputeId)
    : command.contractId
      ? await ports.freelancer.getDisputeByContractId(command.contractId)
      : null;
  if (!dispute) {
    throw new Error("Anlaşmazlık bulunamadı.");
  }
  const contract = await ports.freelancer.getContract(dispute.contractId);
  if (!contract) {
    throw new Error("Sözleşme bulunamadı.");
  }
  const adminOk = command.asSuperAdmin === true || isSuperAdminUser(command.actorUserId);
  if (!adminOk) {
    throw new Error("İnsan incelemesini yalnız Super Admin sonuçlandırır.");
  }
  if (dispute.roundStatus === "SETTLED") {
    return { contract, dispute };
  }
  if (dispute.roundStatus !== "HUMAN_REVIEW") {
    throw new Error("İnsan incelemesi bu durumda açık değil.");
  }
  const now = command.now ?? new Date();
  return settleDisputeSplit(ports, {
    contract,
    dispute,
    employerRefundBps: command.employerRefundBps,
    now,
    platformUserId: command.platformUserId,
  });
}
