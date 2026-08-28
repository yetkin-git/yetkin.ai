/**
 * Ops HTTP istemcisi — sunucu yalnız v1 basar; saha script'i data'yı
 * çağrı yerinde kök alan gibi okur (`body.merchantOid`). Dual-read serim değildir.
 */
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";

export function flattenRailV1Record(parsed: Record<string, unknown>): Record<string, unknown> {
  const v1 = parseRailClientJson<Record<string, unknown>>(parsed);
  if (!v1.ok) {
    return parsed;
  }
  return {
    ok: true,
    error: null,
    requestId: parsed.requestId,
    apiVersion: parsed.apiVersion,
    ...v1.data,
  };
}
