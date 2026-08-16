/**
 * PayTR valör tarama seçimi — Inngest adımından bağımsız, sınır testi için saf.
 * Boş / yalnızca boşluk `merchantOid` aday değildir; dispatched = gönderilen sayı.
 */

export type PaytrClearingCandidate = { merchantOid: string };

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
