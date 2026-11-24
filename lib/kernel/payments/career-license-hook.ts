import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";

/**
 * CLEARED sonrası kariyer ürünü (YetkinCV kamuya açık yayın mührü).
 * Kernel kariyer dikeyini import etmez.
 * Kayıt `registerPaytrValorLicenseHooks` ile webhook, Inngest, cron ve ops CLI'dadır.
 */
export type CareerLicenseHook = (order: PaymentOrderSnapshot) => Promise<void>;

let hook: CareerLicenseHook | null = null;

export function registerCareerLicenseHook(next: CareerLicenseHook): void {
  hook = next;
}

export function clearCareerLicenseHook(): void {
  hook = null;
}

export async function notifyCareerLicenseHook(order: PaymentOrderSnapshot): Promise<void> {
  if (!hook) {
    return;
  }
  await hook(order);
}
