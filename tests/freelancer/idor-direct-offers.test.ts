import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as listDirectOffers } from "@/app/api/freelancer/direct-offers/route";
import { POST as acceptDirectOffer } from "@/app/api/freelancer/direct-offers/[id]/accept/route";
import { POST as declineDirectOffer } from "@/app/api/freelancer/direct-offers/[id]/decline/route";
import { GET as getSquad, POST as postSquad } from "@/app/api/freelancer/squad/route";
import {
  acceptDirectFreelancerOffer,
  createDirectFreelancerOffer,
  declineDirectFreelancerOffer,
} from "@/lib/freelancer/engine";
import { FREELANCER_SATELLITE_GONE } from "@/lib/freelancer/satellite-gone";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
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

  it("BFF 410; davetli ve yabancı aynı kapıyı görür, teklif listesi sızmaz", async () => {
    const inviteeRes = await listDirectOffers(
      new Request("http://localhost:3000/api/freelancer/direct-offers"),
    );
    expect(inviteeRes.status).toBe(410);
    const inviteeBody = (await inviteeRes.json()) as { ok: boolean; error: string };
    expect(inviteeBody.ok).toBe(false);
    expect(inviteeBody.error).toBe(FREELANCER_SATELLITE_GONE.directOffer);

    const strangerRes = await listDirectOffers(
      new Request("http://localhost:3000/api/freelancer/direct-offers"),
    );
    expect(strangerRes.status).toBe(410);
    expect(await strangerRes.json()).toMatchObject({
      ok: false,
      error: FREELANCER_SATELLITE_GONE.directOffer,
    });
  });
});

describe("freelancer uydu BFF 410", () => {
  it("squad ve direct-offer her yöntemde 410 basar; motor çağrılmaz", async () => {
    const request = new Request("http://localhost:3000/api/freelancer/squad", { method: "GET" });
    const squadGet = await getSquad(request);
    expect(squadGet.status).toBe(410);
    expect(await squadGet.json()).toMatchObject({ ok: false, error: FREELANCER_SATELLITE_GONE.squad });

    const squadPost = await postSquad(
      new Request("http://localhost:3000/api/freelancer/squad", { method: "POST" }),
    );
    expect(squadPost.status).toBe(410);

    const accept = await acceptDirectOffer(
      new Request("http://localhost:3000/api/freelancer/direct-offers/job-1/accept", {
        method: "POST",
      }),
    );
    expect(accept.status).toBe(410);
    expect(await accept.json()).toMatchObject({
      ok: false,
      error: FREELANCER_SATELLITE_GONE.directOffer,
    });

    const decline = await declineDirectOffer(
      new Request("http://localhost:3000/api/freelancer/direct-offers/job-1/decline", {
        method: "POST",
      }),
    );
    expect(decline.status).toBe(410);
  });
});
