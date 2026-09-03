import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { collectSupabaseAuthCookieRefresh } from "./lib/kernel/auth/refresh-edge-cookies";
import { buildCitizenLoginHref } from "./lib/kernel/auth/redirects";
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
import {
  decideEdgeApiAuth,
  EDGE_API_FROZEN_ROOM_ERROR,
  isFrozenRoomApi,
} from "./lib/kernel/security/edge-api-auth";
import {
  applyEdgeSecurityHeaders,
  attachEdgeNonceRequestHeaders,
  createEdgeNonce,
  decideEdgeAction,
  RAIL_PATHNAME_HEADER,
  RAIL_REQUEST_METHOD_HEADER,
} from "./lib/kernel/security/edge-guard";
import { resolveEdgeSessionState } from "./lib/kernel/security/edge-jwt";
import {
  applyHttpRateLimit,
  matchEdgeRateLimit,
  rateLimitedJsonResponse,
} from "./lib/kernel/security/http-rate-limit";
import { decideWebOriginGuard } from "./lib/kernel/security/origin-guard";
import { renderFrozenRoomGoneHtml } from "./lib/kernel/http/frozen-410-html";
import {
  isSiteMaintenanceActive,
  readProcessSiteMaintenanceEnv,
  resolveRequestHostname,
  shouldInterceptForSiteMaintenance,
  siteMaintenanceNextResponse,
} from "./lib/kernel/http/site-maintenance";

/**
 * Tek edge girişi (Next 16 `proxy.ts`). Kök `middleware.ts` yoktur.
 * İnce mühür: müze 404, `/kayit` 308, oturumsuz çekirdek → `/giris`,
 * K6 `export const auth` kind, JWKS/HS256 JWT fail-closed, nonce CSP,
 * auth çerez yenileme (0.12 getAll/setAll + Cache-Control),
 * çerezli web yazmalarında Origin / Sec-Fetch-Site fail-closed,
 * `/api/v1` hop allowlist (`RAIL_V1_HOPS_META`) + sürüm kapısı + soyma rewrite
 * (kopya handler ağacı yok; sicil dışı v1 yol 404, kanonik handler'a düşmez).
 * `SITE_MAINTENANCE_FREEZE=true|1` iken ürün 503; health, `/legal`, `/iletisim`,
 * robots ve sitemap geçer. Canlı / PayTR: bayrak boş. `NODE_ENV=development` ve localhost yok sayılır.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = createEdgeNonce();
  const v1 = isApiV1Pathname(pathname);

  const maintenanceEnv = readProcessSiteMaintenanceEnv();
  if (
    shouldInterceptForSiteMaintenance(
      pathname,
      isSiteMaintenanceActive(maintenanceEnv, resolveRequestHostname(request)),
      request,
      maintenanceEnv,
    )
  ) {
    const maintenance = siteMaintenanceNextResponse(request, pathname);
    if (v1) {
      applyRailV1Cors(maintenance, request);
    }
    applyEdgeSecurityHeaders(maintenance, { nonce });
    return maintenance;
  }

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

  if (decision.kind === "frozen-410") {
    return seal(
      new NextResponse(renderFrozenRoomGoneHtml(pathname), {
        status: 410,
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
    );
  }

  if (isFrozenRoomApi(canonicalPath)) {
    return seal(railEdgeFailResponse(request, EDGE_API_FROZEN_ROOM_ERROR, 410));
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
    apiVersionHeader: request.headers.get(RAIL_API_VERSION_REQUEST_HEADER),
  });
  if (versionGate.kind === "fail") {
    return seal(railV1FailResponse(request, versionGate.error, versionGate.status));
  }

  if (v1 && request.method.toUpperCase() === "OPTIONS") {
    return seal(new NextResponse(null, { status: 204 }));
  }

  const originDecision = decideWebOriginGuard({
    pathname,
    method: request.method,
    originHeader: request.headers.get("origin"),
    secFetchSite: request.headers.get("sec-fetch-site"),
    cookies: request.cookies.getAll(),
    requestUrl: request.nextUrl,
  });
  if (originDecision.kind === "deny") {
    return seal(railEdgeFailResponse(request, originDecision.error, 403));
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
    sessionEmail: session.email,
  });
  if (apiDecision.kind === "deny") {
    return seal(railEdgeFailResponse(request, apiDecision.error, apiDecision.status));
  }

  if (decision.kind === "auth-307") {
    const url = request.nextUrl.clone();
    const login = new URL(buildCitizenLoginHref(pathname), url.origin);
    url.pathname = login.pathname;
    url.search = login.search;
    return seal(NextResponse.redirect(url, 307));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(RAIL_PATHNAME_HEADER);
  requestHeaders.set(RAIL_PATHNAME_HEADER, pathname);
  requestHeaders.set(RAIL_REQUEST_METHOD_HEADER, request.method);
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
  // /media/academy/audio WAV — kenar JWT/getUser Range isteğini kesmesin.
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico|media/).*)"],
};
