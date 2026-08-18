import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { listFreelancerContractViews } from "@/lib/freelancer/contract-view";
import { postFreelancerContractMessage } from "@/lib/freelancer/messages";
import { railV1FreelancerContractViewSchema } from "@/lib/kernel/http/v1-contract";
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
const SECRET_BODY = "hasta-teslim-notu-gizli";
const SECRET_URL = "https://files.example/secret-delivery.zip";

function world() {
  const ledger = createMemoryLedgerStore([
    { userId: CLIENT, amountMinor: 100_000 },
    { userId: FREELANCER, amountMinor: 0 },
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

describe("FreelancerContractView — teslim türevi, PII yok", () => {
  it("DELIVERY yokken deliveredAt null; TEXT teslim sayılmaz", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    await postFreelancerContractMessage(ports, {
      contractId: contract.id,
      actorUserId: FREELANCER,
      kind: "TEXT",
      body: SECRET_BODY,
    });
    const views = await listFreelancerContractViews(ports.freelancer, FREELANCER);
    expect(views).toHaveLength(1);
    expect(views[0]?.deliveredAt).toBeNull();
    expect(views[0]?.status).toBe("FUNDED");
    expect(railV1FreelancerContractViewSchema.parse(views[0])).toEqual(views[0]);
    const serialized = JSON.stringify(views);
    expect(serialized).not.toContain(SECRET_BODY);
    expect(serialized).not.toContain("artifactUrl");
    expect(serialized).not.toContain("reportJson");
    expect(serialized).not.toContain("walletId");
  });

  it("deliveredAt kind=DELIVERY max(createdAt) türevidir; gövde/artifact sızmaz", async () => {
    const ports = world();
    const contract = await fundedContract(ports);
    await postFreelancerContractMessage(ports, {
      contractId: contract.id,
      actorUserId: FREELANCER,
      kind: "DELIVERY",
      body: SECRET_BODY,
      artifactUrl: SECRET_URL,
      now: new Date("2026-08-18T10:00:00.000Z"),
    });
    await postFreelancerContractMessage(ports, {
      contractId: contract.id,
      actorUserId: FREELANCER,
      kind: "DELIVERY",
      body: "ikinci-kanit-gizli",
      artifactUrl: "https://files.example/second.zip",
      now: new Date("2026-08-18T12:00:00.000Z"),
    });
    const asFreelancer = await listFreelancerContractViews(ports.freelancer, FREELANCER);
    const asClient = await listFreelancerContractViews(ports.freelancer, CLIENT);
    const asStranger = await listFreelancerContractViews(ports.freelancer, STRANGER);
    expect(asFreelancer).toHaveLength(1);
    expect(asClient).toHaveLength(1);
    expect(asStranger).toHaveLength(0);
    expect(asFreelancer[0]?.deliveredAt).toBe("2026-08-18T12:00:00.000Z");
    expect(asClient[0]?.deliveredAt).toBe("2026-08-18T12:00:00.000Z");
    const serialized = JSON.stringify(asFreelancer);
    expect(serialized).not.toContain(SECRET_BODY);
    expect(serialized).not.toContain(SECRET_URL);
    expect(serialized).not.toContain("ikinci-kanit-gizli");
    expect(serialized).not.toContain("second.zip");
    expect(asFreelancer[0]).not.toHaveProperty("body");
    expect(asFreelancer[0]).not.toHaveProperty("artifactUrl");
  });
});
