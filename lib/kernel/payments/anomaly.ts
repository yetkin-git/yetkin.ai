import { createHash, randomUUID } from "node:crypto";

/**
 * Append-only nakit anomali kaydı. İkinci bakiye / CREDIT yazıcı değildir.
 * Aynı parmak izi ikinci kez satır doğurmaz; CREDIT yine yazılmaz.
 */

export const PAYMENT_ANOMALY_KINDS = [
  "order_not_found",
  "amount_mismatch",
  "malformed_replay",
  "wallet_ledger_drift",
  "cleared_order_mismatch",
] as const;

export type PaymentAnomalyKind = (typeof PAYMENT_ANOMALY_KINDS)[number];

export type PaymentAnomalyRecord = {
  id: string;
  fingerprint: string;
  kind: PaymentAnomalyKind;
  merchantOid: string;
  expectedMinor: number | null;
  reportedMinor: number | null;
  orderId: string | null;
  walletId: string | null;
  requestId: string;
  sourceIp: string | null;
  detail: string;
  createdAt: Date;
};

export type PaymentAnomalyInsert = {
  kind: PaymentAnomalyKind;
  merchantOid: string;
  expectedMinor?: number | null;
  reportedMinor?: number | null;
  orderId?: string | null;
  walletId?: string | null;
  requestId: string;
  sourceIp?: string | null;
  detail?: Record<string, string | number | boolean | null>;
};

export type RecordPaymentAnomalyResult = {
  record: PaymentAnomalyRecord;
  inserted: boolean;
};

export type PaymentAnomalyStore = {
  insert(row: PaymentAnomalyRecord): Promise<RecordPaymentAnomalyResult>;
  findByFingerprint(fingerprint: string): Promise<PaymentAnomalyRecord | null>;
};

export function isPaymentAnomalyKind(value: string): value is PaymentAnomalyKind {
  return (PAYMENT_ANOMALY_KINDS as readonly string[]).includes(value);
}

export function paymentAnomalyFingerprint(input: {
  kind: PaymentAnomalyKind;
  merchantOid: string;
  expectedMinor?: number | null;
  reportedMinor?: number | null;
  orderId?: string | null;
  walletId?: string | null;
}): string {
  const canonical = [
    input.kind,
    input.merchantOid.trim(),
    input.expectedMinor ?? "",
    input.reportedMinor ?? "",
    input.orderId ?? "",
    input.walletId ?? "",
  ].join("|");
  return createHash("sha256").update(canonical).digest("hex");
}

function detailJson(detail: PaymentAnomalyInsert["detail"]): string {
  const payload: Record<string, string | number | boolean | null> = {};
  if (detail) {
    for (const [key, value] of Object.entries(detail)) {
      if (value !== undefined) {
        payload[key] = value;
      }
    }
  }
  return JSON.stringify(payload);
}

export function buildPaymentAnomalyRecord(
  input: PaymentAnomalyInsert,
  now: Date = new Date(),
  id: string = randomUUID(),
): PaymentAnomalyRecord {
  const expectedMinor = input.expectedMinor ?? null;
  const reportedMinor = input.reportedMinor ?? null;
  const orderId = input.orderId ?? null;
  const walletId = input.walletId ?? null;
  const sourceIp = input.sourceIp?.trim() ? input.sourceIp.trim() : null;
  return {
    id,
    fingerprint: paymentAnomalyFingerprint({
      kind: input.kind,
      merchantOid: input.merchantOid,
      expectedMinor,
      reportedMinor,
      orderId,
      walletId,
    }),
    kind: input.kind,
    merchantOid: input.merchantOid.trim(),
    expectedMinor,
    reportedMinor,
    orderId,
    walletId,
    requestId: input.requestId,
    sourceIp,
    detail: detailJson(input.detail),
    createdAt: now,
  };
}

/**
 * Kalıcı yaz. Unique parmak izi ihlali = mükerrer bozuk istek; yeni CREDIT yok.
 * Store insert unique çakışmasında inserted:false dönmekle yükümlüdür.
 */
export async function recordPaymentAnomaly(
  store: PaymentAnomalyStore,
  input: PaymentAnomalyInsert,
  now: Date = new Date(),
): Promise<RecordPaymentAnomalyResult> {
  const row = buildPaymentAnomalyRecord(input, now);
  return store.insert(row);
}
