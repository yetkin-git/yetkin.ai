/**
 * Faz 2 `/api/v1` sürüm kapısı — tek omurga, kopya handler ağacı yok.
 * Kenar soyar ve rewrite eder; `jsonOk` yalnız v1 zarf basar.
 * Versiyonsuz kök serim yayın yüzeyi değildir (P1 kapandı).
 */

import { NextResponse } from "next/server";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  RAIL_V1_API_VERSION_LABEL,
  assertNoSpreadV1Envelope,
  type RailV1FailBody,
  type RailV1OkBody,
} from "@/lib/kernel/http/v1-envelope";
import { normalizePathname, RAIL_PATHNAME_HEADER } from "@/lib/kernel/security/edge-guard";

export const RAIL_API_VERSION = 1;
export const RAIL_API_MIN_VERSION = 1;
export const RAIL_API_VERSION_LABEL = RAIL_V1_API_VERSION_LABEL;

export const RAIL_MIN_VERSION_HEADER = "x-rail-min-version";
export const RAIL_API_VERSION_REQUEST_HEADER = "x-rail-api-version";

export const RAIL_VERSION_HEADER_REQUIRED = "Sürüm başlığı gerekli.";
export const RAIL_VERSION_HEADER_INVALID = "Sürüm başlığı geçersiz.";
export const RAIL_VERSION_CLIENT_STALE =
  `Bu uygulama güncel değil. ${YETKIN_BRAND} uygulamasını mağazadan güncelle.`;
export const RAIL_VERSION_SERVER_STALE = "Bu sunucu henüz o sözleşmeyi konuşmuyor.";

export const RAIL_V1_CORS_METHODS = "GET, POST, PATCH, PUT, OPTIONS";
export const RAIL_V1_CORS_HEADERS =
  "Authorization, Content-Type, Idempotency-Key, X-Rail-Min-Version, x-request-id";
export const RAIL_V1_CORS_MAX_AGE = "600";

const API_V1_PREFIX = "/api/v1";

export type { RailV1FailBody, RailV1OkBody } from "@/lib/kernel/http/v1-envelope";

export type RailVersionDecision =
  | { kind: "skip" }
  | { kind: "next"; clientVersion: number }
  | { kind: "fail"; status: 400 | 426; error: string };

export function isApiV1Pathname(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === API_V1_PREFIX || path.startsWith(`${API_V1_PREFIX}/`);
}

export function canonicalApiPathname(pathname: string): string {
  const path = normalizePathname(pathname);
  if (path === API_V1_PREFIX) {
    return "/api";
  }
  if (path.startsWith(`${API_V1_PREFIX}/`)) {
    return `/api/${path.slice(API_V1_PREFIX.length + 1)}`;
  }
  return path;
}

export function isRailV1HealthPath(pathname: string): boolean {
  return canonicalApiPathname(pathname) === "/api/health";
}

export function isV1JsonRequest(request: Request): boolean {
  if (request.headers.get(RAIL_API_VERSION_REQUEST_HEADER)?.trim() === RAIL_API_VERSION_LABEL) {
    return true;
  }
  try {
    return isApiV1Pathname(new URL(request.url).pathname);
  } catch {
    return false;
  }
}

export const isV1PathRequest = isV1JsonRequest;

/**
 * Dron `/api/v1` hop'ları çerez oturumu kabul etmez (Bearer zorunlu).
 * Amiral `/api/...` aynı origin çağrıları sürüm başlığı taşısa da çerez okur —
 * `x-rail-api-version` yalnız zarf sözleşmesidir, çerez kilidi değildir.
 */
export function isV1CookieSessionBlocked(request: Request): boolean {
  const railPath = request.headers.get(RAIL_PATHNAME_HEADER)?.trim();
  if (railPath) {
    return isApiV1Pathname(railPath);
  }
  try {
    return isApiV1Pathname(new URL(request.url).pathname);
  } catch {
    return false;
  }
}

