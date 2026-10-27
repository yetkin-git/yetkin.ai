/**
 * Monolit yüzeyi. Satırların tek evi `@yetkin/kernel` hop metasıdır.
 * Profil GET, oluşturma (POST), seçme (PATCH), veli onayı (PUT) ve silme (DELETE)
 * bu ihracatla gelir. İkinci dizi yazılmaz.
 * Oda listesine girmeyen çekirdek hop’lar `v1-core-hops.ts`.
 * v1 siciline girmeyen web BFF yazmaları `web-only-write-routes.ts`.
 */
export * from "@yetkin/kernel/http/v1-hops-meta";
export * from "@yetkin/kernel/http/v1-client-flags";
export * from "@yetkin/kernel/http/junior-timeline-version";
