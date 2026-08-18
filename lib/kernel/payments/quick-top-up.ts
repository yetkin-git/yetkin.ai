import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  assertWalletTopUpAmountMinor,
  WALLET_TOP_UP_MAX_MINOR,
  WALLET_TOP_UP_MIN_MINOR,
} from "@/lib/kernel/payments/wallet-top-up";

/** required − balance; negatif olmaz. Float yok. */
export function computeWalletShortfallMinor(requiredMinor: number, balanceMinor: number): AmountMinor {
  const required = Math.trunc(requiredMinor);
  const balance = Math.trunc(balanceMinor);
  const gap = required - balance;
  return toAmountMinor(gap > 0 ? gap : 0);
}

/**
 * PayTR bandına sıkıştırılmış öneri tutarı.
 * Eksik < min ise min yüklenir; eksik > max ise max (dürüst tavan).
 */
export function suggestQuickTopUpAmountMinor(shortfallMinor: number): AmountMinor {
  const gap = Math.trunc(shortfallMinor);
  if (!Number.isInteger(gap) || gap <= 0) {
    return WALLET_TOP_UP_MIN_MINOR as AmountMinor;
  }
  const lifted = Math.max(gap, WALLET_TOP_UP_MIN_MINOR);
  const capped = Math.min(lifted, WALLET_TOP_UP_MAX_MINOR);
  return assertWalletTopUpAmountMinor(capped);
}

export function isQuickTopUpMinLift(shortfallMinor: number, suggestedMinor: number): boolean {
  return shortfallMinor > 0 && shortfallMinor < WALLET_TOP_UP_MIN_MINOR && suggestedMinor === WALLET_TOP_UP_MIN_MINOR;
}

export function isQuickTopUpCapped(shortfallMinor: number, suggestedMinor: number): boolean {
  return shortfallMinor > WALLET_TOP_UP_MAX_MINOR && suggestedMinor === WALLET_TOP_UP_MAX_MINOR;
}
