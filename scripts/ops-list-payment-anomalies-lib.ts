/**
 * Operatör mutabakat sapması listesi — HTTP yok.
 * Cüzdan düzeltilmez. Parmak izi / requestId; e-posta basılmaz.
 */

import type { Client } from "pg";

export const PAYMENT_ANOMALY_LIST_DEFAULT_LIMIT = 50;
export const PAYMENT_ANOMALY_LIST_MAX_LIMIT = 200;

export type PaymentAnomalyListRow = {
  createdAt: Date;
  kind: string;
  merchantOid: string;
  requestId: string;
  expectedMinor: number | null;
  reportedMinor: number | null;
  fingerprint: string;
};

export function parseAnomalyListLimit(raw: string | undefined): number {
  if (!raw?.trim()) {
    return PAYMENT_ANOMALY_LIST_DEFAULT_LIMIT;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return PAYMENT_ANOMALY_LIST_DEFAULT_LIMIT;
  }
  return Math.min(parsed, PAYMENT_ANOMALY_LIST_MAX_LIMIT);
}

export function parseAnomalyListCliArgs(argv: string[]): { limit: number } {
  let limit = PAYMENT_ANOMALY_LIST_DEFAULT_LIMIT;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if (token === "--limit" && next) {
      limit = parseAnomalyListLimit(next);
      index += 1;
    } else if (token?.startsWith("--limit=")) {
      limit = parseAnomalyListLimit(token.slice("--limit=".length));
    }
  }
  return { limit };
}

function toMinor(value: string | number | null): number | null {
  if (value == null) {
    return null;
  }
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function listPaymentAnomalies(
  client: Client,
  limit: number = PAYMENT_ANOMALY_LIST_DEFAULT_LIMIT,
): Promise<PaymentAnomalyListRow[]> {
  const take = parseAnomalyListLimit(String(limit));
  const result = await client.query<{
    created_at: Date;
    kind: string;
    merchant_oid: string;
    request_id: string;
    expected_minor: string | number | null;
    reported_minor: string | number | null;
    fingerprint: string;
  }>(
    `SELECT created_at, kind, merchant_oid, request_id, expected_minor, reported_minor, fingerprint
       FROM payment_anomalies
      ORDER BY created_at DESC
      LIMIT $1`,
    [take],
  );
  return result.rows.map((row) => ({
    createdAt: row.created_at,
    kind: row.kind,
    merchantOid: row.merchant_oid,
    requestId: row.request_id,
    expectedMinor: toMinor(row.expected_minor),
    reportedMinor: toMinor(row.reported_minor),
    fingerprint: row.fingerprint,
  }));
}

export function formatPaymentAnomalyList(rows: readonly PaymentAnomalyListRow[]): string {
  if (rows.length === 0) {
    return "   (satır yok — sapma kaydı yok veya tarama henüz koşmadı)";
  }
  return rows
    .map((row) => {
      const expected = row.expectedMinor == null ? "-" : String(row.expectedMinor);
      const reported = row.reportedMinor == null ? "-" : String(row.reportedMinor);
      return `   ${row.createdAt.toISOString()}  ${row.kind}  oid=${row.merchantOid}  req=${row.requestId}  expected=${expected} reported=${reported}`;
    })
    .join("\n");
}
