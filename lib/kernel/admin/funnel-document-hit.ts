import "server-only";

import { headers } from "next/headers";
import { recordFunnelDailyStep } from "@/lib/kernel/admin/funnel-counter";
import type { FunnelCounterStep } from "@/lib/kernel/admin/funnel-constants";

function isDocumentPrefetch(headerStore: { get(name: string): string | null }): boolean {
  const purpose = `${headerStore.get("purpose") ?? ""} ${headerStore.get("sec-purpose") ?? ""}`.toLowerCase();
  if (purpose.includes("prefetch")) {
    return true;
  }
  const nextPrefetch = headerStore.get("next-router-prefetch") ?? headerStore.get("x-middleware-prefetch");
  return nextPrefetch === "1" || nextPrefetch === "true";
}

/**
 * Belge gösterimi. Next ön yüklemesi sayılmaz. Çerez yazılmaz.
 * İstek başlığı okunamazsa sayaç artmaz; sayfa düşmez.
 */
export async function recordFunnelDailyDocumentStep(step: FunnelCounterStep): Promise<void> {
  try {
    const headerStore = await headers();
    if (isDocumentPrefetch(headerStore)) {
      return;
    }
  } catch {
    return;
  }
  await recordFunnelDailyStep(step);
}
