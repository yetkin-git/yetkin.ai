/**
 * Anonim tetkik rapor TTL temizliği kancası.
 *
 * Kernel `lib/tezgah`'ı import etmez (B1 import duvarı). Inngest cron'u yalnız bu
 * kancayı çağırır; gerçek silme dikeyin içindedir
 * (`lib/tezgah/tetkik/public-report.ts` → `cleanupExpiredTetkikReports`).
 * Kayıt `app/api/(kernel)/jobs/register-tetkik-hooks.ts` ile Inngest serve
 * rotasında yapılır.
 */

export type TetkikReportsCleanupView = {
  ttlDays: number;
  deleted: number;
  cutoffIso: string;
};

export type TetkikReportsCleanupHook = () => Promise<TetkikReportsCleanupView>;

let hook: TetkikReportsCleanupHook | null = null;

export function registerTetkikReportsCleanupHook(next: TetkikReportsCleanupHook): void {
  hook = next;
}

export function clearTetkikReportsCleanupHook(): void {
  hook = null;
}

/** Bağlı değilse `null` — çağıran "ölçülmedi" der, silme uydurmaz. */
export async function notifyTetkikReportsCleanupHook(): Promise<TetkikReportsCleanupView | null> {
  if (!hook) {
    return null;
  }
  return hook();
}
