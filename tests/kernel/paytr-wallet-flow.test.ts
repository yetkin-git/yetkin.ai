import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEscrowHold,
  ESCROW_WALLET_FUNDING_FORBIDDEN,
  PLATFORM_TREASURY_USER_ID,
} from "@/lib/kernel/escrow/engine";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PaytrPaymentProvider } from "@/lib/kernel/payments/paytr/adapter";
import {
  buildPaytrTokenHash,
  encodePaytrUserBasket,
  requestPaytrCheckoutToken,
} from "@/lib/kernel/payments/paytr/checkout";
import { computePaytrWebhookHash } from "@/lib/kernel/payments/paytr/webhook";
import {
  settlePaytrWebhookFailure,
  settlePaytrWebhookSuccess,
} from "@/lib/kernel/payments/paytr/webhook-settle";
import {
  assertWalletTopUpAmountMinor,
  WALLET_TOP_UP_MAX_MINOR,
  WALLET_TOP_UP_MIN_MINOR,
} from "@/lib/kernel/payments/wallet-top-up";
import { createMemoryLedgerStore, createMemoryEscrowStore } from "../helpers/memory-money";
import { createMemoryPaymentAnomalyStore } from "../helpers/memory-payment-anomaly";
import { createMemoryPaymentOrderStore } from "../helpers/memory-payment-orders";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";

const OID = "wallettopupflow1";
const BUYER = "buyer-paytr-flow";
const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440010";
const AMOUNT = 1300;

function setLivePaytrCredentials(): void {
  process.env.PAYTR_MERCHANT_ID = "111111";
  process.env.PAYTR_MERCHANT_KEY = "key-secret";
  process.env.PAYTR_MERCHANT_SALT = "salt-secret";
  delete process.env.PAYTR_SANDBOX;
  delete process.env.PAYTR_ALLOW_MOCK_CHECKOUT;
}

function snapshot(overrides?: Partial<PaymentOrderSnapshot>): PaymentOrderSnapshot {
  return {
    id: "po-flow",
    userId: BUYER,
    merchantOid: OID,
    amountMinor: AMOUNT,
    currencyCode: "TRY",
    status: "PENDING",
    createdAt: new Date("2026-08-29T00:00:00.000Z"),
    ...overrides,
  };
}

