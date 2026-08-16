import { describe, expect, it } from "vitest";
import { allocateMinorByShareBps, SHARE_BPS_TOTAL, splitGross } from "@/lib/kernel/escrow";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";

describe("escrow split", () => {
  it("gross = hold + net", () => {
    const split = splitGross({
      grossMinor: 10_000,
      holdBps: HOLD_BPS_DEFAULT,
      currencyCode: "TRY",
    });
    expect(split.holdMinor).toBe(1_000);
    expect(split.netMinor).toBe(9_000);
    expect(split.holdMinor + split.netMinor).toBe(split.grossMinor);
  });

  it("bant dışı hold bps reddeder", () => {
    expect(() =>
      splitGross({ grossMinor: 10_000, holdBps: 999, currencyCode: "TRY" }),
    ).toThrow();
    expect(() =>
      splitGross({ grossMinor: 10_000, holdBps: 1501, currencyCode: "TRY" }),
    ).toThrow();
  });

  it("shareBps toplam 10.000 ile neti üyeye böler, kalan son paydaşa gider", () => {
    expect(SHARE_BPS_TOTAL).toBe(10_000);
    const slices = allocateMinorByShareBps(9_000, [
      { userId: "a", shareBps: 7000 },
      { userId: "b", shareBps: 3000 },
    ]);
    expect(slices).toEqual([
      { userId: "a", amountMinor: 6_300 },
      { userId: "b", amountMinor: 2_700 },
    ]);
  });
});
