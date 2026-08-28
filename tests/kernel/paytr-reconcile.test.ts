import { describe, expect, it, vi } from "vitest";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryPaymentAnomalyStore } from "../helpers/memory-payment-anomaly";
import { createMemoryPaymentOrderStore } from "../helpers/memory-payment-orders";
import {
  assertPaymentOrderAmountMatches,
  failPaymentOrder,
  PaymentOrderCasError,
  type PaymentOrderSnapshot,
} from "@/lib/kernel/payments/clearing";
import {
  PAYTR_PENDING_TIMEOUT_MS,
  reconcilePaytrPaymentOrder,
} from "@/lib/kernel/payments/paytr/reconcile";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";

const BUYER = "buyer-paytr-1";
const OID = "wallet-top-up-abc";

function snapshot(overrides?: Partial<PaymentOrderSnapshot>): PaymentOrderSnapshot {
  return {
    id: "po-1",
    userId: BUYER,
    merchantOid: OID,
    amountMinor: 1300,
    currencyCode: "TRY",
    status: "PENDING",
    createdAt: new Date("2026-08-15T12:00:00.000Z"),
    ...overrides,
  };
}

function ports(order: PaymentOrderSnapshot) {
  const orders = createMemoryPaymentOrderStore(order);
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: 0 },
    { userId: PLATFORM_TREASURY_USER_ID, amountMinor: 0 },
  ]);
  return { ledger, orders };
}

