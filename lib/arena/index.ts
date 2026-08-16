export const MODULE_ID = "arena" as const;

/** Faz 5B — ihale emaneti → teslim → değerlendirme → ödül dağıtımı. */
export const ARENA_HAPPY_PATH = ["tender-escrow", "submission", "evaluate", "award-payout"] as const;

export type ArenaHappyPathStep = (typeof ARENA_HAPPY_PATH)[number];

export {
  ARENA_MODULE_KEY,
  ARENA_TENDER_FLOOR_UNIT_KEY,
  ARENA_TRANSPORT,
} from "@/lib/arena/types";
export {
  advanceArenaTenderRound,
  advanceDueArenaTenders,
  awardArenaTender,
  openArenaTender,
  refundArenaTender,
  submitArenaProposal,
} from "@/lib/arena/engine";
export {
  ARENA_ESCROW_REFUND_PURPOSE,
  onEscrowRefunded as onArenaEscrowRefunded,
} from "@/lib/arena/escrow-refund";
export {
  awardTenderInputSchema,
  createTenderInputSchema,
  submitProposalInputSchema,
} from "@/lib/arena/schemas";
export {
  arenaTenderReferenceKey,
  canAwardTender,
  canRefundTender,
  canSubmitToTender,
} from "@/lib/arena/fsm";
export type {
  ArenaAwardRecord,
  ArenaPulse,
  ArenaStore,
  ArenaSubmissionRecord,
  ArenaTenderRecord,
} from "@/lib/arena/types";
