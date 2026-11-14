import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";

export const GOOGLE_OAUTH_PROVIDER = "google" as const;

export type GoogleOAuthFailureKind = "unavailable" | "consent" | "generic";

/** Supabase / tetikleyici metnini vatandaş nedenine indirger. */
export function classifyGoogleOAuthFailure(raw: string): GoogleOAuthFailureKind {
  const normalized = raw.toLowerCase();
  if (
    normalized.includes("provider is not enabled") ||
    normalized.includes("unsupported provider") ||
    normalized.includes("provider_disabled") ||
    (normalized.includes("provider") && normalized.includes("not enabled"))
  ) {
    return "unavailable";
  }
  if (
    normalized.includes("age_confirmed") ||
    normalized.includes("18 yaş onayı") ||
    normalized.includes("terms_accepted") ||
    normalized.includes("consent_version") ||
    normalized.includes("kullanım/kvkk")
  ) {
    return "consent";
  }
  return "generic";
}

export function googleOauthCallbackReason(kind: GoogleOAuthFailureKind): string {
  if (kind === "unavailable") {
    return "google_unavailable";
  }
  if (kind === "consent") {
    return "google_consent";
  }
  return "auth_callback";
}

/** Bilinen dönüş kodu yoksa `null` — ilgisiz `error` sorgusu formu kirletmez. */
export function googleOauthReasonMessage(reason: string | null | undefined): string | null {
  switch (reason?.trim()) {
    case "google_unavailable":
    case "unavailable":
      return AUTH_SEN.google.unavailable;
    case "google_consent":
    case "consent":
      return AUTH_SEN.google.consent;
    case "auth_unconfigured":
      return AUTH_SEN.login.envMissing;
    case "auth_callback":
    case "missing_code":
      return AUTH_SEN.google.fail;
    default:
      return null;
  }
}
