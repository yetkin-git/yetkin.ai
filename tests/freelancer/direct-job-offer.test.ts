import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import {
  acceptDirectFreelancerOffer,
  createDirectFreelancerOffer,
  createFreelancerJob,
  declineDirectFreelancerOffer,
} from "@/lib/freelancer/engine";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";

const CLIENT = "client-1";
const INVITEE = "invitee-1";
const STRANGER = "stranger-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function world(clientBalance = 100_000) {
  return withMemoryAcceptAtomic({
    ledger: createMemoryLedgerStore([
      { userId: CLIENT, amountMinor: clientBalance },
      { userId: INVITEE, amountMinor: 0 },
      { userId: PLATFORM, amountMinor: 0 },
    ]),
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });
}

describe("freelancer doğrudan iş teklifi (DIRECT)", () => {
  it("createDirect listOpenJobs'ta görünmez; listDirectOffersForInvitee'de görünür", async () => {
    const ports = world();
    const publicJob = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "Açık ilan",
      brief: "Herkese açık tahta işi.",
      budgetMinor: 25_000,
    });
    const direct = await createDirectFreelancerOffer(ports, {
      clientId: CLIENT,
      inviteeId: INVITEE,
      title: "Özel teklif",
      brief: "Yalnız davetli ustaya.",
      budgetMinor: 30_000,
      dueDays: 14,
    });

    const open = await ports.freelancer.listOpenJobs();
    expect(open.map((job) => job.id)).toContain(publicJob.id);
    expect(open.map((job) => job.id)).not.toContain(direct.id);

    const inbox = await ports.freelancer.listDirectOffersForInvitee(INVITEE);
    expect(inbox.map((job) => job.id)).toEqual([direct.id]);
    expect(inbox[0]?.visibility).toBe("DIRECT");
    expect(inbox[0]?.inviteeId).toBe(INVITEE);
    expect(inbox[0]?.dueDays).toBe(14);

    expect(await ports.freelancer.listDirectOffersForInvitee(STRANGER)).toEqual([]);
  });

  it("davetli olmayan kabul edemez", async () => {
    const ports = world();
    const direct = await createDirectFreelancerOffer(ports, {
      clientId: CLIENT,
      inviteeId: INVITEE,
      title: "Özel teklif",
      brief: "Yalnız davetli ustaya.",
      budgetMinor: 25_000,
      dueDays: 7,
    });

    await expect(
      acceptDirectFreelancerOffer(ports, {
        jobId: direct.id,
        actorUserId: STRANGER,
        holdBps: HOLD_BPS_DEFAULT,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(await ports.freelancer.getContractByJobId(direct.id)).toBeNull();
    expect((await ports.freelancer.getJob(direct.id))?.status).toBe("OPEN");
  });

  it("davetli kabul FUNDED sözleşme yaratır", async () => {
    const ports = world();
    const direct = await createDirectFreelancerOffer(ports, {
      clientId: CLIENT,
      inviteeId: INVITEE,
      title: "Özel teklif",
      brief: "Yalnız davetli ustaya.",
      budgetMinor: 25_000,
      dueDays: 21,
    });

    const accepted = await acceptDirectFreelancerOffer(ports, {
      jobId: direct.id,
      actorUserId: INVITEE,
      holdBps: HOLD_BPS_DEFAULT,
    });

    expect(accepted.applied).toBe(true);
    expect(accepted.contract.status).toBe("FUNDED");
    expect(accepted.contract.clientId).toBe(CLIENT);
    expect(accepted.contract.freelancerId).toBe(INVITEE);
    expect(accepted.contract.grossMinor).toBe(25_000);
    expect((await ports.freelancer.getJob(direct.id))?.status).toBe("AWARDED");

    const bid = await ports.freelancer.getBidByJobAndBidder(direct.id, INVITEE);
    expect(bid?.status).toBe("ACCEPTED");
    expect(bid?.coverNote).toBe("Doğrudan teklif kabulü");
    expect(bid?.amountMinor).toBe(25_000);
  });

  it("davetli red CANCELLED yazar; emanet açılmaz", async () => {
    const ports = world();
    const direct = await createDirectFreelancerOffer(ports, {
      clientId: CLIENT,
      inviteeId: INVITEE,
      title: "Özel teklif",
      brief: "Yalnız davetli ustaya.",
      budgetMinor: 25_000,
      dueDays: 10,
    });

    const declined = await declineDirectFreelancerOffer(ports, {
      jobId: direct.id,
      actorUserId: INVITEE,
    });

    expect(declined.status).toBe("CANCELLED");
    expect(await ports.freelancer.getContractByJobId(direct.id)).toBeNull();
    expect(await ports.freelancer.listDirectOffersForInvitee(INVITEE)).toEqual([]);
  });

  it("davetli olmayan reddedemez", async () => {
    const ports = world();
    const direct = await createDirectFreelancerOffer(ports, {
      clientId: CLIENT,
      inviteeId: INVITEE,
      title: "Özel teklif",
      brief: "Yalnız davetli ustaya.",
      budgetMinor: 25_000,
      dueDays: 7,
    });

    await expect(
      declineDirectFreelancerOffer(ports, {
        jobId: direct.id,
        actorUserId: STRANGER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect((await ports.freelancer.getJob(direct.id))?.status).toBe("OPEN");
  });
});
