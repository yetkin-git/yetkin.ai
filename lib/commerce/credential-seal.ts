import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { CommerceChannelName } from "@/lib/commerce/marketplace-types";

/** Kolon öneki. Düz satıcı numarası, API anahtarı ve sır bu önek olmadan yazılmaz. */
export const COMMERCE_CREDENTIAL_SEAL_PREFIX = "ccred1:" as const;

export const COMMERCE_CREDENTIAL_ENCRYPTION_ENV = "COMMERCE_CREDENTIAL_ENCRYPTION_KEY" as const;

export type CommerceCredentialField = "supplier" | "apiKey" | "apiSecret";

/** Pazaryeri çifti ve kokpit kanalları. Düz anahtar bu birliğin dışında durmaz. */
export type CommerceSealChannel = CommerceChannelName | "AMAZON" | "N11" | "OWN_STORE";

export class CommerceCredentialSealError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommerceCredentialSealError";
  }
}

/** AAD mağazaya, alana ve kanala bağlıdır. Trendyol mührü `:TRENDYOL` ile açılır. */
export function commerceCredentialAad(
  field: CommerceCredentialField,
  storeId: string,
  channel: CommerceSealChannel = "TRENDYOL",
): string {
  return `${field}:${storeId}:${channel}`;
}

function requireKey(env: NodeJS.ProcessEnv): Buffer {
  const raw = env[COMMERCE_CREDENTIAL_ENCRYPTION_ENV]?.trim() ?? "";
  if (!raw) {
    throw new CommerceCredentialSealError("COMMERCE_CREDENTIAL_ENCRYPTION_KEY yok.");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new CommerceCredentialSealError("COMMERCE_CREDENTIAL_ENCRYPTION_KEY 32 bayt base64 olmalıdır.");
  }
  return key;
}

export function sealCommerceCredential(
  plain: string,
  field: CommerceCredentialField,
  storeId: string,
  env: NodeJS.ProcessEnv = process.env,
  channel: CommerceSealChannel = "TRENDYOL",
): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", requireKey(env), iv);
  cipher.setAAD(Buffer.from(commerceCredentialAad(field, storeId, channel), "utf8"));
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return COMMERCE_CREDENTIAL_SEAL_PREFIX + Buffer.concat([iv, tag, body]).toString("base64url");
}

export function openCommerceCredential(
  stored: string,
  field: CommerceCredentialField,
  storeId: string,
  env: NodeJS.ProcessEnv = process.env,
  channel: CommerceSealChannel = "TRENDYOL",
): string {
  if (!stored.startsWith(COMMERCE_CREDENTIAL_SEAL_PREFIX)) {
    throw new CommerceCredentialSealError("Kimlik mührü tanınmadı.");
  }
  const packed = Buffer.from(stored.slice(COMMERCE_CREDENTIAL_SEAL_PREFIX.length), "base64url");
  if (packed.length < 29) {
    throw new CommerceCredentialSealError("Kimlik mührü tanınmadı.");
  }
  try {
    const decipher = createDecipheriv("aes-256-gcm", requireKey(env), packed.subarray(0, 12));
    decipher.setAAD(Buffer.from(commerceCredentialAad(field, storeId, channel), "utf8"));
    decipher.setAuthTag(packed.subarray(12, 28));
    return Buffer.concat([decipher.update(packed.subarray(28)), decipher.final()]).toString("utf8");
  } catch (error) {
    if (error instanceof CommerceCredentialSealError) {
      throw error;
    }
    throw new CommerceCredentialSealError("Kimlik mührü açılmadı.");
  }
}

export function supplierHint(supplierId: string): string {
  return supplierId.slice(-4);
}
