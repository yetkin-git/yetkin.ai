/**
 * Kenar JWT mührü (fail-closed). Cookie/Bearer varlığı ipucu değildir.
 * HS256 → SUPABASE_JWT_SECRET; ES256/RS256 → Supabase JWKS.
 * Kimlik gerçeği (e-posta) handler `getUser`’dadır; kenar imza + exp + role.
 * Super Admin kapısı imzalı `email` claim’ini kanonik adrese karşı okur.
 */

import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
  type JWTVerifyOptions,
} from "jose";
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { isFrozenShellPagePath } from "@/lib/kernel/compliance/circuit-breakers";
import { isApiV1Pathname } from "@/lib/kernel/http/api-v1";
import {
  isApiPathname,
  isEdgeOpenApiAuthKind,
  matchApiAuthKind,
} from "@/lib/kernel/security/api-auth";
import { isFrozenRoomApi } from "@/lib/kernel/security/edge-api-auth";
import {
  hasBearerSessionHint,
  hasSupabaseAuthCookieHint,
  isProtectedCitizenPath,
  SUPABASE_AUTH_COOKIE_NAME,
} from "@/lib/kernel/security/edge-guard";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";

const JWT_SEGMENTS = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const BASE64_PREFIX = "base64-";
const CLOCK_TOLERANCE_SEC = 30;
const JWKS_ALGORITHMS = ["ES256", "RS256"] as const;

const remoteJwksByUrl = new Map<string, JWTVerifyGetKey>();

export type EdgeJwtEnv = {
  supabaseUrl?: string;
  jwtSecret?: string;
};

export function readEdgeJwtEnv(source: NodeJS.ProcessEnv = process.env): EdgeJwtEnv {
  return {
    supabaseUrl: source.NEXT_PUBLIC_SUPABASE_URL,
    jwtSecret: source.SUPABASE_JWT_SECRET,
  };
}

export function looksLikeJwt(value: string): boolean {
  return JWT_SEGMENTS.test(value.trim());
}

export function extractBearerAccessToken(
  authorizationHeader: string | null | undefined,
): string | null {
  const header = authorizationHeader?.trim() ?? "";
  const match = /^Bearer\s+(\S+)/i.exec(header);
  const token = match?.[1]?.trim() ?? "";
  return looksLikeJwt(token) ? token : null;
}

function decodeBase64UrlUtf8(value: string): string | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (padded.length % 4)) % 4;
    return Buffer.from(padded + "=".repeat(pad), "base64").toString("utf8");
  } catch {
    return null;
  }
}

function tokenFromSessionBlob(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  if (looksLikeJwt(trimmed)) {
    return trimmed;
  }
  let decoded = trimmed;
  if (trimmed.startsWith(BASE64_PREFIX)) {
    const fromB64 = decodeBase64UrlUtf8(trimmed.slice(BASE64_PREFIX.length));
    if (!fromB64) {
      return null;
    }
    decoded = fromB64;
  }
  try {
    const parsed = JSON.parse(decoded) as { access_token?: unknown };
    if (typeof parsed.access_token === "string" && looksLikeJwt(parsed.access_token)) {
      return parsed.access_token;
    }
  } catch {
    try {
      const uriDecoded = decodeURIComponent(trimmed);
      if (uriDecoded !== trimmed) {
        return tokenFromSessionBlob(uriDecoded);
      }
    } catch {
      return null;
    }
  }
  return null;
}

function combineCookieChunks(
  base: string,
  byName: Map<string, string>,
): string | null {
  const unchunked = byName.get(base)?.trim();
  if (unchunked) {
    return unchunked;
  }
  const parts: string[] = [];
  for (let index = 0; ; index += 1) {
    const chunk = byName.get(`${base}.${index}`)?.trim();
    if (!chunk) {
      break;
    }
    parts.push(chunk);
  }
  return parts.length > 0 ? parts.join("") : null;
}

export function extractAccessTokenFromCookies(
  cookies: ReadonlyArray<{ name: string; value: string }>,
): string | null {
  const byName = new Map<string, string>();
  const bases = new Set<string>();
  for (const cookie of cookies) {
    if (!SUPABASE_AUTH_COOKIE_NAME.test(cookie.name)) {
      continue;
    }
    byName.set(cookie.name, cookie.value);
    const base = cookie.name.replace(/\.\d+$/, "");
    bases.add(base);
  }
  for (const base of bases) {
    const blob = combineCookieChunks(base, byName);
    if (!blob) {
      continue;
    }
    const token = tokenFromSessionBlob(blob);
    if (token) {
      return token;
    }
  }
  return null;
}

export function extractEdgeAccessToken(input: {
  authorizationHeader?: string | null;
  cookies?: ReadonlyArray<{ name: string; value: string }>;
}): string | null {
  if (hasBearerSessionHint(input.authorizationHeader)) {
    return extractBearerAccessToken(input.authorizationHeader);
  }
  if (hasSupabaseAuthCookieHint(input.cookies ?? [])) {
    return extractAccessTokenFromCookies(input.cookies ?? []);
  }
  return null;
}

export function supabaseAuthIssuer(supabaseUrl: string | undefined): string | undefined {
  const trimmed = supabaseUrl?.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return undefined;
  }
  return `${trimmed}/auth/v1`;
}

