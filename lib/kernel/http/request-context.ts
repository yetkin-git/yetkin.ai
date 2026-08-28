/**
 * HTTP istek bağlamı — Node AsyncLocalStorage.
 * Next `next/dist/...` work-unit ALS kullanılmaz; zarf requestId ve hop
 * yolu kanonik Request başlıklarından (kenarın yazdığı x-request-id /
 * x-rail-pathname / x-rail-request-method) veya bu ALS'ten okunur.
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { isRequestId, REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  RAIL_PATHNAME_HEADER,
  RAIL_REQUEST_METHOD_HEADER,
} from "@/lib/kernel/security/edge-guard";

export type RailHttpContext = {
  requestId: string;
  pathname: string | null;
  method: string;
};

const railHttpContext = new AsyncLocalStorage<RailHttpContext>();

export function runWithRailHttpContext<T>(ctx: RailHttpContext, fn: () => T): T {
  return railHttpContext.run(ctx, fn);
}

export function getRailHttpContext(): RailHttpContext | undefined {
  return railHttpContext.getStore();
}

export function railHttpContextFromRequest(request: Request): RailHttpContext {
  const fromHeader = request.headers.get(RAIL_PATHNAME_HEADER)?.trim();
  let pathname = fromHeader || null;
  if (!pathname) {
    try {
      pathname = new URL(request.url).pathname;
    } catch {
      pathname = null;
    }
  }
  return {
    requestId: resolveRequestId(request),
    pathname,
    method: request.method || "GET",
  };
}

export function peekRailHttpContextRequestId(): string | null {
  const id = getRailHttpContext()?.requestId?.trim() ?? "";
  return id && isRequestId(id) ? id : null;
}

export function peekRailHttpContextPathname(): string | null {
  return getRailHttpContext()?.pathname ?? null;
}

export function peekRailHttpContextMethod(): string | null {
  return getRailHttpContext()?.method ?? null;
}

export function peekRailHttpContextHeader(name: string): string | null {
  const ctx = getRailHttpContext();
  if (!ctx) {
    return null;
  }
  const needle = name.toLowerCase();
  if (needle === REQUEST_ID_HEADER) {
    return ctx.requestId;
  }
  if (needle === RAIL_PATHNAME_HEADER) {
    return ctx.pathname;
  }
  if (needle === RAIL_REQUEST_METHOD_HEADER) {
    return ctx.method;
  }
  return null;
}
