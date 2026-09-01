import { describe, expect, it } from "vitest";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE } from "@/lib/kernel/http/v1-contract";
import { paytrMarketplaceSplitPort } from "@/lib/kernel/payments/marketplace-split";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  signedLedgerSum,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";
import {
  CITIZEN_CASH_RING_CLIENT_ID,
  CITIZEN_CASH_RING_CLIENT_START_MINOR,
  CITIZEN_CASH_RING_GROSS_MINOR,
  CITIZEN_CASH_RING_ID,
  CITIZEN_CASH_RING_PLATFORM_ID,
  CITIZEN_CASH_RING_TOP_UP_MINOR,
  formatCitizenCashRingReport,
  runCitizenCashRingJourney,
} from "../helpers/citizen-cash-ring-journey";

describe("laboratuvar vatandaş nakit halkası", () => {
  it("PayTR CREDIT → Akademi DEBIT → freelancer hold (Rail DEBIT yok); usta CREDIT yazılmaz", async () => {
    const seed = academyCourseSeedBySlug("python-temel");
    expect(seed).toBeTruthy();
    const journey = await runCitizenCashRingJourney();

    expect(journey.cleared.applied).toBe(true);
    expect(journey.cleared.status).toBe("CLEARED");
    expect(journey.replayCleared.applied).toBe(false);

    expect(journey.chain.paytrCredit.direction).toBe("CREDIT");
    expect(journey.chain.paytrCredit.purpose).toBe("wallet-top-up");
    expect(journey.chain.paytrCredit.amountMinor).toBe(CITIZEN_CASH_RING_TOP_UP_MINOR);
    expect(journey.chain.paytrCredit.userId).toBe(CITIZEN_CASH_RING_ID);

    expect(journey.chain.academyDebit.direction).toBe("DEBIT");
    expect(journey.chain.academyDebit.purpose).toBe("academy-purchase");
    expect(journey.chain.academyDebit.amountMinor).toBe(seed!.seedAmountMinor);
    expect(journey.academy.purchase.status).toBe("SETTLED");

    expect(journey.chain.escrowDebit).toBeNull();
    expect(journey.freelancer.holdAfterAccept?.status).toBe("PENDING");
    expect(journey.chain.releaseCredit).toBeNull();
    expect(journey.freelancer.released?.status).toBe("RELEASED");
    expect(journey.freelancer.holdAfterRelease?.status).toBe("RELEASED");
    expect(journey.freelancer.payoutFrozen).toBe(false);

    expect(journey.witness.certificateHash).toMatch(/^[a-f0-9]{64}$/);
    expect(journey.witness.curriculumSeal).toMatch(/^[a-f0-9]{64}$/);
    expect(journey.witness.hashVerified).toBe(true);
    expect(journey.witness.publicVerifyStatus).toBe("found");
    expect(journey.witness.sealStatus).toBe("valid");
    expect(journey.witness.verifyHref).toBe(
      `/academy/dogrula/${journey.witness.certificateHash}`,
    );
    expect(journey.academyVisa.stamp.certificateHash).toBe(journey.witness.certificateHash);
    expect(journey.freelancer.visa?.applied).toBe(true);

    expect(journey.balances.citizen).toBe(
      CITIZEN_CASH_RING_TOP_UP_MINOR - seed!.seedAmountMinor,
    );
    expect(journey.balances.client).toBe(CITIZEN_CASH_RING_CLIENT_START_MINOR);
    expect(journey.balances.platform).toBe(seed!.seedAmountMinor);
    const settlement = journey.ledger
      .listEntries()
      .find((row) => row.purpose === "academy-settlement" && row.direction === "CREDIT");
    expect(settlement?.userId).toBe(CITIZEN_CASH_RING_PLATFORM_ID);
    expect(settlement?.amountMinor).toBe(seed!.seedAmountMinor);
    expect(journey.balances.citizen + journey.balances.platform + journey.balances.client).toBe(
      CITIZEN_CASH_RING_TOP_UP_MINOR + CITIZEN_CASH_RING_CLIENT_START_MINOR,
    );
    expect(journey.balances.citizen).toBe(
      signedLedgerSum(journey.ledger.listEntries(), CITIZEN_CASH_RING_ID),
    );
    expect(CITIZEN_CASH_RING_PLATFORM_ID).toBe("00000000-0000-4000-8000-000000000001");

    const report = formatCitizenCashRingReport(journey);
    expect(report).toContain("wallet-top-up");
    expect(report).toContain("academy-purchase");
    expect(report).not.toContain("escrow-hold");
    expect(report).not.toContain("escrow-release-net");
    expect(report).toContain(journey.witness.certificateHash);
    expect(report).toContain("Checkout token CREDIT yazmaz");
  });

  it("üretim PayTR split not_configured; accept 503, CREDIT/hold/sözleşme yok", async () => {
    expect(await paytrMarketplaceSplitPort.beginHold({
      buyerUserId: CITIZEN_CASH_RING_CLIENT_ID,
      artisanUserId: CITIZEN_CASH_RING_ID,
      referenceKey: "lab-prod-split-must-not-hold",
      grossMinor: CITIZEN_CASH_RING_GROSS_MINOR,
      holdBps: 1000,
      currencyCode: "TRY",
    })).toEqual({ ok: false, reason: "not_configured" });

    const ports = withMemoryAcceptAtomic({
      ledger: createMemoryLedgerStore([
        { userId: CITIZEN_CASH_RING_CLIENT_ID, amountMinor: CITIZEN_CASH_RING_CLIENT_START_MINOR },
        { userId: CITIZEN_CASH_RING_ID, amountMinor: 0 },
        { userId: CITIZEN_CASH_RING_PLATFORM_ID, amountMinor: 0 },
      ]),
      escrow: createMemoryEscrowStore(),
      freelancer: createMemoryFreelancerStore(),
      marketplace: paytrMarketplaceSplitPort,
    });
    const job = await createFreelancerJob(ports, {
      clientId: CITIZEN_CASH_RING_CLIENT_ID,
      title: "Üretim split kapalı",
      brief: "PSP yokken kabul 503.",
      budgetMinor: CITIZEN_CASH_RING_GROSS_MINOR,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: CITIZEN_CASH_RING_ID,
      amountMinor: CITIZEN_CASH_RING_GROSS_MINOR,
      coverNote: "Hazırım.",
    });
    await expect(
      acceptFreelancerBid(ports, {
        jobId: job.id,
        bidId: bid.id,
        actorUserId: CITIZEN_CASH_RING_CLIENT_ID,
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableError);
    await expect(
      acceptFreelancerBid(ports, {
        jobId: job.id,
        bidId: bid.id,
        actorUserId: CITIZEN_CASH_RING_CLIENT_ID,
      }),
    ).rejects.toThrow(RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE);
    expect(ports.ledger.snapshot(CITIZEN_CASH_RING_CLIENT_ID).amountMinor).toBe(
      CITIZEN_CASH_RING_CLIENT_START_MINOR,
    );
    expect(await ports.freelancer.getContractByJobId(job.id)).toBeNull();
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("OPEN");
  });
});
