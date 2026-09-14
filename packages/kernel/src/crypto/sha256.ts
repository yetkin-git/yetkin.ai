export const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/;

export function parseSha256Hex(raw: string): string | null {
  const hash = raw.trim().toLowerCase();
  return SHA256_HEX_PATTERN.test(hash) ? hash : null;
}
