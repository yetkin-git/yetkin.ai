export const PROFILE_UNSET_LABEL = "Belirtilmemiş" as const;
export const PROFILE_DEFAULT_LOCALE = "tr-TR" as const;
export const PROFILE_DEFAULT_TIME_ZONE = "Europe/Istanbul" as const;

export function profileDisplayName(displayName: string | null | undefined): string {
  const trimmed = displayName?.trim();
  return trimmed ? trimmed : PROFILE_UNSET_LABEL;
}

/** User.email SSOT; satır yoksa oturum e-postası. Uydurma adres yok. */
export function profileEmail(userEmail: string | null | undefined, sessionEmail: string): string {
  const trimmed = userEmail?.trim();
  return trimmed ? trimmed : sessionEmail;
}

export function formatProfileCreatedAt(
  createdAt: Date,
  locale: string,
  timeZone: string,
): string {
  try {
    return createdAt.toLocaleString(locale, {
      timeZone,
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return createdAt.toLocaleString(PROFILE_DEFAULT_LOCALE, {
      timeZone: PROFILE_DEFAULT_TIME_ZONE,
      dateStyle: "long",
      timeStyle: "short",
    });
  }
}
