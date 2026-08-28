/**
 * Vatandaş yazma yanıtı — HTML/boş gövde .json() patlatmaz; sahte ok yok.
 * Yalnız v1 `{ ok, error, requestId, apiVersion, data }`. `body` = `data`.
 */

import { parseRailClientJson } from "@/lib/ui/parse-rail-json";

export type CitizenEnvelope = {
  status: number;
  ok: boolean;
  error?: string;
  body: Record<string, unknown>;
};

export async function readCitizenEnvelope(response: Response): Promise<CitizenEnvelope> {
  try {
    const parsed: unknown = await response.json();
    const v1 = parseRailClientJson<Record<string, unknown>>(parsed);
    const raw =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    if (!v1.ok) {
      return {
        status: response.status,
        ok: false,
        error: v1.error,
        body: raw,
      };
    }
    return {
      status: response.status,
      ok: true,
      body: v1.data,
    };
  } catch {
    return { status: response.status, ok: false, body: {} };
  }
}
