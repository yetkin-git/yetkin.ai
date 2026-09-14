/**
 * Dron cüzdan kasası — tek kullanımlık HMAC pasaportu.
 * PayTR iFrame token'ı tarayıcıya Bearer olmadan taşır; çerez oturumu gerekmez.
 * MAC anahtarı sınav oturumundan domain-ayrılır (aynı sır, ayrı derive).
 */

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { resolveAcademyExamSittingMacKey } from "@/lib/academy/exam-sitting";

export const WALLET_CHECKOUT_PASSPORT_PATH = "/kasa" as const;
export const WALLET_CHECKOUT_PASSPORT_RETURN_PATH = "/kasa/donus" as const;
export const WALLET_CHECKOUT_PASSPORT_TTL_MS = 15 * 60_000;
export const WALLET_CHECKOUT_PASSPORT_VERSION = "yetkin-rail.wallet.checkout-passport.v1" as const;
const WALLET_CHECKOUT_PASSPORT_DERIVE_INFO =
  "yetkin-rail.wallet.checkout-passport.mac.derive.v1" as const;
export const WALLET_CHECKOUT_PASSPORT_QUERY = "p" as const;
export const WALLET_CHECKOUT_PASSPORT_INVALID =
  "Bu kasa bağlantısı geçersiz veya süresi doldu. Drona dönüp yeniden dene." as const;

export type WalletCheckoutPassportPayload = {
  v: typeof WALLET_CHECKOUT_PASSPORT_VERSION;
  sub: string;
  oid: string;
  tok: string;
  exp: number;
  nce: string;
};

function derivePassportMacKey(seed: string): string {
  return createHmac("sha256", seed).update(WALLET_CHECKOUT_PASSPORT_DERIVE_INFO).digest("hex");
}

export function resolveWalletCheckoutPassportMacKey(
  env: Record<string, string | undefined> = process.env,
): string {
  return derivePassportMacKey(resolveAcademyExamSittingMacKey(env));
}

function macKey(): string {
  return resolveWalletCheckoutPassportMacKey(process.env);
}

function signBody(body: string, key: string): string {
  return createHmac("sha256", key).update(body).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export function mintWalletCheckoutPassport(input: {
  userId: string;
  merchantOid: string;
  token: string;
  now?: number;
  ttlMs?: number;
}): string {
  const now = input.now ?? Date.now();
  const payload: WalletCheckoutPassportPayload = {
    v: WALLET_CHECKOUT_PASSPORT_VERSION,
    sub: input.userId,
    oid: input.merchantOid,
    tok: input.token,
    exp: now + (input.ttlMs ?? WALLET_CHECKOUT_PASSPORT_TTL_MS),
    nce: randomUUID(),
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${signBody(body, macKey())}`;
}

export function verifyWalletCheckoutPassport(
  raw: string | null | undefined,
  now: number = Date.now(),
): WalletCheckoutPassportPayload | null {
  const token = raw?.trim() ?? "";
  const dot = token.lastIndexOf(".");
  if (dot < 1) {
    return null;
  }
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  if (!body || !mac) {
    return null;
  }
  let expected: string;
  try {
    expected = signBody(body, macKey());
  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      return null;
    }
    throw error;
  }
  if (!safeEqual(mac, expected)) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (
    parsed == null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    (parsed as WalletCheckoutPassportPayload).v !== WALLET_CHECKOUT_PASSPORT_VERSION
  ) {
    return null;
  }
  const payload = parsed as WalletCheckoutPassportPayload;
  if (
    typeof payload.sub !== "string" ||
    !payload.sub ||
    typeof payload.oid !== "string" ||
    !payload.oid ||
    typeof payload.tok !== "string" ||
    !payload.tok ||
    typeof payload.exp !== "number" ||
    !Number.isFinite(payload.exp) ||
    payload.exp <= now
  ) {
    return null;
  }
  return payload;
}

export function buildWalletCheckoutPassportUrl(origin: string, passport: string): string {
  const base = origin.trim().replace(/\/+$/, "");
  const url = new URL(WALLET_CHECKOUT_PASSPORT_PATH, `${base}/`);
  url.searchParams.set(WALLET_CHECKOUT_PASSPORT_QUERY, passport);
  return url.toString();
}

export function buildPaytrDronCheckoutReturnUrl(
  origin: string,
  outcome: "ok" | "fail",
): string {
  const base = origin.trim().replace(/\/+$/, "");
  const url = new URL(WALLET_CHECKOUT_PASSPORT_RETURN_PATH, `${base}/`);
  url.searchParams.set("sonuc", outcome);
  return url.toString();
}
