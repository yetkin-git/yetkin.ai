import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as postPaytrWebhook } from "@/app/api/(kernel)/payments/webhooks/paytr/route";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import {
  type PaymentOrderSnapshot,
} from "@/lib/kernel/payments/clearing";
import { PaytrPaymentProvider } from "@/lib/kernel/payments/paytr/adapter";
import {
  computePaytrWebhookHash,
  isPaytrWebhookIpAllowlistRequired,
  isPaytrWebhookSourceIpAllowed,
} from "@/lib/kernel/payments/paytr/webhook";
import {
  settlePaytrWebhookFailure,
  settlePaytrWebhookSuccess,
} from "@/lib/kernel/payments/paytr/webhook-settle";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryPaymentAnomalyStore } from "../helpers/memory-payment-anomaly";
import { createMemoryPaymentOrderStore } from "../helpers/memory-payment-orders";

const OID = "wallettopupanomaly1";
const BUYER = "buyer-paytr-anomaly";
const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440001";

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
    id: "po-anomaly",
    userId: BUYER,
    merchantOid: OID,
    amountMinor: 1300,
    currencyCode: "TRY",
    status: "PENDING",
    createdAt: new Date("2026-08-19T00:00:00.000Z"),
    ...overrides,
  };
}

function settlePorts(order: PaymentOrderSnapshot | null) {
  const anomalies = createMemoryPaymentAnomalyStore();
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: 0 },
    { userId: PLATFORM_TREASURY_USER_ID, amountMinor: 0 },
  ]);
  return {
    ledger,
    orders: createMemoryPaymentOrderStore(order),
    anomalies,
  };
}

