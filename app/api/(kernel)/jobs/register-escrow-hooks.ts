import {
  registerEscrowRefundHook,
  registerEscrowTimeoutGuard,
  registerEscrowTtlApproachingHook,
} from "@/lib/kernel/escrow/refund-hooks";
import {
  FREELANCER_ESCROW_REFUND_PURPOSE,
  onEscrowRefunded as freelancerOnEscrowRefunded,
  shouldFreezeEscrowTimeout as freelancerShouldFreezeEscrowTimeout,
} from "@/lib/freelancer/escrow-refund";
import { onEscrowTtlApproaching as freelancerOnEscrowTtlApproaching } from "@/lib/freelancer/ttl-notice";

/**
 * Kompozisyon kökü (API dilimi). Donmuş oda iade kancası düşer;
 * yalnız freelancer (çalışan 4 oda) kayıtlıdır.
 */
export function registerVerticalEscrowRefundHooks(): void {
  registerEscrowRefundHook(FREELANCER_ESCROW_REFUND_PURPOSE, async (purpose, holdId) => {
    const { createPrismaFreelancerPorts } = await import("@/lib/freelancer/runtime");
    await freelancerOnEscrowRefunded(purpose, holdId, createPrismaFreelancerPorts().freelancer);
  });
  registerEscrowTimeoutGuard(FREELANCER_ESCROW_REFUND_PURPOSE, async (purpose, holdId) => {
    const { createPrismaFreelancerPorts } = await import("@/lib/freelancer/runtime");
    return freelancerShouldFreezeEscrowTimeout(
      purpose,
      holdId,
      createPrismaFreelancerPorts().freelancer,
    );
  });
  registerEscrowTtlApproachingHook(FREELANCER_ESCROW_REFUND_PURPOSE, async (purpose, holdId) => {
    const { createPrismaFreelancerPorts } = await import("@/lib/freelancer/runtime");
    await freelancerOnEscrowTtlApproaching(purpose, holdId, createPrismaFreelancerPorts().freelancer);
  });
}
