import { describe, expect, it } from "vitest";
import {
  addAmountMinor,
  AMOUNT_MINOR_OVERFLOW_ERROR,
  assertGrossSplitIntegrity,
  computeHoldMinorFromBps,
  subtractAmountMinor,
  toAmountMinor,
  toPositiveAmountMinor,
} from "@/lib/kernel/money/amount-minor";
import { formatMinor, formatMinorCompact, parseMajorToMinor, stripZeroKurusFromTryLabel } from "@/lib/kernel/money/format";
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
    expect(() => subtractAmountMinor(b, a)).toThrow(AMOUNT_MINOR_OVERFLOW_ERROR);
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

  it("vitrin compact tamsayı lirada kuruş hanesini gizler", () => {
    expect(formatMinorCompact(159_000, "TRY")).toBe(formatMinor(159_000, "TRY").replace(/,00$/, ""));
    expect(formatMinorCompact(159_000, "TRY")).not.toMatch(/,00$/);
    expect(formatMinorCompact(89_000, "TRY")).toBe(formatMinor(89_000, "TRY").replace(/,00$/, ""));
    expect(formatMinorCompact(159_050, "TRY")).toBe(formatMinor(159_050, "TRY"));
    expect(stripZeroKurusFromTryLabel("₺1.590,00")).toBe("₺1.590");
    expect(stripZeroKurusFromTryLabel("₺1.590,50")).toBe("₺1.590,50");
  });
});
