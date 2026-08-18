import { describe, expect, it } from "vitest";
import { AMOUNT_MINOR_OVERFLOW_ERROR } from "@/lib/kernel/money/amount-minor";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE } from "@/lib/kernel/http/v1-contract";
import {
  computeWalletShortfallMinor,
  isQuickTopUpCapped,
  isQuickTopUpMinLift,
  suggestQuickTopUpAmountMinor,
} from "@/lib/kernel/payments/quick-top-up";
import { WALLET_TOP_UP_MAX_MINOR, WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";

describe("yetersiz bakiye iğnesi", () => {
  it("v1 kabul, studio ve çekirdek overflow metinlerini tanır", () => {
    expect(isInsufficientBalanceError(RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE)).toBe(true);
    expect(isInsufficientBalanceError("Yetersiz bakiye.")).toBe(true);
    expect(isInsufficientBalanceError(AMOUNT_MINOR_OVERFLOW_ERROR)).toBe(true);
    expect(isInsufficientBalanceError("Fiyat kilidi alınamadı.")).toBe(false);
    expect(isInsufficientBalanceError(null)).toBe(false);
  });
});

describe("hızlı yükleme shortfall", () => {
  it("eksik tutarı tam sayı minor olarak üretir", () => {
    expect(computeWalletShortfallMinor(25_000, 10_000)).toBe(15_000);
    expect(computeWalletShortfallMinor(10_000, 10_000)).toBe(0);
    expect(computeWalletShortfallMinor(8_000, 10_000)).toBe(0);
  });

  it("bant altına düşeni min'e, tavan üstünü max'a sıkıştırır", () => {
    expect(suggestQuickTopUpAmountMinor(500)).toBe(WALLET_TOP_UP_MIN_MINOR);
    expect(isQuickTopUpMinLift(500, WALLET_TOP_UP_MIN_MINOR)).toBe(true);
    expect(suggestQuickTopUpAmountMinor(12_500)).toBe(12_500);
    expect(suggestQuickTopUpAmountMinor(WALLET_TOP_UP_MAX_MINOR + 1)).toBe(WALLET_TOP_UP_MAX_MINOR);
    expect(isQuickTopUpCapped(WALLET_TOP_UP_MAX_MINOR + 50, WALLET_TOP_UP_MAX_MINOR)).toBe(true);
  });
});
