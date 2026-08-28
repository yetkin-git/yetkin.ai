import { describe, expect, it } from "vitest";
import { onEscrowRefunded as freelancerOnEscrowRefunded } from "@/lib/freelancer/escrow-refund";
import { createMemoryFreelancerStore } from "../helpers/memory-money";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";

const now = new Date("2026-08-15T00:00:00.000Z");

describe("dikey onEscrowRefunded FSM — freelancer (çalışan oda)", () => {
  it("yabancı purpose ve bulunamayan hold no-op; uygun satır REFUNDED olur", async () => {
    const freelancer = createMemoryFreelancerStore();

    expect(await freelancerOnEscrowRefunded("kurumsal", "h1", freelancer, now)).toEqual({
      applied: false,
    });
    expect(await freelancerOnEscrowRefunded("freelancer", "missing-hold", freelancer, now)).toEqual({
      applied: false,
    });

    await freelancer.insertJob({
      id: "job-1",
      clientId: "c1",
      title: "İş",
      brief: "Brief yeterince uzun.",
      budgetMinor: toAmountMinor(10_000),
      currencyCode: SETTLEMENT_CURRENCY,
      visaPathwayId: "uiux-tasarim-sistemleri",
      visibility: "PUBLIC",
      inviteeId: null,
      dueDays: null,
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
