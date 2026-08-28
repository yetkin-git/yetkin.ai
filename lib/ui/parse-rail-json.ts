/**
 * Amiral istemci JSON — yalnız v1 zarfı `{ ok, error, requestId, apiVersion, data }`.
 * Versiyonsuz kök alanları parse fail'dir.
 */

export const RAIL_WEB_API_VERSION_HEADER = "x-rail-api-version";
export const RAIL_WEB_API_VERSION_LABEL = "1";

export type RailClientJsonOk<T> = {
  ok: true;
  data: T;
  envelope: "v1";
};

export type RailClientJsonFail = {
  ok: false;
  error: string;
  envelope: "v1" | "unknown";
};

export type RailClientJson<T> = RailClientJsonOk<T> | RailClientJsonFail;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseRailClientJson<T>(raw: unknown): RailClientJson<T> {
  if (!isRecord(raw)) {
    return { ok: false, error: "v1 zarfı okunamadı.", envelope: "unknown" };
  }
  if (raw.apiVersion !== RAIL_WEB_API_VERSION_LABEL) {
    return { ok: false, error: "v1 zarfı okunamadı.", envelope: "unknown" };
  }
  if (raw.ok === true) {
    if (raw.error !== null) {
      return { ok: false, error: "v1 zarfı okunamadı.", envelope: "v1" };
    }
    const data = raw.data;
    if (!isRecord(data)) {
      return { ok: false, error: "v1 zarfı okunamadı.", envelope: "v1" };
    }
    return { ok: true, data: data as T, envelope: "v1" };
  }
  if (raw.ok === false) {
    const error = typeof raw.error === "string" && raw.error.trim() ? raw.error : "İşlem tamamlanamadı.";
    return { ok: false, error, envelope: "v1" };
  }
  return { ok: false, error: "v1 zarfı okunamadı.", envelope: "unknown" };
}
