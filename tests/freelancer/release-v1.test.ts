import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ConflictError, ForbiddenError } from "@/lib/kernel/http/errors";
import {
  RAIL_V1_RELEASE_FORBIDDEN,
  RAIL_V1_RELEASE_NOT_FUNDED,
  railV1ReleaseDataSchema,
} from "@/lib/kernel/http/v1-contract";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { toFreelancerReleaseWire } from "@/lib/freelancer/contract-view";
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

function netCreditCount(ports: ReturnType<typeof world>, userId: string) {
  return ports.ledger.capture().entries.filter(
    ([, entry]) =>
      entry.userId === userId &&
      entry.direction === "CREDIT" &&
      entry.purpose === "escrow-release-net",
  ).length;
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

describe("Hak ediş serbest bırakma — işveren / FUNDED / ISO DTO", () => {
  it("işveren FUNDED sözleşmeyi çözer; usta net CREDIT; DTO'da deliveredAt yok", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    const released = await releaseFreelancerContract(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });
    expect(released.status).toBe("RELEASED");
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(9_000);
    expect(netCreditCount(ports, FREELANCER)).toBe(1);
    const wire = toFreelancerReleaseWire(released, null);
    expect(railV1ReleaseDataSchema.parse(wire)).toEqual(wire);
    expect(wire.contract).not.toHaveProperty("deliveredAt");
    expect(wire.visaStamp).toBeNull();
    expect(wire.contract.status).toBe("RELEASED");
    expect(wire.contract.releasedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("usta ve yabancı 403; CREDIT yok; FUNDED dışı 409", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    await expect(
      releaseFreelancerContract(ports, {
        contractId: contract.id,
        actorUserId: FREELANCER,
        platformUserId: PLATFORM,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      releaseFreelancerContract(ports, {
        contractId: contract.id,
        actorUserId: FREELANCER,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(RAIL_V1_RELEASE_FORBIDDEN);
    await expect(
      releaseFreelancerContract(ports, {
        contractId: contract.id,
        actorUserId: STRANGER,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(RAIL_V1_RELEASE_FORBIDDEN);
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(0);
    expect(netCreditCount(ports, FREELANCER)).toBe(0);

    await releaseFreelancerContract(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });
    expect(netCreditCount(ports, FREELANCER)).toBe(1);
    await expect(
      releaseFreelancerContract(ports, {
        contractId: contract.id,
        actorUserId: CLIENT,
        platformUserId: PLATFORM,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    await expect(
      releaseFreelancerContract(ports, {
        contractId: contract.id,
        actorUserId: CLIENT,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(RAIL_V1_RELEASE_NOT_FUNDED);
    expect(netCreditCount(ports, FREELANCER)).toBe(1);
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(9_000);
  });
});
