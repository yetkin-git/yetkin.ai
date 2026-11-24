import { registerTetkikReportsCleanupHook } from "@/lib/kernel/jobs/tetkik-cleanup-hook";
import { cleanupExpiredTetkikReports } from "@/lib/tezgah/tetkik/public-report";

/**
 * Anonim tetkik rapor TTL süpürücüsünü dikeye bağlar.
 *
 * Kernel cron'u `lib/tezgah` import etmez; bu dosya Inngest serve rotasında
 * bir kez çağrılır (`app/api/(kernel)/jobs/inngest/route.ts`).
 */
export function registerTetkikMaintenanceHooks(): void {
  registerTetkikReportsCleanupHook(() => cleanupExpiredTetkikReports());
}
