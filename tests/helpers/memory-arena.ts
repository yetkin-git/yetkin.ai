import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type {
  ArenaAwardRecord,
  ArenaPulse,
  ArenaStore,
  ArenaSubmissionRecord,
  ArenaTenderRecord,
} from "@/lib/arena/types";

export function createMemoryArenaStore(): ArenaStore {
  const tenders = new Map<string, ArenaTenderRecord>();
  const submissions = new Map<string, ArenaSubmissionRecord>();
  const awards = new Map<string, ArenaAwardRecord>();

  return {
    async insertTender(tender) {
      tenders.set(tender.id, tender);
      return { ...tender };
    },
    async getTender(id) {
      const row = tenders.get(id);
      return row ? { ...row } : null;
    },
    async getTenderByEscrowHoldId(escrowHoldId) {
      const row = [...tenders.values()].find((item) => item.escrowHoldId === escrowHoldId);
      return row ? { ...row } : null;
    },
    async listOpenTenders() {
      return [...tenders.values()]
        .filter((row) => row.status === "OPEN" || row.status === "EVALUATING")
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async listTendersBySponsor(userId) {
      return [...tenders.values()].filter((row) => row.userId === userId).map((row) => ({ ...row }));
    },
    async listTendersDue(now) {
      return [...tenders.values()]
        .filter((row) => {
          if (row.status === "OPEN" && row.submissionClosesAt.getTime() <= now.getTime()) {
            return true;
          }
          if (
            (row.status === "OPEN" || row.status === "EVALUATING") &&
            row.evaluationClosesAt.getTime() <= now.getTime()
          ) {
            return true;
          }
          return false;
        })
        .map((row) => ({ ...row }));
    },
    async updateTender(id, patch) {
      const row = tenders.get(id);
      if (!row) {
        throw new Error("İhale yok.");
      }
      const next = { ...row, ...patch };
      tenders.set(id, next);
      return { ...next };
    },
    async insertSubmission(submission) {
      submissions.set(submission.id, submission);
      return { ...submission };
    },
    async getSubmission(id) {
      const row = submissions.get(id);
      return row ? { ...row } : null;
    },
    async getSubmissionByTenderAndUser(tenderId, userId) {
      const row = [...submissions.values()].find(
        (item) => item.tenderId === tenderId && item.userId === userId,
      );
      return row ? { ...row } : null;
    },
    async listSubmissionsForTender(tenderId) {
      return [...submissions.values()]
        .filter((row) => row.tenderId === tenderId)
        .map((row) => ({ ...row }));
    },
    async updateSubmission(id, patch) {
      const row = submissions.get(id);
      if (!row) {
        throw new Error("Teslim yok.");
      }
      const next = { ...row, ...patch };
      submissions.set(id, next);
      return { ...next };
    },
    async rejectOtherSubmissions(tenderId, winnerSubmissionIds, now) {
      for (const row of submissions.values()) {
        if (
          row.tenderId === tenderId &&
          !winnerSubmissionIds.includes(row.id) &&
          row.status === "SUBMITTED"
        ) {
          submissions.set(row.id, { ...row, status: "REJECTED", updatedAt: now });
        }
      }
    },
    async insertAward(award) {
      awards.set(award.id, award);
      return { ...award };
    },
    async listAwardsForTender(tenderId) {
      return [...awards.values()].filter((row) => row.tenderId === tenderId).map((row) => ({ ...row }));
    },
    async pulseForUser(userId) {
      const ownTenders = [...tenders.values()].filter((row) => row.userId === userId);
      const pendingPoolMinor = ownTenders
        .filter((row) => row.status === "OPEN" || row.status === "EVALUATING")
        .reduce((sum, row) => sum + row.prizePoolMinor, 0);
      const pulse: ArenaPulse = {
        openTendersSponsored: ownTenders.filter(
          (row) => row.status === "OPEN" || row.status === "EVALUATING",
        ).length,
        submissionsMade: [...submissions.values()].filter((row) => row.userId === userId).length,
        awardsWon: [...awards.values()].filter((row) => row.userId === userId).length,
        pendingPoolMinor: toAmountMinor(pendingPoolMinor),
        currencyCode: SETTLEMENT_CURRENCY,
      };
      return pulse;
    },
  };
}
