import { canRefundTender } from "@/lib/arena/fsm";
import type { ArenaStore } from "@/lib/arena/types";

export const ARENA_ESCROW_REFUND_PURPOSE = "arena" as const;

export type ArenaEscrowRefundResult = { applied: boolean };

export async function onEscrowRefunded(
  purpose: string,
  holdId: string,
  store: ArenaStore,
  now: Date = new Date(),
): Promise<ArenaEscrowRefundResult> {
  if (purpose !== ARENA_ESCROW_REFUND_PURPOSE) {
    return { applied: false };
  }
  const tender = await store.getTenderByEscrowHoldId(holdId);
  if (!tender) {
    return { applied: false };
  }
  if (tender.status === "REFUNDED") {
    return { applied: false };
  }
  if (!canRefundTender(tender.status)) {
    return { applied: false };
  }
  await store.updateTender(tender.id, {
    status: "REFUNDED",
    round: "CLOSED",
    refundedAt: now,
    updatedAt: now,
  });
  return { applied: true };
}
