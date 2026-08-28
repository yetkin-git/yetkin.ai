/** Gerekçeli zam — sessiz katalog yazımı yok. */
export const PRICE_DECISION_REASON_CODES = [
  "ADMIN_MANUAL",
  "MACRO_INDEX_ADJUSTMENT",
  "PROMOTION",
  "CORRECTION",
] as const;

export type PriceDecisionReasonCode = (typeof PRICE_DECISION_REASON_CODES)[number];

export function isPriceDecisionReasonCode(value: string): value is PriceDecisionReasonCode {
  return (PRICE_DECISION_REASON_CODES as readonly string[]).includes(value);
}
