import type {
  PaymentAnomalyRecord,
  PaymentAnomalyStore,
  RecordPaymentAnomalyResult,
} from "@/lib/kernel/payments/anomaly";

export type MemoryPaymentAnomalyStore = PaymentAnomalyStore & {
  list(): PaymentAnomalyRecord[];
};

export function createMemoryPaymentAnomalyStore(): MemoryPaymentAnomalyStore {
  const rows = new Map<string, PaymentAnomalyRecord>();
  return {
    list() {
      return [...rows.values()].map((row) => ({ ...row }));
    },
    async findByFingerprint(fingerprint) {
      const row = rows.get(fingerprint);
      return row ? { ...row } : null;
    },
    async insert(row): Promise<RecordPaymentAnomalyResult> {
      const existing = rows.get(row.fingerprint);
      if (existing) {
        return { record: { ...existing }, inserted: false };
      }
      rows.set(row.fingerprint, { ...row });
      return { record: { ...row }, inserted: true };
    },
  };
}
