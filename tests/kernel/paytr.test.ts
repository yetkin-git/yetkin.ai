import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatPaytrPaymentAmount, assertPaytrProductionSafety, requestPaytrCheckoutToken, buildPaytrMockCheckoutToken } from "@/lib/kernel/payments/paytr/checkout";
import { PaytrPaymentProvider } from "@/lib/kernel/payments/paytr/adapter";
import {
  computePaytrWebhookHash,
  parsePaytrAmountMinor,
} from "@/lib/kernel/payments/paytr/webhook";
import {
  interpretPaytrStatusPayload,
  parsePaytrStatusAmountMinor,
} from "@/lib/kernel/payments/paytr/status";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";

describe("PayTR port", () => {
  afterEach(() => {
    delete process.env.PAYTR_MERCHANT_ID;
    delete process.env.PAYTR_MERCHANT_KEY;
    delete process.env.PAYTR_MERCHANT_SALT;
    delete process.env.PAYTR_SANDBOX;
    delete process.env.PAYTR_ALLOW_MOCK_CHECKOUT;
    vi.unstubAllEnvs();
  });

  it("minor tutarı yalnızca sınırda ondalık stringe çevirir", () => {
    expect(formatPaytrPaymentAmount(1300)).toBe("13.00");
    expect(() => formatPaytrPaymentAmount(13.5)).toThrow();
    expect(() => formatPaytrPaymentAmount(0)).toThrow();
  });

  it("TRY dışı checkout'u reddeder", async () => {
    const provider = new PaytrPaymentProvider();
    const result = await provider.beginCheckout({
      merchantOid: "wallet-top-up-test",
      userIp: "127.0.0.1",
      email: "a@b.co",
      paymentAmountMinor: 1000,
      currencyCode: "USD",
      merchantOkUrl: "http://localhost/ok",
      merchantFailUrl: "http://localhost/fail",
      userBasket: [{ name: "yukleme", amountMinor: toAmountMinor(1000), quantity: 1 }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("unsupported_currency");
    }
  });

  it("webhook HMAC ve minor tutarı doğrular", () => {
    process.env.PAYTR_MERCHANT_ID = "id";
    process.env.PAYTR_MERCHANT_KEY = "key-secret";
    process.env.PAYTR_MERCHANT_SALT = "salt-secret";
    const payload = {
      merchantOid: "wallet-top-up-abc",
      status: "success",
      totalAmount: "1300",
      hash: "",
      event: null,
      transferStatus: null,
    };
    payload.hash = computePaytrWebhookHash(
      payload,
      process.env.PAYTR_MERCHANT_KEY,
      process.env.PAYTR_MERCHANT_SALT,
    );
    const provider = new PaytrPaymentProvider();
    const verified = provider.verifyWebhook(payload);
    expect(verified.ok).toBe(true);
    if (verified.ok) {
      expect(verified.amountMinor).toBe(1300);
    }
    expect(parsePaytrAmountMinor("1300")).toBe(1300);
    expect(parsePaytrAmountMinor("13.00")).toBeNull();
  });

  it("sahte HMAC'i reddeder", () => {
    process.env.PAYTR_MERCHANT_ID = "id";
    process.env.PAYTR_MERCHANT_KEY = "key-secret";
    process.env.PAYTR_MERCHANT_SALT = "salt-secret";
    const provider = new PaytrPaymentProvider();
    const verified = provider.verifyWebhook({
      merchantOid: "wallet-top-up-abc",
      status: "success",
      totalAmount: "1300",
      hash: createHmac("sha256", "wrong").update("x").digest("base64"),
      event: null,
      transferStatus: null,
    });
    expect(verified.ok).toBe(false);
  });

  it("durum sorgusu ondalıklı TL'yi minor'a çevirir; bulunamadı pending'dir", () => {
    expect(parsePaytrStatusAmountMinor("13.00")).toBe(1300);
    expect(parsePaytrStatusAmountMinor("1300")).toBe(1300);
    expect(
      interpretPaytrStatusPayload({
        status: "success",
        returns: [{ payment_amount: "13.00" }],
      }),
    ).toEqual({ kind: "paid", amountMinor: 1300 });
    expect(
      interpretPaytrStatusPayload({ status: "error", err_no: "009", err_msg: "Sipariş bulunamadı" }),
    ).toEqual({ kind: "pending" });
    expect(interpretPaytrStatusPayload({ status: "failed" })).toEqual({ kind: "failed" });
  });

  it("üretimde PAYTR_SANDBOX ve PAYTR_ALLOW_MOCK_CHECKOUT fail-closed", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PAYTR_ALLOW_MOCK_CHECKOUT", "true");
    expect(() => assertPaytrProductionSafety("checkout")).toThrow(
      /PAYTR_ALLOW_MOCK_CHECKOUT üretimde yasak/,
    );
    vi.stubEnv("PAYTR_ALLOW_MOCK_CHECKOUT", "");
    vi.stubEnv("PAYTR_SANDBOX", "true");
    expect(() => assertPaytrProductionSafety("webhook")).toThrow(/PAYTR_SANDBOX üretimde yasak/);
  });

  it("kimlik yokken mock checkout token üretir; CREDIT iddia etmez", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("PAYTR_ALLOW_MOCK_CHECKOUT", "true");
    delete process.env.PAYTR_MERCHANT_ID;
    delete process.env.PAYTR_MERCHANT_KEY;
    delete process.env.PAYTR_MERCHANT_SALT;
    const result = await requestPaytrCheckoutToken({
      merchantOid: "wallet-top-up-mock-1",
      userIp: "127.0.0.1",
      email: "e2e@example.com",
      paymentAmountMinor: 10_000,
      merchantOkUrl: "http://localhost/ok",
      merchantFailUrl: "http://localhost/fail",
      userBasket: [{ name: "yukleme", amountMinor: 10_000, quantity: 1 }],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mockCheckout).toBe(true);
      expect(result.sandboxMode).toBe(true);
      expect(result.token).toBe(buildPaytrMockCheckoutToken("wallet-top-up-mock-1"));
    }
  });

  it("mock kapalıyken kimlik yoksa token basmaz", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("PAYTR_ALLOW_MOCK_CHECKOUT", "");
    delete process.env.PAYTR_MERCHANT_ID;
    delete process.env.PAYTR_MERCHANT_KEY;
    delete process.env.PAYTR_MERCHANT_SALT;
    const result = await requestPaytrCheckoutToken({
      merchantOid: "wallet-top-up-mock-2",
      userIp: "127.0.0.1",
      email: "e2e@example.com",
      paymentAmountMinor: 10_000,
      merchantOkUrl: "http://localhost/ok",
      merchantFailUrl: "http://localhost/fail",
      userBasket: [{ name: "yukleme", amountMinor: 10_000, quantity: 1 }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("missing_credentials");
    }
  });
});
