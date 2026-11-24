import "server-only";

import {
  registerHibeCatalogReadPort,
  toPlatformGrantCall,
  type PlatformGrantCall,
} from "@/lib/kernel/market-demand/platform-demand-port";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";

/**
 * Hibe kataloğu → platform talep portu adaptörü (Ş12 / eski bulgu 3.16).
 *
 * Kernel `yetkinhibe_grant_calls` tablosunu **doğrudan** okumaz; satırlar
 * `lib/yetkinhibe/grant-catalog-live.ts` üzerinden gelir. Böylece:
 * - Tek okuma yolu vardır (tazelik, karantina, durum hesabı aynı yerden).
 * - Kernel ↔ dikey sınırı korunur (`verify:boundaries` kernel.vertical kuralı).
 *
 * Kayıt Inngest serve rotasında bir kez yapılır (`registerHibePlatformPort`).
 * Kayıt yoksa port boş liste döner ve sinyal uydurmaz.
 */
export function registerHibePlatformPort(): void {
  registerHibeCatalogReadPort({
    async readOpenCalls(now: Date): Promise<readonly PlatformGrantCall[]> {
      const catalog = await loadYetkinhibeGrantCatalog(now);
      const calls: PlatformGrantCall[] = [];
      for (const entry of catalog) {
        if (entry.status !== "ACTIVE" && entry.status !== "CLOSING_SOON") {
          continue;
        }
        const call = toPlatformGrantCall({
          id: entry.id,
          title: entry.title,
          summary: entry.summary,
          tags: entry.tags,
          minSupportMinor: entry.minSupportMinor,
          maxSupportMinor: entry.maxSupportMinor,
          supportRatioBps: entry.supportRatioBps,
        });
        if (call) {
          calls.push(call);
        }
      }
      return calls;
    },
  });
}
