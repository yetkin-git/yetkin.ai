import { describe, expect, it } from "vitest";
import { onEscrowRefunded as arenaOnEscrowRefunded } from "@/lib/arena/escrow-refund";
import { onEscrowRefunded as freelancerOnEscrowRefunded } from "@/lib/freelancer/escrow-refund";
import { onEscrowRefunded as kurumsalOnEscrowRefunded } from "@/lib/kurumsal/escrow-refund";
import { onEscrowRefunded as pazaryeriOnEscrowRefunded } from "@/lib/pazaryeri/escrow-refund";
import { createMemoryArenaStore } from "../helpers/memory-arena";
import { createMemoryKurumsalStore } from "../helpers/memory-kurumsal";
import { createMemoryFreelancerStore } from "../helpers/memory-money";
import { createMemoryPazaryeriStore } from "../helpers/memory-pazaryeri";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";

const now = new Date("2026-08-15T00:00:00.000Z");

describe("dikey onEscrowRefunded FSM", () => {
  it("yabancı purpose ve bulunamayan hold no-op; uygun satır REFUNDED olur", async () => {
    const freelancer = createMemoryFreelancerStore();
    const kurumsal = createMemoryKurumsalStore();
    const arena = createMemoryArenaStore();
    const pazaryeri = createMemoryPazaryeriStore();

    expect(await freelancerOnEscrowRefunded("kurumsal", "h1", freelancer, now)).toEqual({
      applied: false,
    });
    expect(await kurumsalOnEscrowRefunded("freelancer", "h1", kurumsal, now)).toEqual({
      applied: false,
    });
    expect(await arenaOnEscrowRefunded("pazaryeri", "h1", arena, now)).toEqual({ applied: false });
    expect(await pazaryeriOnEscrowRefunded("arena", "h1", pazaryeri, now)).toEqual({
      applied: false,
    });

    await freelancer.insertJob({
      id: "job-1",
      clientId: "c1",
      title: "İş",
      brief: "Brief yeterince uzun.",
      budgetMinor: toAmountMinor(10_000),
      currencyCode: SETTLEMENT_CURRENCY,
      status: "AWARDED",
      createdAt: now,
      updatedAt: now,
    });
    await freelancer.insertBid({
      id: "bid-1",
      jobId: "job-1",
      bidderId: "f1",
      amountMinor: toAmountMinor(10_000),
      currencyCode: SETTLEMENT_CURRENCY,
      coverNote: "Teslim notu.",
      status: "ACCEPTED",
      createdAt: now,
      updatedAt: now,
    });
    const contract = await freelancer.insertContract({
      id: "ct-1",
      jobId: "job-1",
      bidId: "bid-1",
      clientId: "c1",
      freelancerId: "f1",
      escrowHoldId: "hold-f",
      status: "FUNDED",
      currencyCode: SETTLEMENT_CURRENCY,
      grossMinor: toAmountMinor(10_000),
      holdMinor: toAmountMinor(1_000),
      netMinor: toAmountMinor(9_000),
      holdBps: 1000,
      fundedAt: now,
      releasedAt: null,
      refundedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    expect(await freelancerOnEscrowRefunded("freelancer", contract.escrowHoldId, freelancer, now)).toEqual({
      applied: true,
    });
    expect((await freelancer.getContract(contract.id))?.status).toBe("REFUNDED");
  });
});
