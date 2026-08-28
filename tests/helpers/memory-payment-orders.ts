import {
  PaymentOrderCasError,
  type PaymentOrderSnapshot,
  type PaymentOrderStore,
} from "@/lib/kernel/payments/clearing";

export type MemoryPaymentOrderStore = PaymentOrderStore & {
  row(): PaymentOrderSnapshot | null;
};

export function createMemoryPaymentOrderStore(
  initial: PaymentOrderSnapshot | null,
): MemoryPaymentOrderStore {
  let row = initial ? { ...initial } : null;

  function requireRow(id: string): PaymentOrderSnapshot {
    if (!row || row.id !== id) {
      throw new Error("sipariş yok");
    }
    return row;
  }

  return {
    row() {
      return row ? { ...row } : null;
    },
    async findByMerchantOid(merchantOid) {
      return row && merchantOid === row.merchantOid ? { ...row } : null;
    },
    async markPaid(id, _at) {
      const current = requireRow(id);
      if (current.status !== "PENDING" && current.status !== "FAILED") {
        throw new PaymentOrderCasError("PAID");
      }
      row = { ...current, status: "PAID" };
      return { ...row };
    },
    async markCleared(id, _at) {
      const current = requireRow(id);
      if (current.status !== "PAID") {
        throw new PaymentOrderCasError("CLEARED");
      }
      row = { ...current, status: "CLEARED" };
      return { ...row };
    },
    async markFailed(id, _at) {
      const current = requireRow(id);
      if (current.status !== "PENDING") {
        throw new PaymentOrderCasError("FAILED");
      }
      row = { ...current, status: "FAILED" };
      return { ...row };
    },
    async listUnclearedPaid() {
      return row?.status === "PAID" ? [{ ...row }] : [];
    },
  };
}
