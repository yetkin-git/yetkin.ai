import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as postPaytrWebhook } from "@/app/api/(kernel)/payments/webhooks/paytr/route";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { freelancerJobEscrowReferenceKey } from "@/lib/freelancer/fsm";
import { createEscrowHold, PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import {
  clearSuccessfulPaymentOrder,
  type PaymentOrderSnapshot,
  type PaymentOrderStore,
} from "@/lib/kernel/payments/clearing";
import { PaytrPaymentProvider } from "@/lib/kernel/payments/paytr/adapter";
import {
  assertPaytrLiveUserIp,
  assertPaytrProductionSafety,
  PaytrProductionSafetyError,
  resolvePaytrMerchantAppOrigin,
} from "@/lib/kernel/payments/paytr/checkout";
import {
  computePaytrWebhookHash,
  isPaytrWebhookSourceIpAllowed,
  parsePaytrWebhookIpAllowlist,
} from "@/lib/kernel/payments/paytr/webhook";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { ConflictError } from "@/lib/kernel/http/errors";
import { RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE } from "@/lib/kernel/http/v1-contract";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";

const OID = "wallettopupshield1";
const BUYER = "buyer-paytr-shield";
const FREELANCER = "freelancer-paytr-shield";
const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";

function setLivePaytrCredentials(): void {
  process.env.PAYTR_MERCHANT_ID = "id";
  process.env.PAYTR_MERCHANT_KEY = "key-secret";
  process.env.PAYTR_MERCHANT_SALT = "salt-secret";
  delete process.env.PAYTR_SANDBOX;
  delete process.env.PAYTR_ALLOW_MOCK_CHECKOUT;
  delete process.env.PAYTR_WEBHOOK_IP_ALLOWLIST;
}

function validHash(totalAmount = "1300"): string {
  return computePaytrWebhookHash(
    { merchantOid: OID, status: "success", totalAmount },
    "key-secret",
    "salt-secret",
  );
}

function webhookForm(hash: string, totalAmount = "1300"): FormData {
  const form = new FormData();
  form.set("merchant_oid", OID);
  form.set("status", "success");
  form.set("total_amount", totalAmount);
  form.set("hash", hash);
  return form;
}

function postWebhook(form: FormData, extraHeaders?: HeadersInit): Promise<Response> {
  return postPaytrWebhook(
    new Request("http://localhost/api/payments/webhooks/paytr", {
      method: "POST",
      headers: { "x-request-id": REQUEST_ID, ...extraHeaders },
      body: form,
    }),
  );
}

function snapshot(overrides?: Partial<PaymentOrderSnapshot>): PaymentOrderSnapshot {
  return {
    id: "po-shield",
    userId: BUYER,
    merchantOid: OID,
    amountMinor: 1300,
    currencyCode: "TRY",
    status: "PENDING",
    createdAt: new Date("2026-08-18T00:00:00.000Z"),
    ...overrides,
  };
}

function memoryOrders(initial: PaymentOrderSnapshot): PaymentOrderStore {
  let row = { ...initial };
  return {
    async findByMerchantOid(merchantOid) {
      return merchantOid === row.merchantOid ? { ...row } : null;
    },
    async markPaid(id, _at) {
      row = { ...row, id, status: "PAID" };
      return { ...row };
    },
    async markCleared(id, _at) {
      row = { ...row, id, status: "CLEARED" };
      return { ...row };
    },
    async markFailed(id, _at) {
      row = { ...row, id, status: "FAILED" };
      return { ...row };
    },
    async listUnclearedPaid() {
      return row.status === "PAID" ? [{ ...row }] : [];
    },
  };
}

describe("PayTR canlı kalkan mührü", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    setLivePaytrCredentials();
  });

  afterEach(() => {
    delete process.env.PAYTR_MERCHANT_ID;
    delete process.env.PAYTR_MERCHANT_KEY;
    delete process.env.PAYTR_MERCHANT_SALT;
    delete process.env.PAYTR_SANDBOX;
    delete process.env.PAYTR_ALLOW_MOCK_CHECKOUT;
    delete process.env.PAYTR_WEBHOOK_IP_ALLOWLIST;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("geçersiz PayTR HMAC imzasını 403 ile keser; CREDIT yoluna inmez", async () => {
    const fakeHash = createHmac("sha256", "wrong").update("x").digest("base64");
    const response = await postWebhook(webhookForm(fakeHash));
    expect(response.status).toBe(403);
    const body = (await response.json()) as { status: string; reason: string };
    expect(body.status).toBe("rejected");
    expect(body.reason).toBe("invalid_signature");

    const provider = new PaytrPaymentProvider();
    const verified = provider.verifyWebhook({
      merchantOid: OID,
      status: "success",
      totalAmount: "1300",
      hash: fakeHash,
      event: null,
      transferStatus: null,
    });
    expect(verified.ok).toBe(false);
    if (!verified.ok) {
      expect(verified.reason).toBe("invalid_signature");
    }
  });

  it("üretimde sandbox/mock sessiz geçmez: throw + log + webhook 403", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PAYTR_SANDBOX", "1");
    expect(() => assertPaytrProductionSafety("live-shield")).toThrow(PaytrProductionSafetyError);
    expect(() => assertPaytrProductionSafety("live-shield")).toThrow(/PAYTR_SANDBOX üretimde yasak/);

    const response = await postWebhook(webhookForm(validHash()));
    expect(response.status).toBe(403);
    const body = (await response.json()) as { reason: string };
    expect(body.reason).toBe("production_safety");

    const logged = vi.mocked(console.error).mock.calls.some((call) => {
      const line = String(call[0] ?? "");
      return line.includes("paytr.production_safety") || line.includes("production_safety");
    });
    expect(logged).toBe(true);

    vi.stubEnv("PAYTR_SANDBOX", "");
    vi.stubEnv("PAYTR_ALLOW_MOCK_CHECKOUT", "true");
    expect(() => assertPaytrProductionSafety("live-shield-mock")).toThrow(
      /PAYTR_ALLOW_MOCK_CHECKOUT üretimde yasak/,
    );
  });

  it("üçlü kimlik yoksa imza doğrulanmaz ve CREDIT yazılmaz", () => {
    delete process.env.PAYTR_MERCHANT_ID;
    delete process.env.PAYTR_MERCHANT_KEY;
    delete process.env.PAYTR_MERCHANT_SALT;
    const provider = new PaytrPaymentProvider();
    const verified = provider.verifyWebhook({
      merchantOid: OID,
      status: "success",
      totalAmount: "1300",
      hash: validHash(),
      event: null,
      transferStatus: null,
    });
    expect(verified.ok).toBe(false);
    if (!verified.ok) {
      expect(verified.reason).toBe("missing_credentials");
    }
  });

  it("aynı merchant_oid mükerrer webhook'ta tekil CREDIT üretir", async () => {
    const orders = memoryOrders(snapshot());
    const ledger = createMemoryLedgerStore([
      { userId: BUYER, amountMinor: 0 },
      { userId: PLATFORM_TREASURY_USER_ID, amountMinor: 0 },
    ]);
    const first = await clearSuccessfulPaymentOrder(
      { ledger, orders },
      OID,
      new Date("2026-08-18T00:10:00.000Z"),
      { expectedAmountMinor: 1300 },
    );
    expect(first.applied).toBe(true);
    expect(ledger.snapshot(BUYER).amountMinor).toBe(1300);
    const credit = await ledger.findByIdempotencyKey(`wallet-top-up:${OID}`);
    expect(credit?.direction).toBe("CREDIT");
    expect(credit?.purpose).toBe("wallet-top-up");

    const second = await clearSuccessfulPaymentOrder(
      { ledger, orders },
      OID,
      new Date("2026-08-18T00:11:00.000Z"),
      { expectedAmountMinor: 1300 },
    );
    expect(second.applied).toBe(false);
    expect(ledger.snapshot(BUYER).amountMinor).toBe(1300);
  });

  it("bakiye yetersizliğinde emanet fonlama durur; hold ve sözleşme yazılmaz", async () => {
    const escrow = createMemoryEscrowStore();
    const emptyLedger = createMemoryLedgerStore([
      { userId: BUYER, amountMinor: 0 },
      { userId: PLATFORM_TREASURY_USER_ID, amountMinor: 0 },
    ]);
    await expect(
      createEscrowHold(
        { ledger: emptyLedger, escrow },
        {
          userId: BUYER,
          referenceKey: "shield-hold",
          grossMinor: 10_000,
          holdBps: HOLD_BPS_DEFAULT,
          currencyCode: SETTLEMENT_CURRENCY,
        },
      ),
    ).rejects.toThrow(/mevcut tutarı aşamaz/);
    expect(emptyLedger.snapshot(BUYER).amountMinor).toBe(0);
    expect(await escrow.findByReferenceKey("shield-hold")).toBeNull();

    const ports = withMemoryAcceptAtomic({
      ledger: createMemoryLedgerStore([
        { userId: BUYER, amountMinor: 500 },
        { userId: FREELANCER, amountMinor: 0 },
        { userId: PLATFORM_TREASURY_USER_ID, amountMinor: 0 },
      ]),
      escrow: createMemoryEscrowStore(),
      freelancer: createMemoryFreelancerStore(),
    });
    const job = await createFreelancerJob(ports, {
      clientId: BUYER,
      title: "Kalkan emanet",
      brief: "Yetersiz bakiyede hold açılmaz.",
      budgetMinor: 10_000,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: FREELANCER,
      amountMinor: 10_000,
      coverNote: "Hazırım.",
    });
    await expect(
      acceptFreelancerBid(ports, {
        jobId: job.id,
        bidId: bid.id,
        actorUserId: BUYER,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    await expect(
      acceptFreelancerBid(ports, {
        jobId: job.id,
        bidId: bid.id,
        actorUserId: BUYER,
      }),
    ).rejects.toThrow(RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(500);
    expect(await ports.freelancer.getContractByJobId(job.id)).toBeNull();
    expect(await ports.escrow.findByReferenceKey(freelancerJobEscrowReferenceKey(job.id))).toBeNull();
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("OPEN");
  });

  it("boş IP allowlist HMAC-only bırakır; dolu listede yabancı IP kesilir", () => {
    expect(parsePaytrWebhookIpAllowlist("")).toEqual([]);
    expect(isPaytrWebhookSourceIpAllowed("1.2.3.4", [])).toBe(true);
    expect(isPaytrWebhookSourceIpAllowed("1.2.3.4", ["5.6.7.8"])).toBe(false);
    expect(isPaytrWebhookSourceIpAllowed("5.6.7.8", ["5.6.7.8"])).toBe(true);
    expect(isPaytrWebhookSourceIpAllowed("", ["5.6.7.8"])).toBe(false);
  });

  it("allowlist doluyken yabancı kaynak IP 403 döner", async () => {
    process.env.PAYTR_WEBHOOK_IP_ALLOWLIST = "203.0.113.10";
    const response = await postWebhook(webhookForm(validHash()), {
      "x-forwarded-for": "198.51.100.1",
    });
    expect(response.status).toBe(403);
    const body = (await response.json()) as { reason: string };
    expect(body.reason).toBe("ip_not_allowed");
  });

  it("üretimde loopback user_ip ve localhost köken fail-closed", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => assertPaytrLiveUserIp("127.0.0.1", "shield")).toThrow(/user_ip üretimde genel IPv4/);
    expect(() => assertPaytrLiveUserIp("10.0.0.1", "shield")).toThrow(/user_ip/);
    expect(() => assertPaytrLiveUserIp("85.105.141.10", "shield")).not.toThrow();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    expect(() => resolvePaytrMerchantAppOrigin()).toThrow(/HTTPS/);
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://rail.example");
    expect(resolvePaytrMerchantAppOrigin()).toBe("https://rail.example");
  });
});
