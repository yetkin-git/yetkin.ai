import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { createEscrowHold } from "@/lib/kernel/escrow";
import { ConflictError } from "@/lib/kernel/http/errors";
import { RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE } from "@/lib/kernel/http/v1-contract";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  isFreelancerUniqueViolation,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { freelancerJobEscrowReferenceKey } from "@/lib/freelancer/fsm";
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
  return withMemoryAcceptAtomic({
    ledger: createMemoryLedgerStore([
      { userId: CLIENT, amountMinor: clientBalance },
      { userId: FREELANCER, amountMinor: 0 },
      { userId: PLATFORM, amountMinor: 0 },
    ]),
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });
}

async function openJobWithBid(ports: ReturnType<typeof world>, amountMinor = 10_000) {
  const job = await createFreelancerJob(ports, {
    clientId: CLIENT,
    title: "Atomik kabul",
    brief: "Hold ve sözleşme aynı birimde yazılacak.",
    budgetMinor: amountMinor,
  });
  const bid = await submitFreelancerBid(ports, {
    jobId: job.id,
    bidderId: FREELANCER,
    amountMinor,
    coverNote: "Hazırım.",
  });
  return { job, bid };
}

describe("freelancer teklif kabulü — atomik emanet", () => {
  it("ilk kabul hold+sözleşme yazar; ikinci çağrı aynı sözleşmeyi döner, bakiyeyi iki kez düşmez", async () => {
    const ports = world();
    const { job, bid } = await openJobWithBid(ports);
    const first = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      holdBps: HOLD_BPS_DEFAULT,
    });
    expect(first.applied).toBe(true);
    expect(first.healed).toBe(false);
    expect(first.contract.status).toBe("FUNDED");
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);
    const hold = await ports.escrow.findByReferenceKey(freelancerJobEscrowReferenceKey(job.id));
    expect(hold?.status).toBe("PENDING");
    expect(hold?.id).toBe(first.contract.escrowHoldId);

    const second = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
    });
    expect(second.applied).toBe(false);
    expect(second.healed).toBe(false);
    expect(second.contract.id).toBe(first.contract.id);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);
    expect(await ports.freelancer.getContractByJobId(job.id)).toEqual(first.contract);
  });

  it("sözleşme yazımı düşünce debit ve hold geri alınır; yetim emanet kalmaz", async () => {
    const ports = world();
    const { job, bid } = await openJobWithBid(ports);
    ports.freelancer.failNextContractInsert();
    await expect(
      acceptFreelancerBid(ports, {
        jobId: job.id,
        bidId: bid.id,
        actorUserId: CLIENT,
      }),
    ).rejects.toThrow(/Sözleşme yazımı düştü/);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
    expect(await ports.escrow.findByReferenceKey(freelancerJobEscrowReferenceKey(job.id))).toBeNull();
    expect(await ports.freelancer.getContractByJobId(job.id)).toBeNull();
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("OPEN");
    expect((await ports.freelancer.getBid(bid.id))?.status).toBe("SUBMITTED");
  });

  it("hold yazımı düşünce debit geri alınır; sözleşme basılmaz", async () => {
    const ports = world();
    const { job, bid } = await openJobWithBid(ports);
    ports.escrow.failNextHoldInsert();
    await expect(
      acceptFreelancerBid(ports, {
        jobId: job.id,
        bidId: bid.id,
        actorUserId: CLIENT,
      }),
    ).rejects.toThrow(/Emanet hold yazımı düştü/);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
    expect(await ports.escrow.findByReferenceKey(freelancerJobEscrowReferenceKey(job.id))).toBeNull();
    expect(await ports.freelancer.getContractByJobId(job.id)).toBeNull();
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("OPEN");
  });

  it("yetim hold (sözleşme yok) aynı anahtarla onarılır; ikinci debit yazılmaz", async () => {
    const ports = world();
    const { job, bid } = await openJobWithBid(ports);
    const orphan = await createEscrowHold(
      { ledger: ports.ledger, escrow: ports.escrow },
      {
        userId: CLIENT,
        referenceKey: freelancerJobEscrowReferenceKey(job.id),
        grossMinor: bid.amountMinor,
        holdBps: HOLD_BPS_DEFAULT,
        currencyCode: bid.currencyCode,
      },
    );
    expect(orphan.applied).toBe(true);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);
    expect(await ports.freelancer.getContractByJobId(job.id)).toBeNull();

    const healed = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      holdBps: HOLD_BPS_DEFAULT,
    });
    expect(healed.applied).toBe(false);
    expect(healed.healed).toBe(true);
    expect(healed.contract.escrowHoldId).toBe(orphan.hold.id);
    expect(healed.contract.status).toBe("FUNDED");
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("AWARDED");

    const again = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
    });
    expect(again.applied).toBe(false);
    expect(again.healed).toBe(false);
    expect(again.contract.id).toBe(healed.contract.id);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);
  });

  it("AWARDED okumasında mevcut sözleşmeye döner (TOCTOU); bakiyeyi iki kez düşmez", async () => {
    const ports = world();
    const { job, bid } = await openJobWithBid(ports);
    const winner = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      holdBps: HOLD_BPS_DEFAULT,
    });
    ports.freelancer.skipNextContractLookup();
    const raced = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
    });
    expect(raced.applied).toBe(false);
    expect(raced.healed).toBe(false);
    expect(raced.contract.id).toBe(winner.contract.id);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);
  });

  it("eşzamanlı unique (P2002) sonrası mevcut sözleşmeyi okur; kaybeden yeni debit basmaz", async () => {
    const ports = world();
    const { job, bid } = await openJobWithBid(ports);
    const now = new Date("2026-08-14T12:00:00.000Z");
    const orphan = await createEscrowHold(
      { ledger: ports.ledger, escrow: ports.escrow },
      {
        userId: CLIENT,
        referenceKey: freelancerJobEscrowReferenceKey(job.id),
        grossMinor: bid.amountMinor,
        holdBps: HOLD_BPS_DEFAULT,
        currencyCode: bid.currencyCode,
        now,
      },
    );
    const preloaded = await ports.freelancer.insertContract({
      id: "pre-contract",
      jobId: job.id,
      bidId: bid.id,
      clientId: CLIENT,
      freelancerId: FREELANCER,
      escrowHoldId: orphan.hold.id,
      status: "FUNDED",
      currencyCode: orphan.hold.currencyCode,
      grossMinor: orphan.hold.grossMinor,
      holdMinor: orphan.hold.holdMinor,
      netMinor: orphan.hold.netMinor,
      holdBps: orphan.hold.holdBps,
      fundedAt: now,
      releasedAt: null,
      refundedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    ports.freelancer.skipNextContractLookup();
    ports.freelancer.skipNextContractLookup();
    const raced = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      now,
    });

    expect(isFreelancerUniqueViolation(Object.assign(new Error("x"), { code: "P2002" }))).toBe(true);
    expect(isFreelancerUniqueViolation(new Error("Sözleşme yazımı düştü."))).toBe(false);
    expect(raced.applied).toBe(false);
    expect(raced.healed).toBe(false);
    expect(raced.contract.id).toBe(preloaded.id);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);
    expect((await ports.freelancer.listContractsForUser(CLIENT)).length).toBe(1);
  });

  it("yetersiz bakiyede fail-closed: hold yok, sözleşme yok, ilan OPEN, bakiye aynı", async () => {
    const ports = world(500);
    const { job, bid } = await openJobWithBid(ports);
    await expect(
      acceptFreelancerBid(ports, {
        jobId: job.id,
        bidId: bid.id,
        actorUserId: CLIENT,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    await expect(
      acceptFreelancerBid(ports, {
        jobId: job.id,
        bidId: bid.id,
        actorUserId: CLIENT,
      }),
    ).rejects.toThrow(RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(500);
    expect(await ports.freelancer.getContractByJobId(job.id)).toBeNull();
    expect(await ports.escrow.findByReferenceKey(freelancerJobEscrowReferenceKey(job.id))).toBeNull();
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("OPEN");
  });
});
