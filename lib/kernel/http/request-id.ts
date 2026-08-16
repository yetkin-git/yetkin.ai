/**
 * Korelasyon kimliği — nakit ve kritik mutasyon izi.
 * İstemci `x-request-id` gönderirse yalnız UUID kabul edilir (log enjeksiyonu yok).
 */

export const REQUEST_ID_HEADER = "x-request-id";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isRequestId(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export function resolveRequestId(request: Request): string {
  const raw = request.headers.get(REQUEST_ID_HEADER)?.trim() ?? "";
  if (isRequestId(raw)) {
    return raw;
  }
  return crypto.randomUUID();
}

export function requestIdHeaders(requestId: string): HeadersInit {
  return { [REQUEST_ID_HEADER]: requestId };
}
