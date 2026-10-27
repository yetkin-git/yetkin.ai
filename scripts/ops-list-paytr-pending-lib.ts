/**
 * PENDING PayTR sipariş listesi — saf biçimlendirme.
 * Yaş, `PAYTR_PENDING_TIMEOUT_MS` tavanına göre sınıflandırılır. Yazma yok.
 */

import { PAYTR_PENDING_TIMEOUT_MS } from "@/lib/kernel/payments/paytr/reconcile";

export type PaytrPendingRow = {
  merchantOid: string;
  purpose: string;
  amountMinor: number;
  currencyCode: string;
  createdAt: Date;
  userId: string;
};

export type PaytrStaleClass = "within_window" | "timed_out";

export function classifyPaytrPending(createdAt: Date, now: Date): PaytrStaleClass {
  return now.getTime() - createdAt.getTime() >= PAYTR_PENDING_TIMEOUT_MS
    ? "timed_out"
    : "within_window";
}

export function paytrPendingAgeHours(createdAt: Date, now: Date): number {
  return Math.round(((now.getTime() - createdAt.getTime()) / 3_600_000) * 10) / 10;
}

export function formatPaytrPendingList(
  rows: readonly PaytrPendingRow[],
  now: Date = new Date(),
): string {
  if (rows.length === 0) {
    return "PENDING PayTR siparişi yok.";
  }
  const lines = rows.map((row, index) => {
    const stale = classifyPaytrPending(row.createdAt, now);
    return [
      `${index + 1}. ${row.merchantOid}`,
      `   purpose=${row.purpose}`,
      `   amount=${row.amountMinor} ${row.currencyCode}`,
      `   age=${paytrPendingAgeHours(row.createdAt, now)}h`,
      `   class=${stale}`,
      `   user=${row.userId}`,
    ].join("\n");
  });
  return lines.join("\n");
}

export function paytrPendingSummary(
  rows: readonly PaytrPendingRow[],
  now: Date = new Date(),
): { total: number; timedOut: number; withinWindow: number; oldestHours: number } {
  const timedOut = rows.filter((row) => classifyPaytrPending(row.createdAt, now) === "timed_out").length;
  const oldestHours = rows.reduce(
    (max, row) => Math.max(max, paytrPendingAgeHours(row.createdAt, now)),
    0,
  );
  return {
    total: rows.length,
    timedOut,
    withinWindow: rows.length - timedOut,
    oldestHours,
  };
}
