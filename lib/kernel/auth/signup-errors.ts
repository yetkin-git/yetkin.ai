import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";

export type SignupErrorCopy = typeof AUTH_SEN.register;

export function isSignupDuplicateMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("already registered") ||
    normalized.includes("user already") ||
    normalized.includes("already been registered") ||
    normalized.includes("zaten kayıtlı")
  );
}

export function isSignupConfirmationEmailFailure(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("confirmation email") ||
    normalized.includes("error sending confirmation") ||
    normalized.includes("error_sending_email") ||
    (normalized.includes("smtp") && normalized.includes("email"))
  );
}

export function isSignupDatabaseTriggerFailure(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("database error saving new user") ||
    normalized.includes("handle_new_user") ||
    normalized.includes("age_confirmed_at") ||
    normalized.includes("terms_accepted_at") ||
    normalized.includes("users_email_key") ||
    normalized.includes("wallets_user_id_currency_code")
  );
}

/** Günlük `errorName` — SQL metni değil, kısa etiket. */
export function classifySignupAuthError(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return "auth";
  }
  if (isSignupDuplicateMessage(trimmed)) {
    return "duplicate";
  }
  if (isSignupConfirmationEmailFailure(trimmed)) {
    return "smtp";
  }
  if (isSignupDatabaseTriggerFailure(trimmed)) {
    if (trimmed.toLowerCase().includes("users_email_key")) {
      return "users_email_unique";
    }
    if (trimmed.toLowerCase().includes("wallets_user_id_currency_code")) {
      return "wallets_unique";
    }
    return "database_trigger";
  }
  const normalized = trimmed.toLowerCase();
  if (
    normalized.includes("failed to fetch") ||
    normalized.includes("network") ||
    normalized.includes("timeout")
  ) {
    return "timeout";
  }
  return "auth";
}

/** Auth `signUp` / kayıt API hatasını vatandaşa açık metne çevirir; İngilizce mesaj yutulmaz. */
export function resolveSignupAuthError(
  message: string,
  copy: SignupErrorCopy = AUTH_SEN.register,
): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return copy.fail;
  }
  if (isSignupDuplicateMessage(trimmed)) {
    return copy.duplicate;
  }
  if (isSignupConfirmationEmailFailure(trimmed)) {
    return copy.confirmEmail;
  }
  if (isSignupDatabaseTriggerFailure(trimmed)) {
    return copy.database;
  }
  const normalized = trimmed.toLowerCase();
  if (
    normalized.includes("failed to fetch") ||
    normalized.includes("network") ||
    normalized.includes("timeout")
  ) {
    return AUTH_SEN.login.timeout;
  }
  return trimmed;
}
