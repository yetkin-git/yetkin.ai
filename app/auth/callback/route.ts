import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/kernel/auth/require-session";
import { createSupabaseCookieClient } from "@/lib/kernel/auth/supabase-server";
import {
  classifyGoogleOAuthFailure,
  googleOauthCallbackReason,
} from "@/lib/kernel/auth/google-oauth";
import {
  AUTH_CALLBACK_ERROR_PATH,
  isSafeAuthNextPath,
  resolveAuthCallbackNext,
  resolveAuthOrigin,
} from "@/lib/kernel/auth/redirects";
import { logEvent } from "@/lib/kernel/observability/log";
import { resolveRequestId } from "@/lib/kernel/http/request-id";

function failRedirect(origin: string, reason: string, nextPath?: string): NextResponse {
  const url = new URL(AUTH_CALLBACK_ERROR_PATH, `${origin}/`);
  url.searchParams.set("error", reason);
  if (nextPath && isSafeAuthNextPath(nextPath)) {
    url.searchParams.set("next", nextPath);
  }
  return NextResponse.redirect(url);
}

function createCallbackClient(request: NextRequest, response: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  return createSupabaseCookieClient({
    url,
    anon,
    requestUrl: request.nextUrl,
    getAll() {
      return request.cookies.getAll();
    },
    setCookie(name, value, options) {
      response.cookies.set(name, value, options);
    },
    setHeaders: response.headers,
  });
}

export async function GET(request: NextRequest) {
  const requestId = resolveRequestId(request);
  const requestUrl = request.nextUrl;
  const origin = resolveAuthOrigin(requestUrl);
  const code = requestUrl.searchParams.get("code")?.trim() ?? "";
  const nextPath = resolveAuthCallbackNext({
    next: requestUrl.searchParams.get("next"),
    type: requestUrl.searchParams.get("type"),
  });

  const oauthError = requestUrl.searchParams.get("error")?.trim() ?? "";
  const oauthDescription = requestUrl.searchParams.get("error_description")?.trim() ?? "";
  if (oauthError) {
    const reason = googleOauthCallbackReason(classifyGoogleOAuthFailure(`${oauthError} ${oauthDescription}`));
    logEvent({
      level: "warn",
      event: "auth.callback",
      requestId,
      route: "/auth/callback",
      reason,
    });
    return failRedirect(origin, reason, nextPath);
  }

  if (!isSupabaseConfigured()) {
    logEvent({
      level: "warn",
      event: "auth.callback",
      requestId,
      route: "/auth/callback",
      reason: "unconfigured",
    });
    return failRedirect(origin, "auth_unconfigured", nextPath);
  }

  if (!code || code.length > 2048) {
    logEvent({
      level: "warn",
      event: "auth.callback",
      requestId,
      route: "/auth/callback",
      reason: "missing_code",
    });
    return failRedirect(origin, "missing_code", nextPath);
  }

  const success = NextResponse.redirect(new URL(nextPath, `${origin}/`));
  const supabase = createCallbackClient(request, success);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logEvent({
      level: "warn",
      event: "auth.callback",
      requestId,
      route: "/auth/callback",
      reason: "exchange_failed",
      errorName: error.name,
    });
    const reason = googleOauthCallbackReason(classifyGoogleOAuthFailure(error.message));
    return failRedirect(origin, reason, nextPath);
  }

  logEvent({
    level: "info",
    event: "auth.callback",
    requestId,
    route: "/auth/callback",
    reason: "exchanged",
    action: nextPath,
  });
  return success;
}
