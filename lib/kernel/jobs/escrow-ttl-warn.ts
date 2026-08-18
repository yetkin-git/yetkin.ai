/**
 * Emanet TTL yaklaşım tarama — Inngest adımından bağımsız.
 * Yeni tablo yok: mevcut EscrowHold.expiresAt penceresi.
 */

import { ESCROW_TTL_WARN_WINDOW_MS } from "@/lib/kernel/escrow/engine";
import { notifyEscrowTtlApproaching } from "@/lib/kernel/escrow/refund-hooks";
import type { EscrowHoldRecord, EscrowStore } from "@/lib/kernel/escrow/types";
import { emitCitizenNotice } from "@/lib/kernel/notice/emit";

export type EscrowTtlApproachingEvent = {
  holdId: string;
  referenceKey: string;
};

export type EscrowTtlWarnScanResult = {
  warned: number;
  holds: EscrowTtlApproachingEvent[];
};

export function escrowTtlWarnScanResult(
  holds: ReadonlyArray<EscrowTtlApproachingEvent>,
): EscrowTtlWarnScanResult {
  return { warned: holds.length, holds: [...holds] };
}

export function isEscrowTtlApproaching(
  hold: Pick<EscrowHoldRecord, "status" | "expiresAt">,
  now: Date,
  windowMs: number = ESCROW_TTL_WARN_WINDOW_MS,
): boolean {
  if (hold.status !== "PENDING" || hold.expiresAt === null) {
    return false;
  }
  const at = hold.expiresAt.getTime();
  const until = now.getTime() + windowMs;
  return at > now.getTime() && at <= until;
}

export async function selectEscrowTtlApproachingHolds(
  ports: { escrow: EscrowStore },
  options: { now?: Date; windowMs?: number } = {},
): Promise<EscrowTtlApproachingEvent[]> {
  const now = options.now ?? new Date();
  const windowMs = options.windowMs ?? ESCROW_TTL_WARN_WINDOW_MS;
  const until = new Date(now.getTime() + windowMs);
  const pending = await ports.escrow.listPendingExpiringSoon(now, until);
  return pending.map((hold) => ({ holdId: hold.id, referenceKey: hold.referenceKey }));
}

export async function applyEscrowTtlApproachingNotice(
  ports: { escrow: EscrowStore },
  holdId: string,
  options: {
    now?: Date;
    windowMs?: number;
    onHoldApproaching?: (holdId: string) => Promise<void>;
  } = {},
): Promise<{ applied: boolean }> {
  const hold = await ports.escrow.findById(holdId);
  if (!hold) {
    return { applied: false };
  }
  const now = options.now ?? new Date();
  if (!isEscrowTtlApproaching(hold, now, options.windowMs ?? ESCROW_TTL_WARN_WINDOW_MS)) {
    return { applied: false };
  }
  emitCitizenNotice({
    kind: "escrow_ttl_approaching",
    userId: hold.userId,
    reference: hold.id,
    amountMinor: hold.grossMinor,
    applied: true,
  });
  const onHoldApproaching = options.onHoldApproaching ?? notifyEscrowTtlApproaching;
  try {
    await onHoldApproaching(hold.id);
  } catch (error) {
    void error;
  }
  return { applied: true };
}

export async function runEscrowTtlApproachingNotices(
  ports: { escrow: EscrowStore },
  options: {
    now?: Date;
    windowMs?: number;
    onHoldApproaching?: (holdId: string) => Promise<void>;
  } = {},
): Promise<EscrowTtlWarnScanResult> {
  const selected = await selectEscrowTtlApproachingHolds(ports, options);
  const holds: EscrowTtlApproachingEvent[] = [];
  for (const row of selected) {
    const result = await applyEscrowTtlApproachingNotice(ports, row.holdId, options);
    if (result.applied) {
      holds.push(row);
    }
  }
  return escrowTtlWarnScanResult(holds);
}