function settleWorld(order: PaymentOrderSnapshot | null) {
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

describe("PayTR cüzdan yükleme halkası — başlatma, callback, bakiye", () => {
  afterEach(() => {
    delete process.env.PAYTR_MERCHANT_ID;
    delete process.env.PAYTR_MERCHANT_KEY;
    delete process.env.PAYTR_MERCHANT_SALT;
    delete process.env.PAYTR_SANDBOX;
    delete process.env.PAYTR_ALLOW_MOCK_CHECKOUT;
    vi.unstubAllEnvs();
  });

  it("get-token iframe başlatır; success CREDIT yazar; failed CREDIT yazmaz", async () => {
    vi.stubEnv("PAYTR_MERCHANT_ID", "111111");
    vi.stubEnv("PAYTR_MERCHANT_KEY", "key-secret");
    vi.stubEnv("PAYTR_MERCHANT_SALT", "salt-secret");
    vi.stubEnv("PAYTR_SANDBOX", "1");

    const basket = [{ name: "Cuzdan yukleme", amountMinor: AMOUNT, quantity: 1 }];
    const capture: { posted: URLSearchParams | null } = { posted: null };
    const checkout = await requestPaytrCheckoutToken(
      {
        merchantOid: OID,
        userIp: "85.105.141.10",
        email: "citizen@example.com",
        paymentAmountMinor: AMOUNT,
        merchantOkUrl: "https://rail.example/cuzdan",
        merchantFailUrl: "https://rail.example/cuzdan",
        userBasket: basket,
        userName: "Ayşe Kaya",
        userAddress: "İnönü Mah. 157 Sk. No:3/C Akhisar",
        userPhone: "05321234567",
      },
      async (_url, init) => {
        capture.posted = new URLSearchParams(String(init?.body ?? ""));
        return new Response(JSON.stringify({ status: "success", token: "iframe-live" }), {
          status: 200,
        });
      },
    );
    expect(checkout.ok).toBe(true);
    if (!checkout.ok) {
      throw new Error("get-token beklenirdi.");
    }
    expect(checkout.mockCheckout).toBeUndefined();
    expect(checkout.token).toBe("iframe-live");
    expect(capture.posted?.get("merchant_oid")).toBe(OID);
    expect(capture.posted?.get("payment_amount")).toBe(String(AMOUNT));
    expect(capture.posted?.get("paytr_token")).toBe(
      buildPaytrTokenHash({
        credentials: {
          merchantId: "111111",
          merchantKey: "key-secret",
          merchantSalt: "salt-secret",
          testMode: true,
        },
        userIp: "85.105.141.10",
        merchantOid: OID,
        email: "citizen@example.com",
        paymentAmount: String(AMOUNT),
        userBasket: encodePaytrUserBasket(basket),
        noInstallment: "1",
        maxInstallment: "0",
        currency: "TL",
        testMode: "1",
      }),
    );

    setLivePaytrCredentials();
    const provider = new PaytrPaymentProvider();
    const successHash = computePaytrWebhookHash(
      { merchantOid: OID, status: "success", totalAmount: String(AMOUNT) },
      "key-secret",
      "salt-secret",
    );
    const successVerified = provider.verifyWebhook({
      merchantOid: OID,
      status: "success",
      totalAmount: String(AMOUNT),
      hash: successHash,
      event: null,
      transferStatus: null,
    });
    expect(successVerified.ok).toBe(true);
    if (!successVerified.ok) {
      throw new Error("success HMAC beklenirdi.");
    }

    const paid = settleWorld(snapshot());
    const cleared = await settlePaytrWebhookSuccess(paid, {
      merchantOid: successVerified.merchantOid,
      amountMinor: successVerified.amountMinor,
      requestId: REQUEST_ID,
      sourceIp: "203.0.113.10",
    });
    expect(cleared).toMatchObject({
      disposition: "cleared",
      ack: true,
      creditApplied: true,
    });
    expect(paid.ledger.snapshot(BUYER).amountMinor).toBe(AMOUNT);
    expect((await paid.orders.findByMerchantOid(OID))?.status).toBe("CLEARED");

    const failedPayload = {
      merchantOid: OID,
      status: "failed",
      totalAmount: String(AMOUNT),
      hash: computePaytrWebhookHash(
        { merchantOid: OID, status: "failed", totalAmount: String(AMOUNT) },
        "key-secret",
        "salt-secret",
      ),
      event: null,
      transferStatus: null,
    };
    const failedVerified = provider.verifyWebhook(failedPayload);
    expect(failedVerified.ok).toBe(true);
    if (!failedVerified.ok) {
      throw new Error("failed HMAC beklenirdi.");
    }
    expect(failedVerified.status).toBe("failed");

    const pending = settleWorld(snapshot());
    const closed = await settlePaytrWebhookFailure(pending.orders, {
      merchantOid: failedVerified.merchantOid,
      amountMinor: failedVerified.amountMinor,
      requestId: `${REQUEST_ID}-fail`,
    });
    expect(closed).toMatchObject({
      disposition: "failed",
      ack: true,
      applied: true,
      creditApplied: false,
    });
    expect(pending.ledger.snapshot(BUYER).amountMinor).toBe(0);
    expect(await pending.ledger.findByIdempotencyKey(`wallet-top-up:${OID}`)).toBeNull();
    expect((await pending.orders.findByMerchantOid(OID))?.status).toBe("FAILED");

    const afterClear = await settlePaytrWebhookFailure(paid.orders, {
      merchantOid: OID,
      amountMinor: AMOUNT,
      requestId: `${REQUEST_ID}-replay-fail`,
    });
    expect(afterClear.applied).toBe(false);
    expect(afterClear.creditApplied).toBe(false);
    expect(paid.ledger.snapshot(BUYER).amountMinor).toBe(AMOUNT);
    expect((await paid.orders.findByMerchantOid(OID))?.status).toBe("CLEARED");
  });

  it("cüzdan bandı ve emanet cüzdan-DEBIT bakiyeyi değiştirmez", async () => {
    expect(assertWalletTopUpAmountMinor(WALLET_TOP_UP_MIN_MINOR)).toBe(1_000);
    expect(assertWalletTopUpAmountMinor(WALLET_TOP_UP_MAX_MINOR)).toBe(2_000_000);
    expect(() => assertWalletTopUpAmountMinor(WALLET_TOP_UP_MIN_MINOR - 1)).toThrow();
    expect(() => assertWalletTopUpAmountMinor(WALLET_TOP_UP_MAX_MINOR + 1)).toThrow();

    const escrow = createMemoryEscrowStore();
    const ledger = createMemoryLedgerStore([{ userId: BUYER, amountMinor: 50_000 }]);
    await expect(
      createEscrowHold(
        { ledger, escrow },
        {
          userId: BUYER,
          referenceKey: "flow-wallet-hold",
          grossMinor: 10_000,
          holdBps: HOLD_BPS_DEFAULT,
          currencyCode: SETTLEMENT_CURRENCY,
          funding: "wallet",
        },
      ),
    ).rejects.toThrow(ESCROW_WALLET_FUNDING_FORBIDDEN);
    expect(ledger.snapshot(BUYER).amountMinor).toBe(50_000);
    expect(await escrow.findByReferenceKey("flow-wallet-hold")).toBeNull();
  });
});
