import { kurumsalAccountCloseGuard } from "@/lib/sales/kurumsal-account-close-guard";
import { registerAccountCloseGuard } from "@/lib/kernel/identity/close-account-gate";

/** Hesap kapanışında açık kurumsal ilanı kernel'e kaydeder (F1.6 / K-02). Kayıt idempotenttir. */
export function registerKurumsalAccountCloseGuard(): void {
  registerAccountCloseGuard(kurumsalAccountCloseGuard);
}
