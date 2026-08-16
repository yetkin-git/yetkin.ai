import { sha256Hex } from "@/lib/kernel/crypto/sha256";

/** İnce merchantOid sicili — ads/doping/land-drone ormanı yok. */
export const MERCHANT_OID_PREFIXES = {
  walletTopUp: "wallet-top-up-",
  freelancerEscrow: "freelancer-escrow-",
  academy: "academy-",
} as const;

export type MerchantOidPurpose = keyof typeof MERCHANT_OID_PREFIXES;

/** Zaman damgalı oid — yeni finansal niyet. Çift tıklama için kullanma. */
export function buildMerchantOid(purpose: MerchantOidPurpose, seed: string): string {
  const suffix = seed.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
  const stamp = Date.now().toString(36);
  return `${MERCHANT_OID_PREFIXES[purpose]}${suffix}-${stamp}`.slice(0, 64);
}

/**
 * HTTP Idempotency-Key'e bağlı merchantOid.
 * Aynı kullanıcı + aynı anahtar = aynı oid; ikinci PENDING doğmaz.
 */
export function buildIdempotentMerchantOid(
  purpose: MerchantOidPurpose,
  userId: string,
  idempotencyKey: string,
): string {
  const digest = sha256Hex(`${purpose}:${userId}:${idempotencyKey}`).slice(0, 24);
  return `${MERCHANT_OID_PREFIXES[purpose]}${digest}`.slice(0, 64);
}

export function isRecognizedMerchantOid(merchantOid: string): boolean {
  return Object.values(MERCHANT_OID_PREFIXES).some((prefix) =>
    merchantOid.startsWith(prefix),
  );
}
