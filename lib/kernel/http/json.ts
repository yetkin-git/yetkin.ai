/**
 * v1 JSON zarfı `{ ok, error, requestId, apiVersion, data }`.
 * `jsonOk` / `jsonFail` yalnız bu şekli basar. Versiyonsuz `{ ok, ...data }`
 * kapalıdır. Üçüncü zarf yasaktır.
 *
 * requestId ve hop yolu: kanonik Request başlığı, yoksa Node ALS
 * (`runWithRailHttpContext`). Çerçeve iç work-unit deposu kullanılmaz.
 */
import { NextResponse } from "next/server";
import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import {
  buildV1FailBody,
  buildV1OkBody,
} from "@/lib/kernel/http/api-v1";
import type { RailV1FailBody, RailV1OkBody } from "@/lib/kernel/http/v1-envelope";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  PayloadTooLargeError,
  ServiceUnavailableError,
  GoneError,
} from "@/lib/kernel/http/errors";
import { DATABASE_BUSY_ERROR, isPrismaUnavailableError } from "@/lib/kernel/db-errors";
import {
  peekRailHttpContextMethod,
  peekRailHttpContextPathname,
  peekRailHttpContextRequestId,
} from "@/lib/kernel/http/request-context";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import { v1EnvelopeHeaders } from "@/lib/kernel/http/unversioned-sunset";
import { guardRailV1OkData } from "@/lib/kernel/http/v1-response-guard";
import { RAIL_PATHNAME_HEADER } from "@/lib/kernel/security/edge-guard";

export const GENERIC_INTERNAL_ERROR = "İşlem tamamlanamadı.";

function mergeHeaders(...parts: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();
  for (const part of parts) {
    if (!part) {
      continue;
    }
    const extra = new Headers(part);
    extra.forEach((value, key) => {
      headers.set(key, value);
    });
  }
  return headers;
}

function jsonHeaders(requestId?: string): HeadersInit | undefined {
  if (!requestId) {
    return undefined;
  }
  return { [REQUEST_ID_HEADER]: requestId };
}

function envelopeRequestId(requestId: string | undefined, request?: Request): string {
  if (requestId) {
    return requestId;
  }
  if (request) {
    return resolveRequestId(request);
  }
  const fromAls = peekRailHttpContextRequestId();
  if (fromAls) {
    return fromAls;
  }
  return crypto.randomUUID();
}

function resolveHopPathname(request?: Request): string | null {
  if (request) {
    const fromHeader = request.headers.get(RAIL_PATHNAME_HEADER)?.trim();
    if (fromHeader) {
      return fromHeader;
    }
    try {
      return new URL(request.url).pathname;
    } catch {
      return null;
    }
  }
  return peekRailHttpContextPathname();
}

function resolveHopMethod(request?: Request): string {
  if (request?.method) {
    return request.method;
  }
  return peekRailHttpContextMethod() ?? "GET";
}

export function jsonOk<T extends Record<string, unknown>>(
  data: T,
  status = 200,
  requestId?: string,
  request?: Request,
): NextResponse<RailV1OkBody<T> | RailV1FailBody> {
  const id = envelopeRequestId(requestId, request);
  const pathname = resolveHopPathname(request);
  if (pathname) {
    const guarded = guardRailV1OkData({
      pathname,
      method: resolveHopMethod(request),
      data,
    });
    if (!guarded.ok) {
      logEvent({
        level: "error",
        event: "http.v1_response_schema_mismatch",
        requestId: id,
        route: guarded.hopId,
        status: 500,
      });
      return NextResponse.json(buildV1FailBody(GENERIC_INTERNAL_ERROR, id), {
        status: 500,
        headers: mergeHeaders(jsonHeaders(id), v1EnvelopeHeaders()),
      });
    }
    return NextResponse.json(buildV1OkBody(guarded.wire as T, id), {
      status,
      headers: mergeHeaders(jsonHeaders(id), v1EnvelopeHeaders()),
    });
  }
  return NextResponse.json(buildV1OkBody(data, id), {
    status,
    headers: mergeHeaders(jsonHeaders(id), v1EnvelopeHeaders()),
  });
}

export function jsonFail(
  error: string,
  status: number,
  requestId?: string,
  request?: Request,
): NextResponse<RailV1FailBody> {
  const id = envelopeRequestId(requestId, request);
  return NextResponse.json(buildV1FailBody(error, id), {
    status,
    headers: mergeHeaders(jsonHeaders(id), v1EnvelopeHeaders()),
  });
}

export function jsonFromUnknown(
  error: unknown,
  fallbackStatus = 400,
  requestId?: string,
  request?: Request,
) {
  if (error instanceof AuthRequiredError) {
    return jsonFail(error.message, 401, requestId, request);
  }
  if (error instanceof ForbiddenError) {
    return jsonFail(error.message, 403, requestId, request);
  }
  if (error instanceof NotFoundError) {
    return jsonFail(error.message, 404, requestId, request);
  }
  if (error instanceof GoneError) {
    return jsonFail(error.message, 410, requestId, request);
  }
  if (error instanceof PayloadTooLargeError) {
    return jsonFail(error.message, 413, requestId, request);
  }
  if (error instanceof ConflictError) {
    return jsonFail(error.message, 409, requestId, request);
  }
  if (error instanceof ServiceUnavailableError) {
    return jsonFail(error.message, 503, requestId, request);
  }
  if (error instanceof BadRequestError) {
    return jsonFail(error.message, 400, requestId, request);
  }
  const id = envelopeRequestId(requestId, request);
  if (error instanceof Error && error.message.includes("DATABASE_URL")) {
    return jsonFail("Veritabanı bağlı değil.", 503, id, request);
  }
  if (isPrismaUnavailableError(error)) {
    return jsonFail(DATABASE_BUSY_ERROR, 503, id, request);
  }
  logEvent({
    level: "error",
    event: "http.unhandled_error",
    requestId: id,
    errorName: error instanceof Error ? error.name : "unknown",
    status: 500,
    route: "jsonFromUnknown",
  });
  void fallbackStatus;
  return jsonFail(GENERIC_INTERNAL_ERROR, 500, id, request);
}
