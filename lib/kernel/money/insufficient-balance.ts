import { AMOUNT_MINOR_OVERFLOW_ERROR } from "@/lib/kernel/money/amount-minor";

/** Vatandaş ve v1 yüzeylerindeki yetersiz bakiye iğneleri. Sahte 2xx yok. */
export function isInsufficientBalanceError(message?: string | null): boolean {
  if (!message) {
    return false;
  }
  return message.includes("Yetersiz bakiye") || message.includes(AMOUNT_MINOR_OVERFLOW_ERROR);
}
