import "server-only";

import {
  FUNNEL_COUNTER_STEP_IDS,
  FUNNEL_TIME_ZONE,
  isFunnelCounterStep,
  type FunnelCounterStep,
} from "@/lib/kernel/admin/funnel-constants";
import { getPrisma } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";

const COUNTER_STEPS = new Set<string>(FUNNEL_COUNTER_STEP_IDS);

/**
 * Günlük anonim sayaç +1. IP, çerez, kullanıcı ve kampanya yazılmaz.
 * Throw etmez. Veritabanı yoksa no-op.
 */
export async function recordFunnelDailyStep(
  step: FunnelCounterStep,
  options?: { failureEvent?: string },
): Promise<void> {
  if (!COUNTER_STEPS.has(step) || !isFunnelCounterStep(step)) {
    return;
  }
  if (!process.env.DATABASE_URL?.trim()) {
    return;
  }
  try {
    const prisma = getPrisma();
    const zone = FUNNEL_TIME_ZONE;
    await prisma.$executeRaw`
      INSERT INTO funnel_daily_counters (day, step, count)
      VALUES (((CURRENT_TIMESTAMP AT TIME ZONE ${zone})::date), ${step}, 1)
      ON CONFLICT (day, step) DO UPDATE SET count = funnel_daily_counters.count + 1
    `;
  } catch (error) {
    logEvent({
      level: "warn",
      event: options?.failureEvent ?? "funnel.counter.failed",
      reason: "counter_failed",
      errorName: error instanceof Error ? error.name : "unknown",
    });
  }
}
