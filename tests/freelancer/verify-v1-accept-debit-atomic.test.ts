import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { ESCROW_HOLD_TTL_MS, PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { freelancerJobEscrowReferenceKey } from "@/lib/freelancer/fsm";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { IDEMPOTENCY_KEY_HEADER } from "@/lib/kernel/http/idempotency-key";
import {
  RAIL_V1_ACCEPT_FORBIDDEN,
  RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE,
  RAIL_V1_HOPS,
  RAIL_V1_IDEMPOTENCY_REQUIRED,
  parseRailV1Envelope,
  railV1AcceptDataSchema,
  railV1ContractSchema,
  railV1FreelancerContractViewSchema,
} from "@/lib/kernel/http/v1-contract";
import { POST as postAccept } from "@/app/api/freelancer/jobs/[id]/accept/route";
import * as sessionApi from "@/lib/kernel/auth/session";
import * as freelancerRuntime from "@/lib/freelancer/runtime";
import * as prismaIdempotency from "@/lib/kernel/http/prisma-idempotency-store";
import * as catalogStore from "@/lib/kernel/pricing/prisma-catalog-store";
import { createMemoryHttpIdempotencyStore } from "@/lib/kernel/http/memory-idempotency-store";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  refundFreelancerContract,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { toFreelancerAcceptWire } from "@/lib/freelancer/contract-view";
import { runEscrowTimeoutRefunds } from "@/lib/kernel/jobs/escrow-timeout-scan";
import {
  clearEscrowRefundHooks,
  registerEscrowRefundHook,
} from "@/lib/kernel/escrow/refund-hooks";
import {
  FREELANCER_ESCROW_REFUND_PURPOSE,
  onEscrowRefunded as freelancerOnEscrowRefunded,
} from "@/lib/freelancer/escrow-refund";
import { parseRailV1ContractsData, RAIL_V1_PARSE_FAIL } from "../../apps/rail-is/src/contract/v1";
import { assertRailIsDay0Path } from "../../apps/rail-is/src/api/hops";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";

const CLIENT = "client-1";
const FREELANCER = "freelancer-1";
const STRANGER = "stranger-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";
const ACCEPT_KEY = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ACCEPT_KEY_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const TEST_EMAIL = "isveren@yetkin.rail";

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

function debitCount(ports: ReturnType<typeof world>, userId: string) {
  return ports.ledger.capture().entries.filter(
    ([, entry]) =>
      entry.userId === userId &&
      entry.direction === "DEBIT" &&
      entry.purpose === "escrow-hold",
  ).length;
}

function v1Headers(extra?: HeadersInit): Headers {
  return new Headers({
    "x-rail-api-version": "1",
    "x-request-id": REQUEST_ID,
    "X-Rail-Min-Version": "1",
    "content-type": "application/json",
    ...extra,
  });
}

function acceptRequest(
  jobId: string,
  bidId: string,
  init?: { key?: string; omitKey?: boolean },
) {
  const headers = v1Headers(
    init?.omitKey ? undefined : { [IDEMPOTENCY_KEY_HEADER]: init?.key ?? ACCEPT_KEY },
  );
  if (init?.omitKey) {
    headers.delete(IDEMPOTENCY_KEY_HEADER);
  }
  return new Request(new URL(`/api/v1/freelancer/jobs/${jobId}/accept`, "http://localhost:3000"), {
    method: "POST",
    headers,
    body: JSON.stringify({ bidId }),
  });
}

async function openJobWithBid(ports: ReturnType<typeof world>, amountMinor = 10_000) {
  const job = await createFreelancerJob(ports, {
    clientId: CLIENT,
    title: "DEBIT kapısı",
    brief: "Katı DTO ve atomik mühür.",
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

function mockAcceptDeps(ports: ReturnType<typeof world>) {
  vi.spyOn(freelancerRuntime, "createPrismaFreelancerPorts").mockReturnValue(ports as never);
  vi.spyOn(prismaIdempotency, "createPrismaHttpIdempotencyStore").mockReturnValue(
    createMemoryHttpIdempotencyStore(),
  );
  vi.spyOn(catalogStore, "createPrismaPriceCatalogStore").mockReturnValue({
    findActiveEntry: async () => null,
  } as never);
}

describe("ADIM 16 — accept DEBIT projeksiyonu ve atomik mühür", () => {
  beforeEach(() => {
    clearEscrowRefundHooks();
  });

  afterEach(() => {
    clearEscrowRefundHooks();
    vi.restoreAllMocks();
  });

  it("sicil 12. hop freelancer-accept: bearer, çerez yok, idempotency true; 13. hop owner-only GET", () => {
    expect(RAIL_V1_HOPS).toHaveLength(13);
    const hop = RAIL_V1_HOPS.find((item) => item.id === "freelancer-accept");
    expect(hop).toMatchObject({
      method: "POST",
      v1PathTemplate: "/api/v1/freelancer/jobs/{id}/accept",
      v1Auth: "bearer",
      cookieAuth: false,
      idempotency: true,
      successStatus: 200,
      dataKeys: ["contract"],
    });
    expect(hop?.errors).toContain(RAIL_V1_ACCEPT_FORBIDDEN);
    expect(hop?.errors).toContain(RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE);
    expect(assertRailIsDay0Path("/api/v1/freelancer/jobs/fj_1/accept", "POST")).toBe(
      "/api/v1/freelancer/jobs/fj_1/accept",
    );
    const ownerHop = RAIL_V1_HOPS.find((item) => item.id === "client-job-bids");
    expect(ownerHop).toMatchObject({
      method: "GET",
      v1PathTemplate: "/api/v1/client/jobs/{id}/bids",
      v1Auth: "bearer",
      cookieAuth: false,
      idempotency: false,
      dataKeys: ["bids"],
    });
  });

  it("kısmi 6 alan parse olmaz; tam railV1ContractSchema geçer; view parser Tezgâh [] değildir", async () => {
    const ports = world();
    const { job, bid } = await openJobWithBid(ports);
    const { contract } = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      holdBps: HOLD_BPS_DEFAULT,
    });
    const partial = {
      id: contract.id,
      jobId: contract.jobId,
      status: contract.status,
      grossMinor: contract.grossMinor,
      holdMinor: contract.holdMinor,
      netMinor: contract.netMinor,
    };
    expect(railV1ContractSchema.safeParse(partial).success).toBe(false);

    const wire = toFreelancerAcceptWire(contract);
    expect(railV1AcceptDataSchema.parse(wire)).toEqual(wire);
    expect(railV1ContractSchema.parse(wire.contract)).toEqual(wire.contract);
    expect(wire.contract.clientId).toBe(CLIENT);
    expect(wire.contract.freelancerId).toBe(FREELANCER);
    expect(wire.contract.escrowHoldId).toBe(contract.escrowHoldId);
    expect(wire.contract.holdBps).toBe(HOLD_BPS_DEFAULT);
    expect(wire.contract.fundedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(wire.contract.releasedAt).toBeNull();
    expect(wire.contract.refundedAt).toBeNull();
    expect(wire).not.toHaveProperty("visaStamp");
    expect(wire.contract).not.toHaveProperty("deliveredAt");

    expect(railV1FreelancerContractViewSchema.safeParse(wire.contract).success).toBe(false);
    expect(() => parseRailV1ContractsData({ contracts: [wire.contract] })).toThrow(RAIL_V1_PARSE_FAIL);
    expect(() => parseRailV1ContractsData({ contracts: [] })).not.toThrow();
  });

  it("usta accept 403; DEBIT yok; ilan OPEN", async () => {
    const ports = world();
    const { job, bid } = await openJobWithBid(ports);
    await expect(
      acceptFreelancerBid(ports, {
        jobId: job.id,
        bidId: bid.id,
        actorUserId: FREELANCER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      acceptFreelancerBid(ports, {
        jobId: job.id,
        bidId: bid.id,
        actorUserId: STRANGER,
      }),
    ).rejects.toThrow(RAIL_V1_ACCEPT_FORBIDDEN);
    expect(debitCount(ports, CLIENT)).toBe(0);
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("OPEN");
    expect(await ports.freelancer.getContractByJobId(job.id)).toBeNull();
  });

  it("yetersiz bakiyede 409, ilan OPEN, hold yok, 2xx yok", async () => {
    const ports = world(500);
    const { job, bid } = await openJobWithBid(ports);
    mockAcceptDeps(ports);
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: CLIENT,
      email: TEST_EMAIL,
    });

    const response = await postAccept(acceptRequest(job.id, bid.id), {
      params: Promise.resolve({ id: job.id }),
    });
    expect(response.status).toBe(409);
    expect(response.status).toBeLessThan(500);
    const body = parseRailV1Envelope(await response.json());
    expect(body).toMatchObject({
      ok: false,
      error: RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE,
      data: null,
    });
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("OPEN");
    expect(await ports.freelancer.getContractByJobId(job.id)).toBeNull();
    expect(await ports.escrow.findByReferenceKey(freelancerJobEscrowReferenceKey(job.id))).toBeNull();
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(500);
    expect(debitCount(ports, CLIENT)).toBe(0);
  });

  it("HTTP 200 katı DTO basar; aynı UUID ikinci DEBIT yazmaz", async () => {
    const ports = world();
    const { job, bid } = await openJobWithBid(ports);
    mockAcceptDeps(ports);
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: CLIENT,
      email: TEST_EMAIL,
    });

    const first = await postAccept(acceptRequest(job.id, bid.id), {
      params: Promise.resolve({ id: job.id }),
    });
    expect(first.status).toBe(200);
    const firstBody = parseRailV1Envelope(await first.json());
    expect(firstBody.ok).toBe(true);
    if (!firstBody.ok) {
      throw new Error("accept 200 zarfı ok değil");
    }
    const parsed = railV1AcceptDataSchema.parse(firstBody.data);
    expect(parsed.contract.clientId).toBe(CLIENT);
    expect(parsed.contract.freelancerId).toBe(FREELANCER);
    expect(parsed.contract.escrowHoldId.length).toBeGreaterThan(0);
    expect(parsed.contract.status).toBe("FUNDED");
    expect(parsed.contract).not.toHaveProperty("deliveredAt");
    expect(debitCount(ports, CLIENT)).toBe(1);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);

    const replay = await postAccept(acceptRequest(job.id, bid.id), {
      params: Promise.resolve({ id: job.id }),
    });
    expect(replay.status).toBe(200);
    const replayBody = parseRailV1Envelope(await replay.json());
    expect(replayBody.ok).toBe(true);
    if (!replayBody.ok) {
      throw new Error("replay 200 zarfı ok değil");
    }
    expect(railV1AcceptDataSchema.parse(replayBody.data)).toEqual(parsed);
    expect(debitCount(ports, CLIENT)).toBe(1);
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);
    expect((await ports.freelancer.listContractsForUser(CLIENT)).length).toBe(1);
  });

  it("anahtarsız accept 400; 2xx yok", async () => {
    const ports = world();
    const { job, bid } = await openJobWithBid(ports);
    mockAcceptDeps(ports);
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: CLIENT,
      email: TEST_EMAIL,
    });
    const missing = await postAccept(acceptRequest(job.id, bid.id, { omitKey: true }), {
      params: Promise.resolve({ id: job.id }),
    });
    expect(missing.status).toBe(400);
    expect(parseRailV1Envelope(await missing.json())).toMatchObject({
      ok: false,
      error: RAIL_V1_IDEMPOTENCY_REQUIRED,
      data: null,
    });
    expect(debitCount(ports, CLIENT)).toBe(0);
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("OPEN");
  });

  it("HTTP usta 403; DEBIT yok", async () => {
    const ports = world();
    const { job, bid } = await openJobWithBid(ports);
    mockAcceptDeps(ports);
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: FREELANCER,
      email: "usta@yetkin.rail",
    });
    const denied = await postAccept(acceptRequest(job.id, bid.id, { key: ACCEPT_KEY_B }), {
      params: Promise.resolve({ id: job.id }),
    });
    expect(denied.status).toBe(403);
    expect(parseRailV1Envelope(await denied.json())).toMatchObject({
      ok: false,
      error: RAIL_V1_ACCEPT_FORBIDDEN,
      data: null,
    });
    expect(debitCount(ports, CLIENT)).toBe(0);
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("OPEN");
  });

  it("eşzamanlı release × refund × TTL tek kazanan; brüt iki kez çıkmaz", async () => {
    const ports = world();
    const fundedAt = new Date("2026-08-01T00:00:00.000Z");
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "Yarış ilanı",
      brief: "CREDIT tek kazanan.",
      budgetMinor: 10_000,
      now: fundedAt,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: FREELANCER,
      amountMinor: 10_000,
      coverNote: "Hazırım.",
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
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);

    registerEscrowRefundHook(FREELANCER_ESCROW_REFUND_PURPOSE, async (purpose, holdId) => {
      await freelancerOnEscrowRefunded(purpose, holdId, ports.freelancer);
    });

    const scanAt = new Date(fundedAt.getTime() + ESCROW_HOLD_TTL_MS + 1_000);
    const settled = await Promise.allSettled([
      releaseFreelancerContract(ports, {
        contractId: contract.id,
        actorUserId: CLIENT,
        platformUserId: PLATFORM,
        now: scanAt,
      }),
      refundFreelancerContract(ports, {
        contractId: contract.id,
        actorUserId: CLIENT,
        platformUserId: PLATFORM,
        now: scanAt,
      }),
      runEscrowTimeoutRefunds(ports, { now: scanAt }),
    ]);
    expect(settled.some((row) => row.status === "fulfilled")).toBe(true);

    const client = ports.ledger.snapshot(CLIENT).amountMinor;
    const freelancer = ports.ledger.snapshot(FREELANCER).amountMinor;
    const platform = ports.ledger.snapshot(PLATFORM).amountMinor;
    expect(client + freelancer + platform).toBe(100_000);

    const hold = await ports.escrow.findById(contract.escrowHoldId);
    const row = await ports.freelancer.getContract(contract.id);
    expect(hold?.status === "RELEASED" || hold?.status === "REFUNDED").toBe(true);
    expect(row?.status).toBe(hold?.status);

    if (hold?.status === "RELEASED") {
      expect(freelancer).toBe(9_000);
      expect(platform).toBe(1_000);
      expect(client).toBe(90_000);
      expect(row?.status).toBe("RELEASED");
    } else {
      expect(freelancer).toBe(0);
      expect(platform).toBe(0);
      expect(client).toBe(100_000);
      expect(row?.status).toBe("REFUNDED");
    }
  });
});
