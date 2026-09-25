import { createHmac } from "node:crypto";
import {
  assertPaytrProductionSafety,
  getPaytrCheckoutCredentials,
} from "@/lib/kernel/payments/paytr/checkout";

/** PayTR iade servisi — `paytr_refund`. */
export const PAYTR_REFUND_URL = "https://www.paytr.com/odeme/iade";

export type PaytrRefundCallResult =
  | { ok: true; returnAmount: string }
  | { ok: false; reason: "missing_credentials" | "pay_api_error" | "network"; message: string };

/**
 * PayTR `return_amount` ondalıklı TL stringidir ("25.00").
 * Minor tamsayı bölünmez; kuruş hanesi padlenir.
 */
export function formatPaytrReturnAmount(amountMinor: number): string {
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new Error("İade tutarı pozitif kuruş olmalıdır.");
  }
  const major = Math.floor(amountMinor / 100);
  const minor = amountMinor % 100;
  return `${major}.${String(minor).padStart(2, "0")}`;
}

/**
 * paytr_token = base64(HMAC-SHA256(merchant_id + merchant_oid + return_amount + merchant_salt, merchant_key))
 */
export function buildPaytrRefundToken(
  merchantId: string,
  merchantOid: string,
  returnAmount: string,
  merchantKey: string,
  merchantSalt: string,
): string {
  const hashStr = `${merchantId}${merchantOid}${returnAmount}${merchantSalt}`;
  return createHmac("sha256", merchantKey).update(hashStr).digest("base64");
}

export function interpretPaytrRefundPayload(payload: unknown): PaytrRefundCallResult {
  if (payload == null || typeof payload !== "object") {
    return { ok: false, reason: "pay_api_error", message: "İade yanıtı okunamadı." };
  }
  const row = payload as Record<string, unknown>;
  const status = String(row.status ?? "").trim().toLowerCase();
  if (status === "success") {
    const returnAmount = String(row.return_amount ?? "").trim();
    return { ok: true, returnAmount };
  }
  const errMsg = String(row.err_msg ?? "").trim();
  return {
    ok: false,
    reason: "pay_api_error",
    message: errMsg || "Kart iadesi tamamlanamadı.",
  };
}

export async function requestPaytrRefund(
  input: { merchantOid: string; amountMinor: number },
  fetchImpl: typeof fetch = fetch,
): Promise<PaytrRefundCallResult> {
  assertPaytrProductionSafety("requestPaytrRefund");
  const credentials = getPaytrCheckoutCredentials();
  if (!credentials) {
    return {
      ok: false,
      reason: "missing_credentials",
      message: "Kart iadesi henüz bağlanmadı.",
    };
  }
  const returnAmount = formatPaytrReturnAmount(input.amountMinor);
  const paytrToken = buildPaytrRefundToken(
    credentials.merchantId,
    input.merchantOid,
    returnAmount,
    credentials.merchantKey,
    credentials.merchantSalt,
  );
  const body = new URLSearchParams({
    merchant_id: credentials.merchantId,
    merchant_oid: input.merchantOid,
    return_amount: returnAmount,
    paytr_token: paytrToken,
  });

  let response: Response;
  try {
    response = await fetchImpl(PAYTR_REFUND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch {
    return { ok: false, reason: "network", message: "Kart iadesine ulaşılamadı." };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, reason: "pay_api_error", message: "İade yanıtı okunamadı." };
  }
  return interpretPaytrRefundPayload(payload);
}
