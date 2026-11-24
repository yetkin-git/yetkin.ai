/**
 * Faz 3 / S-01 — aylık kredi devri kancası.
 *
 * Kernel `lib/tezgah`'ı import etmez (B1 import duvarı). Inngest cron'u yalnız bu
 * kancayı çağırır; gerçek ölçüm dikeyin içindedir
 * (`lib/tezgah/credit-rollover.ts`). Kayıt `app/api/(kernel)/jobs/register-rollover-hooks.ts`
 * ile Inngest serve rotasında yapılır — ödeme kancalarıyla aynı desen
 * (`registerPaytrValorLicenseHooks`).
 *
 * Kanca bağlı değilse cron no-op döner; sahte sayı basılmaz.
 */
export type TezgahRolloverScanView = {
  periodKey: string;
  previousPeriodKey: string;
  scannedSubjects: number;
  rolloverSubjects: number;
  rolloverCredits: number;
  purgedRows: number;
  applied: false;
};

export type TezgahRolloverHook = () => Promise<TezgahRolloverScanView>;

let hook: TezgahRolloverHook | null = null;

export function registerTezgahRolloverHook(next: TezgahRolloverHook): void {
  hook = next;
}

export function clearTezgahRolloverHook(): void {
  hook = null;
}

/** Bağlı değilse `null` — çağıran "ölçülmedi" der, ölçüm uydurmaz. */
export async function notifyTezgahRolloverHook(): Promise<TezgahRolloverScanView | null> {
  if (!hook) {
    return null;
  }
  return hook();
}
