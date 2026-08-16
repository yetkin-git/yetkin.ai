import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import type { KurumsalPulse } from "@/lib/kurumsal/types";

export type KurumsalPulseSnapshot = KurumsalPulse & { live: boolean };

export const EMPTY_KURUMSAL_PULSE: KurumsalPulseSnapshot = {
  live: false,
  companiesOwned: 0,
  sealedPostings: 0,
  awardedPostings: 0,
  releasedPostings: 0,
  pendingEscrowMinor: toAmountMinor(0) as AmountMinor,
  currencyCode: SETTLEMENT_CURRENCY satisfies CurrencyCode,
};
