/**
 * İki JSON serimi: versiyonsuz Amiral `{ ok, ...data }` ve v1
 * `{ ok, error, requestId, apiVersion, data }`. Üçüncü zarf açılmaz.
 * Yeni dış tüketici `request` geçerek v1 konuşur; versiyonsuz genişlemez.
 */
import { NextResponse } from "next/server";
import { workUnitAsyncStorage } from "next/dist/server/app-render/work-unit-async-storage.external";
import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import {
  buildV1FailBody,
  buildV1OkBody,
  isV1JsonRequest,
  RAIL_API_VERSION_LABEL,
  RAIL_API_VERSION_REQUEST_HEADER,
} from "@/lib/kernel/http/api-v1";
import type {
  RailUnversionedFailBody,
  RailUnversionedOkBody,
  RailV1FailBody,
  RailV1OkBody,
} from "@/lib/kernel/http/v1-envelope";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  PayloadTooLargeError,
  ServiceUnavailableError,
} from "@/lib/kernel/http/errors";
import { isRequestId, REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";

function jsonHeaders(requestId?: string): HeadersInit | undefined {
  if (!requestId) {
    return undefined;
  }
  return { [REQUEST_ID_HEADER]: requestId };
}

function withRequestId<T extends Record<string, unknown>>(
  body: T,
  requestId?: string,
): T & { requestId?: string } {
  if (!requestId) {
    return body;
  }
  return { ...body, requestId };
}

function peekIncomingHeader(name: string): string | null {
  try {
    const store = workUnitAsyncStorage.getStore();
    if (store?.type === "request" && store.headers) {
      return store.headers.get(name);
    }
  } catch {
    return null;
  }
  return null;
}

function shouldEnvelopeV1(request?: Request): boolean {
  if (request) {
    return isV1JsonRequest(request);
  }
  return peekIncomingHeader(RAIL_API_VERSION_REQUEST_HEADER)?.trim() === RAIL_API_VERSION_LABEL;
}

function envelopeRequestId(requestId: string | undefined, request?: Request): string {
  if (requestId) {
    return requestId;
  }
  if (request) {
    return resolveRequestId(request);
  }
  const fromHeader = peekIncomingHeader(REQUEST_ID_HEADER)?.trim() ?? "";
  if (fromHeader && isRequestId(fromHeader)) {
    return fromHeader;
  }
  return crypto.randomUUID();
}

export function jsonOk<T extends Record<string, unknown>>(
  data: T,
  status: number,
  requestId: string | undefined,
  request: Request,
): NextResponse<RailV1OkBody<T>>;
export function jsonOk<T extends Record<string, unknown>>(
  data: T,
  status?: number,
  requestId?: string,
  request?: Request,
): NextResponse<RailUnversionedOkBody<T> | RailV1OkBody<T>>;
export function jsonOk<T extends Record<string, unknown>>(
  data: T,
  status = 200,
  requestId?: string,
  request?: Request,
) {
  if (shouldEnvelopeV1(request)) {
    const id = envelopeRequestId(requestId, request);
    return NextResponse.json(buildV1OkBody(data, id), {
      status,
      headers: jsonHeaders(id),
    });
  }
  return NextResponse.json(withRequestId({ ok: true, ...data }, requestId), {
    status,
    headers: jsonHeaders(requestId),
  });
}

export function jsonFail(
  error: string,
  status: number,
  requestId: string | undefined,
  request: Request,
): NextResponse<RailV1FailBody>;
export function jsonFail(
  error: string,
  status: number,
  requestId?: string,
  request?: Request,
): NextResponse<RailUnversionedFailBody | RailV1FailBody>;
export function jsonFail(error: string, status: number, requestId?: string, request?: Request) {
  if (shouldEnvelopeV1(request)) {
    const id = envelopeRequestId(requestId, request);
    return NextResponse.json(buildV1FailBody(error, id), {
      status,
      headers: jsonHeaders(id),
    });
  }
  return NextResponse.json(withRequestId({ ok: false, error }, requestId), {
    status,
    headers: jsonHeaders(requestId),
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
  if (error instanceof PayloadTooLargeError) {
    return jsonFail(error.message, 413, requestId, request);
  }
  if (error instanceof ConflictError) {
    return jsonFail(error.message, 409, requestId, request);
  }
  if (error instanceof ServiceUnavailableError) {
    return jsonFail(error.message, 503, requestId, request);
  }
  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("DATABASE_URL")) {
      return jsonFail("Veritabanı bağlı değil.", 503, requestId, request);
    }
    return jsonFail(message, fallbackStatus, requestId, request);
  }
  return jsonFail("İşlem başarısız.", fallbackStatus, requestId, request);
}
