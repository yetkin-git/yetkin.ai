export type AuthMailStatus = "sent" | "failed" | "unconfigured";

export type AuthMailTransport =
  | { kind: "resend"; apiKey: string; from: string }
  | { kind: "smtp"; host: string; port: number; user: string; pass: string; from: string };

function trim(env: Record<string, string | undefined>, name: string): string {
  return env[name]?.trim() ?? "";
}

function readFrom(env: Record<string, string | undefined>): string {
  return trim(env, "AUTH_MAIL_FROM") || trim(env, "NOTICE_MAIL_FROM");
}

function readPort(raw: string): number | null {
  if (!raw) {
    return 587;
  }
  const port = Number.parseInt(raw, 10);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    return null;
  }
  return port;
}

/** Resend HTTP önce gelir. SMTP boşsa NOTICE_SMTP_* yedeği okunur. SDK yok. */
export function readAuthMailTransport(
  env: Record<string, string | undefined> = process.env,
): AuthMailTransport | null {
  const from = readFrom(env);
  const apiKey = trim(env, "AUTH_RESEND_API_KEY");
  if (apiKey && from) {
    return { kind: "resend", apiKey, from };
  }
  const host = trim(env, "AUTH_SMTP_HOST") || trim(env, "NOTICE_SMTP_HOST");
  if (!host || !from) {
    return null;
  }
  const portRaw = trim(env, "AUTH_SMTP_HOST")
    ? trim(env, "AUTH_SMTP_PORT")
    : trim(env, "NOTICE_SMTP_PORT");
  const port = readPort(portRaw);
  if (port === null) {
    return null;
  }
  const user = trim(env, "AUTH_SMTP_HOST")
    ? trim(env, "AUTH_SMTP_USER")
    : trim(env, "NOTICE_SMTP_USER");
  const pass = trim(env, "AUTH_SMTP_HOST")
    ? trim(env, "AUTH_SMTP_PASS")
    : trim(env, "NOTICE_SMTP_PASS");
  return { kind: "smtp", host, port, user, pass, from };
}

export function isAuthEmailHookConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return trim(env, "AUTH_EMAIL_HOOK_SECRET").length > 0;
}
