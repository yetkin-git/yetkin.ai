import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/kernel/identity/types";

export type SignupAuthMetadata = {
  display_name: string;
  full_name: string;
  age_confirmed_at: string;
  is_adult: true;
};

export function normalizeSignupFullName(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > DISPLAY_NAME_MAX_LENGTH || /[\r\n\0]/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * Fail-closed kayıt metadata’sı. 18+ onayı yoksa `null` — `signUp` gitmez.
 * `age_confirmed_at` Auth user_metadata’da hukuki kanıttır.
 */
export function buildSignupAuthMetadata(
  fullName: string,
  ageConfirmed: boolean,
  now: Date = new Date(),
): SignupAuthMetadata | null {
  if (!ageConfirmed) {
    return null;
  }
  const displayName = normalizeSignupFullName(fullName);
  if (!displayName) {
    return null;
  }
  return {
    display_name: displayName,
    full_name: displayName,
    age_confirmed_at: now.toISOString(),
    is_adult: true,
  };
}

/** Confirm-email açıkken mevcut adres boş identities ile "başarılı" döner. */
export function isDuplicateSignupUser(user: { identities?: unknown[] | null } | null | undefined): boolean {
  return Array.isArray(user?.identities) && user.identities.length === 0;
}
