import { registerPaytrAcademyLicenseHook } from "@/lib/academy/register-paytr-license-hook";
import { registerPaytrJuniorLicenseHook } from "@/lib/junior/register-paytr-license-hook";

/**
 * CLEARED sonrası Akademi ve Junior lisansı.
 * Kernel dikey import etmez. Webhook, Inngest, cron ve ops CLI bu fonksiyonu
 * `reconcilePaytrPaymentOrder` çağrısından önce çalıştırır.
 * Serverless'ta her rota kendi modül örneğidir; kayıt o örnekte yapılmalıdır.
 */
export function registerPaytrValorLicenseHooks(): void {
  registerPaytrAcademyLicenseHook();
  registerPaytrJuniorLicenseHook();
}
