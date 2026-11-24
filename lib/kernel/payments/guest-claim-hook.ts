import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";

/**
 * Faz 3 / §4.1 — CLEARED **misafir** sipariş için hesap sahiplenme kancası.
 *
 * Kernel `lib/tezgah`'ı import etmez; token üretimi ve e-posta dikeyin işidir.
 * Kayıt `registerPaytrValorLicenseHooks` ile webhook, Inngest, cron ve ops CLI'dadır.
 *
 * Kanca **yalnız** `userId === null` ve `status === "CLEARED"` iken çağrılır.
 * Dekontu sahibine ulaştırmak için token üretir ve postalar; defter yazmaz
 * (defter `/api/auth/claim-order` içinde, sahiplik bağlanınca yazılır).
 */
export type GuestClaimHook = (order: PaymentOrderSnapshot) => Promise<void>;

let hook: GuestClaimHook | null = null;

export function registerGuestClaimHook(next: GuestClaimHook): void {
  hook = next;
}

export function clearGuestClaimHook(): void {
  hook = null;
}

export async function notifyGuestClaimHook(order: PaymentOrderSnapshot): Promise<void> {
  if (!hook) {
    return;
  }
  await hook(order);
}
