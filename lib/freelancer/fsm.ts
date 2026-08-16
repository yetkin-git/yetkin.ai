import type {
  FreelancerContractStatus,
  FreelancerDisputeRoundStatus,
  FreelancerJobStatus,
} from "@/lib/freelancer/types";

const TERMINAL_CONTRACT: ReadonlySet<FreelancerContractStatus> = new Set([
  "RELEASED",
  "REFUNDED",
]);

const OPEN_DISPUTE: ReadonlySet<FreelancerDisputeRoundStatus> = new Set([
  "ROUND_ONE_OPEN",
  "ROUND_ONE_SUBMITTED",
  "ROUND_TWO_SUBMITTED",
  "AI_REPORT_READY",
  "HUMAN_REVIEW",
]);

export function canAcceptBid(jobStatus: FreelancerJobStatus): boolean {
  return jobStatus === "OPEN";
}

/** Mutlu yol serbesti — tahkimdeki hold S51-A ile kilitli kalır. */
export function canReleaseContract(status: FreelancerContractStatus): boolean {
  return status === "FUNDED";
}

/** Karşılıklı iade yalnız tahkim öncesi. DISPUTED hold iade tarayıcısına düşmez. */
export function canRefundContract(status: FreelancerContractStatus): boolean {
  return status === "FUNDED";
}

export function isContractTerminal(status: FreelancerContractStatus): boolean {
  return TERMINAL_CONTRACT.has(status);
}

export function isDisputeOpen(status: FreelancerDisputeRoundStatus): boolean {
  return OPEN_DISPUTE.has(status);
}

/**
 * EscrowHold.referenceKey — ilan başına bir hold. Eşzamanlı kabul aynı idempotency anahtarını paylaşır.
 * (Eski biçim `freelancer-contract:{contractId}` yalnız okuma düşümünde aranır.)
 */
export function freelancerJobEscrowReferenceKey(jobId: string): string {
  return `freelancer.contract.job:${jobId}`;
}

export function freelancerContractReferenceKey(contractId: string): string {
  return `freelancer-contract:${contractId}`;
}

/** Yazma job anahtarı; okuma önce job, yoksa tarihî contract anahtarı. */
export async function resolveFreelancerEscrowReferenceKey(
  findByReferenceKey: (referenceKey: string) => Promise<{ referenceKey: string } | null>,
  input: { jobId: string; contractId: string },
): Promise<string> {
  const jobKey = freelancerJobEscrowReferenceKey(input.jobId);
  const found = await findByReferenceKey(jobKey);
  if (found) {
    return found.referenceKey;
  }
  return freelancerContractReferenceKey(input.contractId);
}

export function counterpartyUserId(input: {
  actorUserId: string;
  clientId: string;
  freelancerId: string;
}): string {
  if (input.actorUserId === input.clientId) {
    return input.freelancerId;
  }
  if (input.actorUserId === input.freelancerId) {
    return input.clientId;
  }
  throw new Error("Yalnız sözleşme tarafları işlem yapabilir.");
}
