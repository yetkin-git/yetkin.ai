import "server-only";

import { FUNNEL_VIZE_HIT_STEP } from "@/lib/kernel/admin/funnel-constants";
import { recordFunnelDailyStep } from "@/lib/kernel/admin/funnel-counter";

/**
 * Kamu `/vize/[id]` kartı bulunduğunda günlük gösterim +1.
 * Throw etmez — kart yüklemesini bozmaz. IP / UA / damga id yazılmaz.
 */
export async function recordPublicTalentCardHit(): Promise<void> {
  await recordFunnelDailyStep(FUNNEL_VIZE_HIT_STEP, { failureEvent: "career.vize.hit" });
}
