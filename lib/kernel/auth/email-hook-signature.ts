import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_SKEW_SEC = 5 * 60;

function decodeSecret(secret: string): Buffer | null {
  const trimmed = secret.trim();
  const raw = trimmed.startsWith("v1,") ? trimmed.slice(3) : trimmed;
  const base64 = raw.startsWith("whsec_") ? raw.slice("whsec_".length) : raw;
  if (!base64) {
    return null;
  }
  try {
    const key = Buffer.from(base64, "base64");
    return key.length > 0 ? key : null;
  } catch {
    return null;
  }
}

function signatures(header: string): string[] {
  return header
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (part.startsWith("v1,") ? part.slice(3) : part));
}

/** Standard Webhooks imzası. Sır boşsa veya sapma varsa reddeder. */
export function verifyEmailHookSignature(input: {
  secret: string | undefined;
  body: string;
  id: string | null;
  timestamp: string | null;
  signature: string | null;
  nowSec?: number;
}): boolean {
  const key = input.secret ? decodeSecret(input.secret) : null;
  const id = input.id?.trim() ?? "";
  const timestamp = input.timestamp?.trim() ?? "";
  const signature = input.signature?.trim() ?? "";
  if (!key || !id || !timestamp || !signature) {
    return false;
  }
  const ts = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(ts)) {
    return false;
  }
  const now = input.nowSec ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > MAX_SKEW_SEC) {
    return false;
  }
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${input.body}`).digest("base64");
  const expectedBuf = Buffer.from(expected);
  return signatures(signature).some((candidate) => {
    const given = Buffer.from(candidate);
    return given.length === expectedBuf.length && timingSafeEqual(given, expectedBuf);
  });
}
