import { createHash } from "node:crypto";

export { SHA256_HEX_PATTERN, parseSha256Hex } from "@yetkin/kernel/crypto/sha256";

export function sha256Hex(data: string | Buffer | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}
