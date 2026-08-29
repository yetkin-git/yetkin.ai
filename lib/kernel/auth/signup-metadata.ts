import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/kernel/identity/types";

export type SignupAuthMetadata = {
  display_name: string;
  full_name: string;
};

export function normalizeSignupFullName(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > DISPLAY_NAME_MAX_LENGTH || /[\r\n\0]/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function buildSignupAuthMetadata(fullName: string): SignupAuthMetadata | null {
  const displayName = normalizeSignupFullName(fullName);
  if (!displayName) {
    return null;
  }
  return {
    display_name: displayName,
    full_name: displayName,
  };
}

/** Confirm-email açıkken mevcut adres boş identities ile "başarılı" döner. */
export function isDuplicateSignupUser(user: { identities?: unknown[] | null } | null | undefined): boolean {
  return Array.isArray(user?.identities) && user.identities.length === 0;
}
