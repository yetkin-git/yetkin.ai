import { PAYMENTS_UNCONFIGURED_ERROR } from "@/lib/kernel/payments/port";

/** Vatandaş / v1 yüzeylerinde PayTR pasif 503 iğnesi. Sahte 2xx yok. */
export function isPaymentsUnconfiguredError(message?: string | null): boolean {
  if (!message) {
    return false;
  }
  return message.trim() === PAYMENTS_UNCONFIGURED_ERROR;
}
