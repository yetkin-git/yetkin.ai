import { randomUUID } from "node:crypto";
import {
  allocateMinorByShareBps,
  createEscrowHold,
  refundEscrowHold,
  releaseEscrowHold,
  releaseEscrowHoldToPayees,
  resolvePlatformTreasuryUserId,
} from "@/lib/kernel/escrow";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import { HOLD_BPS_DEFAULT, resolveHoldBps } from "@/lib/kernel/pricing/hold-bps";
import {
  canAcceptBid,
  canRefundContract,
  canReleaseContract,
  freelancerJobEscrowReferenceKey,
  resolveFreelancerEscrowReferenceKey,
} from "@/lib/freelancer/fsm";
import {
  FREELANCER_JOB_MAX_MINOR,
  FREELANCER_JOB_MIN_MINOR,
} from "@/lib/freelancer/schemas";
import { disbandFreelancerSquad, loadActiveSquadMembers } from "@/lib/freelancer/squad-engine";
import type {
  FreelancerAcceptResult,
  FreelancerAcceptWritePorts,
  FreelancerBidRecord,
  FreelancerContractRecord,
  FreelancerEnginePorts,
  FreelancerJobRecord,
} from "@/lib/freelancer/types";

export type { FreelancerAcceptResult, FreelancerEnginePorts } from "@/lib/freelancer/types";

/** Unique ihlali transaction'ı kapatır; aynı callback içinde devam edilmez — dışarıda yeniden girilir. */
const UNIQUE_RETRY_LIMIT = 3;

export function isFreelancerUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

async function withUniqueRetry<T>(work: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < UNIQUE_RETRY_LIMIT; attempt += 1) {
    try {
      return await work();
    } catch (error) {
      lastError = error;
      if (!isFreelancerUniqueViolation(error)) {
        throw error;
      }
    }
  }
  throw lastError;
}

async function resolveHoldReferenceKey(
  escrow: FreelancerEnginePorts["escrow"],
  contract: Pick<FreelancerContractRecord, "id" | "jobId">,
): Promise<string> {
  return resolveFreelancerEscrowReferenceKey((key) => escrow.findByReferenceKey(key), {
    jobId: contract.jobId,
    contractId: contract.id,
  });
}

export type CreateJobCommand = {
  clientId: string;
  title: string;
  brief: string;
  budgetMinor: number;
  currencyCode?: CurrencyCode;
  now?: Date;
};

export type SubmitBidCommand = {
  jobId: string;
  bidderId: string;
  amountMinor: number;
  coverNote: string;
  now?: Date;
};

export type AcceptBidCommand = {
  jobId: string;
  bidId: string;
  actorUserId: string;
  holdBps?: number;
  platformUserId?: string;
  now?: Date;
};

export type ContractActorCommand = {
  contractId: string;
  actorUserId: string;
  platformUserId?: string;
  now?: Date;
};

function assertBudgetBand(amountMinor: number): void {
  toPositiveAmountMinor(amountMinor);
  if (amountMinor < FREELANCER_JOB_MIN_MINOR || amountMinor > FREELANCER_JOB_MAX_MINOR) {
    throw new Error(
      `İş tutarı ₺10–₺20.000 aralığında olmalıdır.`,
    );
  }
}

export async function createFreelancerJob(
  ports: FreelancerEnginePorts,
  command: CreateJobCommand,
): Promise<FreelancerJobRecord> {
  assertBudgetBand(command.budgetMinor);
  const now = command.now ?? new Date();
  return ports.freelancer.insertJob({
    id: randomUUID(),
    clientId: command.clientId,
    title: command.title.trim(),
    brief: command.brief.trim(),
    budgetMinor: toPositiveAmountMinor(command.budgetMinor),
    currencyCode: command.currencyCode ?? SETTLEMENT_CURRENCY,
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
  });
}

