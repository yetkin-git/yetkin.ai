/**
 * `/api/v1` runtime kalkanı — Diyar B kimlik ve Idempotency-Key.
 * Yeni auth modeli yoktur. Hop kimliği `RAIL_V1_HOPS_META` SSOT'tur; bu dosya
 * handler'ın çağırdığı UUID kapısı ve kaynak mührüdür (sicili import etmez).
 */

import { jsonFail } from "@/lib/kernel/http/json";
import {
  readIdempotencyKey,
  type IdempotencyKeyRead,
} from "@/lib/kernel/http/idempotency-key";

const HANDLER_COOKIE_BAN = [
  "cookies()",
  "Set-Cookie",
  "set-cookie",
  "cookieStore",
  "collectSupabaseAuthCookieRefresh",
] as const;

export type RailV1HopShieldView = {
  id: string;
  method: "GET" | "POST";
  routeAuthPattern: string;
  v1Auth: "none" | "bearer";
  idempotency: boolean;
};

export type RailV1IdempotencyGuard =
  | { ok: true; key: string }
  | { ok: false; response: ReturnType<typeof jsonFail> };

export function railV1HopHandlerFile(hop: Pick<RailV1HopShieldView, "routeAuthPattern">): string {
  const pattern = hop.routeAuthPattern;
  if (pattern === "/api/health" || pattern.startsWith("/api/auth/")) {
    return `app/api/(kernel)${pattern.slice("/api".length)}/route.ts`;
  }
  return `app${pattern}/route.ts`;
}

export function isRailV1SuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * v1 yazma kalkanı. `readIdempotencyKey` çağrısı buradadır;
 * UUID yoksa 400 zarf döner, 2xx doğmaz.
 */
export function requireRailV1IdempotencyKey(
  request: Request,
  requestId: string,
): RailV1IdempotencyGuard {
  const read: IdempotencyKeyRead = readIdempotencyKey(request);
  if (!read.ok) {
    return { ok: false, response: jsonFail(read.error, 400, requestId, request) };
  }
  return { ok: true, key: read.key };
}

export function extractRailRouteHandler(source: string, method: "GET" | "POST"): string {
  const needle = `export async function ${method}`;
  const start = source.indexOf(needle);
  if (start < 0) {
    throw new Error(`${method} export bulunamadı.`);
  }
  let index = start + needle.length;
  while (index < source.length && source[index] !== "(") {
    index += 1;
  }
  let paren = 0;
  let paramsEnd = -1;
  for (; index < source.length; index += 1) {
    const char = source[index];
    if (char === "(") {
      paren += 1;
    } else if (char === ")") {
      paren -= 1;
      if (paren === 0) {
        paramsEnd = index;
        break;
      }
    }
  }
  if (paramsEnd < 0) {
    throw new Error(`${method} imzası kapanmadı.`);
  }
  const brace = source.indexOf("{", paramsEnd);
  if (brace < 0) {
    throw new Error(`${method} gövdesi açılmadı.`);
  }
  let depth = 0;
  for (index = brace; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }
  throw new Error(`${method} gövdesi kapanmadı.`);
}

export function assertRailV1HopHandlerShield(hop: RailV1HopShieldView, source: string): void {
  const handler = extractRailRouteHandler(source, hop.method);
  for (const banned of HANDLER_COOKIE_BAN) {
    if (handler.includes(banned)) {
      throw new Error(`${hop.id}: v1 handler çerez yüzeyi sızdırır (${banned}).`);
    }
  }
  if (hop.v1Auth === "bearer" && !handler.includes("requireSession")) {
    throw new Error(`${hop.id}: Bearer hop requireSession çağırmaz.`);
  }
  if (hop.v1Auth === "none" && handler.includes("requireSession")) {
    throw new Error(`${hop.id}: kamu hop oturum dayatır.`);
  }
  if (hop.idempotency) {
    if (hop.method !== "POST") {
      throw new Error(`${hop.id}: idempotency yalnız POST yazma hop'undadır.`);
    }
    if (!handler.includes("requireRailV1IdempotencyKey")) {
      throw new Error(`${hop.id}: sicil idempotency:true ama handler kalkanı çağırmaz.`);
    }
    if (!handler.includes("settleHttpIdempotency")) {
      throw new Error(`${hop.id}: yazma hop replay kapısını çağırmaz.`);
    }
    if (!handler.includes("if (!idempotency.ok)")) {
      throw new Error(`${hop.id}: UUID yokken fail-closed dönüş yok.`);
    }
    return;
  }
  if (hop.method === "GET") {
    if (handler.includes("requireRailV1IdempotencyKey") || handler.includes("readIdempotencyKey")) {
      throw new Error(`${hop.id}: GET hop Idempotency-Key dayatır.`);
    }
  }
}
