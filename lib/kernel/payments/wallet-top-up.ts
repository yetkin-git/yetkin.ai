import { toPositiveAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";

/** Kart yükleme bandı: ₺10 – ₺20.000 */
export const WALLET_TOP_UP_MIN_MINOR = 1_000;
export const WALLET_TOP_UP_MAX_MINOR = 2_000_000;

export function assertWalletTopUpAmountMinor(amountMinor: number): AmountMinor {
  const value = toPositiveAmountMinor(amountMinor);
  if (value < WALLET_TOP_UP_MIN_MINOR || value > WALLET_TOP_UP_MAX_MINOR) {
    throw new Error(
      `Cüzdan yükleme ₺10–₺20.000 aralığında olmalıdır.`,
    );
  }
  return value;
}

export type WalletTopUpReuseDecision =
  | { action: "create" }
  | { action: "reuse"; retryCheckout: boolean }
  | { action: "conflict"; reason: "amount_mismatch" | "foreign_order" | "failed_oid" };

export function decideWalletTopUpReuse(
  existing: { userId: string; amountMinor: number; status: string } | null,
  actorUserId: string,
  amountMinor: number,
): WalletTopUpReuseDecision {
  if (!existing) {
    return { action: "create" };
  }
  if (existing.userId !== actorUserId) {
    return { action: "conflict", reason: "foreign_order" };
  }
  if (existing.amountMinor !== amountMinor) {
    return { action: "conflict", reason: "amount_mismatch" };
  }
  if (existing.status === "FAILED") {
    return { action: "conflict", reason: "failed_oid" };
  }
  return { action: "reuse", retryCheckout: existing.status === "PENDING" };
}

/** beginCheckout ok değilse PENDING aynı istekte kapanır (failPaymentOrder / markFailed). */
export function shouldFailCloseWalletTopUpCheckout(checkoutOk: boolean): boolean {
  return checkoutOk === false;
}

/**
 * Mock token bakiyeye düşmez. PENDING aynı istekte kapanır ki emir 2 saat takılmaz.
 * Clearing / webhook bu bayrağı okumaz.
 */
export function shouldFailCloseMockTopUp(mockCheckout: boolean | undefined): boolean {
  return mockCheckout === true;
}

export const WALLET_TOP_UP_STATUSES = ["PENDING", "PAID", "CLEARED", "FAILED"] as const;
export type WalletTopUpStatus = (typeof WALLET_TOP_UP_STATUSES)[number];

export type WalletTopUpWire = {
  merchantOid: string;
  token: string | null;
  iframeUrl: string | null;
  sandboxMode: boolean;
  alreadySettled: boolean;
  mockCheckout: boolean;
  status: WalletTopUpStatus | null;
  checkoutPassportUrl: string | null;
};

export function toWalletTopUpWire(
  partial: Partial<WalletTopUpWire> & { merchantOid: string },
): WalletTopUpWire {
  return {
    merchantOid: partial.merchantOid,
    token: partial.token ?? null,
    iframeUrl: partial.iframeUrl ?? null,
    sandboxMode: Boolean(partial.sandboxMode),
    alreadySettled: Boolean(partial.alreadySettled),
    mockCheckout: Boolean(partial.mockCheckout),
    status: partial.status ?? null,
    checkoutPassportUrl: partial.checkoutPassportUrl ?? null,
  };
}
