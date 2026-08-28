import { canRefundPosting } from "@/lib/kurumsal/fsm";
import type { KurumsalStore } from "@/lib/kurumsal/types";

export const KURUMSAL_ESCROW_REFUND_PURPOSE = "kurumsal" as const;

export type KurumsalEscrowRefundResult = { applied: boolean };

export async function onEscrowRefunded(
  purpose: string,
  holdId: string,
  store: KurumsalStore,
  now: Date = new Date(),
): Promise<KurumsalEscrowRefundResult> {
  if (purpose !== KURUMSAL_ESCROW_REFUND_PURPOSE) {
    return { applied: false };
  }
  const posting = await store.getPostingByEscrowHoldId(holdId);
  if (!posting) {
    return { applied: false };
  }
  if (posting.status === "REFUNDED") {
    return { applied: false };
  }
  if (!canRefundPosting(posting.status)) {
    return { applied: false };
  }
  await store.updatePosting(posting.id, {
    status: "REFUNDED",
    refundedAt: now,
    updatedAt: now,
  });
  return { applied: true };
}
