/**
 * PayTR valör tarama seçimi — Inngest adımından bağımsız, sınır testi için saf.
 * Boş / yalnızca boşluk `merchantOid` aday değildir; dispatched = gönderilen sayı.
 * Port `unconfigured` iken tarama no-op: DB hit yok, sahte PENDING avı yok.
 */

import { isPaymentsPortConfigured } from "@/lib/kernel/payments/port";

export type PaytrClearingCandidate = { merchantOid: string };

/** FAILED siparişler bu pencerede PSP'ye yeniden sorulur (geç paid recovery). */
export const PAYTR_FAILED_RECOVERY_MS = 7 * 24 * 60 * 60 * 1000;

export const PAYTR_CLEARING_SCAN_NOOP_REASON = "payments_port_unconfigured" as const;

export type PaytrClearingScanNoOpResult = {
  dispatched: 0;
  noop: true;
  reason: typeof PAYTR_CLEARING_SCAN_NOOP_REASON;
};

export function paytrFailedRecoveryAfter(now: Date): Date {
  return new Date(now.getTime() - PAYTR_FAILED_RECOVERY_MS);
}

/** Merchant üçlüsü yoksa valör tarama DB'ye inmez. */
export function shouldNoOpPaytrClearingScan(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return !isPaymentsPortConfigured(env);
}

export function paytrClearingScanNoOpResult(): PaytrClearingScanNoOpResult {
  return {
    dispatched: 0,
    noop: true,
    reason: PAYTR_CLEARING_SCAN_NOOP_REASON,
  };
}

export function selectPaytrClearingCandidates(
  rows: ReadonlyArray<{ merchantOid?: string | null }>,
): PaytrClearingCandidate[] {
  return rows
    .map((row) => String(row.merchantOid ?? "").trim())
    .filter((merchantOid) => merchantOid.length > 0)
    .map((merchantOid) => ({ merchantOid }));
}

export function paytrClearingScanResult(
  pending: ReadonlyArray<PaytrClearingCandidate>,
): { dispatched: number } {
  return { dispatched: pending.length };
}
