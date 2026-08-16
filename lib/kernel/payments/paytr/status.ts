import { createHmac } from "node:crypto";
import { parsePaytrAmountMinor } from "@/lib/kernel/payments/paytr/webhook";
import {
  assertPaytrProductionSafety,
  getPaytrCheckoutCredentials,
} from "@/lib/kernel/payments/paytr/checkout";

export const PAYTR_STATUS_URL = "https://www.paytr.com/odeme/durum-sorgu";

export type PaytrOrderStatusInquiry =
  | { kind: "paid"; amountMinor: number }
  | { kind: "pending" }
  | { kind: "failed" }
  | { kind: "unavailable"; reason: string };

/**
 * PayTR durum API `payment_amount` ondalıklı TL stringidir ("13.00").
 * Webhook `total_amount` ise minor tam sayı stringidir. İkisini de kabul et.
 */
export function parsePaytrStatusAmountMinor(value: string): number | null {
  const trimmed = value.trim();
  const major = /^(\d+)\.(\d{2})$/.exec(trimmed);
  if (major) {
    return Number(major[1]) * 100 + Number(major[2]);
  }
  return parsePaytrAmountMinor(trimmed);
}

export function buildPaytrStatusToken(
  merchantId: string,
  merchantOid: string,
  merchantKey: string,
  merchantSalt: string,
): string {
  const hashStr = `${merchantId}${merchantOid}${merchantSalt}`;
  return createHmac("sha256", merchantKey).update(hashStr).digest("base64");
}

function readReturnAmountMinor(row: Record<string, unknown>): number | null {
  for (const key of ["payment_amount", "payment_total", "total_amount"] as const) {
    const raw = row[key];
    if (typeof raw === "string" || typeof raw === "number") {
      const parsed = parsePaytrStatusAmountMinor(String(raw));
      if (parsed != null) {
        return parsed;
      }
    }
  }
  return null;
}

export function interpretPaytrStatusPayload(payload: unknown): PaytrOrderStatusInquiry {
  if (payload == null || typeof payload !== "object") {
    return { kind: "unavailable", reason: "invalid_response" };
  }
  const row = payload as Record<string, unknown>;
  const status = String(row.status ?? "").trim().toLowerCase();
  if (status === "success") {
    const returns = Array.isArray(row.returns) ? row.returns : [];
    const first = returns[0];
    if (first == null || typeof first !== "object") {
      return { kind: "unavailable", reason: "empty_returns" };
    }
    const amountMinor = readReturnAmountMinor(first as Record<string, unknown>);
    if (amountMinor == null) {
      return { kind: "unavailable", reason: "invalid_amount" };
    }
    return { kind: "paid", amountMinor };
  }
  if (status === "failed") {
    return { kind: "failed" };
  }
  const errNo = String(row.err_no ?? "").trim();
  const errMsg = String(row.err_msg ?? "").toLowerCase();
  if (errMsg.includes("ödenmedi") || errMsg.includes("odenmedi") || errMsg.includes("failed")) {
    return { kind: "failed" };
  }
  if (errNo === "009" || errMsg.includes("bulunamadı") || errMsg.includes("bulunamadi")) {
    return { kind: "pending" };
  }
  if (status === "error" || errNo || errMsg) {
    return { kind: "pending" };
  }
  return { kind: "unavailable", reason: "unrecognized_status" };
}

export async function queryPaytrOrderStatus(
  merchantOid: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PaytrOrderStatusInquiry> {
  assertPaytrProductionSafety("queryPaytrOrderStatus");
  const oid = merchantOid.trim();
  if (!oid) {
    return { kind: "unavailable", reason: "empty_merchant_oid" };
  }
  const credentials = getPaytrCheckoutCredentials();
  if (!credentials) {
    return { kind: "unavailable", reason: "missing_credentials" };
  }

  const paytrToken = buildPaytrStatusToken(
    credentials.merchantId,
    oid,
    credentials.merchantKey,
    credentials.merchantSalt,
  );
  const body = new URLSearchParams({
    merchant_id: credentials.merchantId,
    merchant_oid: oid,
    paytr_token: paytrToken,
  });

  let response: Response;
  try {
    response = await fetchImpl(PAYTR_STATUS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch {
    return { kind: "unavailable", reason: "network" };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { kind: "unavailable", reason: "invalid_response" };
  }
  return interpretPaytrStatusPayload(payload);
}
