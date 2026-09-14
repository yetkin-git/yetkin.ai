import "server-only";

import { FUNNEL_TIME_ZONE, FUNNEL_VIZE_HIT_STEP } from "@/lib/kernel/admin/funnel-constants";
import { getPrisma } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";

/**
 * Kamu `/vize/[id]` kartı bulunduğunda günlük gösterim +1.
 * Throw etmez — kart yüklemesini bozmaz. IP / UA / damga id yazılmaz.
 */
export async function recordPublicTalentCardHit(): Promise<void> {
  if (!process.env.DATABASE_URL?.trim()) {
    return;
  }
  try {
    const prisma = getPrisma();
    const step = FUNNEL_VIZE_HIT_STEP;
    const zone = FUNNEL_TIME_ZONE;
    await prisma.$executeRaw`
      INSERT INTO funnel_daily_counters (day, step, count)
      VALUES (((CURRENT_TIMESTAMP AT TIME ZONE ${zone})::date), ${step}, 1)
      ON CONFLICT (day, step) DO UPDATE SET count = funnel_daily_counters.count + 1
    `;
  } catch (error) {
    logEvent({
      level: "warn",
      event: "career.vize.hit",
      reason: "counter_failed",
      errorName: error instanceof Error ? error.name : "unknown",
    });
  }
}
