import { describe, expect, it } from "vitest";
import {
  assertWalletTopUpAmountMinor,
  WALLET_TOP_UP_MAX_MINOR,
  WALLET_TOP_UP_MIN_MINOR,
} from "@/lib/kernel/payments/wallet-top-up";

describe("cüzdan yükleme bandı (S15-A)", () => {
  it("₺10 ve ₺20.000 sınırlarını kabul eder", () => {
    expect(assertWalletTopUpAmountMinor(WALLET_TOP_UP_MIN_MINOR)).toBe(1_000);
    expect(assertWalletTopUpAmountMinor(WALLET_TOP_UP_MAX_MINOR)).toBe(2_000_000);
  });

  it("bant dışını reddeder", () => {
    expect(() => assertWalletTopUpAmountMinor(999)).toThrow();
    expect(() => assertWalletTopUpAmountMinor(2_000_001)).toThrow();
  });
});
