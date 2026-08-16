import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/kernel/auth/require-session";
import { AUTH_LOGOUT_API_PATH, resolveAuthOrigin } from "@/lib/kernel/auth/redirects";
import { createSupabaseCookieClient } from "@/lib/kernel/auth/supabase-server";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import { CITIZEN_LOGIN_PATH } from "@/lib/kernel/security/edge-guard";

export const auth = "public" as const;

function createLogoutClient(request: NextRequest, response: NextResponse) {
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

function loginRedirect(origin: string): NextResponse {
  return NextResponse.redirect(new URL(CITIZEN_LOGIN_PATH, `${origin}/`), 303);
}

export async function POST(request: NextRequest) {
  const requestId = resolveRequestId(request);
  const origin = resolveAuthOrigin(request.nextUrl);
  const redirect = loginRedirect(origin);

  if (!isSupabaseConfigured()) {
    logEvent({
      level: "warn",
      event: "auth.logout",
      requestId,
      route: AUTH_LOGOUT_API_PATH,
      reason: "unconfigured",
    });
    return redirect;
  }

  const supabase = createLogoutClient(request, redirect);
  const { error } = await supabase.auth.signOut();

  if (error) {
    logEvent({
      level: "warn",
      event: "auth.logout",
      requestId,
      route: AUTH_LOGOUT_API_PATH,
      reason: "signout_failed",
      errorName: error.name,
    });
    return redirect;
  }

  logEvent({
    level: "info",
    event: "auth.logout",
    requestId,
    route: AUTH_LOGOUT_API_PATH,
    reason: "signed_out",
    action: CITIZEN_LOGIN_PATH,
  });
  return redirect;
}
