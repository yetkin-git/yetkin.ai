import { NextResponse } from "next/server";
import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  PayloadTooLargeError,
  ServiceUnavailableError,
} from "@/lib/kernel/http/errors";
import { REQUEST_ID_HEADER } from "@/lib/kernel/http/request-id";

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

export function jsonOk<T extends Record<string, unknown>>(data: T, status = 200, requestId?: string) {
  return NextResponse.json(withRequestId({ ok: true, ...data }, requestId), {
    status,
    headers: jsonHeaders(requestId),
  });
}

export function jsonFail(error: string, status: number, requestId?: string) {
  return NextResponse.json(withRequestId({ ok: false, error }, requestId), {
    status,
    headers: jsonHeaders(requestId),
  });
}

export function jsonFromUnknown(error: unknown, fallbackStatus = 400, requestId?: string) {
  if (error instanceof AuthRequiredError) {
    return jsonFail(error.message, 401, requestId);
  }
  if (error instanceof ForbiddenError) {
    return jsonFail(error.message, 403, requestId);
  }
  if (error instanceof NotFoundError) {
    return jsonFail(error.message, 404, requestId);
  }
  if (error instanceof PayloadTooLargeError) {
    return jsonFail(error.message, 413, requestId);
  }
  if (error instanceof ConflictError) {
    return jsonFail(error.message, 409, requestId);
  }
  if (error instanceof ServiceUnavailableError) {
    return jsonFail(error.message, 503, requestId);
  }
  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("DATABASE_URL")) {
      return jsonFail("Veritabanı bağlı değil.", 503, requestId);
    }
    return jsonFail(message, fallbackStatus, requestId);
  }
  return jsonFail("İşlem başarısız.", fallbackStatus, requestId);
}
