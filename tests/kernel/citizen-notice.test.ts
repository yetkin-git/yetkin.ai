import { afterEach, describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { postFreelancerContractMessage } from "@/lib/freelancer/messages";
import {
  CITIZEN_NOTICE_KINDS,
  emitCitizenNotice,
  setCitizenNoticeSink,
  type CitizenNotice,
} from "@/lib/kernel/notice";
import { isNoticeMailConfigured, readNoticeMailConfig } from "@/lib/kernel/notice/mail";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";

const CLIENT = "client-1";
const FREELANCER = "freelancer-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function world(clientBalance = 100_000) {
  const ledger = createMemoryLedgerStore([
    { userId: CLIENT, amountMinor: clientBalance },
    { userId: FREELANCER, amountMinor: 0 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const escrow = createMemoryEscrowStore();
  const freelancer = createMemoryFreelancerStore();
  return withMemoryAcceptAtomic({ ledger, escrow, freelancer });
}

describe("vatandaş bildirim asgarisi", () => {
  afterEach(() => {
    setCitizenNoticeSink(null);
  });

  it("beş olay vardır; replay ikinci bildirim basmaz; hazine atlanır", () => {
    expect([...CITIZEN_NOTICE_KINDS]).toEqual([
      "bid_received",
      "bid_accepted",
      "delivery_posted",
      "escrow_released",
      "escrow_ttl_approaching",
    ]);
    const seen: CitizenNotice[] = [];
    setCitizenNoticeSink((notice) => seen.push(notice));
    emitCitizenNotice({
      kind: "bid_received",
      userId: CLIENT,
      reference: "bid-1",
      applied: false,
    });
    expect(seen).toEqual([]);
    emitCitizenNotice({
      kind: "bid_received",
      userId: PLATFORM,
      reference: "bid-1",
      applied: true,
    });
    expect(seen).toEqual([]);
    emitCitizenNotice({
      kind: "bid_received",
      userId: CLIENT,
      reference: "bid-1",
      amountMinor: 10_000,
      applied: true,
    });
    expect(seen).toEqual([
      {
        kind: "bid_received",
        userId: CLIENT,
        reference: "bid-1",
        amountMinor: 10_000,
        applied: true,
      },
    ]);
  });

  it("SMTP boşsa yapılandırılmaz; Resend anahtarı yoktur", () => {
    expect(
      isNoticeMailConfigured({
        NOTICE_SMTP_HOST: "",
        NOTICE_MAIL_FROM: "",
      }),
    ).toBe(false);
    expect(
      readNoticeMailConfig({
        NOTICE_SMTP_HOST: "smtp.example.test",
        NOTICE_MAIL_FROM: "rail@example.test",
      }),
    ).toMatchObject({ host: "smtp.example.test", port: 587, from: "rail@example.test" });
    expect(process.env.RESEND_API_KEY).toBeUndefined();
  });

  it("teklif → kabul → teslim beşlisinin RELEASE basamağı iç hakediş kilidine takılır", async () => {
    const seen: CitizenNotice[] = [];
    setCitizenNoticeSink((notice) => seen.push(notice));
    const ports = world();
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT,
      title: "Bildirim ilanı",
      brief: "Beş e-posta asgarisi.",
      budgetMinor: 25_000,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: FREELANCER,
      amountMinor: 25_000,
      coverNote: "Teslim 5 gün.",
    });
    const { contract, applied } = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      holdBps: HOLD_BPS_DEFAULT,
      platformUserId: PLATFORM,
    });
    expect(applied).toBe(true);
    const replay = await acceptFreelancerBid(ports, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      holdBps: HOLD_BPS_DEFAULT,
      platformUserId: PLATFORM,
    });
    expect(replay.applied).toBe(false);
    await postFreelancerContractMessage(ports, {
      contractId: contract.id,
      actorUserId: FREELANCER,
      kind: "DELIVERY",
      body: "Teslim kanıtı paketi hazır.",
      artifactUrl: "https://example.test/delivery.zip",
    });
    await postFreelancerContractMessage(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      kind: "TEXT",
      body: "Not: metin teslim değildir.",
    });
    const released = await releaseFreelancerContract(ports, {
      contractId: contract.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });
    expect(released.status).toBe("RELEASED");
    expect(ports.ledger.snapshot(FREELANCER).amountMinor).toBe(0);

    const kinds = seen.map((row) => `${row.kind}:${row.userId}`);
    expect(kinds).toContain(`bid_received:${CLIENT}`);
    expect(kinds).toContain(`bid_accepted:${FREELANCER}`);
    expect(kinds).toContain(`delivery_posted:${CLIENT}`);
    expect(seen.filter((row) => row.kind === "bid_accepted")).toHaveLength(1);
    expect(seen.some((row) => row.kind === "escrow_released")).toBe(true);
  });
});