export function parseRailMinVersionHeader(raw: string | null | undefined): number | null {
  const value = raw?.trim() ?? "";
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function decideRailApiVersion(input: {
  pathname: string;
  method?: string;
  minVersionHeader?: string | null;
  minVersion?: number;
  apiVersion?: number;
  apiVersionHeader?: string | null;
}): RailVersionDecision {
  if (!isApiV1Pathname(input.pathname)) {
    return { kind: "skip" };
  }
  const method = (input.method ?? "GET").toUpperCase();
  if (method === "OPTIONS") {
    return { kind: "skip" };
  }

  const minVersion = input.minVersion ?? RAIL_API_MIN_VERSION;
  const apiVersion = input.apiVersion ?? RAIL_API_VERSION;
  const header = input.minVersionHeader?.trim() ?? "";
  const apiVersionHeader = input.apiVersionHeader?.trim() ?? "";
  const health = method === "GET" && isRailV1HealthPath(input.pathname);

  if (!header) {
    if (health) {
      return { kind: "next", clientVersion: apiVersion };
    }
    if (apiVersionHeader === RAIL_API_VERSION_LABEL) {
      return { kind: "next", clientVersion: apiVersion };
    }
    return { kind: "fail", status: 400, error: RAIL_VERSION_HEADER_REQUIRED };
  }

  const clientVersion = parseRailMinVersionHeader(header);
  if (clientVersion == null) {
    return { kind: "fail", status: 400, error: RAIL_VERSION_HEADER_INVALID };
  }
  if (clientVersion < minVersion) {
    return { kind: "fail", status: 426, error: RAIL_VERSION_CLIENT_STALE };
  }
  if (clientVersion > apiVersion) {
    return { kind: "fail", status: 426, error: RAIL_VERSION_SERVER_STALE };
  }
  return { kind: "next", clientVersion };
}

export function buildV1OkBody<T extends Record<string, unknown>>(
  data: T,
  requestId: string,
): RailV1OkBody<T> {
  const body = {
    ok: true as const,
    error: null,
    requestId,
    apiVersion: RAIL_API_VERSION_LABEL,
    data,
  };
  assertNoSpreadV1Envelope(body);
  return body as RailV1OkBody<T>;
}

export function buildV1FailBody(error: string, requestId: string): RailV1FailBody {
  const body = {
    ok: false as const,
    error,
    requestId,
    apiVersion: RAIL_API_VERSION_LABEL,
    data: null,
  };
  assertNoSpreadV1Envelope(body);
  return body;
}

export function railV1FailResponse(
  request: Request,
  error: string,
  status: number,
): NextResponse {
  const requestId = resolveRequestId(request);
  const response = NextResponse.json(buildV1FailBody(error, requestId), {
    status,
    headers: { [REQUEST_ID_HEADER]: requestId },
  });
  applyRailV1Cors(response, request);
  return response;
}

export function railEdgeFailResponse(
  request: Request,
  error: string,
  status: number,
): NextResponse {
  return railV1FailResponse(request, error, status);
}

export function parseRailDronOrigins(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((origin) => origin.length > 0 && origin !== "*" && isAbsoluteOrigin(origin));
}

export function matchRailDronOrigin(origin: string | null | undefined, allowlist: string[]): string | null {
  const value = origin?.trim() ?? "";
  if (!value || allowlist.length === 0) {
    return null;
  }
  return allowlist.includes(value) ? value : null;
}

export function applyRailV1Cors(
  response: { headers: Headers },
  request: { url: string; headers: Headers },
  env: Record<string, string | undefined> = process.env,
): void {
  if (!isApiV1Pathname(safePathname(request))) {
    return;
  }
  const allowed = matchRailDronOrigin(
    request.headers.get("origin"),
    parseRailDronOrigins(env.RAIL_DRON_ORIGINS),
  );
  if (!allowed) {
    return;
  }
  response.headers.set("Access-Control-Allow-Origin", allowed);
  response.headers.set("Access-Control-Allow-Methods", RAIL_V1_CORS_METHODS);
  response.headers.set("Access-Control-Allow-Headers", RAIL_V1_CORS_HEADERS);
  response.headers.set("Access-Control-Max-Age", RAIL_V1_CORS_MAX_AGE);
  response.headers.append("Vary", "Origin");
}

function isAbsoluteOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return url.origin === value;
  } catch {
    return false;
  }
}

function safePathname(request: { url: string }): string {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "/";
  }
}
