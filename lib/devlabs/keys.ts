import { createHmac, randomBytes } from "node:crypto";
import type { DevLabsApiKeyRecord } from "@/lib/devlabs/types";

const DEFAULT_PEPPER = "yetkin-rail-devlabs-key-v1";

export function resolveDevLabsKeyPepper(): string {
  const fromEnv = process.env.DEVLABS_KEY_PEPPER?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_PEPPER;
}

export function generateDevLabsApiKeyPlaintext(): string {
  return `yrk_${randomBytes(24).toString("base64url")}`;
}

export function hashDevLabsApiKey(plaintext: string, pepper = resolveDevLabsKeyPepper()): string {
  return createHmac("sha256", pepper).update(plaintext).digest("hex");
}

export function devLabsKeyPrefix(plaintext: string): string {
  return plaintext.slice(0, 12);
}

/** Vatandaş / JSON yüzeyi — hash ve düz metin taşımaz. */
export function toCitizenDevLabsApiKey(key: DevLabsApiKeyRecord) {
  return {
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    revokedAt: key.revokedAt,
    createdAt: key.createdAt,
  };
}
