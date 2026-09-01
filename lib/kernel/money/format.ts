import { toSignedAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  getCurrencyConfig,
  type CurrencyCode,
} from "@/lib/kernel/money/currency";

/**
 * Minor → görüntü metni. Bölme yalnızca format sınırındadır; motor float tutmaz.
 */
export function formatMinor(
  amountMinor: AmountMinor | number,
  currencyCode: CurrencyCode,
): string {
  const config = getCurrencyConfig(currencyCode);
  const signed = toSignedAmountMinor(Math.trunc(amountMinor));
  const isNegative = signed < 0;
  const abs = Math.abs(signed);
  const wholeMajor = Math.floor(abs / config.minorUnitsPerMajor);
  const remainingMinor = abs % config.minorUnitsPerMajor;
  const exponent = Math.max(0, String(config.minorUnitsPerMajor - 1).length);
  const majorPart = wholeMajor.toLocaleString(config.intlLocale, {
    maximumFractionDigits: 0,
  });
  const minorPart = remainingMinor.toString().padStart(exponent, "0");
  const decimal = currencyCode === "TRY" ? "," : ".";
  const amount = `${majorPart}${decimal}${minorPart}`;
  const signedAmount = isNegative ? `-${amount}` : amount;
  return `${config.symbol}${signedAmount}`;
}

/**
 * Vitrin tutarı — tamsayı majörde kesir hanesini gizler (₺1.590,00 → ₺1.590).
 * Kuruşlu tutar olduğu gibi durur (₺1.590,50). Defter/fiş `formatMinor` kullanır.
 */
export function formatMinorCompact(
  amountMinor: AmountMinor | number,
  currencyCode: CurrencyCode,
): string {
  const full = formatMinor(amountMinor, currencyCode);
  const config = getCurrencyConfig(currencyCode);
  const signed = toSignedAmountMinor(Math.trunc(amountMinor));
  const remainingMinor = Math.abs(signed) % config.minorUnitsPerMajor;
  if (remainingMinor !== 0) {
    return full;
  }
  const decimal = currencyCode === "TRY" ? "," : ".";
  const exponent = Math.max(0, String(config.minorUnitsPerMajor - 1).length);
  const suffix = `${decimal}${"0".repeat(exponent)}`;
  if (full.endsWith(suffix)) {
    return full.slice(0, -suffix.length);
  }
  return full;
}

/** TRY vitrin etiketi — tamsayı lirada `,00` kuruş hanesini düşürür. */
export function stripZeroKurusFromTryLabel(label: string): string {
  return label.replace(/,00(?!\d)/gu, "");
}

/**
 * UI major girdisi → minor. Sınır katmanı; ledger bu fonksiyonu çağırmaz.
 * Ondalık ayırıcı virgül veya nokta olabilir; sonuç tam sayıdır.
 */
export function parseMajorToMinor(
  majorInput: string,
  currencyCode: CurrencyCode,
): AmountMinor {
  const config = getCurrencyConfig(currencyCode);
  const trimmed = majorInput.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("Tutar metni okunamadı.");
  }
  const [wholeRaw, fractionRaw = ""] = trimmed.split(".");
  const negative = wholeRaw?.startsWith("-") ?? false;
  const whole = Math.abs(Number.parseInt(wholeRaw ?? "0", 10));
  if (!Number.isInteger(whole) || whole < 0) {
    throw new Error("Tutar tam sayı major üretemedi.");
  }
  const exponent = Math.max(0, String(config.minorUnitsPerMajor - 1).length);
  const fractionPadded = fractionRaw.padEnd(exponent, "0").slice(0, exponent);
  const fraction = Number.parseInt(fractionPadded || "0", 10);
  const minor = whole * config.minorUnitsPerMajor + fraction;
  if (!Number.isInteger(minor)) {
    throw new Error("Minor dönüşümü tam sayı üretemedi.");
  }
  const signed = negative ? -minor : minor;
  if (signed < 0) {
    throw new Error("Tutar negatif olamaz.");
  }
  return signed as AmountMinor;
}
