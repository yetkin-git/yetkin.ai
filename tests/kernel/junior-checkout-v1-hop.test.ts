import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/junior-pilot/checkout/route";
import { JUNIOR_GUARDIAN_NOTICE } from "@/lib/junior/guardian-notice";
import { JUNIOR_ELECTIVE_QUOTA } from "@/lib/junior/limits";
import * as sessionApi from "@/lib/kernel/auth/session";
import { CHECKOUT_BILLING_PAYLOAD } from "@/lib/kernel/identity/billing-info";
import { findPublishedHopId } from "@/lib/kernel/http/api-route-census";
import { hashIdempotencyPayload } from "@/lib/kernel/http/idempotency";
import type { HttpIdempotencyStore } from "@/lib/kernel/http/idempotency";
import { IDEMPOTENCY_KEY_HEADER } from "@/lib/kernel/http/idempotency-key";
import { createMemoryHttpIdempotencyStore } from "@/lib/kernel/http/memory-idempotency-store";
import {
  RAIL_V1_HOPS,
  RAIL_V1_IDEMPOTENCY_BODY_CONFLICT,
  RAIL_V1_IDEMPOTENCY_REQUIRED,
  RAIL_V1_IDEMPOTENCY_UUID,
} from "@/lib/kernel/http/v1-contract";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import { juniorIframeCheckoutSchema } from "@/lib/kernel/legal/junior-iframe-checkout";
import {
  isJuniorCheckoutLocked,
  JUNIOR_CHECKOUT_LOCKED_ERROR,
} from "@/lib/kernel/security/junior-gate";

const harness = vi.hoisted(() => {
  return {
    idempotency: null as HttpIdempotencyStore | null,
    getSubscription: vi.fn<(userId: string) => Promise<unknown>>(async () => null),
    placeOrder: vi.fn(),
    readPrice: vi.fn(async () => ({ amountMinor: 549_900 })),
  };
});

vi.mock("@/lib/kernel/http/prisma-idempotency-store", () => ({
  createPrismaHttpIdempotencyStore: () => {
    if (!harness.idempotency) {
      throw new Error("idempotency deposu yok");
    }
    return harness.idempotency;
  },
}));

vi.mock("@/lib/junior/load", () => ({
  createPrismaJuniorStore: () => ({
    getSubscription: (userId: string) => harness.getSubscription(userId),
  }),
}));

vi.mock("@/lib/junior/checkout-paytr", () => ({
  placeJuniorPaytrOrder: (draft: unknown) => harness.placeOrder(draft),
}));

vi.mock("@/lib/junior/price", () => ({
  readJuniorYearlyPrice: () => harness.readPrice(),
}));

const USER = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "veli@yetkin.ai",
  emailConfirmedAt: "2026-01-01T00:00:00.000Z",
};

const CHECKOUT_BODY = {
  ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
  guardianConsentAccepted: true as const,
  guardianNoticeVersion: JUNIOR_GUARDIAN_NOTICE.version,
  billing: CHECKOUT_BILLING_PAYLOAD,
};

const OTHER_INVOICE_BODY = {
  ...CHECKOUT_BODY,
  billing: {
    ...CHECKOUT_BILLING_PAYLOAD,
    fullName: "Fatma Demir",
    address: "Cumhuriyet Mahallesi Deneme Sokak No 12",
  },
};

const STORED_IFRAME_URL = "https://www.paytr.com/odeme/guvenli/junior-sim-token";
const STORED_MERCHANT_OID = "JRCHECKOUTSIM01";

type CheckoutOk = {
  ok: true;
  data: {
    status: string;
    electiveQuota: number;
    alreadyActive: boolean;
    expiresAt: string | null;
    merchantOid: string;
    embedIframe: boolean;
    iframeUrl?: string;
  };
};

type CheckoutFail = {
  ok: false;
  error: string;
};

