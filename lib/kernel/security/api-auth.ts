export const API_AUTH_KINDS = [
  "session",
  "public",
  "cron",
  "admin",
  "webhook",
  "hybrid",
  "internal",
] as const;

export type ApiAuthKind = (typeof API_AUTH_KINDS)[number];

/** Kenarda oturum ipucu olmadan geçen kind'lar. İmza handler'da doğrulanır. */
export const EDGE_OPEN_API_AUTH_KINDS = ["public", "webhook"] as const;

export type EdgeOpenApiAuthKind = (typeof EDGE_OPEN_API_AUTH_KINDS)[number];

export function isApiAuthKind(value: string): value is ApiAuthKind {
  return (API_AUTH_KINDS as readonly string[]).includes(value);
}

export function isEdgeOpenApiAuthKind(value: string): value is EdgeOpenApiAuthKind {
  return (EDGE_OPEN_API_AUTH_KINDS as readonly string[]).includes(value);
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
  const exact = map[pathname];
  if (exact) {
    return exact;
  }
  const dynamic = Object.keys(map)
    .filter((pattern) => pattern.includes("["))
    .sort((left, right) => right.length - left.length);
  for (const pattern of dynamic) {
    if (patternToRegExp(pattern).test(pathname)) {
      return map[pattern] ?? null;
    }
  }
  return null;
}
