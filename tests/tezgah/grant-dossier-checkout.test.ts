import { beforeEach, describe, expect, it, vi } from "vitest";
import { CHECKOUT_BILLING_PAYLOAD } from "@/lib/kernel/identity/billing-info";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import { PAYMENT_ORDER_PURPOSE } from "@/lib/kernel/payments/order-purpose";
import { placeTezgahCheckout } from "@/lib/tezgah/checkout";
import { fulfillTezgahOrder } from "@/lib/tezgah/paid-lane";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  catalogAmount: vi.fn(),
  beginCheckout: vi.fn(),
}));

vi.mock("@/lib/kernel/db", () => ({
  getPrisma: () => ({
    paymentOrder: {
      findUnique: mocks.findUnique,
      create: mocks.create,
    },
  }),
}));

vi.mock("@/lib/tezgah/paid-lane", async () => {
  const actual = await vi.importActual<typeof import("@/lib/tezgah/paid-lane")>("@/lib/tezgah/paid-lane");
  return {
    ...actual,
    // Ş6 tek fiyat kaynağı: hibe ürünü `hibe/*` satırından okunur.
    readHibeCatalogAmount: (...args: unknown[]) => mocks.catalogAmount(...args),
    readTezgahCatalogAmount: (...args: unknown[]) => mocks.catalogAmount(...args),
    fulfillTezgahOrder: vi.fn(),
  };
});

vi.mock("@/lib/kernel/payments/paytr/adapter", () => ({
  paytrPaymentProvider: {
    beginCheckout: (...args: unknown[]) => mocks.beginCheckout(...args),
  },
}));

describe("YetkinHibe doğrudan GRANT_DOSSIER checkout", () => {
  beforeEach(() => {
    mocks.findUnique.mockReset();
    mocks.create.mockReset();
    mocks.catalogAmount.mockReset();
    mocks.beginCheckout.mockReset();
    mocks.catalogAmount.mockResolvedValue(149_000);
    mocks.findUnique.mockResolvedValue(null);
    mocks.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "ord-1",
      ...data,
    }));
    mocks.beginCheckout.mockResolvedValue({ ok: false });
  });

  it("grant-dossier siparişi GRANT_DOSSIER amaçlıdır ve hibe masasına döner", async () => {
    const result = await placeTezgahCheckout({
      userId: "user-1",
      email: "uye@yetkin.ai",
      kind: "grant-dossier",
      idempotencyKey: "anahtar-1",
      userIp: "203.0.113.10",
      consent: CHECKOUT_LEGAL_CONSENT_PAYLOAD,
      billing: CHECKOUT_BILLING_PAYLOAD,
    });

    expect(result.ok).toBe(false);
    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        purpose: PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER,
        orderPurpose: PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER,
        amountMinor: 149_000,
        provider: "paytr",
      }),
    });
    const created = mocks.create.mock.calls[0]?.[0] as { data: { merchantOid: string } };
    expect(created.data.merchantOid.startsWith("TZG")).toBe(true);
    expect(mocks.beginCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        merchantOkUrl: expect.stringContaining("masa=hibe"),
      }),
    );
    expect(fulfillTezgahOrder).not.toHaveBeenCalled();
  });
});
