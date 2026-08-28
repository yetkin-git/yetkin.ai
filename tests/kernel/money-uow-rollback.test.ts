import { describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { freelancerJobEscrowReferenceKey } from "@/lib/freelancer/fsm";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";
import {
  createMemoryAcademyStore,
  memoryCourse,
  withMemoryAcademyAtomic,
} from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const PLATFORM = PLATFORM_TREASURY_USER_ID;
const BUYER = "academy-buyer-uow";
const CLIENT = "freelancer-client-uow";
const FREELANCER = "freelancer-usta-uow";
const COURSE_PRICE = 25_000;

describe("nakit Unit of Work — hata enjeksiyonu rollback (çalışan odalar)", () => {
  it("akademi: satın alma yazımı düşünce debit/credit geri alınır", async () => {
    const course = memoryCourse();
    const ledger = createMemoryLedgerStore([
      { userId: BUYER, amountMinor: 100_000 },
      { userId: PLATFORM, amountMinor: 0 },
    ]);
    const academy = createMemoryAcademyStore();
    const ports = withMemoryAcademyAtomic({
      ledger,
      catalog: createMemoryPriceCatalogStore([
        {
          moduleKey: ACADEMY_MODULE_KEY,
          unitKey: course.catalogUnitKey,
          amountMinor: COURSE_PRICE,
        },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy,
    });
    await academy.insertCourse(course);
    const locked = await lockAcademyCoursePrice(ports, {
      courseId: course.id,
      userId: BUYER,
      now: new Date("2026-08-19T00:00:00.000Z"),
    });
    academy.failNextPurchaseInsert();
    await expect(
      purchaseAcademyCourse(ports, {
        courseId: course.id,
        userId: BUYER,
        lockId: locked.lock.id,
        platformUserId: PLATFORM,
        now: new Date("2026-08-19T00:01:00.000Z"),
      }),
    ).rejects.toThrow(/Satın alma yazımı düştü/);
    expect(ledger.snapshot(BUYER).amountMinor).toBe(100_000);
    expect(ledger.snapshot(PLATFORM).amountMinor).toBe(0);
    expect(ledger.listEntries()).toHaveLength(0);
    expect(await academy.getPurchaseByUserAndCourse(BUYER, course.id)).toBeNull();
    expect((await ports.locks.findById(locked.lock.id))?.consumedAt).toBeNull();
  });

  it("freelancer: sözleşme yazımı düşünce hold geri alınır; yetim emanet kalmaz", async () => {
    const ports = withMemoryAcceptAtomic({
      ledger: createMemoryLedgerStore([
        { userId: CLIENT, amountMinor: 100_000 },
        { userId: FREELANCER, amountMinor: 0 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      escrow: createMemoryEscrowStore(),
      freelancer: createMemoryFreelancerStore(),
    });
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "Atomik kabul UoW",
      brief: "Hold ve sözleşme aynı birimde yazılacak.",
      budgetMinor: 25_000,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: FREELANCER,
      amountMinor: 25_000,
      coverNote: "Hazırım.",
    });
    ports.freelancer.failNextContractInsert();
    await expect(
      acceptFreelancerBid(ports, {
        jobId: job.id,
        bidId: bid.id,
        actorUserId: CLIENT,
        holdBps: HOLD_BPS_DEFAULT,
      }),
    ).rejects.toThrow(/Sözleşme yazımı düştü/);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
    expect(ports.ledger.listEntries()).toHaveLength(0);
    expect(await ports.escrow.findByReferenceKey(freelancerJobEscrowReferenceKey(job.id))).toBeNull();
    expect(await ports.freelancer.getContractByJobId(job.id)).toBeNull();
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("OPEN");
    expect((await ports.freelancer.getBid(bid.id))?.status).toBe("SUBMITTED");
  });
});
