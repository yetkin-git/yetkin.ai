import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";

/**
 * CLEARED sonrası Junior yıllık paket. Kernel Junior'u import etmez;
 * kompozisyon `app/api` kaydeder.
 */
export type JuniorLicenseHook = (order: PaymentOrderSnapshot) => Promise<void>;

let hook: JuniorLicenseHook | null = null;

export function registerJuniorLicenseHook(next: JuniorLicenseHook): void {
  hook = next;
}

export function clearJuniorLicenseHook(): void {
  hook = null;
}

export async function notifyJuniorLicenseHook(order: PaymentOrderSnapshot): Promise<void> {
  if (!hook) {
    return;
  }
  await hook(order);
}
