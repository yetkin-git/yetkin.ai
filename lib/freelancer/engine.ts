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
import { emitCitizenNotice } from "@/lib/kernel/notice/emit";
import { HOLD_BPS_DEFAULT, resolveHoldBps } from "@/lib/kernel/pricing/hold-bps";
import type { AcademyPathwayId } from "@/lib/kernel/catalog-ids";
import { lockFreelancerJobVisaPathway } from "@/lib/freelancer/job-visa-lock";
import { ConflictError, ForbiddenError, NotFoundError, ServiceUnavailableError } from "@/lib/kernel/http/errors";
import {
  RAIL_V1_ACCEPT_FORBIDDEN,
  RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE,
  RAIL_V1_OWNER_BIDS_FORBIDDEN,
  RAIL_V1_OWNER_BIDS_NOT_FOUND,
  RAIL_V1_RELEASE_FORBIDDEN,
  RAIL_V1_RELEASE_NOT_FUNDED,
  type ClientJobBidsView,
} from "@/lib/kernel/http/v1-contract";
import { paytrMarketplaceSplitPort } from "@/lib/kernel/payments/marketplace-split";
import { toOwnerBidsWire } from "@/lib/freelancer/contract-view";
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

function isEscrowSettleConflict(error: unknown): boolean {
  return (
    error instanceof Error &&
    (/iken serbest bırakılamaz/.test(error.message) ||
      /iken iade edilemez/.test(error.message) ||
      /PENDING değilken/.test(error.message))
  );
}

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
  visaPathwayId?: AcademyPathwayId | null;
  currencyCode?: CurrencyCode;
  now?: Date;
};

export type CreateDirectOfferCommand = {
  clientId: string;
  inviteeId: string;
  title: string;
  brief: string;
  budgetMinor: number;
  visaPathwayId?: AcademyPathwayId | null;
  dueDays: number;
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

export type AcceptDirectOfferCommand = {
  jobId: string;
  actorUserId: string;
  holdBps?: number;
  now?: Date;
};

export type DeclineDirectOfferCommand = {
  jobId: string;
  actorUserId: string;
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
    const minMajor = FREELANCER_JOB_MIN_MINOR / 100;
    const maxMajor = FREELANCER_JOB_MAX_MINOR / 100;
    throw new Error(
      `İş tutarı ₺${minMajor.toLocaleString("tr-TR")}–₺${maxMajor.toLocaleString("tr-TR")} aralığında olmalıdır.`,
    );
  }
}

function assertDueDays(dueDays: number): void {
  if (!Number.isInteger(dueDays) || dueDays < 1 || dueDays > 90) {
    throw new Error("Teslim süresi 1–90 gün arasında olmalıdır.");
  }
}

export async function createFreelancerJob(
  ports: FreelancerEnginePorts,
  command: CreateJobCommand,
): Promise<FreelancerJobRecord> {
  assertBudgetBand(command.budgetMinor);
  const now = command.now ?? new Date();
  const title = command.title.trim();
  const brief = command.brief.trim();
  const visaPathwayId = lockFreelancerJobVisaPathway(command.visaPathwayId);
  return ports.freelancer.insertJob({
    id: randomUUID(),
    clientId: command.clientId,
    title,
    brief,
    budgetMinor: toPositiveAmountMinor(command.budgetMinor),
    currencyCode: command.currencyCode ?? SETTLEMENT_CURRENCY,
    visaPathwayId,
    visibility: "PUBLIC",
    inviteeId: null,
    dueDays: null,
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
  });
}

export async function createDirectFreelancerOffer(
  ports: FreelancerEnginePorts,
  command: CreateDirectOfferCommand,
): Promise<FreelancerJobRecord> {
  assertBudgetBand(command.budgetMinor);
  assertDueDays(command.dueDays);
  if (command.inviteeId === command.clientId) {
    throw new Error("Kendine doğrudan iş teklifi gönderilemez.");
  }
  const now = command.now ?? new Date();
  const title = command.title.trim();
  const brief = command.brief.trim();
  const visaPathwayId = lockFreelancerJobVisaPathway(command.visaPathwayId);
  return ports.freelancer.insertJob({
    id: randomUUID(),
    clientId: command.clientId,
    title,
    brief,
    budgetMinor: toPositiveAmountMinor(command.budgetMinor),
    currencyCode: command.currencyCode ?? SETTLEMENT_CURRENCY,
    visaPathwayId,
    visibility: "DIRECT",
    inviteeId: command.inviteeId,
    dueDays: command.dueDays,
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
  });
}