function checkoutRequest(headers?: HeadersInit, body: unknown = {}) {
  return new Request("http://localhost:3000/api/v1/junior-pilot/checkout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-rail-min-version": "1",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function stubOpenJuniorCheckout() {
  vi.stubEnv("JUNIOR_CHECKOUT_OPEN", "1");
  vi.stubEnv("JUNIOR_BETA_ALLOWLIST", "");
  vi.stubEnv("PAYTR_MERCHANT_ID", "111111");
  vi.stubEnv("PAYTR_MERCHANT_KEY", "iframe-key");
  vi.stubEnv("PAYTR_MERCHANT_SALT", "iframe-salt");
  vi.stubEnv("PAYTR_SANDBOX", "1");
  vi.stubEnv("PAYTR_ALLOW_MOCK_CHECKOUT", "");
}

describe("Junior kasa v1 hop", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("bugünkü şemayı bağlar; grade hop değildir; kapı kapalıdır", () => {
    vi.stubEnv("JUNIOR_CHECKOUT_OPEN", "");
    const hop = RAIL_V1_HOPS.find((row) => row.id === "junior-pilot-checkout");
    expect(hop?.idempotency).toBe(true);
    expect(hop?.requestSchema).toBe(juniorIframeCheckoutSchema);
    expect(hop?.v1PathTemplate).toBe("/api/v1/junior-pilot/checkout");
    expect(findPublishedHopId("POST", "/api/junior-pilot/checkout")).toBe("junior-pilot-checkout");
    expect(findPublishedHopId("POST", "/api/junior-pilot/grade")).toBeNull();
    expect(isJuniorCheckoutLocked()).toBe(true);
    expect(juniorIframeCheckoutSchema.safeParse({}).success).toBe(false);
  });

  it("boş veya geçersiz Idempotency-Key 400 döner; geçerli anahtar kapalı kapıda tahsilat açmaz", async () => {
    vi.stubEnv("JUNIOR_CHECKOUT_OPEN", "");
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue(USER);

    const missing = await POST(checkoutRequest());
    expect(missing.status).toBe(400);
    await expect(missing.json()).resolves.toMatchObject({
      ok: false,
      error: RAIL_V1_IDEMPOTENCY_REQUIRED,
    });

    const invalid = await POST(checkoutRequest({ [IDEMPOTENCY_KEY_HEADER]: "not-a-uuid" }));
    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toMatchObject({
      ok: false,
      error: RAIL_V1_IDEMPOTENCY_UUID,
    });

    const locked = await POST(
      checkoutRequest({ [IDEMPOTENCY_KEY_HEADER]: "11111111-1111-4111-8111-111111111111" }),
    );
    expect(locked.status).toBe(503);
    await expect(locked.json()).resolves.toMatchObject({
      ok: false,
      error: JUNIOR_CHECKOUT_LOCKED_ERROR,
    });
  });

  describe("açık kapı simülasyonu", () => {
    beforeEach(() => {
      harness.idempotency = createMemoryHttpIdempotencyStore();
      harness.getSubscription.mockReset();
      harness.getSubscription.mockResolvedValue(null);
      harness.placeOrder.mockReset();
      harness.readPrice.mockReset();
      harness.readPrice.mockResolvedValue({ amountMinor: 549_900 });
      stubOpenJuniorCheckout();
      vi.spyOn(sessionApi, "requireSession").mockResolvedValue(USER);
    });

    it("aynı UUID ilk iframe yanıtını saklar; farklı fatura 409, aynı fatura PayTR'ye ikinci kez gitmez", async () => {
      expect(juniorIframeCheckoutSchema.safeParse(CHECKOUT_BODY).success).toBe(true);
      expect(juniorIframeCheckoutSchema.safeParse(OTHER_INVOICE_BODY).success).toBe(true);
      expect(hashIdempotencyPayload(CHECKOUT_BODY)).not.toBe(hashIdempotencyPayload(OTHER_INVOICE_BODY));

      const key = "44444444-4444-4444-8444-444444444444";
      harness.placeOrder.mockResolvedValue({
        ok: true,
        kind: "iframe",
        merchantOid: STORED_MERCHANT_OID,
        iframeUrl: STORED_IFRAME_URL,
      });

      const first = await POST(checkoutRequest({ [IDEMPOTENCY_KEY_HEADER]: key }, CHECKOUT_BODY));
      expect(first.status).toBe(200);
      const firstBody = (await first.json()) as CheckoutOk;
      expect(firstBody.ok).toBe(true);
      expect(firstBody.data).toEqual({
        status: "PENDING",
        electiveQuota: JUNIOR_ELECTIVE_QUOTA,
        alreadyActive: false,
        expiresAt: null,
        merchantOid: STORED_MERCHANT_OID,
        embedIframe: true,
        iframeUrl: STORED_IFRAME_URL,
      });

      const conflict = await POST(
        checkoutRequest({ [IDEMPOTENCY_KEY_HEADER]: key }, OTHER_INVOICE_BODY),
      );
      expect(conflict.status).toBe(409);
      const conflictBody = (await conflict.json()) as CheckoutFail;
      expect(conflictBody).toMatchObject({
        ok: false,
        error: RAIL_V1_IDEMPOTENCY_BODY_CONFLICT,
      });

      const replay = await POST(checkoutRequest({ [IDEMPOTENCY_KEY_HEADER]: key }, CHECKOUT_BODY));
      expect(replay.status).toBe(200);
      const replayBody = (await replay.json()) as CheckoutOk;
      expect(replayBody.data).toEqual(firstBody.data);
      expect(replayBody.data.merchantOid).toBe(STORED_MERCHANT_OID);
      expect(replayBody.data.iframeUrl).toBe(STORED_IFRAME_URL);

      expect(harness.placeOrder).toHaveBeenCalledTimes(1);
      const draft = harness.placeOrder.mock.calls[0]?.[0] as {
        idempotencyKey: string;
        billing: { fullName: string; address: string };
      };
      expect(draft.idempotencyKey).toBe(key);
      expect(draft.billing.fullName).toBe(CHECKOUT_BILLING_PAYLOAD.fullName);
      expect(draft.billing.address).toBe(CHECKOUT_BILLING_PAYLOAD.address);
    });

    it("aktif paket PayTR siparişi açmadan alreadyActive döner", async () => {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      harness.getSubscription.mockResolvedValue({
        status: "ACTIVE",
        electiveQuota: JUNIOR_ELECTIVE_QUOTA,
        expiresAt,
        providerRef: "JRSEEDED01",
      });
      const key = "55555555-5555-4555-8555-555555555555";

      const first = await POST(checkoutRequest({ [IDEMPOTENCY_KEY_HEADER]: key }, CHECKOUT_BODY));
      expect(first.status).toBe(200);
      const firstBody = (await first.json()) as CheckoutOk;
      expect(firstBody.data).toEqual({
        status: "ACTIVE",
        electiveQuota: JUNIOR_ELECTIVE_QUOTA,
        alreadyActive: true,
        expiresAt: expiresAt.toISOString(),
        merchantOid: "JRSEEDED01",
        embedIframe: false,
      });
      expect(firstBody.data.iframeUrl).toBeUndefined();

      const replay = await POST(checkoutRequest({ [IDEMPOTENCY_KEY_HEADER]: key }, CHECKOUT_BODY));
      expect(replay.status).toBe(200);
      const replayBody = (await replay.json()) as CheckoutOk;
      expect(replayBody.data).toEqual(firstBody.data);

      expect(harness.placeOrder).not.toHaveBeenCalled();
      expect(harness.readPrice).not.toHaveBeenCalled();
      expect(harness.getSubscription).toHaveBeenCalledTimes(1);
      expect(harness.getSubscription).toHaveBeenCalledWith(USER.id);
    });
  });
});
