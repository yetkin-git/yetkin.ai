import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { FreelancerPulse } from "@/lib/freelancer/types";

export type FreelancerPulseSnapshot = FreelancerPulse & {
  live: boolean;
};

export const EMPTY_FREELANCER_PULSE: FreelancerPulseSnapshot = {
  live: false,
  openJobsPosted: 0,
  fundedAsClient: 0,
  fundedAsFreelancer: 0,
  releasedAsFreelancer: 0,
  pendingEscrowMinor: toAmountMinor(0),
  currencyCode: SETTLEMENT_CURRENCY,
};
