/**
 * HTTP Idempotency-Key — çift tıklama / yeniden deneme anahtarı.
 * İstemci ve sunucu aynı sabitleri paylaşır (server-only yok).
 * Yalnız UUID kabul edilir (log enjeksiyonu yok).
 */

export const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isIdempotencyKey(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export function createClientIdempotencyKey(): string {
  return crypto.randomUUID();
}

export type IdempotencyKeyRead =
  | { ok: true; key: string }
  | { ok: false; error: string };

export function readIdempotencyKey(request: Request): IdempotencyKeyRead {
  const raw = request.headers.get(IDEMPOTENCY_KEY_HEADER)?.trim() ?? "";
  if (!raw) {
    return { ok: false, error: "Idempotency-Key başlığı zorunludur." };
  }
  if (!isIdempotencyKey(raw)) {
    return { ok: false, error: "Idempotency-Key UUID olmalıdır." };
  }
  return { ok: true, key: raw };
}

export function idempotencyKeyHeaders(key: string): Record<string, string> {
  return { [IDEMPOTENCY_KEY_HEADER]: key };
}
