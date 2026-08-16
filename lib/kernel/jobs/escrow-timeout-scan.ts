/**
 * Emanet TTL tarama — Inngest adımından bağımsız.
 * Çekirdek yalnız EscrowHold + Ledger iade eder; dikey FSM kancaya aittir (K7).
 */

import { refundEscrowHold } from "@/lib/kernel/escrow/engine";
import {
  notifyEscrowRefunded,
  shouldFreezeEscrowTimeout,
} from "@/lib/kernel/escrow/refund-hooks";
import type { EscrowStore } from "@/lib/kernel/escrow/types";
import type { LedgerStore } from "@/lib/kernel/ledger/types";

export type EscrowRefundedEvent = {
  holdId: string;
  referenceKey: string;
};

export type EscrowTimeoutScanResult = {
  refunded: number;
  frozen: number;
  refundedHolds: EscrowRefundedEvent[];
};

export function escrowTimeoutScanResult(
  refundedHolds: ReadonlyArray<EscrowRefundedEvent>,
  frozen: number,
): EscrowTimeoutScanResult {
  return {
    refunded: refundedHolds.length,
    frozen,
    refundedHolds: [...refundedHolds],
  };
}

export async function runEscrowTimeoutRefunds(
  ports: { ledger: LedgerStore; escrow: EscrowStore },
  options: {
    now?: Date;
    shouldFreeze?: (holdId: string) => Promise<boolean>;
    onHoldRefunded?: (holdId: string) => Promise<void>;
  } = {},
): Promise<EscrowTimeoutScanResult> {
  const now = options.now ?? new Date();
  const shouldFreeze = options.shouldFreeze ?? shouldFreezeEscrowTimeout;
  const onHoldRefunded = options.onHoldRefunded ?? notifyEscrowRefunded;

  const expired = await ports.escrow.listExpiredPending(now);
  const refundedHolds: EscrowRefundedEvent[] = [];
  let frozen = 0;

  for (const hold of expired) {
    if (await shouldFreeze(hold.id)) {
      await ports.escrow.freezeExpiry(hold.id);
      frozen += 1;
      continue;
    }
    await refundEscrowHold(ports, { referenceKey: hold.referenceKey, now });
    refundedHolds.push({ holdId: hold.id, referenceKey: hold.referenceKey });
    try {
      await onHoldRefunded(hold.id);
    } catch (error) {
      void error;
    }
  }

  return escrowTimeoutScanResult(refundedHolds, frozen);
}
