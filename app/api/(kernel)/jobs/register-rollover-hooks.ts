import { registerTezgahRolloverHook } from "@/lib/kernel/jobs/tezgah-rollover-hook";
import { runTezgahCreditRolloverScan } from "@/lib/tezgah/credit-rollover";

/**
 * Aylık kredi devri kancasını dikeye bağlar.
 *
 * Kernel cron'u `lib/tezgah` import etmez; bu dosya Inngest serve rotasında
 * bir kez çağrılır (`app/api/(kernel)/jobs/inngest/route.ts`). Serverless'ta her
 * rota kendi modül örneğidir, bu yüzden kayıt o örnekte yapılmalıdır.
 */
export function registerTezgahRolloverHooks(): void {
  registerTezgahRolloverHook(() => runTezgahCreditRolloverScan());
}
