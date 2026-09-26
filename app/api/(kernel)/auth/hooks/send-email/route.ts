import { NextResponse, type NextRequest } from "next/server";
import { buildSignupConfirmationEmail } from "@/lib/kernel/auth/confirmation-template";
import { verifyEmailHookSignature } from "@/lib/kernel/auth/email-hook-signature";
import {
  buildSignupVerifyUrl,
  logConfirmationMail,
  sendAuthHtmlMail,
} from "@/lib/kernel/auth/confirmation-mail";
import { resolveRequestId } from "@/lib/kernel/http/request-id";

export const auth = "webhook" as const;

const ROUTE = "/api/auth/hooks/send-email";

type HookBody = {
  user?: { email?: string };
  email_data?: {
    token_hash?: string;
    redirect_to?: string;
    email_action_type?: string;
  };
};

export async function POST(request: NextRequest) {
  const requestId = resolveRequestId(request);
  const raw = await request.text();
  const secret = process.env.AUTH_EMAIL_HOOK_SECRET;
  const verified = verifyEmailHookSignature({
    secret,
    body: raw,
    id: request.headers.get("webhook-id") ?? request.headers.get("svix-id"),
    timestamp: request.headers.get("webhook-timestamp") ?? request.headers.get("svix-timestamp"),
    signature: request.headers.get("webhook-signature") ?? request.headers.get("svix-signature"),
  });
  if (!verified) {
    logConfirmationMail({
      status: "failed",
      requestId,
      route: ROUTE,
      reason: "hook_signature",
    });
    return NextResponse.json({ error: "imza" }, { status: 401 });
  }

  let body: HookBody;
  try {
    body = JSON.parse(raw) as HookBody;
  } catch {
    logConfirmationMail({ status: "failed", requestId, route: ROUTE, reason: "hook_body" });
    return NextResponse.json({ error: "gövde" }, { status: 400 });
  }

  const email = body.user?.email?.trim().toLowerCase() ?? "";
  const tokenHash = body.email_data?.token_hash?.trim() ?? "";
  const action = body.email_data?.email_action_type?.trim() || "signup";
  const redirectTo = body.email_data?.redirect_to?.trim() ?? "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!email || !tokenHash) {
    logConfirmationMail({
      status: "failed",
      requestId,
      route: ROUTE,
      reason: "hook_payload",
    });
    return NextResponse.json({ error: "payload" }, { status: 400 });
  }

  const confirmUrl = buildSignupVerifyUrl({ supabaseUrl, tokenHash, redirectTo, type: action });
  if (!confirmUrl) {
    logConfirmationMail({ status: "unconfigured", requestId, route: ROUTE, reason: "no_verify_url" });
    return NextResponse.json({ error: "adres" }, { status: 503 });
  }

  try {
    const letter = buildSignupConfirmationEmail(confirmUrl, action);
    const status = await sendAuthHtmlMail({ to: email, ...letter });
    logConfirmationMail({
      status,
      requestId,
      route: ROUTE,
      reason: status === "sent" ? "hook" : "mail_unconfigured",
    });
    if (status !== "sent") {
      return NextResponse.json({ error: status }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    logConfirmationMail({
      status: "failed",
      requestId,
      route: ROUTE,
      reason: "send_failed",
      errorName: error instanceof Error ? error.name || "Error" : "Error",
    });
    return NextResponse.json({ error: "gonderilemedi" }, { status: 503 });
  }
}
