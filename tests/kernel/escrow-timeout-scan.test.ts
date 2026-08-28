import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ESCROW_HOLD_TTL_MS } from "@/lib/kernel/escrow/engine";
import {
  clearEscrowRefundHooks,
  listedEscrowRefundPurposes,
  registerEscrowRefundHook,
  registerEscrowTimeoutGuard,
} from "@/lib/kernel/escrow/refund-hooks";
import { runEscrowTimeoutRefunds } from "@/lib/kernel/jobs/escrow-timeout-scan";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { createEscrowHold } from "@/lib/kernel/escrow";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import {
  FREELANCER_ESCROW_REFUND_PURPOSE,
  onEscrowRefunded as freelancerOnEscrowRefunded,
  shouldFreezeEscrowTimeout as freelancerShouldFreeze,
} from "@/lib/freelancer/escrow-refund";
import { openFreelancerDispute } from "@/lib/freelancer/dispute-engine";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";

const CLIENT = "client-1";
const FREELANCER = "freelancer-1";
const PLATFORM = "00000000-0000-4000-8000-000000000001";

function world(clientBalance = 100_000) {
  const ledger = createMemoryLedgerStore([
    { userId: CLIENT, amountMinor: clientBalance },
    { userId: FREELANCER, amountMinor: 0 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const escrow = createMemoryEscrowStore();
  const freelancer = createMemoryFreelancerStore();
  return withMemoryAcceptAtomic({ ledger, escrow, freelancer });
}

describe("çekirdek emanet iade kancası", () => {
  beforeEach(() => {
    clearEscrowRefundHooks();
  });
  afterEach(() => {
    clearEscrowRefundHooks();
  });

  it("kayıtlı purpose ile onEscrowRefunded(purpose, holdId) basar", async () => {
    const seen: Array<{ purpose: string; holdId: string }> = [];
    registerEscrowRefundHook("freelancer", async (purpose, holdId) => {
      seen.push({ purpose, holdId });
    });
    expect(listedEscrowRefundPurposes()).toEqual(["freelancer"]);
    const { notifyEscrowRefunded } = await import("@/lib/kernel/escrow/refund-hooks");
    await notifyEscrowRefunded("hold-1");
    expect(seen).toEqual([{ purpose: "freelancer", holdId: "hold-1" }]);
  });

  it("süresi dolmuş PENDING hold'u iade eder; dikey kanca purpose+holdId alır; cüzdan CREDIT yazar", async () => {
    const ports = world();
    const fundedAt = new Date("2026-08-01T00:00:00.000Z");
    const { hold } = await createEscrowHold(ports, {
      userId: CLIENT,
      referenceKey: "kernel-only-hold",
      grossMinor: 10_000,
      holdBps: HOLD_BPS_DEFAULT,
      currencyCode: SETTLEMENT_CURRENCY,
      now: fundedAt,
      funding: "psp",
    });
    expect(hold.walletId).toBeNull();
    expect(hold.pspPaymentId).toBe("kernel-only-hold");
    const seen: string[] = [];
    registerEscrowRefundHook("pazaryeri", async (purpose, holdId) => {
      seen.push(`${purpose}:${holdId}`);
    });

    const scanAt = new Date(fundedAt.getTime() + ESCROW_HOLD_TTL_MS);
    const result = await runEscrowTimeoutRefunds(ports, { now: scanAt });

    expect(result.refunded).toBe(1);
    expect(result.frozen).toBe(0);
    expect(result.refundedHolds).toEqual([{ holdId: hold.id, referenceKey: "kernel-only-hold" }]);
    expect(seen).toEqual([`pazaryeri:${hold.id}`]);
    const refunded = await ports.escrow.findById(hold.id);
    expect(refunded?.status).toBe("REFUNDED");
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
  });

  it("guard freeze derse iade etmez; expiresAt dondurulur", async () => {
    const ports = world();
    const fundedAt = new Date("2026-08-01T00:00:00.000Z");
    const { hold } = await createEscrowHold(ports, {
      userId: CLIENT,
      referenceKey: "freeze-hold",
      grossMinor: 10_000,
      holdBps: HOLD_BPS_DEFAULT,
      currencyCode: SETTLEMENT_CURRENCY,
      now: fundedAt,
      funding: "psp",
    });
    registerEscrowTimeoutGuard("freelancer", async () => true);
    let hooked = 0;
    registerEscrowRefundHook("freelancer", async () => {
      hooked += 1;
    });

    const result = await runEscrowTimeoutRefunds(ports, {
      now: new Date(fundedAt.getTime() + ESCROW_HOLD_TTL_MS),
    });
    expect(result).toMatchObject({ refunded: 0, frozen: 1 });
    expect(hooked).toBe(0);
    const frozen = await ports.escrow.findById(hold.id);
    expect(frozen?.status).toBe("PENDING");
    expect(frozen?.expiresAt).toBeNull();
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
  });

  it("freelancer sözleşmesi TTL ile REFUNDED olur; DISPUTED dondurulur", async () => {
    const ports = world();
    const fundedAt = new Date("2026-08-01T00:00:00.000Z");
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "TTL ilan",
      brief: "Zaman aşımı iadesi.",
      budgetMinor: 25_000,
      now: fundedAt,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: FREELANCER,
      amountMinor: 25_000,
      coverNote: "Teslim 5 gün.",
      now: fundedAt,
    });
    const { contract } = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      holdBps: HOLD_BPS_DEFAULT,
      platformUserId: PLATFORM,
      now: fundedAt,
    });

    registerEscrowRefundHook(FREELANCER_ESCROW_REFUND_PURPOSE, async (purpose, holdId) => {
      await freelancerOnEscrowRefunded(purpose, holdId, ports.freelancer);
    });
    registerEscrowTimeoutGuard(FREELANCER_ESCROW_REFUND_PURPOSE, async (purpose, holdId) =>
      freelancerShouldFreeze(purpose, holdId, ports.freelancer),
    );

    const scanAt = new Date(fundedAt.getTime() + ESCROW_HOLD_TTL_MS);
    const refundedScan = await runEscrowTimeoutRefunds(ports, { now: scanAt });
    expect(refundedScan.refunded).toBe(1);
    const updated = await ports.freelancer.getContract(contract.id);
    expect(updated?.status).toBe("REFUNDED");
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);

    const ports2 = world();
    const job2 = await createFreelancerJob(ports2, {
      clientId: CLIENT,
      title: "Tahkim ilan",
      brief: "DISPUTED dondurulur.",
      budgetMinor: 25_000,
      now: fundedAt,
    });
    const bid2 = await submitFreelancerBid(ports2, {
      jobId: job2.id,
      bidderId: FREELANCER,
      amountMinor: 25_000,
      coverNote: "Teslim 5 gün.",
      now: fundedAt,
    });
    const accepted2 = await acceptFreelancerBid(ports2, {
      jobId: job2.id,
      bidId: bid2.id,
      actorUserId: CLIENT,
      holdBps: HOLD_BPS_DEFAULT,
      platformUserId: PLATFORM,
      now: fundedAt,
    });
    await openFreelancerDispute(ports2, {
      contractId: accepted2.contract.id,
      actorUserId: CLIENT,
      partyAClaim: "Teslim eksik kaldı.",
      now: fundedAt,
    });
    registerEscrowRefundHook(FREELANCER_ESCROW_REFUND_PURPOSE, async (purpose, holdId) => {
      await freelancerOnEscrowRefunded(purpose, holdId, ports2.freelancer);
    });
    registerEscrowTimeoutGuard(FREELANCER_ESCROW_REFUND_PURPOSE, async (purpose, holdId) =>
      freelancerShouldFreeze(purpose, holdId, ports2.freelancer),
    );
    const disputedScan = await runEscrowTimeoutRefunds(ports2, { now: scanAt });
    expect(disputedScan.refunded).toBe(0);
    const disputed = await ports2.freelancer.getContract(accepted2.contract.id);
    expect(disputed?.status).toBe("DISPUTED");
    expect(ports2.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
  });
});
