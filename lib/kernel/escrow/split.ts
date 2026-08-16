import {
  assertGrossSplitIntegrity,
  computeHoldMinorFromBps,
  subtractHoldFromGross,
  toPositiveAmountMinor,
  type AmountMinor,
} from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import { assertHoldBps } from "@/lib/kernel/pricing/hold-bps";

export type EscrowHoldStatus = "PENDING" | "RELEASED" | "REFUNDED";

export type EscrowSplit = {
  currencyCode: CurrencyCode;
  grossMinor: AmountMinor;
  holdMinor: AmountMinor;
  netMinor: AmountMinor;
  holdBps: number;
};

export function splitGross(input: {
  grossMinor: number;
  holdBps: number;
  currencyCode: CurrencyCode;
}): EscrowSplit {
  const grossMinor = toPositiveAmountMinor(input.grossMinor);
  const holdBps = assertHoldBps(input.holdBps);
  const holdMinor = computeHoldMinorFromBps(grossMinor, holdBps);
  const netMinor = subtractHoldFromGross(grossMinor, holdMinor);
  assertGrossSplitIntegrity(grossMinor, holdMinor, netMinor);
  return {
    currencyCode: input.currencyCode,
    grossMinor,
    holdMinor,
    netMinor,
    holdBps,
  };
}

export function assertEscrowReleaseSplit(split: EscrowSplit): void {
  assertGrossSplitIntegrity(split.grossMinor, split.holdMinor, split.netMinor);
}
