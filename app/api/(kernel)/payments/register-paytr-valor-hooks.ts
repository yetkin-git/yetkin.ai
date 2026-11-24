import { registerPaytrAcademyLicenseHook } from "@/lib/academy/register-paytr-license-hook";
import { registerPaytrCareerLicenseHook } from "@/lib/career/register-paytr-license-hook";
import { registerPaytrCommerceLicenseHook } from "@/lib/commerce/register-paytr-license-hook";
import { registerPaytrJuniorLicenseHook } from "@/lib/junior/register-paytr-license-hook";
import { registerPaytrTezgahGuestClaimHook } from "@/lib/tezgah/register-paytr-guest-claim-hook";
import { registerPaytrTezgahLicenseHook } from "@/lib/tezgah/register-paytr-license-hook";

/**
 * CLEARED sonrası Akademi, Junior, Commerce, Kariyer ve Tezgâh lisansı + misafir sahiplenme.
 * Kernel dikey import etmez. Webhook, Inngest, cron ve ops CLI bu fonksiyonu
 * `reconcilePaytrPaymentOrder` çağrısından önce çalıştırır.
 * Serverless'ta her rota kendi modül örneğidir; kayıt o örnekte yapılmalıdır.
 */
export function registerPaytrValorLicenseHooks(): void {
  registerPaytrAcademyLicenseHook();
  registerPaytrJuniorLicenseHook();
  registerPaytrCommerceLicenseHook();
  registerPaytrCareerLicenseHook();
  registerPaytrTezgahLicenseHook();
  registerPaytrTezgahGuestClaimHook();
}
