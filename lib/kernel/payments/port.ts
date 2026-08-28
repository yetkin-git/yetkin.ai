import { readServiceEnvChecks } from "@/lib/kernel/health/probe";
import {
  paytrMarketplaceSplitPort,
  type MarketplaceSplitPort,
} from "@/lib/kernel/payments/marketplace-split";
import { paytrPaymentProvider } from "@/lib/kernel/payments/paytr/adapter";
import type { PaymentProvider } from "@/lib/kernel/payments/provider";

/**
 * Payments portu — omurga değil. Gün 0 somut adaptör PayTR; webhook yolu
 * satıcıya özel kalır. `unconfigured` liveness/readiness 503 sebebi değildir.
 * Tahsilat uçları dürüst kapalıdır; sahte CREDIT yazılmaz.
 */
export const PAYMENTS_UNCONFIGURED_ERROR = "Ödeme henüz bağlanmadı" as const;

export type PaymentsPortStatus = "configured" | "unconfigured";

export type PaymentsPort = {
  readonly id: "merchant";
  status(env?: Record<string, string | undefined>): PaymentsPortStatus;
  readonly merchant: PaymentProvider;
  readonly split: MarketplaceSplitPort;
};

export function readPaymentsPortStatus(
  env: Record<string, string | undefined> = process.env,
): PaymentsPortStatus {
  return readServiceEnvChecks(env).payments;
}

export function isPaymentsPortConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return readPaymentsPortStatus(env) === "configured";
}

export const paymentsPort: PaymentsPort = {
  id: "merchant",
  status: readPaymentsPortStatus,
  merchant: paytrPaymentProvider,
  split: paytrMarketplaceSplitPort,
};
