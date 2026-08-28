/**
 * P1: versiyonsuz `{ ok, ...data }` serimi kapandı; Sunset ertelenmez.
 * Tek zarf başlığı `x-rail-envelope: v1`. Üçüncü zarf yasaktır.
 */
export const RAIL_ENVELOPE_HEADER = "x-rail-envelope" as const;

export function v1EnvelopeHeaders(): HeadersInit {
  return {
    [RAIL_ENVELOPE_HEADER]: "v1",
  };
}
