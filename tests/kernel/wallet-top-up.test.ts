import { describe, expect, it } from "vitest";
import { failPaymentOrder, type PaymentOrderSnapshot, type PaymentOrderStore } from "@/lib/kernel/payments/clearing";
import {
  assertWalletTopUpAmountMinor,
  decideWalletTopUpReuse,
  shouldFailCloseWalletTopUpCheckout,
  WALLET_TOP_UP_MAX_MINOR,
  WALLET_TOP_UP_MIN_MINOR,
} from "@/lib/kernel/payments/wallet-top-up";

describe("cüzdan yükleme bandı (S15-A)", () => {
  it("₺10 ve ₺20.000 sınırlarını kabul eder", () => {
    expect(assertWalletTopUpAmountMinor(WALLET_TOP_UP_MIN_MINOR)).toBe(1_000);
    expect(assertWalletTopUpAmountMinor(WALLET_TOP_UP_MAX_MINOR)).toBe(2_000_000);
  });

  it("bant dışını reddeder", () => {
    expect(() => assertWalletTopUpAmountMinor(999)).toThrow();
    expect(() => assertWalletTopUpAmountMinor(2_000_001)).toThrow();
  });
});

describe("cüzdan yükleme checkout fail-closed", () => {
  it("pay_api_error / 503 PENDING'i markFailed eder; CREDIT yok; reuse failed_oid", async () => {
    expect(shouldFailCloseWalletTopUpCheckout(true)).toBe(false);
    expect(shouldFailCloseWalletTopUpCheckout(false)).toBe(true);

    const oid = "wallettopupfailclosed1";
    const orders = memoryOrders({
      id: "po-fail-close",
      userId: "u1",
      merchantOid: oid,
      amountMinor: 1000,
      currencyCode: "TRY",
      status: "PENDING",
      createdAt: new Date("2026-08-17T00:00:00.000Z"),
    });
    const checkout = { ok: false as const, reason: "pay_api_error" as const, message: "magaza aktif degil" };
    expect(shouldFailCloseWalletTopUpCheckout(checkout.ok)).toBe(true);
    const closed = await failPaymentOrder(orders, oid);
    expect(closed.applied).toBe(true);
    expect(closed.order.status).toBe("FAILED");
    expect(orders.row().status).toBe("FAILED");
    expect(decideWalletTopUpReuse(orders.row(), "u1", 1000)).toEqual({
      action: "conflict",
      reason: "failed_oid",
    });
  });
});

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
