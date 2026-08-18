import { emitCitizenNotice } from "@/lib/kernel/notice/emit";
import { FREELANCER_ESCROW_REFUND_PURPOSE } from "@/lib/freelancer/escrow-refund";
import type { FreelancerStore } from "@/lib/freelancer/types";

/** Çekirdek ödeyeni bildirir; bu kanca yalnız ustayı (freelancerId) bildirir. */
export async function onEscrowTtlApproaching(
  purpose: string,
  holdId: string,
  store: FreelancerStore,
): Promise<{ applied: boolean }> {
  if (purpose !== FREELANCER_ESCROW_REFUND_PURPOSE) {
    return { applied: false };
  }
  const contract = await store.getContractByEscrowHoldId(holdId);
  if (!contract || contract.status !== "FUNDED") {
    return { applied: false };
  }
  emitCitizenNotice({
    kind: "escrow_ttl_approaching",
    userId: contract.freelancerId,
    reference: holdId,
    amountMinor: contract.grossMinor,
    applied: true,
  });
  return { applied: true };
}
