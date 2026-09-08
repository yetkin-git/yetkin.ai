import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ConflictError, ForbiddenError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import {
  acceptFreelancerBid,
  cancelFreelancerJob,
  createFreelancerJob,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { openFreelancerDispute } from "@/lib/freelancer/dispute-engine";
import {
  listFreelancerContractMessages,
  postFreelancerContractMessage,
} from "@/lib/freelancer/messages";
import { upsertFreelancerSquad } from "@/lib/freelancer/squad-engine";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";

const CLIENT = "client-1";
const LEAD = "freelancer-lead";
const STRANGER = "stranger-9";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function world() {
  const ledger = createMemoryLedgerStore([
    { userId: CLIENT, amountMinor: 100_000 },
    { userId: LEAD, amountMinor: 0 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  return withMemoryAcceptAtomic({
    ledger,
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });
}

async function fundedContract(ports: ReturnType<typeof world>) {
  const job = await createFreelancerJob(ports, {
    clientId: CLIENT,
    title: "IDOR mühür işi",
    brief: "Taraf olmayan 403 görmeli.",
    budgetMinor: 25_000,
  });
  const bid = await submitFreelancerBid(ports, {
    jobId: job.id,
    bidderId: LEAD,
    amountMinor: 25_000,
    coverNote: "Hazır teslim.",
  });
  const { contract } = await acceptFreelancerBid(ports, {
    jobId: job.id,
    bidId: bid.id,
    actorUserId: CLIENT,
    holdBps: HOLD_BPS_DEFAULT,
    platformUserId: PLATFORM,
  });
  return contract;
}

describe("freelancer taraf IDOR — 403", () => {
  it("yabancı mesaj yazınca ForbiddenError ve HTTP 403 döner", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    await expect(
      postFreelancerContractMessage(ports, {
        contractId: contract.id,
        actorUserId: STRANGER,
        body: "Sızma denemesi",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    try {
      await postFreelancerContractMessage(ports, {
        contractId: contract.id,
        actorUserId: STRANGER,
        body: "Sızma denemesi",
      });
    } catch (error) {
      const response = jsonFromUnknown(error);
      expect(response.status).toBe(403);
    }
  });

  it("yabancı mesaj okuyunca 403 döner", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    await expect(
      listFreelancerContractMessages(ports, {
        contractId: contract.id,
        actorUserId: STRANGER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("işveren takım kurunca 403 döner", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    await expect(
      upsertFreelancerSquad(ports, {
        contractId: contract.id,
        actorUserId: CLIENT,
        members: [{ userId: LEAD, shareBps: 10_000 }],
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("yabancı tahkim açınca 403 döner", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    await expect(
      openFreelancerDispute(ports, {
        contractId: contract.id,
        actorUserId: STRANGER,
        partyAClaim: "Taraf değilim; kapı 403 olmalı.",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("yabancı OPEN ilanı kapatınca 403 döner; sahip CANCELLED yazar", async () => {
    const ports = world();
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "Kapatılacak ilan",
      brief: "Sahiplik kalkanı üçüncü şahsı keser.",
      budgetMinor: 25_000,
    });
    await expect(
      cancelFreelancerJob(ports, { jobId: job.id, actorUserId: STRANGER }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    try {
      await cancelFreelancerJob(ports, { jobId: job.id, actorUserId: STRANGER });
    } catch (error) {
      const response = jsonFromUnknown(error);
      expect(response.status).toBe(403);
    }
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("OPEN");

    const closed = await cancelFreelancerJob(ports, {
      jobId: job.id,
      actorUserId: CLIENT,
    });
    expect(closed.status).toBe("CANCELLED");
  });

  it("sözleşmeli ilanı sahip kapatınca 409 döner", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    await expect(
      cancelFreelancerJob(ports, { jobId: contract.jobId, actorUserId: CLIENT }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
