import { isIdempotencyKey } from "@/lib/kernel/http/idempotency-key";

/** Başlık yoksa ücretsiz hat sürer. Başlık varsa UUID olmak zorundadır. */
export function readTezgahCommandKey(
  request: Request,
): { ok: true; key: string | null } | { ok: false; error: string } {
  const raw = request.headers.get("Idempotency-Key")?.trim() ?? "";
  if (!raw) {
    return { ok: true, key: null };
  }
  if (!isIdempotencyKey(raw)) {
    return { ok: false, error: "Idempotency-Key UUID olmalıdır." };
  }
  return { ok: true, key: raw };
}
