import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as listDirectOffers } from "@/app/api/freelancer/direct-offers/route";
import {
  acceptDirectFreelancerOffer,
  createDirectFreelancerOffer,
  declineDirectFreelancerOffer,
} from "@/lib/freelancer/engine";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import * as sessionApi from "@/lib/kernel/auth/session";
import * as freelancerRuntime from "@/lib/freelancer/runtime";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";

const CLIENT = "direct-client-1";
const INVITEE = "direct-invitee-1";
const STRANGER = "direct-stranger-1";
const PLATFORM = "00000000-0000-4000-8000-000000000001";

function world() {
  return withMemoryAcceptAtomic({
    ledger: createMemoryLedgerStore([
      { userId: CLIENT, amountMinor: 100_000 },
      { userId: INVITEE, amountMinor: 0 },
      { userId: STRANGER, amountMinor: 0 },
      { userId: PLATFORM, amountMinor: 0 },
    ]),
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });
}

async function seededOffer(ports: ReturnType<typeof world>) {
  return createDirectFreelancerOffer(ports, {
    clientId: CLIENT,
    inviteeId: INVITEE,
    title: "Özel teklif",
    brief: "Yalnız davetli ustanın tezgâhına düşer.",
    budgetMinor: 25_000,
    visaPathwayId: "uiux-tasarim-sistemleri",
    dueDays: 7,
  });
}

describe("freelancer doğrudan teklif IDOR", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("yabancı kabul ve red ForbiddenError / HTTP 403 döner", async () => {
    const ports = world();
    const job = await seededOffer(ports);
    await expect(
      acceptDirectFreelancerOffer(ports, {
        jobId: job.id,
        actorUserId: STRANGER,
        holdBps: HOLD_BPS_DEFAULT,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      declineDirectFreelancerOffer(ports, {
        jobId: job.id,
        actorUserId: STRANGER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    try {
      await acceptDirectFreelancerOffer(ports, {
        jobId: job.id,
        actorUserId: STRANGER,
        holdBps: HOLD_BPS_DEFAULT,
      });
    } catch (error) {
      expect(jsonFromUnknown(error).status).toBe(403);
    }
    const still = await ports.freelancer.getJob(job.id);
    expect(still?.status).toBe("OPEN");
  });

  it("GET yalnız davetlinin tekliflerini döner; yabancı boş liste görür", async () => {
    const ports = world();
    const job = await seededOffer(ports);
    vi.spyOn(freelancerRuntime, "createPrismaFreelancerPorts").mockReturnValue(ports as never);

    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: INVITEE,
      email: "invitee@example.com",
    });
    const inviteeRes = await listDirectOffers(
      new Request("http://localhost:3000/api/freelancer/direct-offers"),
    );
    expect(inviteeRes.status).toBe(200);
    const inviteeBody = (await inviteeRes.json()) as { data: { offers: Array<{ id: string }> } };
    expect(inviteeBody.data.offers.map((row) => row.id)).toEqual([job.id]);

    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: STRANGER,
      email: "stranger@example.com",
    });
    const strangerRes = await listDirectOffers(
      new Request("http://localhost:3000/api/freelancer/direct-offers"),
    );
    expect(strangerRes.status).toBe(200);
    const strangerBody = (await strangerRes.json()) as { data: { offers: Array<{ id: string }> } };
    expect(strangerBody.data.offers).toEqual([]);
  });
});