export async function submitFreelancerBid(
  ports: FreelancerEnginePorts,
  command: SubmitBidCommand,
): Promise<FreelancerBidRecord> {
  const job = await ports.freelancer.getJob(command.jobId);
  if (!job) {
    throw new Error("İlan bulunamadı.");
  }
  if (job.status !== "OPEN") {
    throw new Error("İlan teklife kapalı.");
  }
  if (command.bidderId === job.clientId) {
    throw new Error("İlan sahibi kendi işine teklif veremez.");
  }
  assertBudgetBand(command.amountMinor);
  if (command.amountMinor > job.budgetMinor) {
    throw new Error("Teklif bütçe tavanını aşamaz.");
  }
  if (job.currencyCode !== SETTLEMENT_CURRENCY) {
    throw new Error("Gün 0 settlement yalnızca TRY.");
  }

  const duplicate = await ports.freelancer.getBidByJobAndBidder(job.id, command.bidderId);
  if (duplicate) {
    throw new Error("Bu ilana zaten teklif var.");
  }

  const now = command.now ?? new Date();
  return ports.freelancer.insertBid({
    id: randomUUID(),
    jobId: job.id,
    bidderId: command.bidderId,
    amountMinor: toPositiveAmountMinor(command.amountMinor),
    currencyCode: job.currencyCode,
    coverNote: command.coverNote.trim(),
    status: "SUBMITTED",
    createdAt: now,
    updatedAt: now,
  });
}

async function sealAcceptInTx(
  tx: FreelancerAcceptWritePorts,
  input: {
    job: FreelancerJobRecord;
    bid: FreelancerBidRecord;
    now: Date;
    holdBps: number;
  },
): Promise<FreelancerAcceptResult> {
  const existing = await tx.freelancer.getContractByJobId(input.job.id);
  if (existing) {
    return { applied: false, healed: false, contract: existing };
  }

  const claimed = await tx.freelancer.claimJobForAward(input.job.id, input.now);
  if (!claimed) {
    const winner = await tx.freelancer.getContractByJobId(input.job.id);
    if (winner) {
      return { applied: false, healed: false, contract: winner };
    }
    throw new Error("İlan teklif kabulüne kapalı.");
  }

  const bid = await tx.freelancer.getBid(input.bid.id);
  if (!bid || bid.jobId !== input.job.id) {
    throw new Error("Teklif bulunamadı.");
  }
  if (bid.status !== "SUBMITTED") {
    throw new Error("Teklif kabul edilebilir durumda değil.");
  }

  const { hold, applied: holdApplied } = await createEscrowHold(
    { ledger: tx.ledger, escrow: tx.escrow },
    {
      userId: input.job.clientId,
      referenceKey: freelancerJobEscrowReferenceKey(input.job.id),
      grossMinor: bid.amountMinor,
      holdBps: input.holdBps,
      currencyCode: bid.currencyCode,
      now: input.now,
    },
  );

  if (hold.status !== "PENDING") {
    throw new Error("Emanet kilidi teklif kabulüne uygun değil.");
  }
  if (hold.userId !== input.job.clientId) {
    throw new Error("Emanet kilidi ilan sahibi cüzdanına ait değil.");
  }
  if (hold.grossMinor !== bid.amountMinor) {
    throw new Error("Emanet tutarı teklif ile uyuşmuyor.");
  }

  const contract = await tx.freelancer.insertContract({
    id: randomUUID(),
    jobId: input.job.id,
    bidId: bid.id,
    clientId: input.job.clientId,
    freelancerId: bid.bidderId,
    escrowHoldId: hold.id,
    status: "FUNDED",
    currencyCode: hold.currencyCode,
    grossMinor: hold.grossMinor,
    holdMinor: hold.holdMinor,
    netMinor: hold.netMinor,
    holdBps: hold.holdBps,
    fundedAt: input.now,
    releasedAt: null,
    refundedAt: null,
    createdAt: input.now,
    updatedAt: input.now,
  });

  await tx.freelancer.updateBid(bid.id, { status: "ACCEPTED", updatedAt: input.now });
  await tx.freelancer.rejectOtherBids(input.job.id, bid.id, input.now);

  return {
    applied: holdApplied,
    healed: !holdApplied,
    contract,
  };
}

