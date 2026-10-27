/**
 * Native istemci sözleşme bayrakları — saf veri.
 * Zod, Prisma ve Amiral alias burada yoktur. Tek native istemci (`apps/rail-is`)
 * ve Amiral gövdesi aynı sayıları bu dosyadan okur; ikinci kopya yazılmaz.
 *
 * `timelineSchemaVersion` sahne sözleşmesidir: yeni `StageLayout` / `VisualKeyframeOp`
 * değerini tanımayan eski build sahneyi boş oynatır. Bu yüzden okuma hop'ları sürümü
 * veriyle birlikte döner; istemci eşleşmeyi kendisi keser.
 *
 * Medya TTL: R2 sorgu imzası 60–900 saniye aralığındadır (`presignR2GetUrl`).
 * Web 600 sn'de kalır (kısa ömür, sayfa içi oynatma). Native arka plan çalma
 * 900 sn üst sınırını kullanır ve süresi dolmadan `refreshAfterSec` anında
 * aynı `play` hop'undan yeni imza alır.
 */

import { JUNIOR_TIMELINE_SCHEMA_VERSION } from "./junior-timeline-version";

/** Web oynatıcı medya imzası ömrü (saniye). Mevcut davranış korunur. */
export const RAIL_MEDIA_TTL_WEB_SEC = 600 as const;

/** Native istemci medya imzası ömrü (saniye). R2 tavanı 900'dür. */
export const RAIL_MEDIA_TTL_NATIVE_SEC = 900 as const;

/** Web: süre dolmadan önce yenileme anı (saniye). */
export const RAIL_MEDIA_REFRESH_WEB_SEC = 540 as const;

/** Native: süre dolmadan önce yenileme anı (saniye). */
export const RAIL_MEDIA_REFRESH_NATIVE_SEC = 600 as const;

export type RailMediaAudience = "web" | "native";

export const RAIL_MEDIA_AUDIENCES = ["web", "native"] as const satisfies readonly RailMediaAudience[];

export function railMediaTtlSec(audience: RailMediaAudience): number {
  return audience === "native" ? RAIL_MEDIA_TTL_NATIVE_SEC : RAIL_MEDIA_TTL_WEB_SEC;
}

export function railMediaRefreshAfterSec(audience: RailMediaAudience): number {
  return audience === "native" ? RAIL_MEDIA_REFRESH_NATIVE_SEC : RAIL_MEDIA_REFRESH_WEB_SEC;
}

export function isRailMediaAudience(value: string): value is RailMediaAudience {
  return (RAIL_MEDIA_AUDIENCES as readonly string[]).includes(value);
}

/**
 * Okuma hop'larının döndürdüğü sözleşme bloğu.
 * `shelves`, `progress` ve `catalog` aynı bloğu basar; istemci tek yerden kapı kurar.
 */
export const RAIL_V1_CLIENT_SCHEMA = {
  timelineSchemaVersion: JUNIOR_TIMELINE_SCHEMA_VERSION,
  /** Bu sürümün altındaki istemci yeni sahne op'larını boş oynatır. */
  minTimelineSchemaVersion: JUNIOR_TIMELINE_SCHEMA_VERSION,
  media: {
    web: { ttlSec: RAIL_MEDIA_TTL_WEB_SEC, refreshAfterSec: RAIL_MEDIA_REFRESH_WEB_SEC },
    native: { ttlSec: RAIL_MEDIA_TTL_NATIVE_SEC, refreshAfterSec: RAIL_MEDIA_REFRESH_NATIVE_SEC },
  },
} as const;

export type RailV1ClientSchema = typeof RAIL_V1_CLIENT_SCHEMA;
