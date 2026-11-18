import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";

/**
 * CLEARED sonrası Tezgâh Pro veya kredi paketi.
 * Kernel tezgâh motorunu import etmez.
 * Kayıt `registerPaytrValorLicenseHooks` ile webhook, Inngest, cron ve ops CLI'dadır.
 */
export type TezgahLicenseHook = (order: PaymentOrderSnapshot) => Promise<void>;

let hook: TezgahLicenseHook | null = null;

export function registerTezgahLicenseHook(next: TezgahLicenseHook): void {
  hook = next;
}

export function clearTezgahLicenseHook(): void {
  hook = null;
}

export async function notifyTezgahLicenseHook(order: PaymentOrderSnapshot): Promise<void> {
  if (!hook) {
    return;
  }
  await hook(order);
}
