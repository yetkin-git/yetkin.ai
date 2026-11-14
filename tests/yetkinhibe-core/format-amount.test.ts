import { describe, expect, it } from "vitest";

import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { formatAmountMinorAsWholeTry } from "@/lib/yetkinhibe/format-amount";

describe("formatAmountMinorAsWholeTry — tam lira vitrini", () => {
  it("kuruş hanesini en yakın tam liraya yuvarlar", () => {
    expect(formatAmountMinorAsWholeTry(toAmountMinor(159_049))).toBe("₺1.590");
    expect(formatAmountMinorAsWholeTry(toAmountMinor(159_050))).toBe("₺1.591");
  });

  it("tam sayı lirada kuruş hanesini göstermez", () => {
    expect(formatAmountMinorAsWholeTry(toAmountMinor(100_000_000))).toBe("₺1.000.000");
    expect(formatAmountMinorAsWholeTry(toAmountMinor(0))).toBe("₺0");
  });

  it("negatif girdiyi reddeder", () => {
    expect(() => formatAmountMinorAsWholeTry(-1)).toThrow();
  });
});
