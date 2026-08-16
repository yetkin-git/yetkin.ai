import { createHash } from "node:crypto";

export const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/;

export function sha256Hex(data: string | Buffer | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

export function parseSha256Hex(raw: string): string | null {
  const hash = raw.trim().toLowerCase();
  return SHA256_HEX_PATTERN.test(hash) ? hash : null;
}
