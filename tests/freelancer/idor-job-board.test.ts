import { afterEach, describe, expect, it, vi } from "vitest";
import { DELETE as deleteJob, GET as getJob } from "@/app/api/freelancer/jobs/[id]/route";
import {
  cancelFreelancerJob,
  createFreelancerJob,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { queryJobBoard } from "@/lib/freelancer/job-board";
import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import * as sessionApi from "@/lib/kernel/auth/session";
import * as freelancerRuntime from "@/lib/freelancer/runtime";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";
import { assertWireContains, assertWireOmits } from "../helpers/idor-leak";

const CLIENT = "client-idor-1";
const ALICE = "bidder-alice-1";
const BOB = "bidder-bob-1";
const STRANGER = "stranger-idor-1";
const PLATFORM = "platform-idor-1";

const IDOR_COVER_ALICE = "IDOR_COVER_ALICE";
const IDOR_COVER_BOB = "IDOR_COVER_BOB";
const IDOR_AMOUNT_ALICE = 27_171;
const IDOR_AMOUNT_BOB = 38_282;
const JOB_BUDGET = 50_000;

function world() {
  return withMemoryAcceptAtomic({
    ledger: createMemoryLedgerStore([
      { userId: CLIENT, amountMinor: 100_000 },
      { userId: ALICE, amountMinor: 0 },
      { userId: BOB, amountMinor: 0 },
      { userId: PLATFORM, amountMinor: 0 },
    ]),
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });
}

async function seededJob(ports: ReturnType<typeof world>) {
  const job = await createFreelancerJob(ports, {
    clientId: CLIENT,
    title: "IDOR ilan",
    brief: "Kapak notu ve tutar sızmamalı.",
    budgetMinor: JOB_BUDGET,
  });
  const aliceBid = await submitFreelancerBid(ports, {
    jobId: job.id,
    bidderId: ALICE,
    amountMinor: IDOR_AMOUNT_ALICE,
    coverNote: IDOR_COVER_ALICE,
  });
  const bobBid = await submitFreelancerBid(ports, {
    jobId: job.id,
    bidderId: BOB,
    amountMinor: IDOR_AMOUNT_BOB,
    coverNote: IDOR_COVER_BOB,
  });
  return { job, aliceBid, bobBid };
}

function rivalSecrets(): string[] {
  return [IDOR_COVER_BOB, String(IDOR_AMOUNT_BOB)];
}

function publicSecrets(): string[] {
  return [IDOR_COVER_ALICE, IDOR_COVER_BOB, String(IDOR_AMOUNT_ALICE), String(IDOR_AMOUNT_BOB)];
}

function jobGetRequest(jobId: string): Request {
  return new Request(new URL(`/api/freelancer/jobs/${jobId}`, "http://localhost:3000"), {
    method: "GET",
  });
}

function jobDeleteRequest(jobId: string): Request {
  return new Request(new URL(`/api/freelancer/jobs/${jobId}`, "http://localhost:3000"), {
    method: "DELETE",
  });
}

describe("freelancer iş detayı IDOR — teklif ve coverNote", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ilan sahibi tüm teklifleri görür; rakip ve anonim coverNote/tutar almaz", async () => {
    const ports = world();
    const { job, aliceBid, bobBid } = await seededJob(ports);

    const owner = await queryJobBoard(ports.freelancer, job.id, CLIENT);
    expect(owner?.viewerRole).toBe("owner");
    expect(owner?.bids).toHaveLength(2);
    assertWireContains(owner, [IDOR_COVER_ALICE, IDOR_COVER_BOB, String(IDOR_AMOUNT_ALICE), String(IDOR_AMOUNT_BOB)]);

    const rival = await queryJobBoard(ports.freelancer, job.id, ALICE);
    expect(rival?.viewerRole).toBe("participant");
    expect(rival?.bids).toEqual([expect.objectContaining({ id: aliceBid.id, coverNote: IDOR_COVER_ALICE })]);
    expect(rival?.bids.find((row) => row.id === bobBid.id)).toBeUndefined();
    expect(rival?.bids[0]?.coverNote).toBe(IDOR_COVER_ALICE);
    expect(rival?.bids[0]?.amountMinor).toBe(IDOR_AMOUNT_ALICE);
    assertWireOmits(rival, rivalSecrets());

    const stranger = await queryJobBoard(ports.freelancer, job.id, STRANGER);
    expect(stranger?.viewerRole).toBe("third_party");
    expect(stranger?.bids).toEqual([]);
    expect(stranger?.contract).toBeNull();
    assertWireOmits(stranger, publicSecrets());

    const anonymous = await queryJobBoard(ports.freelancer, job.id, null);
    expect(anonymous?.viewerRole).toBe("third_party");
    expect(anonymous?.bids).toEqual([]);
    assertWireOmits(anonymous, publicSecrets());
    expect(anonymous?.bids[0]?.coverNote).toBeUndefined();
    expect(anonymous?.bids[0]?.amountMinor).toBeUndefined();
  });

  it("GET /api/freelancer/jobs/[id] aynı projeksiyonu basar; rakip/anonim sızdırmaz", async () => {
    const ports = world();
    const { job } = await seededJob(ports);
    vi.spyOn(freelancerRuntime, "createPrismaFreelancerPorts").mockReturnValue(ports as never);
    const requireSession = vi.spyOn(sessionApi, "requireSession");
    requireSession.mockResolvedValueOnce({
      id: CLIENT,
      email: "owner@yetkin.rail",
    });
    const ownerRes = await getJob(jobGetRequest(job.id), { params: Promise.resolve({ id: job.id }) });
    expect(ownerRes.status).toBe(200);
    const ownerBody = (await ownerRes.json()) as {
      ok: boolean;
      data?: {
        bids: Array<{ coverNote?: string; amountMinor?: number }>;
      };
    };
    expect(ownerBody.ok).toBe(true);
    expect(ownerBody.data?.bids).toHaveLength(2);
    assertWireContains(ownerBody, [IDOR_COVER_ALICE, IDOR_COVER_BOB]);

    requireSession.mockResolvedValueOnce({
      id: ALICE,
      email: "alice@yetkin.rail",
    });
    const rivalRes = await getJob(jobGetRequest(job.id), { params: Promise.resolve({ id: job.id }) });
    expect(rivalRes.status).toBe(200);
    const rivalBody = (await rivalRes.json()) as {
      ok: boolean;
      data?: {
        bids: Array<{ coverNote?: string; amountMinor?: number }>;
      };
    };
    expect(rivalBody.data?.bids).toHaveLength(1);
    expect(rivalBody.data?.bids[0]?.coverNote).toBe(IDOR_COVER_ALICE);
    expect(rivalBody.data?.bids.find((row) => row.coverNote === IDOR_COVER_BOB)).toBeUndefined();
    assertWireOmits(rivalBody, rivalSecrets());

    requireSession.mockRejectedValueOnce(new AuthRequiredError());
    const anonRes = await getJob(jobGetRequest(job.id), { params: Promise.resolve({ id: job.id }) });
    expect(anonRes.status).toBe(401);
    const anonBody = (await anonRes.json()) as { ok: boolean; bids?: unknown };
    expect(anonBody.ok).toBe(false);
    expect(anonBody.bids).toBeUndefined();
    assertWireOmits(anonBody, publicSecrets());
  });

  it("yalnız ilan sahibi OPEN ilanı kapatır; üçüncü şahıs 403 alır", async () => {
    const ports = world();
    const { job } = await seededJob(ports);

    await expect(
      cancelFreelancerJob(ports, { jobId: job.id, actorUserId: STRANGER }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      cancelFreelancerJob(ports, { jobId: job.id, actorUserId: ALICE }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    const stillOpen = await ports.freelancer.getJob(job.id);
    expect(stillOpen?.status).toBe("OPEN");

    const closed = await cancelFreelancerJob(ports, { jobId: job.id, actorUserId: CLIENT });
    expect(closed.status).toBe("CANCELLED");
    const stored = await ports.freelancer.getJob(job.id);
    expect(stored?.status).toBe("CANCELLED");
  });

  it("DELETE /api/freelancer/jobs/[id] sahip için CANCELLED yazar; yabancı 403, oturumsuz 401", async () => {
    const ports = world();
    const owned = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "Sahip kapatma",
      brief: "Yalnız işveren arşivler.",
      budgetMinor: JOB_BUDGET,
    });
    const foreign = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "Yabancı kapatma",
      brief: "Üçüncü şahıs 403 görmeli.",
      budgetMinor: JOB_BUDGET,
    });
    vi.spyOn(freelancerRuntime, "createPrismaFreelancerPorts").mockReturnValue(ports as never);
    const requireSession = vi.spyOn(sessionApi, "requireSession");

    requireSession.mockResolvedValueOnce({
      id: STRANGER,
      email: "stranger@yetkin.rail",
    });
    const strangerRes = await deleteJob(jobDeleteRequest(foreign.id), {
      params: Promise.resolve({ id: foreign.id }),
    });
    expect(strangerRes.status).toBe(403);
    const strangerBody = (await strangerRes.json()) as { ok: boolean; error?: string };
    expect(strangerBody.ok).toBe(false);
    expect(strangerBody.error).toBe("Yalnız ilan sahibi ilanı kapatabilir.");
    expect((await ports.freelancer.getJob(foreign.id))?.status).toBe("OPEN");

    requireSession.mockRejectedValueOnce(new AuthRequiredError());
    const anonRes = await deleteJob(jobDeleteRequest(foreign.id), {
      params: Promise.resolve({ id: foreign.id }),
    });
    expect(anonRes.status).toBe(401);
    expect((await ports.freelancer.getJob(foreign.id))?.status).toBe("OPEN");

    requireSession.mockResolvedValueOnce({
      id: CLIENT,
      email: "owner@yetkin.rail",
    });
    const ownerRes = await deleteJob(jobDeleteRequest(owned.id), {
      params: Promise.resolve({ id: owned.id }),
    });
    expect(ownerRes.status).toBe(200);
    const ownerBody = (await ownerRes.json()) as {
      ok: boolean;
      data?: { job?: { status?: string } };
    };
    expect(ownerBody.ok).toBe(true);
    expect(ownerBody.data?.job?.status).toBe("CANCELLED");
    expect((await ports.freelancer.getJob(owned.id))?.status).toBe("CANCELLED");
  });
});