export async function listOwnerJobBids(
  ports: Pick<FreelancerEnginePorts, "freelancer">,
  command: { jobId: string; actorUserId: string },
): Promise<ClientJobBidsView> {
  const job = await ports.freelancer.getJob(command.jobId);
  if (!job) {
    throw new NotFoundError(RAIL_V1_OWNER_BIDS_NOT_FOUND);
  }
  if (command.actorUserId !== job.clientId) {
    throw new ForbiddenError(RAIL_V1_OWNER_BIDS_FORBIDDEN);
  }
  if (job.status !== "OPEN") {
    return toOwnerBidsWire([]);
  }
  const submitted = (await ports.freelancer.listBidsForJob(job.id)).filter(
    (bid) => bid.status === "SUBMITTED",
  );
  return toOwnerBidsWire(submitted);
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
  if (job.visibility === "DIRECT" && command.bidderId !== job.inviteeId) {
    throw new ForbiddenError("Bu doğrudan teklife yalnız davetli usta teklif verebilir.");
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
  const bid = await ports.freelancer.insertBid({
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
  emitCitizenNotice({
    kind: "bid_received",
    userId: job.clientId,
    reference: bid.id,
    amountMinor: bid.amountMinor,
    applied: true,
  });
  return bid;
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
    { ledger: tx.ledger, escrow: tx.escrow, marketplace: tx.marketplace },
    {
      userId: input.job.clientId,
      referenceKey: freelancerJobEscrowReferenceKey(input.job.id),
      grossMinor: bid.amountMinor,
      holdBps: input.holdBps,
      currencyCode: bid.currencyCode,
      now: input.now,
      funding: "psp",
    },
  );

  if (hold.status !== "PENDING") {
    throw new Error("Emanet kilidi teklif kabulüne uygun değil.");
  }
  if (hold.userId !== input.job.clientId) {
    throw new Error("Emanet kilidi ilan sahibine ait değil.");
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

async function beginHoldAndSealAccept(
  ports: FreelancerEnginePorts,
  input: {
    job: FreelancerJobRecord;
    bid: FreelancerBidRecord;
    holdBps?: number;
    now: Date;
  },
): Promise<FreelancerAcceptResult> {
  const holdBps = resolveHoldBps(input.holdBps ?? HOLD_BPS_DEFAULT);
  const marketplace = ports.marketplace ?? paytrMarketplaceSplitPort;
  const begun = await marketplace.beginHold({
    buyerUserId: input.job.clientId,
    artisanUserId: input.bid.bidderId,
    referenceKey: freelancerJobEscrowReferenceKey(input.job.id),
    grossMinor: input.bid.amountMinor,
    holdBps,
    currencyCode: input.bid.currencyCode,
  });
  if (!begun.ok) {
    throw new ServiceUnavailableError(RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE);
  }

  const result = await withUniqueRetry(() =>
    ports.runAcceptAtomic((tx) =>
      sealAcceptInTx(tx, {
        job: input.job,
        bid: input.bid,
        now: input.now,
        holdBps,
      }),
    ),
  );
  if (result.applied) {
    emitCitizenNotice({
      kind: "bid_accepted",
      userId: result.contract.freelancerId,
      reference: result.contract.id,
      amountMinor: result.contract.grossMinor,
      applied: true,
    });
  }
  return result;
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
    throw new ForbiddenError(RAIL_V1_ACCEPT_FORBIDDEN);
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
  return beginHoldAndSealAccept(ports, {
    job,
    bid,
    holdBps: command.holdBps,
    now,
  });
}

export async function acceptDirectFreelancerOffer(
  ports: FreelancerEnginePorts,
  command: AcceptDirectOfferCommand,
): Promise<FreelancerAcceptResult> {
  const existing = await ports.freelancer.getContractByJobId(command.jobId);
  if (existing) {
    return { applied: false, healed: false, contract: existing };
  }

  const job = await ports.freelancer.getJob(command.jobId);
  if (!job) {
    throw new Error("İlan bulunamadı.");
  }
  if (job.visibility !== "DIRECT") {
    throw new Error("Bu ilan doğrudan teklif değil.");
  }
  if (!canAcceptBid(job.status)) {
    const raced = await ports.freelancer.getContractByJobId(command.jobId);
    if (raced) {
      return { applied: false, healed: false, contract: raced };
    }
    throw new Error("İlan teklif kabulüne kapalı.");
  }
  if (job.inviteeId !== command.actorUserId) {
    throw new ForbiddenError("Yalnız davetli usta bu teklifi kabul edebilir.");
  }

  const now = command.now ?? new Date();
  let bid = await ports.freelancer.getBidByJobAndBidder(job.id, command.actorUserId);
  if (!bid) {
    bid = await ports.freelancer.insertBid({
      id: randomUUID(),
      jobId: job.id,
      bidderId: command.actorUserId,
      amountMinor: toPositiveAmountMinor(job.budgetMinor),
      currencyCode: job.currencyCode,
      coverNote: "Doğrudan teklif kabulü",
      status: "SUBMITTED",
      createdAt: now,
      updatedAt: now,
    });
  } else if (bid.status === "ACCEPTED") {
    const contract = await ports.freelancer.getContractByJobId(job.id);
    if (contract) {
      return { applied: false, healed: false, contract };
    }
    throw new Error("Teklif kabul edilmiş ama sözleşme yok.");
  } else if (bid.status !== "SUBMITTED") {
    throw new Error("Teklif kabul edilebilir durumda değil.");
  }

  return beginHoldAndSealAccept(ports, {
    job,
    bid,
    holdBps: command.holdBps,
    now,
  });
}

/** Davetli usta doğrudan teklifi reddeder; ilan CANCELLED olur, emanet açılmaz. */
export async function declineDirectFreelancerOffer(
  ports: Pick<FreelancerEnginePorts, "freelancer">,
  command: DeclineDirectOfferCommand,
): Promise<FreelancerJobRecord> {
  const job = await ports.freelancer.getJob(command.jobId);
  if (!job) {
    throw new Error("İlan bulunamadı.");
  }
  if (job.visibility !== "DIRECT") {
    throw new Error("Bu ilan doğrudan teklif değil.");
  }
  if (job.inviteeId !== command.actorUserId) {
    throw new ForbiddenError("Yalnız davetli usta bu teklifi reddedebilir.");
  }
  if (job.status === "CANCELLED") {
    return job;
  }
  if (job.status !== "OPEN") {
    throw new Error("İlan teklif reddine kapalı.");
  }
  const existing = await ports.freelancer.getContractByJobId(command.jobId);
  if (existing) {
    throw new ConflictError("Sözleşme kurulmuş teklif reddedilemez.");
  }

  const now = command.now ?? new Date();
  const bid = await ports.freelancer.getBidByJobAndBidder(job.id, command.actorUserId);
  if (bid && bid.status === "SUBMITTED") {
    await ports.freelancer.updateBid(bid.id, { status: "REJECTED", updatedAt: now });
  }

  return ports.freelancer.updateJob(job.id, { status: "CANCELLED", updatedAt: now });
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
    throw new ForbiddenError(RAIL_V1_RELEASE_FORBIDDEN);
  }
  if (!canReleaseContract(contract.status)) {
    throw new ConflictError(RAIL_V1_RELEASE_NOT_FUNDED);
  }

  const now = command.now ?? new Date();
  try {
    return await ports.runReleaseAtomic(async (tx) => {
      const holdKey = await resolveHoldReferenceKey(tx.escrow, contract);
      const hold = await tx.escrow.lockByReferenceKey(holdKey);
      if (!hold || hold.status !== "PENDING") {
        throw new ConflictError(RAIL_V1_RELEASE_NOT_FUNDED);
      }

      const squadMembers = await loadActiveSquadMembers(tx, contract.id);
      if (squadMembers) {
        const payees = allocateMinorByShareBps(contract.netMinor, squadMembers);
        await releaseEscrowHoldToPayees(
          { ledger: tx.ledger, escrow: tx.escrow, marketplace: ports.marketplace },
          {
            referenceKey: holdKey,
            payees,
            platformUserId: command.platformUserId ?? resolvePlatformTreasuryUserId(),
            now,
          },
        );
        await disbandFreelancerSquad(tx, contract.id, now);
      } else {
        await releaseEscrowHold(
          { ledger: tx.ledger, escrow: tx.escrow, marketplace: ports.marketplace },
          {
            referenceKey: holdKey,
            payeeUserId: contract.freelancerId,
            platformUserId: command.platformUserId ?? resolvePlatformTreasuryUserId(),
            now,
          },
        );
      }

      const claimed = await tx.freelancer.claimFundedContract(contract.id, {
        status: "RELEASED",
        releasedAt: now,
        updatedAt: now,
      });
      if (!claimed) {
        throw new ConflictError(RAIL_V1_RELEASE_NOT_FUNDED);
      }
      return claimed;
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof ForbiddenError) {
      throw error;
    }
    if (isEscrowSettleConflict(error)) {
      throw new ConflictError(RAIL_V1_RELEASE_NOT_FUNDED);
    }
    throw error;
  }
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
    throw new ForbiddenError("Yalnız sözleşme tarafları iade isteyebilir.");
  }
  if (!canRefundContract(contract.status)) {
    if (contract.status === "REFUNDED") {
      return contract;
    }
    throw new Error("Sözleşme iade edilemez.");
  }

  const now = command.now ?? new Date();
  try {
    return await ports.runReleaseAtomic(async (tx) => {
      const holdKey = await resolveHoldReferenceKey(tx.escrow, contract);
      const hold = await tx.escrow.lockByReferenceKey(holdKey);
      if (hold?.status === "REFUNDED") {
        const current = await tx.freelancer.getContract(contract.id);
        return current ?? contract;
      }
      if (!hold || hold.status !== "PENDING") {
        throw new Error("Sözleşme iade edilemez.");
      }

      await refundEscrowHold(
        { ledger: tx.ledger, escrow: tx.escrow },
        {
          referenceKey: holdKey,
          now,
        },
      );

      const claimed = await tx.freelancer.claimFundedContract(contract.id, {
        status: "REFUNDED",
        refundedAt: now,
        updatedAt: now,
      });
      if (!claimed) {
        const current = await tx.freelancer.getContract(contract.id);
        if (current?.status === "REFUNDED") {
          return current;
        }
        throw new Error("Sözleşme iade edilemez.");
      }
      return claimed;
    });
  } catch (error) {
    if (isEscrowSettleConflict(error)) {
      throw new Error("Sözleşme iade edilemez.");
    }
    throw error;
  }
}
