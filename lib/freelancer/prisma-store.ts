import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import {
  FREELANCER_JOB_DEFAULT_VISA_PATHWAY,
  parseFreelancerJobVisaPathwayId,
} from "@/lib/freelancer/job-visa-lock";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode, SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type {
  FreelancerBidRecord,
  FreelancerContractMessageRecord,
  FreelancerContractRecord,
  FreelancerDisputeRecord,
  FreelancerJobRecord,
  FreelancerPulse,
  FreelancerSquadMemberRecord,
  FreelancerSquadRecord,
  FreelancerStore,
} from "@/lib/freelancer/types";

function toJob(row: {
  id: string;
  clientId: string;
  title: string;
  brief: string;
  budgetMinor: number;
  currencyCode: string;
  visaPathwayId: string;
  visibility?: FreelancerJobRecord["visibility"] | null;
  inviteeId?: string | null;
  dueDays?: number | null;
  status: FreelancerJobRecord["status"];
  createdAt: Date;
  updatedAt: Date;
}): FreelancerJobRecord {
  return {
    id: row.id,
    clientId: row.clientId,
    title: row.title,
    brief: row.brief,
    budgetMinor: toAmountMinor(row.budgetMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
    visaPathwayId:
      parseFreelancerJobVisaPathwayId(row.visaPathwayId) ?? FREELANCER_JOB_DEFAULT_VISA_PATHWAY,
    visibility: row.visibility === "DIRECT" ? "DIRECT" : "PUBLIC",
    inviteeId: row.inviteeId ?? null,
    dueDays: row.dueDays ?? null,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toBid(row: {
  id: string;
  jobId: string;
  bidderId: string;
  amountMinor: number;
  currencyCode: string;
  coverNote: string;
  status: FreelancerBidRecord["status"];
  createdAt: Date;
  updatedAt: Date;
}): FreelancerBidRecord {
  return {
    ...row,
    amountMinor: toAmountMinor(row.amountMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
  };
}

function toContract(row: {
  id: string;
  jobId: string;
  bidId: string;
  clientId: string;
  freelancerId: string;
  escrowHoldId: string;
  status: FreelancerContractRecord["status"];
  currencyCode: string;
  grossMinor: number;
  holdMinor: number;
  netMinor: number;
  holdBps: number;
  fundedAt: Date;
  releasedAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): FreelancerContractRecord {
  return {
    ...row,
    currencyCode: parseCurrencyCode(row.currencyCode),
    grossMinor: toAmountMinor(row.grossMinor),
    holdMinor: toAmountMinor(row.holdMinor),
    netMinor: toAmountMinor(row.netMinor),
  };
}

function toDispute(row: {
  id: string;
  contractId: string;
  initiatorUserId: string;
  clientId: string;
  freelancerId: string;
  partyAClaim: string;
  partyBRebuttal: string | null;
  roundStatus: FreelancerDisputeRecord["roundStatus"];
  employerRefundBps: number | null;
  rationale: string | null;
  arbitrationReady: boolean;
  reportJson: string | null;
  clientApprovedAt: Date | null;
  freelancerApprovedAt: Date | null;
  rejectedByUserId: string | null;
  settledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): FreelancerDisputeRecord {
  return { ...row };
}

function toMessage(row: {
  id: string;
  contractId: string;
  userId: string;
  clientId: string;
  freelancerId: string;
  kind: FreelancerContractMessageRecord["kind"];
  body: string;
  artifactUrl: string | null;
  createdAt: Date;
}): FreelancerContractMessageRecord {
  return { ...row };
}

function toSquad(row: {
  id: string;
  contractId: string;
  userId: string;
  clientId: string;
  kind: FreelancerSquadRecord["kind"];
  status: FreelancerSquadRecord["status"];
  createdAt: Date;
  updatedAt: Date;
}): FreelancerSquadRecord {
  return { ...row };
}

function toSquadMember(row: {
  id: string;
  squadId: string;
  userId: string;
  shareBps: number;
  createdAt: Date;
}): FreelancerSquadMemberRecord {
  return { ...row };
}

export type FreelancerWriteDb = Pick<
  PrismaClient,
  | "freelancerJob"
  | "freelancerBid"
  | "freelancerContract"
  | "freelancerDispute"
  | "freelancerContractMessage"
  | "freelancerSquad"
  | "freelancerSquadMember"
> & {
  user?: Pick<PrismaClient["user"], "findUnique">;
};

export function bindFreelancerStore(db: FreelancerWriteDb): FreelancerStore {
  return {
    async hasUser(userId) {
      if (!db.user) {
        return true;
      }
      const row = await db.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      return row != null;
    },
    async insertJob(job) {
      const row = await db.freelancerJob.create({
        data: {
          id: job.id,
          clientId: job.clientId,
          title: job.title,
          brief: job.brief,
          budgetMinor: job.budgetMinor,
          currencyCode: job.currencyCode,
          visaPathwayId: job.visaPathwayId,
          visibility: job.visibility,
          inviteeId: job.inviteeId,
          dueDays: job.dueDays,
          status: job.status,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        },
      });
      return toJob(row);
    },
    async getJob(id) {
      const row = await db.freelancerJob.findUnique({ where: { id } });
      return row ? toJob(row) : null;
    },
    async listOpenJobs() {
      const rows = await db.freelancerJob.findMany({
        where: { status: "OPEN", visibility: "PUBLIC" },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toJob);
    },
    async listDirectOffersForInvitee(inviteeId) {
      const rows = await db.freelancerJob.findMany({
        where: { inviteeId, status: "OPEN", visibility: "DIRECT" },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toJob);
    },
    async listJobsByClient(clientId) {
      const rows = await db.freelancerJob.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toJob);
    },
    async updateJob(id, patch) {
      const row = await db.freelancerJob.update({ where: { id }, data: patch });
      return toJob(row);
    },
    async claimJobForAward(jobId, now) {
      const result = await db.freelancerJob.updateMany({
        where: { id: jobId, status: "OPEN" },
        data: { status: "AWARDED", updatedAt: now },
      });
      return result.count === 1;
    },
    async claimFundedContract(id, patch) {
      const result = await db.freelancerContract.updateMany({
        where: { id, status: "FUNDED" },
        data: patch,
      });
      if (result.count !== 1) {
        return null;
      }
      const row = await db.freelancerContract.findUnique({ where: { id } });
      return row ? toContract(row) : null;
    },
    async insertBid(bid) {
      const row = await db.freelancerBid.create({
        data: {
          id: bid.id,
          jobId: bid.jobId,
          bidderId: bid.bidderId,
          amountMinor: bid.amountMinor,
          currencyCode: bid.currencyCode,
          coverNote: bid.coverNote,
          status: bid.status,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt,
        },
      });
      return toBid(row);
    },
    async getBid(id) {
      const row = await db.freelancerBid.findUnique({ where: { id } });
      return row ? toBid(row) : null;
    },
    async getBidByJobAndBidder(jobId, bidderId) {
      const row = await db.freelancerBid.findUnique({
        where: { jobId_bidderId: { jobId, bidderId } },
      });
      return row ? toBid(row) : null;
    },
    async listBidsForJob(jobId) {
      const rows = await db.freelancerBid.findMany({
        where: { jobId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toBid);
    },
    async updateBid(id, patch) {
      const row = await db.freelancerBid.update({ where: { id }, data: patch });
      return toBid(row);
    },
    async rejectOtherBids(jobId, acceptedBidId, now) {
      await db.freelancerBid.updateMany({
        where: { jobId, id: { not: acceptedBidId }, status: "SUBMITTED" },
        data: { status: "REJECTED", updatedAt: now },
      });
    },
    async insertContract(contract) {
      const row = await db.freelancerContract.create({
        data: {
          id: contract.id,
          jobId: contract.jobId,
          bidId: contract.bidId,
          clientId: contract.clientId,
          freelancerId: contract.freelancerId,
          escrowHoldId: contract.escrowHoldId,
          status: contract.status,
          currencyCode: contract.currencyCode,
          grossMinor: contract.grossMinor,
          holdMinor: contract.holdMinor,
          netMinor: contract.netMinor,
          holdBps: contract.holdBps,
          fundedAt: contract.fundedAt,
          releasedAt: contract.releasedAt,
          refundedAt: contract.refundedAt,
          createdAt: contract.createdAt,
          updatedAt: contract.updatedAt,
        },
      });
      return toContract(row);
    },
    async getContract(id) {
      const row = await db.freelancerContract.findUnique({ where: { id } });
      return row ? toContract(row) : null;
    },
    async getContractByJobId(jobId) {
      const row = await db.freelancerContract.findUnique({ where: { jobId } });
      return row ? toContract(row) : null;
    },
    async getContractByEscrowHoldId(escrowHoldId) {
      const row = await db.freelancerContract.findUnique({ where: { escrowHoldId } });
      return row ? toContract(row) : null;
    },
    async listContractsForUser(userId) {
      const rows = await db.freelancerContract.findMany({
        where: { OR: [{ clientId: userId }, { freelancerId: userId }] },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toContract);
    },
    async updateContract(id, patch) {
      const row = await db.freelancerContract.update({ where: { id }, data: patch });
      return toContract(row);
    },
    async insertDispute(dispute) {
      const row = await db.freelancerDispute.create({
        data: {
          id: dispute.id,
          contractId: dispute.contractId,
          initiatorUserId: dispute.initiatorUserId,
          clientId: dispute.clientId,
          freelancerId: dispute.freelancerId,
          partyAClaim: dispute.partyAClaim,
          partyBRebuttal: dispute.partyBRebuttal,
          roundStatus: dispute.roundStatus,
          employerRefundBps: dispute.employerRefundBps,
          rationale: dispute.rationale,
          arbitrationReady: dispute.arbitrationReady,
          reportJson: dispute.reportJson,
          clientApprovedAt: dispute.clientApprovedAt,
          freelancerApprovedAt: dispute.freelancerApprovedAt,
          rejectedByUserId: dispute.rejectedByUserId,
          settledAt: dispute.settledAt,
          createdAt: dispute.createdAt,
          updatedAt: dispute.updatedAt,
        },
      });
      return toDispute(row);
    },
    async getDispute(id) {
      const row = await db.freelancerDispute.findUnique({ where: { id } });
      return row ? toDispute(row) : null;
    },
    async getDisputeByContractId(contractId) {
      const row = await db.freelancerDispute.findUnique({ where: { contractId } });
      return row ? toDispute(row) : null;
    },
    async updateDispute(id, patch) {
      const row = await db.freelancerDispute.update({ where: { id }, data: patch });
      return toDispute(row);
    },
    async insertMessage(message) {
      const row = await db.freelancerContractMessage.create({
        data: {
          id: message.id,
          contractId: message.contractId,
          userId: message.userId,
          clientId: message.clientId,
          freelancerId: message.freelancerId,
          kind: message.kind,
          body: message.body,
          artifactUrl: message.artifactUrl,
          createdAt: message.createdAt,
        },
      });
      return toMessage(row);
    },
    async listMessagesForContract(contractId) {
      const rows = await db.freelancerContractMessage.findMany({
        where: { contractId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toMessage);
    },
    async listLatestDeliveryAtByContractIds(contractIds) {
      const ids = [...new Set(contractIds.filter((id) => id.length > 0))];
      if (ids.length === 0) {
        return new Map();
      }
      const rows = await db.freelancerContractMessage.findMany({
        where: { contractId: { in: ids }, kind: "DELIVERY" },
        select: { contractId: true, createdAt: true },
      });
      const latest = new Map<string, Date>();
      for (const row of rows) {
        const prev = latest.get(row.contractId);
        if (!prev || row.createdAt.getTime() > prev.getTime()) {
          latest.set(row.contractId, row.createdAt);
        }
      }
      return latest;
    },
    async insertSquad(squad) {
      const row = await db.freelancerSquad.create({
        data: {
          id: squad.id,
          contractId: squad.contractId,
          userId: squad.userId,
          clientId: squad.clientId,
          kind: squad.kind,
          status: squad.status,
          createdAt: squad.createdAt,
          updatedAt: squad.updatedAt,
        },
      });
      return toSquad(row);
    },
    async getSquad(id) {
      const row = await db.freelancerSquad.findUnique({ where: { id } });
      return row ? toSquad(row) : null;
    },
    async getSquadByContractId(contractId) {
      const row = await db.freelancerSquad.findUnique({ where: { contractId } });
      return row ? toSquad(row) : null;
    },
    async updateSquad(id, patch) {
      const row = await db.freelancerSquad.update({ where: { id }, data: patch });
      return toSquad(row);
    },
    async replaceSquadMembers(squadId, members) {
      await db.freelancerSquadMember.deleteMany({ where: { squadId } });
      if (members.length === 0) {
        return [];
      }
      await db.freelancerSquadMember.createMany({
        data: members.map((member) => ({
          id: member.id,
          squadId: member.squadId,
          userId: member.userId,
          shareBps: member.shareBps,
          createdAt: member.createdAt,
        })),
      });
      const rows = await db.freelancerSquadMember.findMany({
        where: { squadId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toSquadMember);
    },
    async listSquadMembers(squadId) {
      const rows = await db.freelancerSquadMember.findMany({
        where: { squadId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toSquadMember);
    },
    async pulseForUser(userId) {
      const [openJobsPosted, contractRows] = await Promise.all([
        db.freelancerJob.count({ where: { clientId: userId, status: "OPEN" } }),
        db.freelancerContract.findMany({
          where: {
            OR: [
              { clientId: userId, status: "FUNDED" },
              { freelancerId: userId, status: { in: ["FUNDED", "RELEASED"] } },
            ],
          },
          select: { clientId: true, freelancerId: true, status: true, grossMinor: true },
        }),
      ]);
      let fundedAsClient = 0;
      let fundedAsFreelancer = 0;
      let releasedAsFreelancer = 0;
      let pendingEscrowMinor = 0;
      for (const row of contractRows) {
        if (row.clientId === userId && row.status === "FUNDED") {
          fundedAsClient += 1;
          pendingEscrowMinor += row.grossMinor;
        }
        if (row.freelancerId === userId && row.status === "FUNDED") {
          fundedAsFreelancer += 1;
        }
        if (row.freelancerId === userId && row.status === "RELEASED") {
          releasedAsFreelancer += 1;
        }
      }
      const pulse: FreelancerPulse = {
        openJobsPosted,
        fundedAsClient,
        fundedAsFreelancer,
        releasedAsFreelancer,
        pendingEscrowMinor: toAmountMinor(pendingEscrowMinor),
        currencyCode: SETTLEMENT_CURRENCY,
      };
      return pulse;
    },
  };
}

export function createPrismaFreelancerStore(): FreelancerStore {
  return bindFreelancerStore(getPrisma());
}
