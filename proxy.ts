import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { collectSupabaseAuthCookieRefresh } from "./lib/kernel/auth/refresh-edge-cookies";
import { decideEdgeApiAuth } from "./lib/kernel/security/edge-api-auth";
import {
  applyEdgeSecurityHeaders,
  attachEdgeNonceRequestHeaders,
  createEdgeNonce,
  decideEdgeAction,
} from "./lib/kernel/security/edge-guard";
import { resolveEdgeSessionState } from "./lib/kernel/security/edge-jwt";
import {
  applyHttpRateLimit,
  matchEdgeRateLimit,
  rateLimitedJsonResponse,
} from "./lib/kernel/security/http-rate-limit";

/**
 * Tek edge girişi (Next 16 `proxy.ts`). Kök `middleware.ts` yoktur.
 * İnce mühür: müze 404, `/kayit` 308, oturumsuz çekirdek → `/giris`,
 * K6 `export const auth` kind, JWKS/HS256 JWT fail-closed, nonce CSP,
 * auth çerez yenileme (0.12 getAll/setAll + Cache-Control).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = createEdgeNonce();
  const refreshed = await collectSupabaseAuthCookieRefresh(request);
  const seal = (response: NextResponse) => {
    applyEdgeSecurityHeaders(response, { nonce });
    refreshed.applyTo(response);
    return response;
  };

  const session = await resolveEdgeSessionState({
    pathname,
    method: request.method,
    authorizationHeader: request.headers.get("authorization"),
    cookies: request.cookies.getAll(),
  });
  const decision = decideEdgeAction(pathname, session.verified);

  if (decision.kind === "museum-404") {
    return seal(new NextResponse(null, { status: 404 }));
  }

  if (decision.kind === "kayit-308") {
    const url = request.nextUrl.clone();
    url.pathname = "/register";
    return seal(NextResponse.redirect(url, 308));
  }

  const rateLimitConfig = matchEdgeRateLimit(pathname, request.method);
  if (rateLimitConfig) {
    const limited = applyHttpRateLimit(request, rateLimitConfig);
    if (!limited.allowed) {
      return seal(rateLimitedJsonResponse(limited));
    }
  }

  const apiDecision = decideEdgeApiAuth({
    pathname,
    method: request.method,
    sessionHint: session.verified,
    sessionUserId: session.userId,
  });
  if (apiDecision.kind === "deny") {
    return seal(
      NextResponse.json({ ok: false, error: apiDecision.error }, { status: apiDecision.status }),
    );
  }

  if (decision.kind === "auth-307") {
    const url = request.nextUrl.clone();
    url.pathname = decision.to;
    url.search = "";
    return seal(NextResponse.redirect(url, 307));
  }

  const requestHeaders = new Headers(request.headers);
  attachEdgeNonceRequestHeaders(requestHeaders, nonce);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  return seal(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
