import { afterEach, describe, expect, it } from "vitest";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import { clearJuniorLicenseHook, registerJuniorLicenseHook } from "@/lib/kernel/payments/junior-license-hook";
import { settlePaytrWebhookSuccess } from "@/lib/kernel/payments/paytr/webhook-settle";
import { JUNIOR_INVOICE_WITHHELD } from "@/lib/junior/invoice-seal";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import {
  fulfillJuniorLicenseFromClearedOrder,
  JUNIOR_LICENSE_ORDER_PURPOSE,
  juniorLicenseMerchantOid,
} from "@/lib/junior/paytr-license-bridge";
import { juniorPlanExpiry } from "@/lib/junior/plan";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryPaymentAnomalyStore } from "../helpers/memory-payment-anomaly";
import { createMemoryPaymentOrderStore } from "../helpers/memory-payment-orders";

const PARENT = "parent-junior-license";
const PRICE = 549_900;
const NOW = new Date("2026-10-06T09:00:00.000Z");
const OID = "JRLICENSE01";

function order(overrides?: Partial<PaymentOrderSnapshot>): PaymentOrderSnapshot {
  return {
    id: "po-junior",
    userId: PARENT,
    merchantOid: OID,
    amountMinor: PRICE,
    currencyCode: "TRY",
    status: "CLEARED",
    createdAt: NOW,
    purpose: JUNIOR_LICENSE_ORDER_PURPOSE,
    ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
    ...overrides,
  };
}

describe("PayTR CLEARED → Junior yıllık paket", () => {
  afterEach(() => {
    clearJuniorLicenseHook();
  });

  it("yıllık süreyi yazar; aynı sipariş süreyi yeniden uzatmaz", async () => {
    const store = createMemoryJuniorStore();
    const first = await fulfillJuniorLicenseFromClearedOrder(store, order(), NOW);
    expect(first.reason).toBe("settled");
    expect(first.applied).toBe(true);
    expect(first.expiresAt).toBe(juniorPlanExpiry(NOW).toISOString());

    const later = new Date("2026-11-06T09:00:00.000Z");
    const replay = await fulfillJuniorLicenseFromClearedOrder(store, order(), later);
    expect(replay.reason).toBe("already_settled");
    expect(replay.applied).toBe(false);
    expect(replay.expiresAt).toBe(first.expiresAt);

    const row = await store.getSubscription(PARENT);
    expect(row?.status).toBe("ACTIVE");
    expect(row?.providerRef).toBe(OID);
    expect(row?.invoiceTckn).toBe(JUNIOR_INVOICE_WITHHELD);
    expect(row?.invoicePhone).toBe(JUNIOR_INVOICE_WITHHELD);
    expect(row?.invoiceAddress).toBe(JUNIOR_INVOICE_WITHHELD);
    expect(row?.appliedMerchantOids).toEqual([OID]);
  });

  it("yeni sipariş bitmemiş yılın üstüne bir yıl ekler", async () => {
    const store = createMemoryJuniorStore();
    await fulfillJuniorLicenseFromClearedOrder(store, order(), NOW);
    const renewalOid = "JRLICENSE02";
    const renewalAt = new Date("2027-01-06T09:00:00.000Z");
    const renewal = await fulfillJuniorLicenseFromClearedOrder(
      store,
      order({ id: "po-junior-2", merchantOid: renewalOid }),
      renewalAt,
    );
    expect(renewal.reason).toBe("extended");
    const row = await store.getSubscription(PARENT);
    expect(row?.expiresAt?.toISOString()).toBe(juniorPlanExpiry(juniorPlanExpiry(NOW)).toISOString());
    expect(row?.appliedMerchantOids).toEqual([OID, renewalOid]);
    const replayOld = await fulfillJuniorLicenseFromClearedOrder(store, order(), renewalAt);
    expect(replayOld.reason).toBe("already_settled");
    expect((await store.getSubscription(PARENT))?.expiresAt?.toISOString()).toBe(row?.expiresAt?.toISOString());
  });

  it("düz cüzdan yüklemesi paket açmaz", async () => {
    const store = createMemoryJuniorStore();
    const skipped = await fulfillJuniorLicenseFromClearedOrder(
      store,
      order({ purpose: "wallet-top-up" }),
      NOW,
    );
    expect(skipped.reason).toBe("not_junior");
    expect(await store.getSubscription(PARENT)).toBeNull();
  });

  it("webhook kancası CLEARED junior niyetini pakete bağlar", async () => {
    const store = createMemoryJuniorStore();
    const pending = order({ status: "PENDING" });
    registerJuniorLicenseHook(async (cleared) => {
      await fulfillJuniorLicenseFromClearedOrder(store, cleared, NOW);
    });
    const ledger = createMemoryLedgerStore([{ userId: PARENT, amountMinor: 0 }]);
    const settled = await settlePaytrWebhookSuccess(
      {
        ledger,
        orders: createMemoryPaymentOrderStore(pending),
        anomalies: createMemoryPaymentAnomalyStore(),
      },
      {
        merchantOid: OID,
        amountMinor: PRICE,
        requestId: "req-junior-license",
        sourceIp: "127.0.0.1",
      },
      NOW,
    );
    expect(settled.disposition).toBe("cleared");
    const row = await store.getSubscription(PARENT);
    expect(row?.status).toBe("ACTIVE");
    expect(row?.expiresAt?.toISOString()).toBe(juniorPlanExpiry(NOW).toISOString());
  });

  it("aynı kullanıcı ve anahtar aynı sipariş numarasını üretir", () => {
    const oid = juniorLicenseMerchantOid(PARENT, "checkout-1");
    expect(oid).toBe(juniorLicenseMerchantOid(PARENT, "checkout-1"));
    expect(oid).toMatch(/^JR[A-F0-9]{24}$/);
    expect(oid).not.toBe(juniorLicenseMerchantOid(PARENT, "checkout-2"));
  });
});
