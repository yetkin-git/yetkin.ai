import type { PazaryeriStore } from "@/lib/pazaryeri/types";

export const PAZARYERI_ESCROW_REFUND_PURPOSE = "pazaryeri" as const;

export type PazaryeriEscrowRefundResult = { applied: boolean };

/** TTL iadesi: bekleyen teslim siparişi. Aktör kontrolü yok — çekirdek zaten iade etti. */
export async function onEscrowRefunded(
  purpose: string,
  holdId: string,
  store: PazaryeriStore,
  now: Date = new Date(),
): Promise<PazaryeriEscrowRefundResult> {
  if (purpose !== PAZARYERI_ESCROW_REFUND_PURPOSE) {
    return { applied: false };
  }
  const order = await store.getOrderByEscrowHoldId(holdId);
  if (!order) {
    return { applied: false };
  }
  if (order.status === "REFUNDED") {
    return { applied: false };
  }
  if (order.status !== "AWAITING_DELIVERY") {
    return { applied: false };
  }
  await store.updateOrder(order.id, {
    status: "REFUNDED",
    refundedAt: now,
    updatedAt: now,
  });
  return { applied: true };
}