export async function acceptFreelancerBid(
  ports: FreelancerEnginePorts,
  command: AcceptBidCommand,
): Promise<FreelancerAcceptResult> {
  const existing = await ports.freelancer.getContractByJobId(command.jobId);
  if (existing) {
    return { applied: false, healed: false, contract: existing };
  }

  const job = await ports.freelancer.getJob(command.jobId);
  if (!job) {
    throw new Error("İlan bulunamadı.");
  }
  if (!canAcceptBid(job.status)) {
    const raced = await ports.freelancer.getContractByJobId(command.jobId);
    if (raced) {
      return { applied: false, healed: false, contract: raced };
    }
    throw new Error("İlan teklif kabulüne kapalı.");
  }
  if (command.actorUserId !== job.clientId) {
    throw new Error("Yalnız ilan sahibi teklif kabul edebilir.");
  }

  const bid = await ports.freelancer.getBid(command.bidId);
  if (!bid || bid.jobId !== job.id) {
    throw new Error("Teklif bulunamadı.");
  }
  if (bid.status !== "SUBMITTED") {
    const raced = await ports.freelancer.getContractByJobId(command.jobId);
    if (raced) {
      return { applied: false, healed: false, contract: raced };
    }
    throw new Error("Teklif kabul edilebilir durumda değil.");
  }

  const now = command.now ?? new Date();
  const holdBps = resolveHoldBps(command.holdBps ?? HOLD_BPS_DEFAULT);

  return withUniqueRetry(() =>
    ports.runAcceptAtomic((tx) =>
      sealAcceptInTx(tx, {
        job,
        bid,
        now,
        holdBps,
      }),
    ),
  );
}

export async function releaseFreelancerContract(
  ports: FreelancerEnginePorts,
  command: ContractActorCommand,
): Promise<FreelancerContractRecord> {
  const contract = await ports.freelancer.getContract(command.contractId);
  if (!contract) {
    throw new Error("Sözleşme bulunamadı.");
  }
  if (command.actorUserId !== contract.clientId) {
    throw new Error("Yalnız müşteri emaneti serbest bırakabilir.");
  }
  if (!canReleaseContract(contract.status)) {
    if (contract.status === "RELEASED") {
      return contract;
    }
    throw new Error("Sözleşme serbest bırakılamaz.");
  }

  const now = command.now ?? new Date();
  const squadMembers = await loadActiveSquadMembers(ports, contract.id);
  if (squadMembers) {
    const payees = allocateMinorByShareBps(contract.netMinor, squadMembers);
    await releaseEscrowHoldToPayees(
      { ledger: ports.ledger, escrow: ports.escrow },
      {
        referenceKey: await resolveHoldReferenceKey(ports.escrow, contract),
        payees,
        platformUserId: command.platformUserId ?? resolvePlatformTreasuryUserId(),
        now,
      },
    );
    await disbandFreelancerSquad(ports, contract.id, now);
  } else {
    await releaseEscrowHold(
      { ledger: ports.ledger, escrow: ports.escrow },
      {
        referenceKey: await resolveHoldReferenceKey(ports.escrow, contract),
        payeeUserId: contract.freelancerId,
        platformUserId: command.platformUserId ?? resolvePlatformTreasuryUserId(),
        now,
      },
    );
  }

  return ports.freelancer.updateContract(contract.id, {
    status: "RELEASED",
    releasedAt: now,
    updatedAt: now,
  });
}

export async function refundFreelancerContract(
  ports: FreelancerEnginePorts,
  command: ContractActorCommand,
): Promise<FreelancerContractRecord> {
  const contract = await ports.freelancer.getContract(command.contractId);
  if (!contract) {
    throw new Error("Sözleşme bulunamadı.");
  }
  const actorOk =
    command.actorUserId === contract.clientId || command.actorUserId === contract.freelancerId;
  if (!actorOk) {
    throw new Error("Yalnız sözleşme tarafları iade isteyebilir.");
  }
  if (!canRefundContract(contract.status)) {
    if (contract.status === "REFUNDED") {
      return contract;
    }
    throw new Error("Sözleşme iade edilemez.");
  }

  const now = command.now ?? new Date();
  await refundEscrowHold(
    { ledger: ports.ledger, escrow: ports.escrow },
    {
      referenceKey: await resolveHoldReferenceKey(ports.escrow, contract),
      now,
    },
  );

  return ports.freelancer.updateContract(contract.id, {
    status: "REFUNDED",
    refundedAt: now,
    updatedAt: now,
  });
}
