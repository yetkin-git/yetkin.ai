/**
 * YetkinCV mührü HMAC-SHA256 imzası.
 * Eski (imzasız) satırlar `hmacSignature == null` iken geçerli sayılır; yeni satırlar imzalıdır.
 * Üçüncü taraf `GET /api/career/verify/[hash]` ile `hmacValid` okur.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export const CAREER_SEAL_HMAC_MIN_LENGTH = 16 as const;
export const CAREER_SEAL_HMAC_DERIVE_INFO = "yetkin-rail.career.seal-hmac.derive.v1" as const;
export const CAREER_SEAL_HMAC_LAB_FALLBACK = "yetkin-rail.career.seal-hmac.lab.v1" as const;

export type CareerSealHmacPayload = {
  certificateHash: string;
  userId: string;
  sittingId: string;
  roleKey: string;
  verticalKey: string;
  score: number;
  issuedAt: Date | string;
};

/** Kanonik yük — alan sırası sabit; imza karşılaştırması buna bağlıdır. */
export function careerSealCanonicalPayload(input: CareerSealHmacPayload): string {
  const issuedAt =
    input.issuedAt instanceof Date ? input.issuedAt.toISOString() : String(input.issuedAt);
  return [
    "yetkin-cv-seal.v1",
    input.certificateHash.trim().toLowerCase(),
    input.userId.trim(),
    input.sittingId.trim(),
    input.roleKey.trim(),
    input.verticalKey.trim(),
    String(input.score),
    issuedAt,
  ].join("\n");
}

function deriveSealHmacKey(seed: string): string {
  return createHmac("sha256", seed).update(CAREER_SEAL_HMAC_DERIVE_INFO).digest("hex");
}

function isVitestEnv(env: Record<string, string | undefined>): boolean {
  return env.VITEST === "true";
}

/**
 * 1) `CAREER_SEAL_HMAC_SECRET` ≥16
 * 2) `SUPABASE_JWT_SECRET` ≥16 üzerinden domain-ayrılmış derive
 * 3) Lab / Vitest sabit
 */
export function resolveCareerSealHmacSecret(
  env: Record<string, string | undefined> = process.env,
): string {
  const dedicated = env.CAREER_SEAL_HMAC_SECRET?.trim() ?? "";
  if (dedicated.length >= CAREER_SEAL_HMAC_MIN_LENGTH) {
    return dedicated;
  }
  const jwt = env.SUPABASE_JWT_SECRET?.trim() ?? "";
  if (jwt.length >= CAREER_SEAL_HMAC_MIN_LENGTH) {
    return deriveSealHmacKey(jwt);
  }
  if (env.NODE_ENV !== "production" || isVitestEnv(env)) {
    return CAREER_SEAL_HMAC_LAB_FALLBACK;
  }
  return CAREER_SEAL_HMAC_LAB_FALLBACK;
}

export function signCareerSealHmac(
  input: CareerSealHmacPayload,
  secret: string = resolveCareerSealHmacSecret(),
): string {
  return createHmac("sha256", secret).update(careerSealCanonicalPayload(input)).digest("hex");
}

export function verifyCareerSealHmac(
  input: CareerSealHmacPayload,
  signature: string | null | undefined,
  secret: string = resolveCareerSealHmacSecret(),
): { present: boolean; valid: boolean } {
  const expected = signCareerSealHmac(input, secret);
  const raw = typeof signature === "string" ? signature.trim().toLowerCase() : "";
  if (!raw) {
    // Geriye dönük: imzasız eski satır — present=false, valid=false (eski mühür geçersiz imza değil).
    return { present: false, valid: false };
  }
  if (!/^[a-f0-9]{64}$/.test(raw) || raw.length !== expected.length) {
    return { present: true, valid: false };
  }
  try {
    const ok = timingSafeEqual(Buffer.from(raw, "utf8"), Buffer.from(expected, "utf8"));
    return { present: true, valid: ok };
  } catch {
    return { present: true, valid: false };
  }
}
