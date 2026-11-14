import { describe, expect, it } from "vitest";

import {
  calculateGrantBudget,
  DEFAULT_CONSULTING_CAP_TRY,
} from "@/lib/yetkinhibe/calculate-grant-budget";

describe("YetkinHibe bütçesi & KDV avantajı — calculateGrantBudget", () => {
  it("varsayılan 100.000 TL limitinde doğru kırılım üretir", () => {
    const result = calculateGrantBudget();

    expect(result.consultingCapMinor).toBe(100_000_00);
    expect(result.grantAmountMinor).toBe(100_000_00);
    expect(result.kdvAmountMinor).toBe(20_000_00);
    expect(result.digitalCreditEarnedMinor).toBe(20_000_00);
    expect(result.netCompanyCashMinor).toBe(75_000_00);
  });

  it("50.000 TL paketinde KDV ve net nakit simülasyonunu doğru hesaplar", () => {
    const result = calculateGrantBudget({ consultingCap: 50_000 });

    expect(result.grantAmountMinor).toBe(50_000_00);
    expect(result.kdvAmountMinor).toBe(10_000_00);
    expect(result.digitalCreditEarnedMinor).toBe(10_000_00);
    expect(result.netCompanyCashMinor).toBe(37_500_00);
  });

  it("200.000 TL paketinde tüm alanlar tam sayı minor unit kalır", () => {
    const result = calculateGrantBudget({ consultingCap: 200_000 });

    expect(Number.isInteger(result.grantAmountMinor)).toBe(true);
    expect(Number.isInteger(result.kdvAmountMinor)).toBe(true);
    expect(Number.isInteger(result.digitalCreditEarnedMinor)).toBe(true);
    expect(Number.isInteger(result.netCompanyCashMinor)).toBe(true);
    expect(result.kdvAmountMinor).toBe(40_000_00);
    expect(result.netCompanyCashMinor).toBe(150_000_00);
  });

  it("varsayılan consultingCap sabiti ile açık girdi aynı sonucu verir", () => {
    const implicit = calculateGrantBudget();
    const explicit = calculateGrantBudget({ consultingCap: DEFAULT_CONSULTING_CAP_TRY });
    expect(explicit).toEqual(implicit);
  });

  it("negatif, kesirli veya güvenli tam sayı dışı limit için hata fırlatır", () => {
    expect(() => calculateGrantBudget({ consultingCap: -1 })).toThrow();
    expect(() => calculateGrantBudget({ consultingCap: 99.5 })).toThrow();
    expect(() => calculateGrantBudget({ consultingCap: 1e15 })).toThrow();
  });
});
