/**
 * Junior zaman çizelgesi şema sürümü — tek ev.
 * `packages/junior-graphic` (Zod literal) ve `lib/kernel/http/v1-client-flags`
 * bu sabiti okur. Sayı ikinci kez yazılmaz.
 *
 * Sürüm artırıldığında 123 timeline dosyası yeniden mühürlenir; native istemci
 * `minTimelineSchemaVersion` altında kalırsa sahneyi boş oynatmak yerine kapıyı kapatır.
 */
export const JUNIOR_TIMELINE_SCHEMA_VERSION = "2.0.0" as const;

export type JuniorTimelineSchemaVersion = typeof JUNIOR_TIMELINE_SCHEMA_VERSION;
