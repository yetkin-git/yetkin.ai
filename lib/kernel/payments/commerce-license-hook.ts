import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";

/**
 * CLEARED sonrası Commerce aylık lisans. Kernel Commerce'u import etmez.
 * Kayıt `registerPaytrValorLicenseHooks` ile webhook, Inngest, cron ve ops CLI'dadır.
 */
export type CommerceLicenseHook = (order: PaymentOrderSnapshot) => Promise<void>;

let hook: CommerceLicenseHook | null = null;

export function registerCommerceLicenseHook(next: CommerceLicenseHook): void {
  hook = next;
}

export function clearCommerceLicenseHook(): void {
  hook = null;
}

export async function notifyCommerceLicenseHook(order: PaymentOrderSnapshot): Promise<void> {
  if (!hook) {
    return;
  }
  await hook(order);
}
