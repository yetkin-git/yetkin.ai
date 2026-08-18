import { createHmac, timingSafeEqual } from "node:crypto";
import { toPositiveAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  assertPaytrProductionSafety,
  PAYTR_WEBHOOK_PATH,
  requirePaytrCheckoutCredentials,
} from "@/lib/kernel/payments/paytr/checkout";

export { PAYTR_WEBHOOK_PATH };

/** Bildirim HMAC: PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT üçlüsü zorunlu. */

export type PaytrWebhookPayload = {
  merchantOid: string;
  status: string;
  totalAmount: string;
  hash: string;
  event: string | null;
  transferStatus: string | null;
};

function timingSafeHashEqual(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function buildPaytrWebhookClassicToken(
  payload: Pick<PaytrWebhookPayload, "merchantOid" | "status" | "totalAmount">,
  merchantSalt: string,
): string {
  return `${payload.merchantOid}${merchantSalt}${payload.status}${payload.totalAmount}`;
}

export function buildPaytrWebhookClearanceBoundToken(
  payload: Pick<
    PaytrWebhookPayload,
    "merchantOid" | "status" | "totalAmount" | "event" | "transferStatus"
  >,
  merchantSalt: string,
): string {
  const classic = buildPaytrWebhookClassicToken(payload, merchantSalt);
  return `${classic}|e:${payload.event ?? ""}|t:${payload.transferStatus ?? ""}`;
}

function hmacBase64(token: string, merchantKey: string): string {
  return createHmac("sha256", merchantKey).update(token).digest("base64");
}

export function parsePaytrWebhookForm(formData: FormData): PaytrWebhookPayload {
  return {
    merchantOid: String(formData.get("merchant_oid") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
    totalAmount: String(formData.get("total_amount") ?? "").trim(),
    hash: String(formData.get("hash") ?? "").trim(),
    event: String(formData.get("event") ?? "").trim() || null,
    transferStatus: String(formData.get("transfer_status") ?? "").trim() || null,
  };
}

export function isPaytrWebhookPayload(value: unknown): value is PaytrWebhookPayload {
  if (value == null || typeof value !== "object") {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.merchantOid === "string" &&
    typeof row.status === "string" &&
    typeof row.totalAmount === "string" &&
    typeof row.hash === "string"
  );
}

export function parsePaytrWebhookIpAllowlist(
  raw: string | undefined = process.env.PAYTR_WEBHOOK_IP_ALLOWLIST,
): string[] {
  return (raw ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function readPaytrWebhookRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim() ?? "";
  if (first) {
    return first;
  }
  return request.headers.get("x-real-ip")?.trim() ?? "";
}

export function isPaytrWebhookSourceIpAllowed(requestIp: string, allowlist: string[]): boolean {
  if (allowlist.length === 0) {
    return true;
  }
  const ip = requestIp.trim();
  if (!ip) {
    return false;
  }
  return allowlist.includes(ip);
}

export function verifyPaytrWebhookHash(payload: PaytrWebhookPayload): boolean {
  assertPaytrProductionSafety("verifyPaytrWebhookHash");
  const credentials = requirePaytrCheckoutCredentials("verifyPaytrWebhookHash");
  if (!payload.merchantOid || !payload.status || !payload.totalAmount || !payload.hash) {
    return false;
  }
  const token = buildPaytrWebhookClassicToken(payload, credentials.merchantSalt);
  const expected = hmacBase64(token, credentials.merchantKey);
  return timingSafeHashEqual(expected, payload.hash);
}

export function verifyPaytrClearanceBoundHash(payload: PaytrWebhookPayload): boolean {
  assertPaytrProductionSafety("verifyPaytrClearanceBoundHash");
  const credentials = requirePaytrCheckoutCredentials("verifyPaytrClearanceBoundHash");
  if (!payload.merchantOid || !payload.status || !payload.totalAmount || !payload.hash) {
    return false;
  }
  const token = buildPaytrWebhookClearanceBoundToken(payload, credentials.merchantSalt);
  const expected = hmacBase64(token, credentials.merchantKey);
  return timingSafeHashEqual(expected, payload.hash);
}

function claimsPaytrClearance(payload: PaytrWebhookPayload): boolean {
  if (payload.event === "clearance" || payload.event === "transfer") {
    return true;
  }
  return payload.transferStatus === "completed" || payload.transferStatus === "success";
}

export function isPaytrClearanceEvent(payload: PaytrWebhookPayload): boolean {
  if (!claimsPaytrClearance(payload)) {
    return false;
  }
  return verifyPaytrClearanceBoundHash(payload);
}

/** PayTR `total_amount` zaten minor (kuruş) tam sayı stringidir. */
export function parsePaytrAmountMinor(totalAmount: string): AmountMinor | null {
  if (!/^\d+$/.test(totalAmount.trim())) {
    return null;
  }
  const parsed = Number.parseInt(totalAmount, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  try {
    return toPositiveAmountMinor(parsed);
  } catch {
    return null;
  }
}

export function computePaytrWebhookHash(
  payload: Pick<PaytrWebhookPayload, "merchantOid" | "status" | "totalAmount">,
  merchantKey: string,
  merchantSalt: string,
): string {
  return hmacBase64(buildPaytrWebhookClassicToken(payload, merchantSalt), merchantKey);
}
