/**
 * ISO 4217 sicili — her para 2 hane varsayılmaz.
 * Settlement gün 0: TRY (S5-A). USD/EUR şemada hazır, bakiye açılmaz.
 */

export const CURRENCY_CODES = ["TRY", "USD", "EUR"] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export type CurrencyConfig = {
  code: CurrencyCode;
  /** Major birim başına minor (TRY 100, USD 100, EUR 100). */
  minorUnitsPerMajor: number;
  symbol: string;
  intlLocale: string;
  minorUnitName: string;
};

export const CURRENCY_REGISTRY: Record<CurrencyCode, CurrencyConfig> = {
  TRY: {
    code: "TRY",
    minorUnitsPerMajor: 100,
    symbol: "₺",
    intlLocale: "tr-TR",
    minorUnitName: "kurus",
  },
  USD: {
    code: "USD",
    minorUnitsPerMajor: 100,
    symbol: "$",
    intlLocale: "en-US",
    minorUnitName: "cents",
  },
  EUR: {
    code: "EUR",
    minorUnitsPerMajor: 100,
    symbol: "€",
    intlLocale: "de-DE",
    minorUnitName: "cents",
  },
};

export const SETTLEMENT_CURRENCY: CurrencyCode = "TRY";

const CURRENCY_CODE_SET = new Set<string>(CURRENCY_CODES);

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCY_CODE_SET.has(value);
}

export function parseCurrencyCode(value: string): CurrencyCode {
  const trimmed = value.trim().toUpperCase();
  if (!isCurrencyCode(trimmed)) {
    throw new Error(`Desteklenmeyen para birimi: ${value}`);
  }
  return trimmed;
}

export function getCurrencyConfig(code: CurrencyCode): CurrencyConfig {
  return CURRENCY_REGISTRY[code];
}

export function assertSameCurrency(a: CurrencyCode, b: CurrencyCode): void {
  if (a !== b) {
    throw new Error(`Para birimi uyuşmazlığı: ${a} ≠ ${b}`);
  }
}

export function getSettlementCurrencyCode(): CurrencyCode {
  const env = process.env.NEXT_PUBLIC_SETTLEMENT_CURRENCY?.trim().toUpperCase();
  if (env && isCurrencyCode(env)) {
    return env;
  }
  return SETTLEMENT_CURRENCY;
}
