import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/kernel/identity/types";
import { CHECKOUT_LEGAL_CONSENT_VERSION } from "@/lib/kernel/legal/checkout-consent";

/** Kayıt rıza sürümü — yasal metin yürürlüğü / kasa `consentVersion` ile aynı. */
export const SIGNUP_LEGAL_CONSENT_VERSION = CHECKOUT_LEGAL_CONSENT_VERSION;

export type SignupAuthMetadata = {
  display_name: string;
  full_name: string;
  age_confirmed_at: string;
  is_adult: true;
  terms_accepted_at: string;
  consent_version: typeof SIGNUP_LEGAL_CONSENT_VERSION;
  terms_confirmed: true;
  kvkk_confirmed: true;
};

export function normalizeSignupFullName(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > DISPLAY_NAME_MAX_LENGTH || /[\r\n\0]/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * Fail-closed kayıt metadata’sı. 18+ veya kullanım/KVKK onayı yoksa `null` — `signUp` gitmez.
 * `age_confirmed_at`, `terms_accepted_at` ve `consent_version` Auth user_metadata’da hukuki kanıttır.
 */
export function buildSignupAuthMetadata(
  fullName: string,
  ageConfirmed: boolean,
  termsConfirmed: boolean,
  now: Date = new Date(),
): SignupAuthMetadata | null {
  if (!ageConfirmed || !termsConfirmed) {
    return null;
  }
  const displayName = normalizeSignupFullName(fullName);
  if (!displayName) {
    return null;
  }
  const acceptedAt = now.toISOString();
  return {
    display_name: displayName,
    full_name: displayName,
    age_confirmed_at: acceptedAt,
    is_adult: true,
    terms_accepted_at: acceptedAt,
    consent_version: SIGNUP_LEGAL_CONSENT_VERSION,
    terms_confirmed: true,
    kvkk_confirmed: true,
  };
}

/** Confirm-email açıkken mevcut adres boş identities ile "başarılı" döner. */
export function isDuplicateSignupUser(user: { identities?: unknown[] | null } | null | undefined): boolean {
  return Array.isArray(user?.identities) && user.identities.length === 0;
}
