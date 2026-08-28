import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode, SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type {
  ArenaAwardRecord,
  ArenaPulse,
  ArenaStore,
  ArenaSubmissionRecord,
  ArenaTenderRecord,
} from "@/lib/arena/types";

function toTender(row: {
  id: string;
  userId: string;
  companyId: string | null;
  title: string;
  brief: string;
  prizePoolMinor: number;
  currencyCode: string;
  escrowHoldId: string;
  status: ArenaTenderRecord["status"];
  round: ArenaTenderRecord["round"];
  holdBps: number;
  grossMinor: number;
  holdMinor: number;
  netMinor: number;
  submissionClosesAt: Date;
  evaluationClosesAt: Date;
  awardedAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ArenaTenderRecord {
  return {
    ...row,
    prizePoolMinor: toAmountMinor(row.prizePoolMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
    grossMinor: toAmountMinor(row.grossMinor),
    holdMinor: toAmountMinor(row.holdMinor),
    netMinor: toAmountMinor(row.netMinor),
  };
}

function toSubmission(row: {
  id: string;
  tenderId: string;
  userId: string;
  proposal: string;
  status: ArenaSubmissionRecord["status"];
  createdAt: Date;
  updatedAt: Date;
}): ArenaSubmissionRecord {
  return { ...row };
}

function toAward(row: {
  id: string;
  tenderId: string;
  submissionId: string;
  userId: string;
  amountMinor: number;
  currencyCode: string;
  createdAt: Date;
}): ArenaAwardRecord {
  return {
    ...row,
    amountMinor: toAmountMinor(row.amountMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
  };
}

export type ArenaWriteDb = Pick<PrismaClient, "arenaTender" | "arenaSubmission" | "arenaAward">;

export function bindArenaStore(db: ArenaWriteDb): ArenaStore {
  return {
    async insertTender(tender) {
      const row = await db.arenaTender.create({
        data: {
          id: tender.id,
          userId: tender.userId,
          companyId: tender.companyId,
          title: tender.title,
          brief: tender.brief,
          prizePoolMinor: tender.prizePoolMinor,
          currencyCode: tender.currencyCode,
          escrowHoldId: tender.escrowHoldId,
          status: tender.status,
          round: tender.round,
          holdBps: tender.holdBps,
          grossMinor: tender.grossMinor,
          holdMinor: tender.holdMinor,
          netMinor: tender.netMinor,
          submissionClosesAt: tender.submissionClosesAt,
          evaluationClosesAt: tender.evaluationClosesAt,
          awardedAt: tender.awardedAt,
          refundedAt: tender.refundedAt,
          createdAt: tender.createdAt,
          updatedAt: tender.updatedAt,
        },
      });
      return toTender(row);
    },
    async getTender(id) {
      const row = await db.arenaTender.findUnique({ where: { id } });
      return row ? toTender(row) : null;
    },
    async getTenderByEscrowHoldId(escrowHoldId) {
      const row = await db.arenaTender.findUnique({ where: { escrowHoldId } });
      return row ? toTender(row) : null;
    },
    async listOpenTenders() {
      const rows = await db.arenaTender.findMany({
        where: { status: { in: ["OPEN", "EVALUATING"] } },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toTender);
    },
    async listTendersBySponsor(userId) {
      const rows = await db.arenaTender.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toTender);
    },
    async listTendersDue(now) {
      const rows = await db.arenaTender.findMany({
        where: {
          OR: [
            {
              status: "OPEN",
              submissionClosesAt: { lte: now },
            },
            {
              status: { in: ["OPEN", "EVALUATING"] },
              evaluationClosesAt: { lte: now },
            },
          ],
        },
      });
      return rows.map(toTender);
    },
    async updateTender(id, patch) {
      const row = await db.arenaTender.update({ where: { id }, data: patch });
      return toTender(row);
    },
    async insertSubmission(submission) {
      const row = await db.arenaSubmission.create({
        data: {
          id: submission.id,
          tenderId: submission.tenderId,
          userId: submission.userId,
          proposal: submission.proposal,
          status: submission.status,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt,
        },
      });
      return toSubmission(row);
    },
    async getSubmission(id) {
      const row = await db.arenaSubmission.findUnique({ where: { id } });
      return row ? toSubmission(row) : null;
    },
    async getSubmissionByTenderAndUser(tenderId, userId) {
      const row = await db.arenaSubmission.findUnique({
        where: { tenderId_userId: { tenderId, userId } },
      });
      return row ? toSubmission(row) : null;
    },
    async listSubmissionsForTender(tenderId) {
      const rows = await db.arenaSubmission.findMany({
        where: { tenderId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toSubmission);
    },
    async updateSubmission(id, patch) {
      const row = await db.arenaSubmission.update({ where: { id }, data: patch });
      return toSubmission(row);
    },
    async rejectOtherSubmissions(tenderId, winnerSubmissionIds, now) {
      await db.arenaSubmission.updateMany({
        where: {
          tenderId,
          id: { notIn: winnerSubmissionIds },
          status: "SUBMITTED",
        },
        data: { status: "REJECTED", updatedAt: now },
      });
    },
    async insertAward(award) {
      const row = await db.arenaAward.create({
        data: {
          id: award.id,
          tenderId: award.tenderId,
          submissionId: award.submissionId,
          userId: award.userId,
          amountMinor: award.amountMinor,
          currencyCode: award.currencyCode,
          createdAt: award.createdAt,
        },
      });
      return toAward(row);
    },
    async listAwardsForTender(tenderId) {
      const rows = await db.arenaAward.findMany({
        where: { tenderId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toAward);
    },
    async pulseForUser(userId) {
      const [openTendersSponsored, submissionsMade, awardsWon, pendingRows] = await Promise.all([
        db.arenaTender.count({
          where: { userId, status: { in: ["OPEN", "EVALUATING"] } },
        }),
        db.arenaSubmission.count({ where: { userId } }),
        db.arenaAward.count({ where: { userId } }),
        db.arenaTender.findMany({
          where: { userId, status: { in: ["OPEN", "EVALUATING"] } },
          select: { prizePoolMinor: true },
        }),
      ]);
      const pendingPoolMinor = pendingRows.reduce((sum, row) => sum + row.prizePoolMinor, 0);
      const pulse: ArenaPulse = {
        openTendersSponsored,
        submissionsMade,
        awardsWon,
        pendingPoolMinor: toAmountMinor(pendingPoolMinor),
        currencyCode: SETTLEMENT_CURRENCY,
      };
      return pulse;
    },
  };
}

export function createPrismaArenaStore(): ArenaStore {
  return bindArenaStore(getPrisma());
}
