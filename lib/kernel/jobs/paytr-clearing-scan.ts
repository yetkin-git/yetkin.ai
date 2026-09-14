/**
 * PayTR valör tarama seçimi — Inngest adımından bağımsız, sınır testi için saf.
 * Boş / yalnızca boşluk `merchantOid` aday değildir; dispatched = gönderilen sayı.
 * Port `unconfigured` iken tarama no-op: DB hit yok, sahte PENDING avı yok.
 */

import { isPaymentsPortConfigured } from "@/lib/kernel/payments/port";
import { isLiveBroadcastShutdownEnvActive } from "@/lib/kernel/http/live-broadcast-shutdown";

export type PaytrClearingCandidate = { merchantOid: string };

/** FAILED siparişler bu pencerede PSP'ye yeniden sorulur (geç paid recovery). */
export const PAYTR_FAILED_RECOVERY_MS = 7 * 24 * 60 * 60 * 1000;

export const PAYTR_CLEARING_SCAN_NOOP_REASON = "payments_port_unconfigured" as const;
export const PAYTR_CLEARING_SCAN_SHUTDOWN_REASON = "live_broadcast_shutdown" as const;

export type PaytrClearingScanNoOpReason =
  | typeof PAYTR_CLEARING_SCAN_NOOP_REASON
  | typeof PAYTR_CLEARING_SCAN_SHUTDOWN_REASON;

export type PaytrClearingScanNoOpResult = {
  dispatched: 0;
  noop: true;
  reason: PaytrClearingScanNoOpReason;
};

export function paytrFailedRecoveryAfter(now: Date): Date {
  return new Date(now.getTime() - PAYTR_FAILED_RECOVERY_MS);
}

/** Merchant üçlüsü yoksa veya canlı yayın kapalıysa valör tarama DB'ye inmez. */
export function shouldNoOpPaytrClearingScan(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (isLiveBroadcastShutdownEnvActive(env)) {
    return true;
  }
  return !isPaymentsPortConfigured(env);
}

export function paytrClearingScanNoOpResult(
  env: Record<string, string | undefined> = process.env,
): PaytrClearingScanNoOpResult {
  return {
    dispatched: 0,
    noop: true,
    reason: isLiveBroadcastShutdownEnvActive(env)
      ? PAYTR_CLEARING_SCAN_SHUTDOWN_REASON
      : PAYTR_CLEARING_SCAN_NOOP_REASON,
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
