import { canRefundContract } from "@/lib/freelancer/fsm";
import type { FreelancerStore } from "@/lib/freelancer/types";

export const FREELANCER_ESCROW_REFUND_PURPOSE = "freelancer" as const;

export type FreelancerEscrowRefundResult = { applied: boolean };

/** TTL / çekirdek iadesi sonrası dikey FSM — para çekirdekte yazılmıştır. */
export async function onEscrowRefunded(
  purpose: string,
  holdId: string,
  store: FreelancerStore,
  now: Date = new Date(),
): Promise<FreelancerEscrowRefundResult> {
  if (purpose !== FREELANCER_ESCROW_REFUND_PURPOSE) {
    return { applied: false };
  }
  const contract = await store.getContractByEscrowHoldId(holdId);
  if (!contract) {
    return { applied: false };
  }
  if (contract.status === "REFUNDED") {
    return { applied: false };
  }
  if (!canRefundContract(contract.status)) {
    return { applied: false };
  }
  await store.updateContract(contract.id, {
    status: "REFUNDED",
    refundedAt: now,
    updatedAt: now,
  });
  return { applied: true };
}

/** S51-A: anlaşmazlık süresince çekirdek TTL iade etmez; expiresAt dondurulur. */
export async function shouldFreezeEscrowTimeout(
  purpose: string,
  holdId: string,
  store: FreelancerStore,
): Promise<boolean> {
  if (purpose !== FREELANCER_ESCROW_REFUND_PURPOSE) {
    return false;
  }
  const contract = await store.getContractByEscrowHoldId(holdId);
  return contract?.status === "DISPUTED";
}
