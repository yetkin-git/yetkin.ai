import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import type { JuniorPulse } from "@/lib/junior/types";

export type JuniorPulseSnapshot = JuniorPulse & { live: boolean };

export const EMPTY_JUNIOR_PULSE: JuniorPulseSnapshot = {
  live: false,
  status: null,
  hasGuardianConsent: false,
  remainingMinor: toAmountMinor(0),
  weeklyCapMinor: toAmountMinor(0),
  mebTrackKey: null,
  currencyCode: SETTLEMENT_CURRENCY satisfies CurrencyCode,
  wardsPending: 0,
  wardsLinked: 0,
};
