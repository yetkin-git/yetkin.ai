import { describe, expect, it } from "vitest";
import {
  PRICE_LOCK_GRACE_MS,
  assertPriceLockAllowsDebit,
  computePriceLockExpiresAt,
} from "@/lib/kernel/pricing/price-lock";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";

describe("checkout price lock", () => {
  it("15 dk grace tanır, süresi bitince debit yok", () => {
    const now = new Date("2026-08-14T00:00:00.000Z");
    const lock = {
      id: "1",
      userId: "u1",
      lockKey: "freelancer:milestone",
      moduleKey: "freelancer",
      unitKey: "milestone",
      amountMinor: toAmountMinor(2500),
      currencyCode: "TRY" as const,
      catalogMinor: toAmountMinor(2500),
      expiresAt: computePriceLockExpiresAt(now),
      consumedAt: null,
    };
    expect(assertPriceLockAllowsDebit(lock, now).ok).toBe(true);
    const expiredAt = new Date(now.getTime() + PRICE_LOCK_GRACE_MS);
    const expired = assertPriceLockAllowsDebit(lock, expiredAt);
    expect(expired.ok).toBe(false);
    if (!expired.ok) {
      expect(expired.code).toBe("expired");
    }
  });
});
