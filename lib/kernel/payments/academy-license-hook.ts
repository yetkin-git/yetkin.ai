import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";

/**
 * CLEARED sonrası akademi lisansı. Kernel akademiyi import etmez;
 * kompozisyon `app/api` kaydeder.
 */
export type AcademyLicenseHook = (order: PaymentOrderSnapshot) => Promise<void>;

let hook: AcademyLicenseHook | null = null;

export function registerAcademyLicenseHook(next: AcademyLicenseHook): void {
  hook = next;
}

export function clearAcademyLicenseHook(): void {
  hook = null;
}

export async function notifyAcademyLicenseHook(order: PaymentOrderSnapshot): Promise<void> {
  if (!hook) {
    return;
  }
  await hook(order);
}
