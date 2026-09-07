import { createHmac, timingSafeEqual } from "node:crypto";
import { toPositiveAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  assertPaytrProductionSafety,
  PAYTR_WEBHOOK_PATH,
  requirePaytrCheckoutCredentials,
} from "@/lib/kernel/payments/paytr/checkout";
import {
  resolveTrustedForwardedIp,
  UNKNOWN_REQUEST_IP,
} from "@/lib/kernel/security/trusted-proxy";

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

/**
 * PayTR PHP: `base64_encode(hash_hmac('sha256', $oid.$salt.$status.$total, $key, true))`.
 * Test ve canlı aynı formül; `test_mode` bildirim HMAC'ine girmez.
 */
function hmacBase64(token: string, merchantKey: string): string {
  return createHmac("sha256", merchantKey).update(token, "utf8").digest("base64");
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

/** Panel canlı-mod URL yoklaması: gövdede ödeme alanı yok, CREDIT yok. */
export function isPaytrNotificationProbe(payload: PaytrWebhookPayload): boolean {
  return (
    payload.merchantOid === "" &&
    payload.status === "" &&
    payload.totalAmount === "" &&
    payload.hash === ""
  );
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

/**
 * PayTR Destek bildirim CIDR'leri. Env boşken HMAC-only (Cloudflare/Vercel hop
 * XFF'yi PayTR IP'si gibi göstermez). Env doluysa bu bloklar her zaman eklenir.
 */
export const PAYTR_OFFICIAL_WEBHOOK_IP_CIDRS = ["185.22.184.0/22"] as const;

export function parsePaytrWebhookIpAllowlist(
  raw: string | undefined = process.env.PAYTR_WEBHOOK_IP_ALLOWLIST,
): string[] {
  return (raw ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/** Env boş = HMAC-only. Doluysa resmi CIDR + operatör listesi. */
export function resolvePaytrWebhookIpAllowlist(
  raw: string | undefined = process.env.PAYTR_WEBHOOK_IP_ALLOWLIST,
): string[] {
  const configured = parsePaytrWebhookIpAllowlist(raw);
  if (configured.length === 0) {
    return [];
  }
  return [...new Set([...PAYTR_OFFICIAL_WEBHOOK_IP_CIDRS, ...configured])];
}

export function readPaytrWebhookRequestIp(request: Request): string {
  const ip = resolveTrustedForwardedIp(request.headers);
  return ip === UNKNOWN_REQUEST_IP ? "" : ip;
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) {
    return null;
  }
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      return null;
    }
    const octet = Number.parseInt(part, 10);
    if (octet < 0 || octet > 255) {
      return null;
    }
    value = (value << 8) + octet;
  }
  return value >>> 0;
}

export function ipMatchesPaytrAllowlistEntry(ip: string, entry: string): boolean {
  const source = ip.trim();
  const rule = entry.trim();
  if (!source || !rule) {
    return false;
  }
  const slash = rule.indexOf("/");
  if (slash === -1) {
    return source === rule;
  }
  const base = rule.slice(0, slash);
  const bitsRaw = rule.slice(slash + 1);
  if (!/^\d{1,2}$/.test(bitsRaw)) {
    return false;
  }
  const bits = Number.parseInt(bitsRaw, 10);
  if (bits < 0 || bits > 32) {
    return false;
  }
  const ipInt = ipv4ToInt(source);
  const baseInt = ipv4ToInt(base);
  if (ipInt === null || baseInt === null) {
    return false;
  }
  if (bits === 0) {
    return true;
  }
  const shift = 32 - bits;
  const mask = shift === 0 ? 0xffffffff : (0xffffffff << shift) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
}

/**
 * IP allowlist üretimde zorunlu değildir — CREDIT kapısı HMAC'dir.
 * Cloudflare kenarı XFF'yi PayTR kaynağı gibi göstermez; boş liste 403 basmaz.
 */
export function isPaytrWebhookIpAllowlistRequired(
  _env: NodeJS.ProcessEnv = process.env,
): boolean {
  return false;
}

/**
 * Boş liste = yalnız HMAC (lab ve üretim).
 * Dolu liste: trusted-proxy kaynak IP tam eşleşme veya IPv4 CIDR.
 */
export function isPaytrWebhookSourceIpAllowed(
  requestIp: string,
  allowlist: string[],
  _env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (allowlist.length === 0) {
    return true;
  }
  const ip = requestIp.trim();
  if (!ip) {
    return false;
  }
  return allowlist.some((entry) => ipMatchesPaytrAllowlistEntry(ip, entry));
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