describe("PayTR webhook güvenlik — HMAC, mismatch, anomali", () => {
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

  it("geçersiz HMAC 403 döner; CREDIT yoluna inmez", async () => {
    const fakeHash = createHmac("sha256", "wrong").update("x").digest("base64");
    const response = await postWebhook(webhookForm(fakeHash));
    expect(response.status).toBe(403);
    const body = (await response.json()) as { reason: string };
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

  it("geçerli HMAC + tutar enjeksiyonu CREDIT yazmaz; anomali kalıcılaşır; ACK", async () => {
    const world = settlePorts(snapshot());
    const result = await settlePaytrWebhookSuccess(world, {
      merchantOid: OID,
      amountMinor: 9999,
      requestId: REQUEST_ID,
      sourceIp: "203.0.113.10",
    });
    expect(result.disposition).toBe("anomaly");
    expect(result.ack).toBe(true);
    expect(result.creditApplied).toBe(false);
    if (result.disposition === "anomaly") {
      expect(result.kind).toBe("amount_mismatch");
      expect(result.duplicate).toBe(false);
    }
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(0);
    expect(await world.ledger.findByIdempotencyKey(`wallet-top-up:${OID}`)).toBeNull();
    expect(world.anomalies.list()).toHaveLength(1);
    expect(world.anomalies.list()[0]?.kind).toBe("amount_mismatch");
    expect((await world.orders.findByMerchantOid(OID))?.status).toBe("PENDING");
  });

  it("sipariş yoksa CREDIT yazmaz; order_not_found anomali + ACK", async () => {
    const world = settlePorts(null);
    const result = await settlePaytrWebhookSuccess(world, {
      merchantOid: OID,
      amountMinor: 1300,
      requestId: REQUEST_ID,
      sourceIp: "203.0.113.10",
    });
    expect(result).toMatchObject({
      disposition: "anomaly",
      ack: true,
      kind: "order_not_found",
      creditApplied: false,
    });
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(0);
    expect(world.anomalies.list()).toHaveLength(1);
  });

  it("mükerrer bozuk webhook ikinci CREDIT yazmaz; aynı parmak izi anomaliyi çoğaltmaz", async () => {
    const world = settlePorts(snapshot());
    const first = await settlePaytrWebhookSuccess(world, {
      merchantOid: OID,
      amountMinor: 9999,
      requestId: REQUEST_ID,
      sourceIp: "203.0.113.10",
    });
    const second = await settlePaytrWebhookSuccess(world, {
      merchantOid: OID,
      amountMinor: 9999,
      requestId: "replay-2",
      sourceIp: "203.0.113.10",
    });
    expect(first.disposition).toBe("anomaly");
    expect(second.disposition).toBe("anomaly");
    if (second.disposition === "anomaly") {
      expect(second.duplicate).toBe(true);
      expect(second.ack).toBe(true);
    }
    expect(world.anomalies.list()).toHaveLength(1);
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(0);
  });

  it("anomali yazılamazsa ACK verilmez (PSP retry)", async () => {
    const world = settlePorts(snapshot());
    world.anomalies.insert = async () => {
      throw new Error("anomali deposu kapalı");
    };
    const result = await settlePaytrWebhookSuccess(world, {
      merchantOid: OID,
      amountMinor: 9999,
      requestId: REQUEST_ID,
      sourceIp: "203.0.113.10",
    });
    expect(result).toMatchObject({
      disposition: "persist_failed",
      ack: false,
      creditApplied: false,
    });
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(0);
  });

  it("eşleşen tutarda CREDIT yazar", async () => {
    const world = settlePorts(snapshot());
    const result = await settlePaytrWebhookSuccess(world, {
      merchantOid: OID,
      amountMinor: 1300,
      requestId: REQUEST_ID,
      sourceIp: "203.0.113.10",
    });
    expect(result).toMatchObject({
      disposition: "cleared",
      ack: true,
      creditApplied: true,
    });
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(1300);
    expect(world.anomalies.list()).toHaveLength(0);
  });

  it("FAILED siparişte eşleşen tutar geç paid recovery ile CREDIT yazar", async () => {
    const world = settlePorts(snapshot({ status: "FAILED" }));
    const result = await settlePaytrWebhookSuccess(world, {
      merchantOid: OID,
      amountMinor: 1300,
      requestId: REQUEST_ID,
      sourceIp: "203.0.113.10",
    });
    expect(result).toMatchObject({
      disposition: "cleared",
      ack: true,
      creditApplied: true,
    });
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(1300);
    expect((await world.orders.findByMerchantOid(OID))?.status).toBe("CLEARED");
    expect(world.anomalies.list()).toHaveLength(0);
  });

  it("HMAC failed bildirimi CREDIT yazmaz; PENDING FAILED olur", async () => {
    const world = settlePorts(snapshot());
    const result = await settlePaytrWebhookFailure(world.orders, {
      merchantOid: OID,
      amountMinor: 1300,
      requestId: REQUEST_ID,
    });
    expect(result).toMatchObject({
      disposition: "failed",
      ack: true,
      applied: true,
      creditApplied: false,
    });
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(0);
    expect(await world.ledger.findByIdempotencyKey(`wallet-top-up:${OID}`)).toBeNull();
    expect((await world.orders.findByMerchantOid(OID))?.status).toBe("FAILED");
  });

  it("FAILED bildirim CLEARED bakiyeyi ezmez; sipariş yoksa ACK ve CREDIT yok", async () => {
    const cleared = settlePorts(snapshot({ status: "CLEARED" }));
    const skip = await settlePaytrWebhookFailure(cleared.orders, {
      merchantOid: OID,
      amountMinor: 1300,
      requestId: REQUEST_ID,
    });
    expect(skip).toMatchObject({
      disposition: "failed",
      ack: true,
      applied: false,
      creditApplied: false,
    });
    expect(cleared.ledger.snapshot(BUYER).amountMinor).toBe(0);
    expect((await cleared.orders.findByMerchantOid(OID))?.status).toBe("CLEARED");

    const missing = settlePorts(null);
    const skipped = await settlePaytrWebhookFailure(missing.orders, {
      merchantOid: OID,
      amountMinor: 1300,
      requestId: REQUEST_ID,
    });
    expect(skipped).toMatchObject({
      disposition: "fail_skipped",
      ack: true,
      creditApplied: false,
    });
    expect(missing.ledger.snapshot(BUYER).amountMinor).toBe(0);
  });

  it("üretimde boş IP allowlist fail-closed; lab boş liste HMAC-only", () => {
    expect(isPaytrWebhookIpAllowlistRequired({ NODE_ENV: "production" })).toBe(true);
    expect(isPaytrWebhookSourceIpAllowed("1.2.3.4", [], { NODE_ENV: "production" })).toBe(false);
    expect(isPaytrWebhookSourceIpAllowed("", ["203.0.113.10"], { NODE_ENV: "production" })).toBe(
      false,
    );
    expect(
      isPaytrWebhookSourceIpAllowed("203.0.113.10", ["203.0.113.10"], { NODE_ENV: "production" }),
    ).toBe(true);
    expect(isPaytrWebhookSourceIpAllowed("1.2.3.4", [], { NODE_ENV: "test" })).toBe(true);
  });

  it("üretimde boş allowlist webhook 403 ip_not_allowed; CREDIT yok", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = await postWebhook(webhookForm(validHash()), {
      "x-forwarded-for": "203.0.113.10",
    });
    expect(response.status).toBe(403);
    const body = (await response.json()) as { reason: string };
    expect(body.reason).toBe("ip_not_allowed");
  });

  it("trusted-proxy sağ hop allowlist'te değilse spoof sol IP 403", async () => {
    process.env.PAYTR_WEBHOOK_IP_ALLOWLIST = "203.0.113.10";
    const spoofed = await postWebhook(webhookForm(validHash()), {
      "x-forwarded-for": "203.0.113.10, 198.51.100.99",
    });
    expect(spoofed.status).toBe(403);
    const body = (await spoofed.json()) as { reason: string };
    expect(body.reason).toBe("ip_not_allowed");
  });
});