export function supabaseJwksUrl(supabaseUrl: string | undefined): string | undefined {
  const issuer = supabaseAuthIssuer(supabaseUrl);
  return issuer ? `${issuer}/.well-known/jwks.json` : undefined;
}

function remoteJwks(jwksUrl: string): JWTVerifyGetKey {
  const cached = remoteJwksByUrl.get(jwksUrl);
  if (cached) {
    return cached;
  }
  const jwks = createRemoteJWKSet(new URL(jwksUrl), {
    cooldownDuration: 30_000,
    timeoutDuration: 5_000,
  });
  remoteJwksByUrl.set(jwksUrl, jwks);
  return jwks;
}

function verifyOptions(env: EdgeJwtEnv, algorithms: string[]): JWTVerifyOptions {
  const options: JWTVerifyOptions = {
    algorithms,
    audience: "authenticated",
    clockTolerance: CLOCK_TOLERANCE_SEC,
  };
  const issuer = supabaseAuthIssuer(env.supabaseUrl);
  if (issuer) {
    options.issuer = issuer;
  }
  return options;
}

function claimsAreAuthenticated(payload: JWTPayload): boolean {
  if (typeof payload.sub !== "string" || !isSupabaseUserId(payload.sub)) {
    return false;
  }
  return payload["role"] === "authenticated";
}

function emailFromPayload(payload: JWTPayload): string | null {
  const raw = payload.email;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function actorFromPayload(payload: JWTPayload): { userId: string; email: string | null } | null {
  if (!claimsAreAuthenticated(payload) || typeof payload.sub !== "string") {
    return null;
  }
  return { userId: payload.sub, email: emailFromPayload(payload) };
}

export async function verifyEdgeAccessToken(
  token: string,
  env: EdgeJwtEnv = readEdgeJwtEnv(),
): Promise<boolean> {
  const claims = await verifyEdgeAccessTokenClaims(token, env);
  return claims !== null;
}

export async function verifyEdgeAccessTokenClaims(
  token: string,
  env: EdgeJwtEnv = readEdgeJwtEnv(),
): Promise<{ userId: string; email: string | null } | null> {
  if (!looksLikeJwt(token)) {
    return null;
  }
  let alg: string | undefined;
  try {
    alg = decodeProtectedHeader(token).alg;
  } catch {
    return null;
  }
  try {
    if (alg === "HS256") {
      const secret = env.jwtSecret?.trim();
      if (!secret) {
        return null;
      }
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
        verifyOptions(env, ["HS256"]),
      );
      return actorFromPayload(payload);
    }
    if (alg === "ES256" || alg === "RS256") {
      const jwksUrl = supabaseJwksUrl(env.supabaseUrl);
      if (!jwksUrl) {
        return null;
      }
      const { payload } = await jwtVerify(
        token,
        remoteJwks(jwksUrl),
        verifyOptions(env, [...JWKS_ALGORITHMS]),
      );
      return actorFromPayload(payload);
    }
    return null;
  } catch {
    return null;
  }
}

export function needsEdgeJwtVerification(pathname: string, method?: string): boolean {
  if (isProtectedCitizenPath(pathname) || isFrozenShellPagePath(pathname)) {
    return true;
  }
  if (!isApiPathname(pathname)) {
    return false;
  }
  if ((method ?? "GET").toUpperCase() === "OPTIONS") {
    return false;
  }
  if (isFrozenRoomApi(pathname)) {
    return true;
  }
  const kind = matchApiAuthKind(pathname, ROUTE_AUTH_MAP as Record<string, string>);
  if (!kind || isEdgeOpenApiAuthKind(kind)) {
    return false;
  }
  return true;
}

export type EdgeSessionState = {
  verified: boolean;
  userId: string | null;
  email: string | null;
};

const ANONYMOUS_EDGE_SESSION: EdgeSessionState = {
  verified: false,
  userId: null,
  email: null,
};

export async function resolveEdgeSessionState(input: {
  pathname: string;
  method?: string;
  authorizationHeader?: string | null;
  cookies?: ReadonlyArray<{ name: string; value: string }>;
  env?: EdgeJwtEnv;
}): Promise<EdgeSessionState> {
  if (!needsEdgeJwtVerification(input.pathname, input.method)) {
    return ANONYMOUS_EDGE_SESSION;
  }
  const token = extractEdgeAccessToken({
    authorizationHeader: input.authorizationHeader,
    cookies: isApiV1Pathname(input.pathname) ? [] : input.cookies,
  });
  if (!token) {
    return ANONYMOUS_EDGE_SESSION;
  }
  const claims = await verifyEdgeAccessTokenClaims(token, input.env ?? readEdgeJwtEnv());
  if (!claims) {
    return ANONYMOUS_EDGE_SESSION;
  }
  return { verified: true, userId: claims.userId, email: claims.email };
}

export async function resolveEdgeSession(input: {
  pathname: string;
  method?: string;
  authorizationHeader?: string | null;
  cookies?: ReadonlyArray<{ name: string; value: string }>;
  env?: EdgeJwtEnv;
}): Promise<boolean> {
  const state = await resolveEdgeSessionState(input);
  return state.verified;
}

/** Test sızıntısını keser — üretim çağırmaz. */
export function resetEdgeJwksCacheForTests(): void {
  remoteJwksByUrl.clear();
}
