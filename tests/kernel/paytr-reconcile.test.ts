import { describe, expect, it } from "vitest";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import {
  assertPaymentOrderAmountMatches,
  failPaymentOrder,
  type PaymentOrderSnapshot,
  type PaymentOrderStore,
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

function memoryOrders(initial: PaymentOrderSnapshot): PaymentOrderStore & {
  row(): PaymentOrderSnapshot;
} {
  let row = { ...initial };
  return {
    row() {
      return { ...row };
    },
    async findByMerchantOid(merchantOid) {
      return merchantOid === row.merchantOid ? { ...row } : null;
    },
    async markPaid(id, _at) {
      if (row.id !== id) {
        throw new Error("sipariş yok");
      }
      row = { ...row, status: "PAID" };
      return { ...row };
    },
    async markCleared(id, _at) {
      if (row.id !== id) {
        throw new Error("sipariş yok");
      }
      row = { ...row, status: "CLEARED" };
      return { ...row };
    },
    async markFailed(id, _at) {
      if (row.id !== id) {
        throw new Error("sipariş yok");
      }
      row = { ...row, status: "FAILED" };
      return { ...row };
    },
    async listUnclearedPaid() {
      return row.status === "PAID" ? [{ ...row }] : [];
    },
  };
}

function ports(order: PaymentOrderSnapshot) {
  const orders = memoryOrders(order);
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
    expect(world.orders.row().status).toBe("CLEARED");
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
    expect(world.orders.row().status).toBe("PENDING");
  });

  it("tutar eşleşmezse CREDIT yazmaz", async () => {
    const world = ports(snapshot());
    const result = await reconcilePaytrPaymentOrder(
      {
        ...world,
        inquireStatus: async () => ({ kind: "paid", amountMinor: 9999 }),
      },
      OID,
    );
    expect(result.reason).toBe("amount_mismatch");
    expect(world.ledger.snapshot(BUYER).amountMinor).toBe(0);
    expect(world.orders.row().status).toBe("PENDING");
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
    expect(world.orders.row().status).toBe("FAILED");
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
    expect(world.orders.row().status).toBe("FAILED");
  });

  it("failPaymentOrder PENDING'i işletir; CLEARED'i reddeder", async () => {
    const pending = memoryOrders(snapshot());
    const failed = await failPaymentOrder(pending, OID);
    expect(failed.applied).toBe(true);
    expect(pending.row().status).toBe("FAILED");
    const again = await failPaymentOrder(pending, OID);
    expect(again.applied).toBe(false);
    const cleared = memoryOrders(snapshot({ status: "CLEARED" }));
    await expect(failPaymentOrder(cleared, OID)).rejects.toThrow(/Temizlenmiş/);
  });

  it("amountMinor birebir eşitliğini doğrular", () => {
    expect(() => assertPaymentOrderAmountMatches(1300, 1300)).not.toThrow();
    expect(() => assertPaymentOrderAmountMatches(1300, 1301)).toThrow(/eşleşmiyor/);
  });
});
