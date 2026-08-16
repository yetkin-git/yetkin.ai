export const MODULE_ID = "kurumsal" as const;

/** Faz 5A — şirket → mühürlü emanet ilanı → ödül → serbest. */
export const KURUMSAL_HAPPY_PATH = ["company", "seal-escrow", "award", "release"] as const;

export type KurumsalHappyPathStep = (typeof KURUMSAL_HAPPY_PATH)[number];

export {
  KURUMSAL_JOB_FLOOR_UNIT_KEY,
  KURUMSAL_MODULE_KEY,
} from "@/lib/kurumsal/types";
export {
  awardCorporateJobPosting,
  refundCorporateJobPosting,
  releaseCorporateJobPosting,
  sealCorporateJobPosting,
  submitCorporateJobOffer,
  upsertCorporateCompany,
} from "@/lib/kurumsal/engine";
export {
  KURUMSAL_ESCROW_REFUND_PURPOSE,
  onEscrowRefunded as onKurumsalEscrowRefunded,
} from "@/lib/kurumsal/escrow-refund";
export {
  awardJobPostingInputSchema,
  createJobPostingInputSchema,
  submitJobOfferInputSchema,
  upsertCompanyInputSchema,
} from "@/lib/kurumsal/schemas";
export {
  canAwardPosting,
  canRefundPosting,
  canReleasePosting,
  canSubmitOffer,
  corporateJobReferenceKey,
} from "@/lib/kurumsal/fsm";
export type {
  CorporateCompanyRecord,
  CorporateJobOfferRecord,
  CorporateJobPostingRecord,
  KurumsalPulse,
  KurumsalStore,
} from "@/lib/kurumsal/types";
