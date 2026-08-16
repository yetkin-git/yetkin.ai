import { describe, expect, it } from "vitest";
import {
  addAmountMinor,
  assertGrossSplitIntegrity,
  computeHoldMinorFromBps,
  subtractAmountMinor,
  toAmountMinor,
  toPositiveAmountMinor,
} from "@/lib/kernel/money/amount-minor";
import { formatMinor, parseMajorToMinor } from "@/lib/kernel/money/format";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";

describe("amountMinor", () => {
  it("float ve negatif tutarı reddeder", () => {
    expect(() => toAmountMinor(1.5)).toThrow();
    expect(() => toAmountMinor(-1)).toThrow();
    expect(() => toPositiveAmountMinor(0)).toThrow();
  });

  it("toplama ve çıkarma tam sayı kalır", () => {
    const a = toAmountMinor(150);
    const b = toAmountMinor(25);
    expect(addAmountMinor(a, b)).toBe(175);
    expect(subtractAmountMinor(a, b)).toBe(125);
    expect(() => subtractAmountMinor(b, a)).toThrow();
  });

  it("hold floor üretir ve split bütünlüğünü korur", () => {
    const gross = toAmountMinor(1001);
    const hold = computeHoldMinorFromBps(gross, 1000);
    expect(hold).toBe(100);
    const net = subtractAmountMinor(gross, hold);
    expect(net).toBe(901);
    assertGrossSplitIntegrity(gross, hold, net);
  });

  it("TRY format ve parse sınırında minor üretir", () => {
    const minor = parseMajorToMinor("13,50", "TRY");
    expect(minor).toBe(1350);
    expect(formatMinor(minor, "TRY")).toContain("13,50");
    expect(parseCurrencyCode("try")).toBe("TRY");
  });
});
