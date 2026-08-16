import { afterEach, describe, expect, it } from "vitest";
import { createMemoryEscrowStore, createMemoryLedgerStore } from "../helpers/memory-money";
import {
  clearSuccessfulPaymentOrder,
  type PaymentOrderSnapshot,
  type PaymentOrderStore,
} from "@/lib/kernel/payments/clearing";
import {
  createEscrowHold,
  PLATFORM_TREASURY_USER_ID,
  refundEscrowHold,
} from "@/lib/kernel/escrow/engine";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import {
  emitTransactionNotice,
  setTransactionNoticeSink,
  type TransactionNotice,
} from "@/lib/kernel/observability/transaction-notice";

const BUYER = "buyer-notice-1";
const OID = "wallet-top-up-notice";

function snapshot(overrides?: Partial<PaymentOrderSnapshot>): PaymentOrderSnapshot {
  return {
    id: "po-notice",
    userId: BUYER,
    merchantOid: OID,
    amountMinor: 1300,
    currencyCode: "TRY",
    status: "PENDING",
    createdAt: new Date("2026-08-15T12:00:00.000Z"),
    ...overrides,
  };
}

function memoryOrders(initial: PaymentOrderSnapshot): PaymentOrderStore {
  let row = { ...initial };
  return {
    async findByMerchantOid(merchantOid) {
      return merchantOid === row.merchantOid ? { ...row } : null;
    },
    async markPaid(id, _at) {
      row = { ...row, id, status: "PAID" };
      return { ...row };
    },
    async markCleared(id, _at) {
      row = { ...row, id, status: "CLEARED" };
      return { ...row };
    },
    async markFailed(id, _at) {
      row = { ...row, id, status: "FAILED" };
      return { ...row };
    },
    async listUnclearedPaid() {
      return row.status === "PAID" ? [{ ...row }] : [];
    },
  };
}

describe("işlem bildirimi", () => {
  afterEach(() => {
    setTransactionNoticeSink(null);
  });

  it("replay ikinci bildirim basmaz", () => {
    const seen: TransactionNotice[] = [];
    setTransactionNoticeSink((notice) => seen.push(notice));
    emitTransactionNotice({
      kind: "wallet_cleared",
      userId: BUYER,
      amountMinor: 1300,
      reference: OID,
      applied: false,
    });
    expect(seen).toEqual([]);
    emitTransactionNotice({
      kind: "wallet_cleared",
      userId: BUYER,
      amountMinor: 1300,
      reference: OID,
      applied: true,
    });
    expect(seen).toEqual([
      {
        kind: "wallet_cleared",
        userId: BUYER,
        amountMinor: 1300,
        reference: OID,
        applied: true,
      },
    ]);
  });

  it("cüzdan CLEARED ve emanet iadesi birer bildirim basar", async () => {
    const seen: TransactionNotice[] = [];
    setTransactionNoticeSink((notice) => seen.push(notice));

    const orders = memoryOrders(snapshot());
    const ledger = createMemoryLedgerStore([
      { userId: BUYER, amountMinor: 0 },
      { userId: PLATFORM_TREASURY_USER_ID, amountMinor: 0 },
    ]);
    const cleared = await clearSuccessfulPaymentOrder(
      { ledger, orders },
      OID,
      new Date("2026-08-15T12:10:00.000Z"),
    );
    expect(cleared.applied).toBe(true);
    const again = await clearSuccessfulPaymentOrder({ ledger, orders }, OID);
    expect(again.applied).toBe(false);

    const escrow = createMemoryEscrowStore();
    const fundedAt = new Date("2026-08-01T00:00:00.000Z");
    const holdLedger = createMemoryLedgerStore([
      { userId: BUYER, amountMinor: 50_000 },
      { userId: PLATFORM_TREASURY_USER_ID, amountMinor: 0 },
    ]);
    const { hold } = await createEscrowHold(
      { ledger: holdLedger, escrow },
      {
        userId: BUYER,
        referenceKey: "notice-hold",
        grossMinor: 10_000,
        holdBps: HOLD_BPS_DEFAULT,
        currencyCode: SETTLEMENT_CURRENCY,
        now: fundedAt,
      },
    );
    const refunded = await refundEscrowHold(
      { ledger: holdLedger, escrow },
      { referenceKey: hold.referenceKey, now: new Date("2026-08-16T00:00:00.000Z") },
    );
    expect(refunded.applied).toBe(true);
    const refundAgain = await refundEscrowHold(
      { ledger: holdLedger, escrow },
      { referenceKey: hold.referenceKey },
    );
    expect(refundAgain.applied).toBe(false);

    expect(seen.filter((row) => row.kind === "wallet_cleared")).toHaveLength(1);
    expect(seen.filter((row) => row.kind === "escrow_refunded")).toHaveLength(1);
    expect(seen.find((row) => row.kind === "wallet_cleared")?.reference).toBe(OID);
    expect(seen.find((row) => row.kind === "escrow_refunded")?.reference).toBe(hold.id);
  });
});
