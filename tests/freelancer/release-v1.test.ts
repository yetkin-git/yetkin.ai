import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { RAIL_V1_RELEASE_FORBIDDEN } from "@/lib/kernel/http/v1-contract";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
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
    budgetMinor: 25_000,
  });
  const bid = await submitFreelancerBid(ports, {
    jobId: job.id,
    bidderId: FREELANCER,
    amountMinor: 25_000,
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

describe("Hak ediş serbest bırakma — işveren / FUNDED / Pazaryeri split", () => {
  it("işveren FUNDED sözleşmede hold RELEASED; usta cüzdanına CREDIT yok", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    const released = await releaseFreelancerContract(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });
    expect(released.status).toBe("RELEASED");
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(0);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
    expect(netCreditCount(ports, FREELANCER)).toBe(0);
  });

  it("usta ve yabancı 403; CREDIT yok", async () => {
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
  });
});
