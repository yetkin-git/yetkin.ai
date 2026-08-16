import {
  registerEscrowRefundHook,
  registerEscrowTimeoutGuard,
} from "@/lib/kernel/escrow/refund-hooks";
import { ARENA_ESCROW_REFUND_PURPOSE, onEscrowRefunded as arenaOnEscrowRefunded } from "@/lib/arena/escrow-refund";
import {
  FREELANCER_ESCROW_REFUND_PURPOSE,
  onEscrowRefunded as freelancerOnEscrowRefunded,
  shouldFreezeEscrowTimeout as freelancerShouldFreezeEscrowTimeout,
} from "@/lib/freelancer/escrow-refund";
import {
  KURUMSAL_ESCROW_REFUND_PURPOSE,
  onEscrowRefunded as kurumsalOnEscrowRefunded,
} from "@/lib/kurumsal/escrow-refund";
import {
  onEscrowRefunded as pazaryeriOnEscrowRefunded,
  PAZARYERI_ESCROW_REFUND_PURPOSE,
} from "@/lib/pazaryeri/escrow-refund";

/**
 * Kompozisyon kökü (API dilimi). Çekirdek dikey import etmez;
 * Inngest serve bu dosyayı yükler, kancalar kayıt olur.
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

  registerEscrowRefundHook(KURUMSAL_ESCROW_REFUND_PURPOSE, async (purpose, holdId) => {
    const { createPrismaKurumsalPorts } = await import("@/lib/kurumsal/runtime");
    await kurumsalOnEscrowRefunded(purpose, holdId, createPrismaKurumsalPorts().kurumsal);
  });

  registerEscrowRefundHook(ARENA_ESCROW_REFUND_PURPOSE, async (purpose, holdId) => {
    const { createPrismaArenaPorts } = await import("@/lib/arena/runtime");
    await arenaOnEscrowRefunded(purpose, holdId, createPrismaArenaPorts().arena);
  });

  registerEscrowRefundHook(PAZARYERI_ESCROW_REFUND_PURPOSE, async (purpose, holdId) => {
    const { createPrismaPazaryeriPorts } = await import("@/lib/pazaryeri/runtime");
    await pazaryeriOnEscrowRefunded(purpose, holdId, createPrismaPazaryeriPorts().pazaryeri);
  });
}
