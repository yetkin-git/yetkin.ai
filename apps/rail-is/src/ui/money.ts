import {
  RAIL_V1_BID_AMOUNT_MAX_MINOR,
  RAIL_V1_BID_AMOUNT_MIN_MINOR,
} from "../contract/v1";

const MINOR_PER_MAJOR = 100;

/**
 * Minor → görüntü. Bölme yalnız gösterimdedir; float/toFixed yok.
 */
export function formatMinorLabel(
  amountMinor: number,
  currencyCode: "TRY" | "USD" | "EUR" = "TRY",
): string {
  if (!Number.isInteger(amountMinor) || !Number.isSafeInteger(amountMinor)) {
    throw new Error("amountMinor tam sayı olmalıdır.");
  }
  const negative = amountMinor < 0;
  const abs = amountMinor < 0 ? -amountMinor : amountMinor;
  const whole = Math.trunc(abs / MINOR_PER_MAJOR);
  const frac = abs % MINOR_PER_MAJOR;
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimal = currencyCode === "TRY" ? "," : ".";
  const amount = `${grouped}${decimal}${String(frac).padStart(2, "0")}`;
  const symbol = currencyCode === "TRY" ? "₺" : currencyCode === "USD" ? "$" : "€";
  return `${symbol}${negative ? "-" : ""}${amount}`;
}

/**
 * Vatandaş ₺ metni → amountMinor. parseFloat yok; virgül veya nokta ondalık olabilir.
 */
export function parseMajorToAmountMinor(input: string): number {
  const trimmed = input.trim().replace(/\s/g, "");
  if (!trimmed) {
    throw new Error("Tutar boş.");
  }
  if (!/^-?\d+([.,]\d{1,2})?$/.test(trimmed)) {
    throw new Error("Tutar metni okunamadı.");
  }
  const normalized = trimmed.replace(",", ".");
  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [wholeRaw, fractionRaw = ""] = unsigned.split(".");
  const whole = Number.parseInt(wholeRaw ?? "0", 10);
  if (!Number.isInteger(whole) || whole < 0) {
    throw new Error("Tutar tam sayı major üretemedi.");
  }
  const fraction = Number.parseInt(fractionRaw.padEnd(2, "0").slice(0, 2) || "0", 10);
  const minor = whole * MINOR_PER_MAJOR + fraction;
  if (!Number.isInteger(minor) || !Number.isSafeInteger(minor)) {
    throw new Error("Minor dönüşümü tam sayı üretemedi.");
  }
  if (negative) {
    throw new Error("Tutar negatif olamaz.");
  }
  return minor;
}

export function assertBidAmountMinor(amountMinor: number, budgetMinor?: number): number {
  if (!Number.isInteger(amountMinor) || !Number.isSafeInteger(amountMinor)) {
    throw new Error("amountMinor tam sayı olmalıdır.");
  }
  if (amountMinor < RAIL_V1_BID_AMOUNT_MIN_MINOR || amountMinor > RAIL_V1_BID_AMOUNT_MAX_MINOR) {
    throw new Error("Teklif ₺250–₺50.000 bandında olmalıdır.");
  }
  if (budgetMinor != null && Number.isInteger(budgetMinor) && amountMinor > budgetMinor) {
    throw new Error("Teklif iş bütçesini aşamaz.");
  }
  return amountMinor;
}

export function assertCoverNote(coverNote: string): string {
  const trimmed = coverNote.trim();
  if (trimmed.length < 4 || trimmed.length > 2000) {
    throw new Error("Teklif notu 4–2000 karakter olmalıdır.");
  }
  return trimmed;
}
