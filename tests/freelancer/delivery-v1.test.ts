import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import {
  RAIL_V1_DELIVERY_FORBIDDEN,
  RAIL_V1_DELIVERY_NOT_FUNDED,
  railV1DeliveryDataSchema,
} from "@/lib/kernel/http/v1-contract";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { listFreelancerContractViews } from "@/lib/freelancer/contract-view";
import {
  postFreelancerDeliveryProof,
  toFreelancerDeliveryMessageWire,
} from "@/lib/freelancer/messages";
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
const NOTE = "teslim kaniti notu";

function world() {
  return withMemoryAcceptAtomic({
    ledger: createMemoryLedgerStore([
      { userId: CLIENT, amountMinor: 100_000 },
      { userId: FREELANCER, amountMinor: 0 },
      { userId: PLATFORM, amountMinor: 0 },
    ]),
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });
}

async function fundedContract(ports: ReturnType<typeof world>) {
  const job = await createFreelancerJob(ports, {
    clientId: CLIENT,
    title: "İkon seti",
    brief: "16 SVG, Quiet Luxury.",
    budgetMinor: 10_000,
  });
  const bid = await submitFreelancerBid(ports, {
    jobId: job.id,
    bidderId: FREELANCER,
    amountMinor: 10_000,
    coverNote: "Teslim 5 gün.",
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

describe("Dar teslim yazması — usta / FUNDED / PII'siz DTO", () => {
  it("usta FUNDED sözleşmeye DELIVERY yazar; deliveredAt türetilir; gövde sızmaz", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    const message = await postFreelancerDeliveryProof(ports, {
      contractId: contract.id,
      actorUserId: FREELANCER,
      body: NOTE,
      now: new Date("2026-08-18T12:00:00.000Z"),
    });
    const wire = toFreelancerDeliveryMessageWire(message);
    expect(railV1DeliveryDataSchema.parse({ message: wire })).toEqual({ message: wire });
    expect(wire).not.toHaveProperty("body");
    expect(wire).not.toHaveProperty("artifactUrl");
    expect(wire).not.toHaveProperty("userId");
    expect(JSON.stringify(wire)).not.toContain(NOTE);
    const views = await listFreelancerContractViews(ports.freelancer, FREELANCER);
    expect(views[0]?.deliveredAt).toBe("2026-08-18T12:00:00.000Z");
  });

  it("işveren ve yabancı 403; RELEASED sözleşmeye yazılmaz", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    await expect(
      postFreelancerDeliveryProof(ports, {
        contractId: contract.id,
        actorUserId: CLIENT,
        body: NOTE,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      postFreelancerDeliveryProof(ports, {
        contractId: contract.id,
        actorUserId: CLIENT,
        body: NOTE,
      }),
    ).rejects.toThrow(RAIL_V1_DELIVERY_FORBIDDEN);
    await expect(
      postFreelancerDeliveryProof(ports, {
        contractId: contract.id,
        actorUserId: STRANGER,
        body: NOTE,
      }),
    ).rejects.toThrow(RAIL_V1_DELIVERY_FORBIDDEN);

    await ports.freelancer.updateContract(contract.id, {
      status: "RELEASED",
      releasedAt: new Date("2026-08-18T13:00:00.000Z"),
      updatedAt: new Date("2026-08-18T13:00:00.000Z"),
    });
    await expect(
      postFreelancerDeliveryProof(ports, {
        contractId: contract.id,
        actorUserId: FREELANCER,
        body: NOTE,
      }),
    ).rejects.toThrow(RAIL_V1_DELIVERY_NOT_FUNDED);
    expect(await ports.freelancer.listMessagesForContract(contract.id)).toHaveLength(0);
  });
});
