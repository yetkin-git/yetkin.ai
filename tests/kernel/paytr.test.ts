import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatPaytrPaymentAmount,
  assertPaytrProductionSafety,
  requestPaytrCheckoutToken,
  buildPaytrMockCheckoutToken,
  buildPaytrTokenHash,
  encodePaytrUserBasket,
  paytrRuntimeCreditsWallet,
  readPaytrRuntimeMode,
} from "@/lib/kernel/payments/paytr/checkout";
import { tryPaytrDevOnlyMockCheckout } from "@/lib/kernel/payments/paytr/mock-checkout";
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
    delete process.env.PAYTR_WEBHOOK_IP_ALLOWLIST;
    vi.unstubAllEnvs();
  });

  it("sepet toplamı payment_amount ile eşleşmezse get-token açılmaz", async () => {
    vi.stubEnv("PAYTR_MERCHANT_ID", "111111");
    vi.stubEnv("PAYTR_MERCHANT_KEY", "key-secret");
    vi.stubEnv("PAYTR_MERCHANT_SALT", "salt-secret");
    const result = await requestPaytrCheckoutToken({
      merchantOid: "wallet-top-up-mismatch",
      userIp: "127.0.0.1",
      email: "e2e@example.com",
      paymentAmountMinor: 89_000,
      merchantOkUrl: "http://localhost/ok",
      merchantFailUrl: "http://localhost/fail",
      userBasket: [{ name: "yukleme", amountMinor: 49_000, quantity: 1 }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("invalid_amount");
    }
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
    if (!verified.ok) {
      expect(verified.reason).toBe("invalid_signature");
    }
  });

  it("başarısız bildirim HMAC'ini doğrular; tutar parse edilir", () => {
    process.env.PAYTR_MERCHANT_ID = "id";
    process.env.PAYTR_MERCHANT_KEY = "key-secret";
    process.env.PAYTR_MERCHANT_SALT = "salt-secret";
    const payload = {
      merchantOid: "wallet-top-up-abc",
      status: "failed",
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
      expect(verified.status).toBe("failed");
      expect(verified.amountMinor).toBe(1300);
    }
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
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PAYTR_ALLOW_MOCK_CHECKOUT", "true");
    expect(() => assertPaytrProductionSafety("checkout")).toThrow(
      /PAYTR_ALLOW_MOCK_CHECKOUT üretimde yasak/,
    );
    vi.stubEnv("PAYTR_ALLOW_MOCK_CHECKOUT", "");
    vi.stubEnv("PAYTR_SANDBOX", "true");
    expect(() => assertPaytrProductionSafety("webhook")).toThrow(/PAYTR_SANDBOX üretimde yasak/);
    errorSpy.mockRestore();
  });

  it("üretimde mock checkout token basmaz; CREDIT iddia etmez", () => {
    const mock = tryPaytrDevOnlyMockCheckout("wallet-top-up-prod", {
      NODE_ENV: "production",
      PAYTR_ALLOW_MOCK_CHECKOUT: "true",
    });
    expect(mock).toBeNull();
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

  it("iframe get-token resmi hash, kuruş payment_amount ve no_installment taşır", async () => {
    vi.stubEnv("PAYTR_MERCHANT_ID", "111111");
    vi.stubEnv("PAYTR_MERCHANT_KEY", "key-secret");
    vi.stubEnv("PAYTR_MERCHANT_SALT", "salt-secret");
    vi.stubEnv("PAYTR_SANDBOX", "1");
    const capture: { posted: URLSearchParams | null } = { posted: null };
    const fetchImpl: typeof fetch = async (_url, init) => {
      capture.posted = new URLSearchParams(String(init?.body ?? ""));
      return new Response(JSON.stringify({ status: "success", token: "iframe-token" }), {
        status: 200,
      });
    };
    const basket = [{ name: "yukleme", amountMinor: 1300, quantity: 1 }];
    const result = await requestPaytrCheckoutToken(
      {
        merchantOid: "wallettopuptest1",
        userIp: "85.105.141.10",
        email: "e2e@example.com",
        paymentAmountMinor: 1300,
        merchantOkUrl: "http://localhost/ok",
        merchantFailUrl: "http://localhost/fail",
        userBasket: basket,
        userName: "Ayşe Kaya",
        userAddress: "İnönü Mah. 157 Sk. No:3/C Akhisar",
        userPhone: "05321234567",
      },
      fetchImpl,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mockCheckout).toBeUndefined();
      expect(result.sandboxMode).toBe(true);
    }
    const posted = capture.posted;
    expect(posted).toBeInstanceOf(URLSearchParams);
    if (!posted) {
      throw new Error("iframe get-token gövdesi beklenirdi.");
    }
    expect(posted.get("payment_amount")).toBe("1300");
    expect(posted.get("no_installment")).toBe("1");
    expect(posted.get("max_installment")).toBe("0");
    expect(posted.get("payment_type")).toBeNull();
    expect(posted.get("non_3d")).toBeNull();
    const userBasket = encodePaytrUserBasket(basket);
    expect(posted.get("user_basket")).toBe(userBasket);
    expect(posted.get("user_phone")).toBe("05321234567");
    expect(posted.get("user_name")).toBe("Ayşe Kaya");
    expect(posted.get("user_address")).toBe("İnönü Mah. 157 Sk. No:3/C Akhisar");
    expect(posted.get("user_phone")).not.toBe("05000000000");
    expect(posted.get("paytr_token")).toBe(
      buildPaytrTokenHash({
        credentials: {
          merchantId: "111111",
          merchantKey: "key-secret",
          merchantSalt: "salt-secret",
          testMode: true,
        },
        userIp: "85.105.141.10",
        merchantOid: "wallettopuptest1",
        email: "e2e@example.com",
        paymentAmount: "1300",
        userBasket,
        noInstallment: "1",
        maxInstallment: "0",
        currency: "TL",
        testMode: "1",
      }),
    );
  });

  it("geçerli kimlik olsa bile sahte telefon ile get-token açılmaz", async () => {
    vi.stubEnv("PAYTR_MERCHANT_ID", "111111");
    vi.stubEnv("PAYTR_MERCHANT_KEY", "key-secret");
    vi.stubEnv("PAYTR_MERCHANT_SALT", "salt-secret");
    const result = await requestPaytrCheckoutToken({
      merchantOid: "wallettopuptest2",
      userIp: "85.105.141.10",
      email: "e2e@example.com",
      paymentAmountMinor: 1300,
      merchantOkUrl: "http://localhost/ok",
      merchantFailUrl: "http://localhost/fail",
      userBasket: [{ name: "yukleme", amountMinor: 1300, quantity: 1 }],
      userName: "Ayşe Kaya",
      userAddress: "İnönü Mah. 157 Sk. No:3/C Akhisar",
      userPhone: "05000000000",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("invalid_user");
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

  it("fail-closed / sandbox sicili CREDIT yazmaz; yalnız sandbox veya canlı üçlü bakiyeye yol açar", () => {
    expect(readPaytrRuntimeMode({})).toBe("unconfigured");
    expect(paytrRuntimeCreditsWallet("unconfigured")).toBe(false);
    expect(readPaytrRuntimeMode({ PAYTR_ALLOW_MOCK_CHECKOUT: "true" })).toBe("mock");
    expect(paytrRuntimeCreditsWallet("mock")).toBe(false);
    expect(
      readPaytrRuntimeMode({
        PAYTR_MERCHANT_ID: "id",
        PAYTR_MERCHANT_KEY: "key",
        PAYTR_MERCHANT_SALT: "salt",
        PAYTR_SANDBOX: "1",
      }),
    ).toBe("sandbox");
    expect(paytrRuntimeCreditsWallet("sandbox")).toBe(true);
    expect(
      readPaytrRuntimeMode({
        PAYTR_MERCHANT_ID: "id",
        PAYTR_MERCHANT_KEY: "key",
        PAYTR_MERCHANT_SALT: "salt",
      }),
    ).toBe("live");
    expect(paytrRuntimeCreditsWallet("live")).toBe(true);
  });
});
