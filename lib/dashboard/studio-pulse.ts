import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import type { StudioPulse } from "@/lib/studio/types";

export type StudioPulseSnapshot = StudioPulse & { live: boolean };

export const EMPTY_STUDIO_PULSE: StudioPulseSnapshot = {
  live: false,
  draftsCount: 0,
  generationsSucceeded: 0,
  lastDraftTitle: null,
  lastDebitMinor: toAmountMinor(0),
  currencyCode: SETTLEMENT_CURRENCY satisfies CurrencyCode,
};
