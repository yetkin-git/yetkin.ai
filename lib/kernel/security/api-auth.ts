import { canonicalApiPathname } from "@/lib/kernel/http/api-v1";

export const API_AUTH_KINDS = [
  "session",
  "public",
  "closed",
  "cron",
  "admin",
  "webhook",
  "hybrid",
  "internal",
] as const;

export type ApiAuthKind = (typeof API_AUTH_KINDS)[number];

/**
 * Kenarda oturum ipucu olmadan geçen kind'lar.
 * `public` canlıdır. `webhook` imzası handler'dadır.
 * `closed` kalıcı 410'dur: kenar oturum istemez, gövde 410 basar.
 * `cron` bu listede değildir. Kenar `CRON_SECRET` ister; oturum rotayı açmaz.
 */
export const EDGE_OPEN_API_AUTH_KINDS = ["public", "webhook", "closed"] as const;

export type EdgeOpenApiAuthKind = (typeof EDGE_OPEN_API_AUTH_KINDS)[number];

export function isApiAuthKind(value: string): value is ApiAuthKind {
  return (API_AUTH_KINDS as readonly string[]).includes(value);
}

export function isEdgeOpenApiAuthKind(value: string): value is EdgeOpenApiAuthKind {
  return (EDGE_OPEN_API_AUTH_KINDS as readonly string[]).includes(value);
}

export const CRON_UNCONFIGURED_ERROR = "CRON_SECRET tanımlı değil. Mutabakat kapalı.";
export const CRON_UNAUTHORIZED_ERROR = "Yetkisiz.";

export function readCronSecret(
  env: Record<string, string | undefined> = process.env,
): string {
  return env.CRON_SECRET?.trim() ?? "";
}

/**
 * `Authorization: Bearer ${CRON_SECRET}` tam eşleşmesi.
 * Eşit uzunlukta sabit süreli karşılaştırma. Boş sır hiçbir başlığı açmaz.
 */
export function cronBearerMatches(
  authorization: string | null | undefined,
  secret: string,
): boolean {
  if (!secret) {
    return false;
  }
  const actual = authorization?.trim() ?? "";
  const expected = `Bearer ${secret}`;
  if (actual.length !== expected.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) {
    diff |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return diff === 0;
}

/** `app/api/(kernel)/health/route.ts` → `/api/health` */
export function toPublicApiPath(fileRel: string): string {
  return fileRel
    .replace(/\\/g, "/")
    .replace(/^app/, "")
    .replace(/\/route\.ts$/, "")
    .replace(/\/\([^/]+\)/g, "");
}

export function isApiPathname(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

function patternToRegExp(pattern: string): RegExp {
  const source = pattern
    .replace(/\[\[\.\.\.([A-Za-z0-9_]+)\]\]/g, "\u0000catchall\u0000")
    .replace(/\[\.\.\.([A-Za-z0-9_]+)\]/g, "\u0000catchall\u0000")
    .replace(/\[([A-Za-z0-9_]+)\]/g, "\u0000param\u0000")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\u0000catchall\u0000/g, ".*")
    .replace(/\u0000param\u0000/g, "[^/]+");
  return new RegExp(`^${source}$`);
}

export function matchApiAuthKind(
  pathname: string,
  map: Record<string, string>,
): string | null {
  const path = canonicalApiPathname(pathname);
  const exact = map[path];
  if (exact) {
    return exact;
  }
  const dynamic = Object.keys(map)
    .filter((pattern) => pattern.includes("["))
    .sort((left, right) => right.length - left.length);
  for (const pattern of dynamic) {
    if (patternToRegExp(pattern).test(path)) {
      return map[pattern] ?? null;
    }
  }
  return null;
}
