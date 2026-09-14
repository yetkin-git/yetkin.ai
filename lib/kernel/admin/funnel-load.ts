import "server-only";

import { isSuperAdminActor, type SuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { FUNNEL_DEFAULT_RANGE, type FunnelRange } from "@/lib/kernel/admin/funnel-constants";
import { queryFunnelSnapshot } from "@/lib/kernel/admin/funnel-query";
import type { AdminFunnelBoard } from "@/lib/kernel/admin/funnel-types";

export const FUNNEL_UNAVAILABLE = "Huni şu an okunamadı." as const;

/**
 * Super Admin B2C hunisi.
 * Actor oturumdan gelmelidir; `isSuperAdminActor` eşleşmezse Prisma çağrılmaz.
 * DATABASE_URL yoksa veya sorgu patlarsa unavailable — sahte %100 yok.
 */
export async function loadAdminFunnelBoard(
  actor: SuperAdminActor,
  range: FunnelRange = FUNNEL_DEFAULT_RANGE,
  now: Date = new Date(),
): Promise<AdminFunnelBoard> {
  if (!isSupabaseUserId(actor.id) || !isSuperAdminActor(actor)) {
    return { access: "forbidden" };
  }
  if (!process.env.DATABASE_URL?.trim()) {
    return { access: "unavailable" };
  }

  try {
    const snapshot = await queryFunnelSnapshot(range, now);
    return { access: "ok", snapshot };
  } catch {
    return { access: "unavailable" };
  }
}
