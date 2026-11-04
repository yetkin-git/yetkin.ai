/**
 * Yeni dron hop kuyruğu. `npm run dron:new` satırı buraya yazar.
 * Dizi `RAIL_V1_HOPS_META` içine yayılır; ikinci sicil değildir.
 * `dronForbidden` yazılmaz. Oda kapısı `DRON_<ID>_OPEN`.
 * Zod bu dosyada durmaz; native istemci hop metasını çekerken şemayı yüklemez.
 */
import type { RailV1HopMeta } from "./v1-hops-meta";

// dron:new imports

export const DRON_ONBOARDING_HOPS = [
  // dron:new hops
] as const satisfies readonly RailV1HopMeta[];

export type DronOnboardingHopId = (typeof DRON_ONBOARDING_HOPS)[number]["id"];

export function isDronOnboardingHopId(id: string): id is DronOnboardingHopId {
  const ids: readonly string[] = (DRON_ONBOARDING_HOPS as readonly { id: string }[]).map(
    (hop) => hop.id,
  );
  return ids.includes(id);
}

const PULSE_SUFFIX = "-pulse";

/** Hop kimliği `<oda>-pulse`. Kanonik ağız `/api/<oda>/pulse`. */
export function dronOnboardingCanonicalPath(hopId: string): string {
  if (!hopId.endsWith(PULSE_SUFFIX) || hopId.length <= PULSE_SUFFIX.length) {
    throw new Error("Onboarding hop kimliği <oda>-pulse olmalıdır.");
  }
  const roomId = hopId.slice(0, -PULSE_SUFFIX.length);
  return `/api/${roomId}/pulse`;
}
