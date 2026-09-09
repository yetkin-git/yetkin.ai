import { createHmac, timingSafeEqual } from "node:crypto";
import { toPositiveAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  assertPaytrProductionSafety,
  getPaytrCheckoutCredentials,
  PAYTR_WEBHOOK_PATH,
  requirePaytrCheckoutCredentials,
} from "@/lib/kernel/payments/paytr/checkout";
import {
  listForwardedIps,
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

/**
 * application/x-www-form-urlencoded `+` karakterini boşluğa çevirir;
 * PayTR Base64 hash'indeki `+` işaretini geri koyar.
 */
export function normalizePaytrPostedHash(hash: string): string {
  return hash.trim().replaceAll(" ", "+");
}

export function buildPaytrWebhookClassicToken(
  payload: Pick<PaytrWebhookPayload, "merchantOid" | "status" | "totalAmount">,
  merchant_salt: string,
): string {
  const merchant_oid = payload.merchantOid;
  const status = payload.status;
  const total_amount = payload.totalAmount;
  const hash_str = merchant_oid + merchant_salt + status + total_amount;
  return hash_str;
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
 * PayTR resmi bildirim HMAC:
 * hash_str = merchant_oid + merchant_salt + status + total_amount
 * calculated_hash = HMAC-SHA256(hash_str, PAYTR_MERCHANT_KEY) → Base64
 * PHP: base64_encode(hash_hmac('sha256', $hash_str, $merchant_key, true))
 * Test ve canlı aynı formül; `test_mode` bildirim HMAC'ine girmez.
 */
function hmacBase64(hash_str: string, merchantKey: string): string {
  const token = hash_str;
  return createHmac("sha256", merchantKey).update(token, "utf8").digest("base64");
}

function parsePaytrWebhookFields(get: (name: string) => string): PaytrWebhookPayload {
  return {
    merchantOid: get("merchant_oid").trim(),
    status: get("status").trim(),
    totalAmount: get("total_amount").trim(),
    hash: normalizePaytrPostedHash(get("hash")),
    event: get("event").trim() || null,
    transferStatus: get("transfer_status").trim() || null,
  };
}

export function parsePaytrWebhookForm(formData: FormData): PaytrWebhookPayload {
  return parsePaytrWebhookFields((name) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  });
}

/** PayTR resmi gövde: `application/x-www-form-urlencoded`. */
export function parsePaytrWebhookUrlEncoded(raw: string): PaytrWebhookPayload {
  const params = new URLSearchParams(raw);
  return parsePaytrWebhookFields((name) => params.get(name) ?? "");
}

/**
 * PayTR Bildirim URL gövdesini okur.
 * `request.formData()` urlencoded POST'ta Next/undici "Failed to parse body as FormData"
 * ile HTTP 400 basabilir; resmi Content-Type text + URLSearchParams ile okunur.
 */
export async function readPaytrWebhookPayload(request: Request): Promise<PaytrWebhookPayload> {
  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  try {
    if (contentType.includes("multipart/form-data")) {
      return parsePaytrWebhookForm(await request.formData());
    }
    return parsePaytrWebhookUrlEncoded(await request.text());
  } catch {
    return parsePaytrWebhookUrlEncoded("");
  }
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
 * PayTR Destek'in güncel bildirim sunucu IPv4'leri (Mağaza paneli URL testi).
 * CREDIT kapısı HMAC'dir; bu listeden gelen istekler 400/403 basmaz.
 */
export const PAYTR_OFFICIAL_WEBHOOK_IPS = [
  "185.187.184.84",
  "212.252.97.250",
  "213.74.97.150",
] as const;

/**
 * PayTR Destek bildirim CIDR + güncel host'lar. Env boşken HMAC-only
 * (Cloudflare/Vercel hop XFF'yi PayTR IP'si gibi göstermez). Env doluysa
 * bu bloklar her zaman eklenir.
 */
export const PAYTR_OFFICIAL_WEBHOOK_IP_CIDRS = [
  "185.22.184.0/22",
  ...PAYTR_OFFICIAL_WEBHOOK_IPS,
] as const;

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

export function isPaytrOfficialWebhookIp(ip: string): boolean {
  const source = ip.trim();
  if (!source) {
    return false;
  }
  return PAYTR_OFFICIAL_WEBHOOK_IPS.some((entry) => ipMatchesPaytrAllowlistEntry(source, entry));
}

function forwardedChainMatchesOfficialCidr(headers: Headers): boolean {
  return listForwardedIps(headers).some((ip) =>
    PAYTR_OFFICIAL_WEBHOOK_IP_CIDRS.some((entry) => ipMatchesPaytrAllowlistEntry(ip, entry)),
  );
}

/** XFF zincirinde PayTR Destek host'u — Cloudflare hop'u trusted IP'yi gizlese de tanınır. */
export function requestHasPaytrOfficialNotificationIp(request: Request): boolean {
  if (isPaytrOfficialWebhookIp(readPaytrWebhookRequestIp(request))) {
    return true;
  }
  return listForwardedIps(request.headers).some((ip) => isPaytrOfficialWebhookIp(ip));
}

/**
 * Operatör allowlist'i trusted hop üzerindendir (sol XFF spoof 403).
 * PayTR resmi CIDR/host zincirdeyse Cloudflare kenarı kesmez.
 */
export function isPaytrWebhookRequestIpAllowed(
  request: Request,
  allowlist: string[],
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (allowlist.length === 0) {
    return true;
  }
  if (isPaytrWebhookSourceIpAllowed(readPaytrWebhookRequestIp(request), allowlist, env)) {
    return true;
  }
  return forwardedChainMatchesOfficialCidr(request.headers);
}

export function verifyPaytrWebhookHash(payload: PaytrWebhookPayload): boolean {
  assertPaytrProductionSafety("verifyPaytrWebhookHash");
  const credentials = requirePaytrCheckoutCredentials("verifyPaytrWebhookHash");
  const receivedHash = normalizePaytrPostedHash(payload.hash);
  if (!payload.merchantOid || !payload.status || !payload.totalAmount || !receivedHash) {
    return false;
  }
  const hash_str = buildPaytrWebhookClassicToken(payload, credentials.merchantSalt);
  const calculated_hash = hmacBase64(hash_str, credentials.merchantKey);
  return timingSafeHashEqual(calculated_hash, receivedHash);
}

/** Panel testinde kilitlenmemek için alınan hash ile hesaplanan geçerli hash'i ayrıntılı basar. */
export function logPaytrWebhookHmacMismatch(
  payload: PaytrWebhookPayload,
  meta: { requestId: string; route: string },
): void {
  const credentials = getPaytrCheckoutCredentials();
  const receivedHash = normalizePaytrPostedHash(payload.hash);
  const calculatedHash = credentials
    ? hmacBase64(
        buildPaytrWebhookClassicToken(payload, credentials.merchantSalt),
        credentials.merchantKey,
      )
    : "";
  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "error",
      event: "paytr.webhook.hmac_mismatch",
      requestId: meta.requestId,
      route: meta.route,
      merchantOid: payload.merchantOid,
      status: payload.status,
      totalAmount: payload.totalAmount,
      receivedHash,
      calculatedHash,
      hashesEqual: calculatedHash === receivedHash,
      merchantIdLength: credentials?.merchantId.length ?? 0,
      merchantKeyLength: credentials?.merchantKey.length ?? 0,
      merchantSaltLength: credentials?.merchantSalt.length ?? 0,
    }),
  );
}

export function verifyPaytrClearanceBoundHash(payload: PaytrWebhookPayload): boolean {
  assertPaytrProductionSafety("verifyPaytrClearanceBoundHash");
  const credentials = requirePaytrCheckoutCredentials("verifyPaytrClearanceBoundHash");
  const receivedHash = normalizePaytrPostedHash(payload.hash);
  if (!payload.merchantOid || !payload.status || !payload.totalAmount || !receivedHash) {
    return false;
  }
  const token = buildPaytrWebhookClearanceBoundToken(payload, credentials.merchantSalt);
  const expected = hmacBase64(token, credentials.merchantKey);
  return timingSafeHashEqual(expected, receivedHash);
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
