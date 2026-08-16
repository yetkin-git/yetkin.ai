import { toPositiveAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

export const PRICE_LOCK_GRACE_MINUTES = 15 as const;
export const PRICE_LOCK_GRACE_MS = PRICE_LOCK_GRACE_MINUTES * 60 * 1000;

export type CheckoutPriceLockSnapshot = {
  id: string;
  userId: string;
  lockKey: string;
  moduleKey: string;
  unitKey: string;
  amountMinor: AmountMinor;
  currencyCode: CurrencyCode;
  catalogMinor: AmountMinor;
  expiresAt: Date;
  consumedAt: Date | null;
};

export type PriceLockDecision =
  | { ok: true; amountMinor: AmountMinor; expired: false }
  | { ok: false; expired: true; code: "expired" }
  | { ok: false; expired: false; code: "missing" | "consumed" | "mismatch" };

export function computePriceLockExpiresAt(now: Date = new Date()): Date {
  return new Date(now.getTime() + PRICE_LOCK_GRACE_MS);
}

export function isPriceLockExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return now.getTime() >= expiresAt.getTime();
}

export function remainingPriceLockMs(expiresAt: Date, now: Date = new Date()): number {
  return Math.max(0, expiresAt.getTime() - now.getTime());
}

export function buildPriceLockKey(moduleKey: string, unitKey: string): string {
  return `${moduleKey.trim()}:${unitKey.trim()}`;
}

export function assertPriceLockAllowsDebit(
  lock: CheckoutPriceLockSnapshot | null,
  now: Date = new Date(),
): PriceLockDecision {
  if (!lock) {
    return { ok: false, expired: false, code: "missing" };
  }
  if (lock.consumedAt) {
    return { ok: false, expired: false, code: "consumed" };
  }
  if (isPriceLockExpired(lock.expiresAt, now)) {
    return { ok: false, expired: true, code: "expired" };
  }
  try {
    const amountMinor = toPositiveAmountMinor(lock.amountMinor);
    return { ok: true, amountMinor, expired: false };
  } catch {
    return { ok: false, expired: false, code: "mismatch" };
  }
}