describe("PayTR fail-closed reconcile", () => {
  it("PSP paid + tutar eşitse CREDIT yazar", async () => {
    const world = ports(snapshot());
    const result = await reconcilePaytrPaymentOrder(
      {
        ...world,
        inquireStatus: async () => ({ kind: "paid", amountMinor: 1300 }),
      },
      OID,
      new Date("2026-08-15T12:10:00.000Z"),
    );
    expect(result.action).toBe("cleared");
    expect(result.applied).toBe(true);
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(1300);
    expect(world.orders.row()?.status).toBe("CLEARED");
  });

  it("PSP yokken PENDING'e CREDIT yazmaz", async () => {
    const world = ports(snapshot());
    const result = await reconcilePaytrPaymentOrder(
      {
        ...world,
        inquireStatus: async () => ({ kind: "pending" }),
      },
      OID,
      new Date("2026-08-15T12:10:00.000Z"),
    );
    expect(result).toMatchObject({ action: "skipped", reason: "still_pending", applied: false });
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(0);
    expect(world.orders.row()?.status).toBe("PENDING");
  });

  it("tutar eşleşmezse CREDIT yazmaz", async () => {
    const world = ports(snapshot());
    const anomalies = createMemoryPaymentAnomalyStore();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await reconcilePaytrPaymentOrder(
      {
        ...world,
        anomalies,
        inquireStatus: async () => ({ kind: "paid", amountMinor: 9999 }),
      },
      OID,
    );
    expect(result.reason).toBe("amount_mismatch");
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(0);
    expect(world.orders.row()?.status).toBe("PENDING");
    expect(anomalies.list()).toHaveLength(1);
    expect(anomalies.list()[0]?.kind).toBe("amount_mismatch");
    vi.restoreAllMocks();
  });

  it("PSP failed PENDING'i markFailed eder", async () => {
    const world = ports(snapshot());
    const result = await reconcilePaytrPaymentOrder(
      {
        ...world,
        inquireStatus: async () => ({ kind: "failed" }),
      },
      OID,
    );
    expect(result.action).toBe("failed");
    expect(world.orders.row()?.status).toBe("FAILED");
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(0);
  });

  it("zaman aşımı PENDING'i markFailed eder", async () => {
    const createdAt = new Date("2026-08-15T10:00:00.000Z");
    const world = ports(snapshot({ createdAt }));
    const result = await reconcilePaytrPaymentOrder(
      {
        ...world,
        inquireStatus: async () => ({ kind: "pending" }),
      },
      OID,
      new Date(createdAt.getTime() + PAYTR_PENDING_TIMEOUT_MS + 1),
    );
    expect(result.reason).toBe("pending_timeout");
    expect(world.orders.row()?.status).toBe("FAILED");
  });

  it("failPaymentOrder PENDING'i işletir; PAID/CLEARED'i ezmez", async () => {
    const pending = createMemoryPaymentOrderStore(snapshot());
    const failed = await failPaymentOrder(pending, OID);
    expect(failed.applied).toBe(true);
    expect(pending.row()?.status).toBe("FAILED");
    const again = await failPaymentOrder(pending, OID);
    expect(again.applied).toBe(false);
    const cleared = createMemoryPaymentOrderStore(snapshot({ status: "CLEARED" }));
    const skipCleared = await failPaymentOrder(cleared, OID);
    expect(skipCleared.applied).toBe(false);
    expect(cleared.row()?.status).toBe("CLEARED");
    const paid = createMemoryPaymentOrderStore(snapshot({ status: "PAID" }));
    const skipPaid = await failPaymentOrder(paid, OID);
    expect(skipPaid.applied).toBe(false);
    expect(paid.row()?.status).toBe("PAID");
  });

  it("markFailed CLEARED satırı CAS ile reddeder", async () => {
    const orders = createMemoryPaymentOrderStore(snapshot({ status: "CLEARED" }));
    await expect(orders.markFailed("po-1", new Date())).rejects.toBeInstanceOf(PaymentOrderCasError);
    expect(orders.row()?.status).toBe("CLEARED");
  });

  it("clearing sonrası failPaymentOrder CREDIT ve CLEARED'i ezmez", async () => {
    const world = ports(snapshot());
    const cleared = await reconcilePaytrPaymentOrder(
      {
        ...world,
        inquireStatus: async () => ({ kind: "paid", amountMinor: 1300 }),
      },
      OID,
    );
    expect(cleared.applied).toBe(true);
    const failed = await failPaymentOrder(world.orders, OID);
    expect(failed.applied).toBe(false);
    expect(world.orders.row()?.status).toBe("CLEARED");
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(1300);
  });

  it("FAILED + PSP paid + tutar eşleşmesi geç paid recovery ile CREDIT yazar", async () => {
    const world = ports(snapshot({ status: "FAILED" }));
    const result = await reconcilePaytrPaymentOrder(
      {
        ...world,
        inquireStatus: async () => ({ kind: "paid", amountMinor: 1300 }),
      },
      OID,
      new Date("2026-08-15T12:10:00.000Z"),
    );
    expect(result).toMatchObject({
      action: "cleared",
      applied: true,
      reason: "late_paid_recovery",
    });
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(1300);
    expect(world.orders.row()?.status).toBe("CLEARED");
  });

  it("FAILED + PSP paid + tutar uyuşmazlığı CREDIT yazmaz", async () => {
    const world = ports(snapshot({ status: "FAILED" }));
    const anomalies = createMemoryPaymentAnomalyStore();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await reconcilePaytrPaymentOrder(
      {
        ...world,
        anomalies,
        inquireStatus: async () => ({ kind: "paid", amountMinor: 9999 }),
      },
      OID,
    );
    expect(result.reason).toBe("amount_mismatch");
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(0);
    expect(world.orders.row()?.status).toBe("FAILED");
    vi.restoreAllMocks();
  });

  it("FAILED + PSP failed CREDIT yazmaz", async () => {
    const world = ports(snapshot({ status: "FAILED" }));
    const result = await reconcilePaytrPaymentOrder(
      {
        ...world,
        inquireStatus: async () => ({ kind: "failed" }),
      },
      OID,
    );
    expect(result).toMatchObject({ action: "failed", reason: "already_failed", applied: false });
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(0);
    expect(world.orders.row()?.status).toBe("FAILED");
  });

  it("amountMinor birebir eşitliğini doğrular", () => {
    expect(() => assertPaymentOrderAmountMatches(1300, 1300)).not.toThrow();
    expect(() => assertPaymentOrderAmountMatches(1300, 1301)).toThrow(/eşleşmiyor/);
  });
});
