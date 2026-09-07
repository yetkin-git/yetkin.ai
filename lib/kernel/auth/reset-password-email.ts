import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
import { buildPasswordResetRedirectTo } from "@/lib/kernel/auth/redirects";

const EMAIL_MAX = 320;

export type PasswordResetAuthError = {
  message: string;
  name?: string;
  status?: number;
};

export type PreparePasswordResetOk = {
  ok: true;
  email: string;
  redirectTo: string;
};

export type PreparePasswordResetFail = {
  ok: false;
  status: 400;
  error: string;
};

export type ResolvePasswordResetFail = {
  status: 400 | 503;
  error: string;
  reason: "smtp" | "auth";
};

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isEmailShape(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function preparePasswordResetEmail(
  emailRaw: string,
  origin: string,
): PreparePasswordResetOk | PreparePasswordResetFail {
  const email = normalizeEmail(emailRaw);
  if (!email || email.length > EMAIL_MAX || !isEmailShape(email)) {
    return { ok: false, status: 400, error: AUTH_SEN.forgot.invalidEmail };
  }
  return {
    ok: true,
    email,
    redirectTo: buildPasswordResetRedirectTo(origin),
  };
}

export function isPasswordResetEmailFailure(error: PasswordResetAuthError | null | undefined): boolean {
  if (!error) {
    return false;
  }
  const status = error.status;
  if (status === 500 || status === 502 || status === 503) {
    return true;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("smtp") ||
    message.includes("error sending") ||
    message.includes("error_sending_email") ||
    message.includes("recovery email") ||
    message.includes("unable to send") ||
    message.includes("email sending")
  );
}

export function resolvePasswordResetAuthError(
  error: PasswordResetAuthError,
  copy: typeof AUTH_SEN.forgot = AUTH_SEN.forgot,
): ResolvePasswordResetFail {
  if (isPasswordResetEmailFailure(error)) {
    return { status: 503, error: copy.smtpDown, reason: "smtp" };
  }
  return { status: 400, error: copy.fail, reason: "auth" };
}
