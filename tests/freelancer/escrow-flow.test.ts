import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { paytrMarketplaceSplitPort } from "@/lib/kernel/payments/marketplace-split";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  refundFreelancerContract,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { openFreelancerDispute } from "@/lib/freelancer/dispute-engine";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";

const CLIENT = "client-1";
const FREELANCER = "freelancer-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

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

describe("freelancer emanet mutlu yolu", () => {
  it("ilan → teklif → hold: gross = hold + net; release split ile hold kapanır, usta CREDIT yok", async () => {
    const ports = world();
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "Landing sayfası",
      brief: "Tek sayfa, mühürlü teslim.",
      budgetMinor: 25_000,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: FREELANCER,
      amountMinor: 25_000,
      coverNote: "Teslim 5 gün.",
    });
    const { contract } = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      holdBps: HOLD_BPS_DEFAULT,
      platformUserId: PLATFORM,
    });

    expect(contract.status).toBe("FUNDED");
    expect(contract.holdBps).toBe(1000);
    expect(contract.grossMinor).toBe(25_000);
    expect(contract.holdMinor).toBe(2_500);
    expect(contract.netMinor).toBe(22_500);
    expect(contract.holdMinor + contract.netMinor).toBe(contract.grossMinor);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(0);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);

    const hold = await ports.escrow.findById(contract.escrowHoldId);
    expect(hold?.status).toBe("PENDING");

    const released = await releaseFreelancerContract(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });
    expect(released.status).toBe("RELEASED");
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(0);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
    const settledHold = await ports.escrow.findById(contract.escrowHoldId);
    expect(settledHold?.status).toBe("RELEASED");
  });

  it("anlaşmazlık öncesi iptalde brüt müşteriye iade edilir; DISPUTED iade edilmez", async () => {
    const ports = world();
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "API işi",
      brief: "REST uçları, testli teslim.",
      budgetMinor: 50_000,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: FREELANCER,
      amountMinor: 50_000,
      coverNote: "Kapsam net.",
    });
    const { contract } = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);

    const refunded = await refundFreelancerContract(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });

    expect(refunded.status).toBe("REFUNDED");
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(0);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
    const hold = await ports.escrow.findById(contract.escrowHoldId);
    expect(hold?.status).toBe("REFUNDED");
  });

  it("tahkim açılınca TTL donar ve mutlu yol iadesi kapanır", async () => {
    const ports = world();
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "API işi",
      brief: "REST uçları, testli teslim ve kanıt.",
      budgetMinor: 50_000,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: FREELANCER,
      amountMinor: 50_000,
      coverNote: "Kapsam net.",
    });
    const { contract } = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });
    await openFreelancerDispute(ports, {
      contractId: contract.id,
      actorUserId: FREELANCER,
      partyAClaim: "Kapsam kaydı; iade tahkimde çözülecek.",
    });
    await expect(
      refundFreelancerContract(ports, {
        contractId: contract.id,
        actorUserId: CLIENT,
      }),
    ).rejects.toThrow();
    const hold = await ports.escrow.findById(contract.escrowHoldId);
    expect(hold?.status).toBe("PENDING");
    expect(hold?.expiresAt).toBeNull();
  });

  it("PSP yoksa hold açılmaz; düşük Rail bakiyesi DEBIT yazmaz", async () => {
    const ports = withMemoryAcceptAtomic({
      ledger: createMemoryLedgerStore([
        { userId: CLIENT, amountMinor: 500 },
        { userId: FREELANCER, amountMinor: 0 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      escrow: createMemoryEscrowStore(),
      freelancer: createMemoryFreelancerStore(),
      marketplace: paytrMarketplaceSplitPort,
    });
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "Küçük bütçe tuzağı",
      brief: "Bakiye yetmezken kilit denemesi.",
      budgetMinor: 25_000,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: FREELANCER,
      amountMinor: 25_000,
      coverNote: "Hazırım.",
    });
    await expect(
      acceptFreelancerBid(ports, {
        jobId: job.id,
        bidId: bid.id,
        actorUserId: CLIENT,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow();
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(500);
    expect(await ports.freelancer.getContractByJobId(job.id)).toBeNull();
  });

  it("FUNDED sözleşme iade edilir; usta CREDIT yok", async () => {
    const ports = world();
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "Bitti",
      brief: "Teslim edildi, serbest bırakıldı.",
      budgetMinor: 25_000,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: FREELANCER,
      amountMinor: 25_000,
      coverNote: "Bitti.",
    });
    const { contract } = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });
    const refunded = await refundFreelancerContract(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
    });
    expect(refunded.status).toBe("REFUNDED");
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(0);
  });
});
