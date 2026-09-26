import "server-only";

import { YETKIN_BRAND } from "@/lib/copy/brand";
import {
  isAuthEmailHookConfigured,
  readAuthMailTransport,
  type AuthMailStatus,
  type AuthMailTransport,
} from "@/lib/kernel/auth/auth-mail-config";
import { buildSignupConfirmationEmail } from "@/lib/kernel/auth/confirmation-template";
import { getPrisma } from "@/lib/kernel/db";
import { sendNoticeSmtp } from "@/lib/kernel/notice/smtp";
import { logEvent } from "@/lib/kernel/observability/log";

const RESEND_URL = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 8_000;

export function buildSignupVerifyUrl(input: {
  supabaseUrl: string;
  tokenHash: string;
  redirectTo: string;
  type?: string;
}): string | null {
  const base = input.supabaseUrl.trim().replace(/\/$/, "");
  const token = input.tokenHash.trim();
  const type = input.type?.trim() || "signup";
  if (!base || !token) {
    return null;
  }
  const url = new URL(`${base}/auth/v1/verify`);
  url.searchParams.set("token", token);
  url.searchParams.set("type", type);
  if (input.redirectTo.trim()) {
    url.searchParams.set("redirect_to", input.redirectTo);
  }
  return url.toString();
}

async function postResend(
  transport: Extract<AuthMailTransport, { kind: "resend" }>,
  mail: { to: string; subject: string; text: string; html: string },
): Promise<void> {
  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${transport.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: transport.from,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    }),
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`resend_${response.status}`);
  }
}

export async function sendAuthHtmlMail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  env?: Record<string, string | undefined>;
}): Promise<AuthMailStatus> {
  const transport = readAuthMailTransport(input.env);
  if (!transport) {
    return "unconfigured";
  }
  if (transport.kind === "resend") {
    await postResend(transport, input);
    return "sent";
  }
  await sendNoticeSmtp(
    {
      host: transport.host,
      port: transport.port,
      user: transport.user,
      pass: transport.pass,
      from: transport.from,
    },
    {
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      fromName: YETKIN_BRAND,
    },
  );
  return "sent";
}

export function logConfirmationMail(input: {
  status: AuthMailStatus;
  requestId?: string;
  route?: string;
  reason?: string;
  errorName?: string;
}): void {
  logEvent({
    level: input.status === "sent" ? "info" : input.status === "unconfigured" ? "warn" : "error",
    event: "auth.confirmation.mail",
    requestId: input.requestId,
    route: input.route,
    action: input.status,
    reason: input.reason,
    errorName: input.errorName,
    status: input.status === "sent" ? 200 : 503,
  });
}

async function readConfirmationToken(email: string): Promise<string | null> {
  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<{ confirmation_token: string | null }[]>`
    SELECT confirmation_token
    FROM auth.users
    WHERE lower(email) = lower(${email})
      AND email_confirmed_at IS NULL
    LIMIT 1
  `;
  const token = rows[0]?.confirmation_token?.trim() ?? "";
  return token || null;
}

/**
 * Kayıt sonrası doğrulama postası.
 * Kanca sırrı dolu ve signUp kabul edildiyse ikinci posta basılmaz (kanca gönderdi).
 * Aksi halde auth.users tokenı ile SMTP / Resend gönderir.
 */
export async function deliverSignupConfirmationMail(input: {
  email: string;
  emailRedirectTo: string;
  signupAccepted: boolean;
  requestId?: string;
  route?: string;
  env?: Record<string, string | undefined>;
}): Promise<AuthMailStatus> {
  const env = input.env ?? process.env;
  if (input.signupAccepted && isAuthEmailHookConfigured(env)) {
    logConfirmationMail({
      status: "sent",
      requestId: input.requestId,
      route: input.route,
      reason: "hook",
    });
    return "sent";
  }
  if (!readAuthMailTransport(env)) {
    logConfirmationMail({
      status: "unconfigured",
      requestId: input.requestId,
      route: input.route,
      reason: "mail_unconfigured",
    });
    return "unconfigured";
  }
  try {
    const token = await readConfirmationToken(input.email);
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const confirmUrl = token
      ? buildSignupVerifyUrl({ supabaseUrl, tokenHash: token, redirectTo: input.emailRedirectTo })
      : null;
    if (!confirmUrl) {
      logConfirmationMail({
        status: "failed",
        requestId: input.requestId,
        route: input.route,
        reason: "no_token",
      });
      return "failed";
    }
    const letter = buildSignupConfirmationEmail(confirmUrl);
    const status = await sendAuthHtmlMail({ to: input.email, ...letter, env });
    logConfirmationMail({
      status,
      requestId: input.requestId,
      route: input.route,
      reason: status === "sent" ? "app" : "mail_unconfigured",
    });
    return status;
  } catch (error) {
    const raw = error instanceof Error ? error.message : "";
    const errorName = /^(resend_\d+|smtp_[\w]+|AbortError|TimeoutError)$/.test(raw)
      ? raw
      : error instanceof Error
        ? error.name || "Error"
        : "Error";
    logConfirmationMail({
      status: "failed",
      requestId: input.requestId,
      route: input.route,
      reason: "send_failed",
      errorName,
    });
    return "failed";
  }
}
