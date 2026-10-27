import { describe, expect, it, vi } from "vitest";
import { academyLicenseOrderPurpose } from "@/lib/academy/paytr-license-bridge";
import {
  planAcademyUnlicensedCreditRefund,
  refundUnlicensedAcademyCredit,
} from "@/lib/academy/license-insufficient-hold";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import type {
  WalletCardRefundRow,
  WalletCardRefundStatus,
  WalletCardRefundStore,
} from "@/lib/kernel/payments/wallet-card-refund";
import { createMemoryLedgerStore } from "../helpers/memory-money";

const BUYER = "buyer-unlicensed";
const AMOUNT = 89_000;

function order(overrides?: Partial<PaymentOrderSnapshot>): PaymentOrderSnapshot {
  return {
    id: "po-unlicensed",
    userId: BUYER,
    merchantOid: "academylicensehold1",
    amountMinor: AMOUNT,
    currencyCode: "TRY",
    status: "CLEARED",
    createdAt: new Date("2026-10-26T12:00:00.000Z"),
    purpose: academyLicenseOrderPurpose("01_office_ai"),
    ...overrides,
  };
}

function memoryRefunds(balanceMinor: number): WalletCardRefundStore & { rows: WalletCardRefundRow[] } {
  const rows: Array<WalletCardRefundRow & { key: string }> = [];
  return {
    rows,
    async lockBalanceMinor() {
      return balanceMinor;
    },
    async listClearedOrders() {
      return [];
    },
    async sumReservedByOid() {
      return {};
    },
    async listOpen() {
      return rows.filter((row) => row.status === "PENDING" || row.status === "ACCEPTED");
    },
    async findByIdempotencyKey(idempotencyKey) {
      return rows.find((row) => row.key === idempotencyKey) ?? null;
    },
    async insert(input) {
      const row = {
        id: `refund-${rows.length + 1}`,
        merchantOid: input.merchantOid,
        amountMinor: input.amountMinor,
        status: input.status,
        key: input.idempotencyKey,
      };
      rows.push(row);
      return row;
    },
    async mark(id, status: WalletCardRefundStatus) {
      const row = rows.find((item) => item.id === id);
      if (row) {
        row.status = status;
      }
    },
  };
}

describe("lisanssız akademi tahsilatı", () => {
  it("yetersiz bakiyede yalnız akademi kasasını iade planına alır", () => {
    expect(planAcademyUnlicensedCreditRefund(order())?.reason).toBe(
      "insufficient_balance_unlicensed_credit",
    );
    expect(planAcademyUnlicensedCreditRefund(order({ purpose: "wallet-top-up" }))).toBeNull();
    expect(planAcademyUnlicensedCreditRefund(order({ status: "PENDING" }))).toBeNull();
  });

  it("bakiye siparişi karşılamıyorsa PayTR çağrılmaz ve uyarı kalır", async () => {
    const callPaytr = vi.fn();
    const refunds = memoryRefunds(1_000);
    const result = await refundUnlicensedAcademyCredit(
      {
        refunds,
        ledger: createMemoryLedgerStore([{ userId: BUYER, amountMinor: 1_000 }]),
        callPaytr,
        paytrConfigured: true,
      },
      order(),
    );
    expect(result).toEqual({ outcome: "warned", reason: "balance_short_of_order" });
    expect(callPaytr).not.toHaveBeenCalled();
    expect(refunds.rows[0]?.status).toBe("REQUESTED");
  });

  it("bakiyedeki sipariş tutarını bir kez karta iade eder", async () => {
    const callPaytr = vi.fn(async () => ({ ok: true as const, returnAmount: "890.00" }));
    const refunds = memoryRefunds(AMOUNT);
    const ledger = createMemoryLedgerStore([{ userId: BUYER, amountMinor: AMOUNT }]);
    const ports = { refunds, ledger, callPaytr, paytrConfigured: true };
    const first = await refundUnlicensedAcademyCredit(ports, order());
    const second = await refundUnlicensedAcademyCredit(ports, order());
    expect(first).toEqual({
      outcome: "refunded",
      reason: "insufficient_balance_unlicensed_credit",
    });
    expect(second.outcome).toBe("replay");
    expect(callPaytr).toHaveBeenCalledTimes(1);
    expect(callPaytr).toHaveBeenCalledWith({
      merchantOid: "academylicensehold1",
      amountMinor: AMOUNT,
    });
    expect(ledger.snapshot(BUYER).amountMinor).toBe(0);
    expect(refunds.rows[0]?.status).toBe("SUCCEEDED");
  });
});
