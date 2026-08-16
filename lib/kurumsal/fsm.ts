import type { CorporateJobPostingStatus } from "@/lib/kurumsal/types";

export function corporateJobReferenceKey(postingId: string): string {
  return `corporate-job:${postingId}`;
}

export function canAwardPosting(status: CorporateJobPostingStatus): boolean {
  return status === "SEALED";
}

export function canSubmitOffer(status: CorporateJobPostingStatus): boolean {
  return status === "SEALED";
}

export function canReleasePosting(status: CorporateJobPostingStatus): boolean {
  return status === "AWARDED";
}

export function canRefundPosting(status: CorporateJobPostingStatus): boolean {
  return status === "SEALED" || status === "AWARDED";
}
