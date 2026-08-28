/**
 * Kanonik `/api/v1` JSON zarfı — API-First Dron sözleşmesi.
 * Yayınlanan tek zarf v1'dir: kökte yalnız `ok, error, requestId, apiVersion, data`.
 * Versiyonsuz `{ ok, ...data }` parse'da tanınır ki sızıntı fail olsun; basılmaz, yaşatılmaz.
 * Üçüncü zarf yasaktır.
 *
 * Zod şemaları `v1-contract.ts` içindedir (kenar/proxy zod taşımaz).
 */

/** Yayınlanan JSON zarfı yalnız v1'dir. Versiyonsuz gövde parse'da tanınır, basılmaz. */
export const RAIL_JSON_ENVELOPE_KINDS = ["v1"] as const;

export const RAIL_V1_ENVELOPE_KEYS = [
  "ok",
  "error",
  "requestId",
  "apiVersion",
  "data",
] as const;

export type RailV1EnvelopeKey = (typeof RAIL_V1_ENVELOPE_KEYS)[number];

export const RAIL_V1_ENVELOPE_KEY_SET: ReadonlySet<string> = new Set(RAIL_V1_ENVELOPE_KEYS);

export const RAIL_V1_API_VERSION_LABEL = "1" as const;

/**
 * v1 başarı zarfı. `T` alanları köke yayılırsa tip hata verir
 * (`jobs` kökte `never`) — versiyonsuz serim ile çift başlılık kapanır.
 */
export type RailV1OkBody<T extends Record<string, unknown>> = {
  ok: true;
  error: null;
  requestId: string;
  apiVersion: typeof RAIL_V1_API_VERSION_LABEL;
  data: T;
} & { [K in Exclude<keyof T, RailV1EnvelopeKey>]?: never };

export type RailV1FailBody = {
  ok: false;
  error: string;
  requestId: string;
  apiVersion: typeof RAIL_V1_API_VERSION_LABEL;
  data: null;
};

export type RailV1Envelope<T extends Record<string, unknown> = Record<string, unknown>> =
  | RailV1OkBody<T>
  | RailV1FailBody;

/** Versiyonsuz web başarı gövdesi — `data` yok, alanlar kökte. */
export type RailUnversionedOkBody<T extends Record<string, unknown>> = { ok: true } & T;

export type RailUnversionedFailBody = {
  ok: false;
  error: string;
  requestId?: string;
};

const _unversionedIsNotV1: RailUnversionedOkBody<{ jobs: unknown[] }> extends RailV1OkBody<
  Record<string, unknown>
>
  ? "leak"
  : "sealed" = "sealed";
void _unversionedIsNotV1;

export function isRailV1EnvelopeKey(value: string): value is RailV1EnvelopeKey {
  return RAIL_V1_ENVELOPE_KEY_SET.has(value);
}

export function listForeignV1EnvelopeKeys(body: Record<string, unknown>): string[] {
  return Object.keys(body).filter((key) => !RAIL_V1_ENVELOPE_KEY_SET.has(key));
}

export function listMissingV1EnvelopeKeys(body: Record<string, unknown>): RailV1EnvelopeKey[] {
  return RAIL_V1_ENVELOPE_KEYS.filter((key) => !(key in body));
}

/**
 * Kökte yabancı alan = versiyonsuz serimin v1'e sızması.
 * `buildV1OkBody` / `buildV1FailBody` bunu mühürler.
 */
export function assertNoSpreadV1Envelope(body: Record<string, unknown>): void {
  const extra = listForeignV1EnvelopeKeys(body);
  const missing = listMissingV1EnvelopeKeys(body);
  if (extra.length === 0 && missing.length === 0) {
    return;
  }
  const parts: string[] = [];
  if (extra.length > 0) {
    parts.push(`yabancı kök alan: ${extra.join(",")}`);
  }
  if (missing.length > 0) {
    parts.push(`eksik zarf alanı: ${missing.join(",")}`);
  }
  throw new Error(`v1 zarfı bozuldu (${parts.join("; ")}).`);
}

export function isRailUnversionedOkBody(
  body: unknown,
): body is RailUnversionedOkBody<Record<string, unknown>> {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }
  const rec = body as Record<string, unknown>;
  if (rec.ok !== true) {
    return false;
  }
  if (
    rec.apiVersion === RAIL_V1_API_VERSION_LABEL &&
    rec.error === null &&
    "data" in rec &&
    listForeignV1EnvelopeKeys(rec).length === 0
  ) {
    return false;
  }
  return true;
}

export function isRailV1Envelope(
  body: unknown,
): body is RailV1Envelope<Record<string, unknown>> {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }
  const rec = body as Record<string, unknown>;
  if (listForeignV1EnvelopeKeys(rec).length > 0 || listMissingV1EnvelopeKeys(rec).length > 0) {
    return false;
  }
  if (rec.apiVersion !== RAIL_V1_API_VERSION_LABEL) {
    return false;
  }
  if (typeof rec.requestId !== "string" || rec.requestId.length === 0) {
    return false;
  }
  if (rec.ok === true) {
    return rec.error === null && rec.data != null && typeof rec.data === "object";
  }
  if (rec.ok === false) {
    return typeof rec.error === "string" && rec.error.length > 0 && rec.data === null;
  }
  return false;
}

export type RailJsonFlavor = "v1" | "unversioned-ok" | "unversioned-fail" | "invalid";

export function detectRailJsonFlavor(body: unknown): RailJsonFlavor {
  if (isRailV1Envelope(body)) {
    return "v1";
  }
  if (isRailUnversionedOkBody(body)) {
    return "unversioned-ok";
  }
  if (
    body != null &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    (body as Record<string, unknown>).ok === false &&
    typeof (body as Record<string, unknown>).error === "string" &&
    !("apiVersion" in (body as Record<string, unknown>))
  ) {
    return "unversioned-fail";
  }
  return "invalid";
}
