import { z } from "zod";

/**
 * Kasa / cüzdan yükleme rızası — 6502 ve Mesafeli Sözleşmeler Yönetmeliği.
 * Tik olmadan ifa başlamaz. Sürüm, yasal metin yürürlük tarihi ile aynıdır.
 */
export const CHECKOUT_LEGAL_CONSENT_VERSION = "2026-08-31" as const;

export const CHECKOUT_LEGAL_CONSENT_REQUIRED =
  "Mesafeli Satış Sözleşmesi, Ön Bilgilendirme Formu ve dijital içeriğin anında ifası için açık rıza zorunludur.";

export const checkoutLegalConsentSchema = z.object({
  distanceContractAccepted: z.literal(true),
  digitalImmediatePerformanceAccepted: z.literal(true),
  consentVersion: z.literal(CHECKOUT_LEGAL_CONSENT_VERSION),
});

export type CheckoutLegalConsent = z.infer<typeof checkoutLegalConsentSchema>;

export const CHECKOUT_LEGAL_CONSENT_PAYLOAD: CheckoutLegalConsent = {
  distanceContractAccepted: true,
  digitalImmediatePerformanceAccepted: true,
  consentVersion: CHECKOUT_LEGAL_CONSENT_VERSION,
};

export function isCheckoutLegalConsentIssue(error: z.ZodError): boolean {
  return error.issues.some((issue) => {
    const key = issue.path[0];
    return (
      key === "distanceContractAccepted" ||
      key === "digitalImmediatePerformanceAccepted" ||
      key === "consentVersion"
    );
  });
}
