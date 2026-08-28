/**
 * v1 başarı gövdesi hop Zod şemasına oturur. Kenar hop-gate Zod taşımaz.
 * Tel biçimi JSON.parse(JSON.stringify) — Date → ISO.
 */
import { matchRailV1PathTemplate } from "@/lib/kernel/http/v1-hop-gate";
import { RAIL_V1_HOPS, type RailV1Hop } from "@/lib/kernel/http/v1-contract";
import { normalizePathname } from "@/lib/kernel/security/edge-guard";

export function findRailV1HopRecord(pathname: string, method: string): RailV1Hop | null {
  const path = normalizePathname(pathname);
  const verb = method.trim().toUpperCase();
  for (const hop of RAIL_V1_HOPS as readonly RailV1Hop[]) {
    if (hop.method !== verb) {
      continue;
    }
    if (
      matchRailV1PathTemplate(path, hop.v1PathTemplate) ||
      matchRailV1PathTemplate(path, hop.canonicalPathTemplate)
    ) {
      return hop;
    }
  }
  return null;
}

export function toRailV1WireData(data: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export type RailV1OkDataGuard =
  | { ok: true; hopId: string | null; wire: Record<string, unknown> }
  | { ok: false; hopId: string };

export function guardRailV1OkData(input: {
  pathname: string;
  method: string;
  data: Record<string, unknown>;
}): RailV1OkDataGuard {
  const wire = toRailV1WireData(input.data);
  const hop = findRailV1HopRecord(input.pathname, input.method);
  if (!hop) {
    return { ok: true, hopId: null, wire };
  }
  const parsed = hop.dataSchema.safeParse(wire);
  if (!parsed.success) {
    return { ok: false, hopId: hop.id };
  }
  return { ok: true, hopId: hop.id, wire: parsed.data as Record<string, unknown> };
}
