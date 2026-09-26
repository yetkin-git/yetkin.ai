import { afterEach, describe, expect, it } from "vitest";
import { fulfillAcademyLicenseFromClearedOrder, academyLicenseOrderPurpose } from "@/lib/academy/paytr-license-bridge";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import { clearSuccessfulPaymentOrder, type PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import {
  clearAcademyLicenseHook,
  registerAcademyLicenseHook,
} from "@/lib/kernel/payments/academy-license-hook";
import { settlePaytrWebhookSuccess } from "@/lib/kernel/payments/paytr/webhook-settle";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryPublishedSku } from "../helpers/memory-academy";
import { createMemoryPaymentAnomalyStore } from "../helpers/memory-payment-anomaly";
import { createMemoryPaymentOrderStore } from "../helpers/memory-payment-orders";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "buyer-paytr-license";
const SKU = memoryPublishedSku("01_office_ai");
const PRICE = SKU.amountMinor;
const OID = "academylicensebridge1";

function order(overrides?: Partial<PaymentOrderSnapshot>): PaymentOrderSnapshot {
  return {
    id: "po-license",
    userId: BUYER,
    merchantOid: OID,
    amountMinor: PRICE,
    currencyCode: "TRY",
    status: "PENDING",
    createdAt: new Date("2026-09-25T08:00:00.000Z"),
    purpose: academyLicenseOrderPurpose("01_office_ai"),
    ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
    ...overrides,
  };
}

function world(row: PaymentOrderSnapshot) {
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: 0 },
    { userId: PLATFORM_TREASURY_USER_ID, amountMinor: 0 },
  ]);
  const academy = createMemoryAcademyStore();
  const locks = createMemoryCheckoutPriceLockStore();
  const catalog = createMemoryPriceCatalogStore([
    {
      moduleKey: ACADEMY_MODULE_KEY,
      unitKey: SKU.course.catalogUnitKey,
      amountMinor: PRICE,
    },
  ]);
  return {
    ledger,
    academy,
    locks,
    catalog,
    orders: createMemoryPaymentOrderStore(row),
    anomalies: createMemoryPaymentAnomalyStore(),
  };
}

describe("PayTR CLEARED → akademi SETTLED lisansı", () => {
  afterEach(() => {
    clearAcademyLicenseHook();
  });

  it("kurs kasası cüzdanı doldurur, bakiyeyi kursa yatırır, lisansı SETTLED yazar", async () => {
    const ports = world(order());
    await ports.academy.insertCourse(SKU.course);
    const now = new Date("2026-09-25T08:05:00.000Z");

    registerAcademyLicenseHook(async (cleared) => {
      await fulfillAcademyLicenseFromClearedOrder(
        {
          ledger: ports.ledger,
          catalog: ports.catalog,
          locks: ports.locks,
          academy: ports.academy,
        },
        cleared,
        now,
      );
    });

    const settled = await settlePaytrWebhookSuccess(
      { ledger: ports.ledger, orders: ports.orders, anomalies: ports.anomalies },
      {
        merchantOid: OID,
        amountMinor: PRICE,
        requestId: "550e8400-e29b-41d4-a716-446655440091",
        sourceIp: "127.0.0.1",
      },
      now,
    );

    expect(settled.disposition).toBe("cleared");
    expect(ports.orders.row()?.status).toBe("CLEARED");
    const purchase = await ports.academy.getPurchaseByUserAndCourse(BUYER, SKU.course.id);
    expect(purchase?.status).toBe("SETTLED");
    expect(purchase?.amountMinor).toBe(PRICE);
    expect(purchase?.consentVersion).toBe(CHECKOUT_LEGAL_CONSENT_PAYLOAD.consentVersion);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(0);
    expect(ports.ledger.snapshot(PLATFORM_TREASURY_USER_ID).amountMinor).toBe(PRICE);

    const replay = await fulfillAcademyLicenseFromClearedOrder(
      {
        ledger: ports.ledger,
        catalog: ports.catalog,
        locks: ports.locks,
        academy: ports.academy,
      },
      { ...order(), status: "CLEARED" },
      now,
    );
    expect(replay.applied).toBe(false);
    expect(replay.reason).toBe("already_settled");
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(0);
  });

  it("düz cüzdan yüklemesi lisans açmaz", async () => {
    const ports = world(order({ purpose: "wallet-top-up" }));
    await ports.academy.insertCourse(SKU.course);
    const cleared = await clearSuccessfulPaymentOrder(
      { ledger: ports.ledger, orders: ports.orders },
      OID,
      new Date("2026-09-25T08:05:00.000Z"),
    );
    const result = await fulfillAcademyLicenseFromClearedOrder(
      {
        ledger: ports.ledger,
        catalog: ports.catalog,
        locks: ports.locks,
        academy: ports.academy,
      },
      cleared.order,
    );
    expect(result.reason).toBe("not_academy");
    expect(await ports.academy.getPurchaseByUserAndCourse(BUYER, SKU.course.id)).toBeNull();
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(PRICE);
  });
});
