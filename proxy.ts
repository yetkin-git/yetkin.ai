import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { collectSupabaseAuthCookieRefresh } from "./lib/kernel/auth/refresh-edge-cookies";
import {
  applyRailV1Cors,
  canonicalApiPathname,
  decideRailApiVersion,
  isApiV1Pathname,
  RAIL_API_VERSION_LABEL,
  RAIL_API_VERSION_REQUEST_HEADER,
  RAIL_MIN_VERSION_HEADER,
  railEdgeFailResponse,
  railV1FailResponse,
} from "./lib/kernel/http/api-v1";
import { decideRailV1HopGate } from "./lib/kernel/http/v1-hop-gate";
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
 * auth çerez yenileme (0.12 getAll/setAll + Cache-Control),
 * `/api/v1` hop allowlist (`RAIL_V1_HOPS`) + sürüm kapısı + soyma rewrite
 * (kopya handler ağacı yok; sicil dışı v1 yol 404, kanonik handler'a düşmez).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = createEdgeNonce();
  const v1 = isApiV1Pathname(pathname);
  const canonicalPath = canonicalApiPathname(pathname);
  const refreshed = v1
    ? { applyTo(_response: NextResponse) {} }
    : await collectSupabaseAuthCookieRefresh(request);
  const seal = (response: NextResponse) => {
    if (v1) {
      applyRailV1Cors(response, request);
    }
    applyEdgeSecurityHeaders(response, { nonce });
    refreshed.applyTo(response);
    return response;
  };

  const session = await resolveEdgeSessionState({
    pathname,
    method: request.method,
    authorizationHeader: request.headers.get("authorization"),
    cookies: v1 ? [] : request.cookies.getAll(),
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

  const hopGate = decideRailV1HopGate({
    pathname,
    method: request.method,
  });
  if (hopGate.kind === "fail") {
    return seal(railV1FailResponse(request, hopGate.error, hopGate.status));
  }

  const versionGate = decideRailApiVersion({
    pathname,
    method: request.method,
    minVersionHeader: request.headers.get(RAIL_MIN_VERSION_HEADER),
  });
  if (versionGate.kind === "fail") {
    return seal(railV1FailResponse(request, versionGate.error, versionGate.status));
  }

  if (v1 && request.method.toUpperCase() === "OPTIONS") {
    return seal(new NextResponse(null, { status: 204 }));
  }

  const rateLimitConfig = matchEdgeRateLimit(canonicalPath, request.method);
  if (rateLimitConfig) {
    const limited = applyHttpRateLimit(request, rateLimitConfig);
    if (!limited.allowed) {
      const denied = rateLimitedJsonResponse(limited, request);
      return seal(denied);
    }
  }

  const apiDecision = decideEdgeApiAuth({
    pathname: canonicalPath,
    method: request.method,
    sessionHint: session.verified,
    sessionUserId: session.userId,
  });
  if (apiDecision.kind === "deny") {
    return seal(railEdgeFailResponse(request, apiDecision.error, apiDecision.status));
  }

  if (decision.kind === "auth-307") {
    const url = request.nextUrl.clone();
    url.pathname = decision.to;
    url.search = "";
    return seal(NextResponse.redirect(url, 307));
  }

  const requestHeaders = new Headers(request.headers);
  attachEdgeNonceRequestHeaders(requestHeaders, nonce);
  if (v1) {
    requestHeaders.set(RAIL_API_VERSION_REQUEST_HEADER, RAIL_API_VERSION_LABEL);
    const url = request.nextUrl.clone();
    url.pathname = canonicalPath;
    return seal(NextResponse.rewrite(url, { request: { headers: requestHeaders } }));
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  return seal(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
