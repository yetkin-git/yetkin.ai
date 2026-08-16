import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import type { ArenaPulse } from "@/lib/arena/types";

export type ArenaPulseSnapshot = ArenaPulse & { live: boolean };

export const EMPTY_ARENA_PULSE: ArenaPulseSnapshot = {
  live: false,
  openTendersSponsored: 0,
  submissionsMade: 0,
  awardsWon: 0,
  pendingPoolMinor: toAmountMinor(0) as AmountMinor,
  currencyCode: SETTLEMENT_CURRENCY satisfies CurrencyCode,
};
