export const MODULE_ID = "freelancer" as const;

/** Faz 2 birinci çiçek sözleşmesi — çekirdek yalnızca EscrowHold. */
export const FREELANCER_HAPPY_PATH = ["listing", "escrow", "release"] as const;

/** Faz 8 mutsuz yol — 2 turlu AI bilirkişi (S49–S53). */
export const FREELANCER_UNHAPPY_PATH = [
  "dispute",
  "rebuttal",
  "ai-report",
  "split-or-human-review",
] as const;

export type FreelancerHappyPathStep = (typeof FREELANCER_HAPPY_PATH)[number];
export type FreelancerUnhappyPathStep = (typeof FREELANCER_UNHAPPY_PATH)[number];

export {
  FREELANCER_CATALOG_SEEDS,
  FREELANCER_JOB_SEEDS,
  FREELANCER_SEED_CLIENT_ID,
  FREELANCER_SEED_MODULE_KEY,
} from "@/lib/freelancer/seed";

export {
  acceptFreelancerBid,
  createFreelancerJob,
  isFreelancerUniqueViolation,
  refundFreelancerContract,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
export {
  FREELANCER_ESCROW_REFUND_PURPOSE,
  onEscrowRefunded as onFreelancerEscrowRefunded,
  shouldFreezeEscrowTimeout as shouldFreezeFreelancerEscrowTimeout,
} from "@/lib/freelancer/escrow-refund";
export {
  adjudicateFreelancerDispute,
  approveFreelancerArbitration,
  openFreelancerDispute,
  rebutFreelancerDispute,
  rejectFreelancerArbitration,
  settleHumanReviewDispute,
} from "@/lib/freelancer/dispute-engine";
export {
  listFreelancerContractMessages,
  postFreelancerContractMessage,
} from "@/lib/freelancer/messages";
export { upsertFreelancerSquad } from "@/lib/freelancer/squad-engine";
export {
  canAcceptBid,
  canRefundContract,
  canReleaseContract,
  freelancerContractReferenceKey,
  freelancerJobEscrowReferenceKey,
  isContractTerminal,
  isDisputeOpen,
  resolveFreelancerEscrowReferenceKey,
} from "@/lib/freelancer/fsm";
export {
  FREELANCER_JOB_MAX_MINOR,
  FREELANCER_JOB_MIN_MINOR,
  acceptBidInputSchema,
  createJobInputSchema,
  disputeRequestSchema,
  postContractMessageInputSchema,
  submitBidInputSchema,
  upsertSquadInputSchema,
} from "@/lib/freelancer/schemas";
export type {
  FreelancerAcceptResult,
  FreelancerAcceptWritePorts,
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
