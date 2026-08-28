import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

export const ARENA_MODULE_KEY = "arena" as const;
export const ARENA_TENDER_FLOOR_UNIT_KEY = "tender-pool:floor" as const;
export const ARENA_TRANSPORT = "http+inngest" as const;

export const ARENA_SUBMISSION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
export const ARENA_EVALUATION_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

export type ArenaTenderStatus = "OPEN" | "EVALUATING" | "AWARDED" | "REFUNDED";
export type ArenaTenderRound = "SUBMISSION" | "EVALUATION" | "CLOSED";
export type ArenaSubmissionStatus = "SUBMITTED" | "REJECTED" | "AWARDED";

export type ArenaTenderRecord = {
  id: string;
  userId: string;
  companyId: string | null;
  title: string;
  brief: string;
  prizePoolMinor: AmountMinor;
  currencyCode: CurrencyCode;
  escrowHoldId: string;
  status: ArenaTenderStatus;
  round: ArenaTenderRound;
  holdBps: number;
  grossMinor: AmountMinor;
  holdMinor: AmountMinor;
  netMinor: AmountMinor;
  submissionClosesAt: Date;
  evaluationClosesAt: Date;
  awardedAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ArenaSubmissionRecord = {
  id: string;
  tenderId: string;
  userId: string;
  proposal: string;
  status: ArenaSubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type ArenaAwardRecord = {
  id: string;
  tenderId: string;
  submissionId: string;
  userId: string;
  amountMinor: AmountMinor;
  currencyCode: CurrencyCode;
  createdAt: Date;
};

export type ArenaPulse = {
  openTendersSponsored: number;
  submissionsMade: number;
  awardsWon: number;
  pendingPoolMinor: AmountMinor;
  currencyCode: CurrencyCode;
};

export type ArenaWinnerShare = {
  submissionId: string;
  amountMinor: number;
};

export type ArenaStore = {
  insertTender(tender: ArenaTenderRecord): Promise<ArenaTenderRecord>;
  getTender(id: string): Promise<ArenaTenderRecord | null>;
  getTenderByEscrowHoldId(escrowHoldId: string): Promise<ArenaTenderRecord | null>;
  listOpenTenders(): Promise<ArenaTenderRecord[]>;
  listTendersBySponsor(userId: string): Promise<ArenaTenderRecord[]>;
  listTendersDue(now: Date): Promise<ArenaTenderRecord[]>;
  updateTender(
    id: string,
    patch: Partial<
      Pick<
        ArenaTenderRecord,
        "status" | "round" | "awardedAt" | "refundedAt" | "updatedAt"
      >
    >,
  ): Promise<ArenaTenderRecord>;
  insertSubmission(submission: ArenaSubmissionRecord): Promise<ArenaSubmissionRecord>;
  getSubmission(id: string): Promise<ArenaSubmissionRecord | null>;
  getSubmissionByTenderAndUser(tenderId: string, userId: string): Promise<ArenaSubmissionRecord | null>;
  listSubmissionsForTender(tenderId: string): Promise<ArenaSubmissionRecord[]>;
  updateSubmission(
    id: string,
    patch: Partial<Pick<ArenaSubmissionRecord, "status" | "updatedAt">>,
  ): Promise<ArenaSubmissionRecord>;
  rejectOtherSubmissions(tenderId: string, winnerSubmissionIds: string[], now: Date): Promise<void>;
  insertAward(award: ArenaAwardRecord): Promise<ArenaAwardRecord>;
  listAwardsForTender(tenderId: string): Promise<ArenaAwardRecord[]>;
  pulseForUser(userId: string): Promise<ArenaPulse>;
};
