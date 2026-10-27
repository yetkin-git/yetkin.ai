import { z } from "zod";
import { JUNIOR_GUARDIAN_NOTICE_VERSION } from "@/lib/copy/junior-guardian-notice";
import { checkoutBillingInfoSchema } from "@/lib/kernel/identity/billing-info";
import { checkoutLegalConsentSchema } from "@/lib/kernel/legal/checkout-consent";

/**
 * Junior iframe kasa gövdesi. Tek nesne.
 * `completeJuniorCheckout` ve `junior-pilot-checkout` hop sözleşmesi bunu okur.
 * İkinci bir şema açılmaz. Kart numarası bu gövdede yoktur.
 */
export const juniorIframeCheckoutSchema = checkoutLegalConsentSchema
  .extend({
    guardianConsentAccepted: z.literal(true),
    guardianNoticeVersion: z.literal(JUNIOR_GUARDIAN_NOTICE_VERSION),
    billing: checkoutBillingInfoSchema,
  })
  .strict();
