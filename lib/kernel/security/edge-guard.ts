/**
 * İnce kenar mühürleri (K3). Müze 400 satır kopyalanmaz.
 * Korumalı sayfa ve session API: JWT imzası kenarda fail-closed doğrulanır (`edge-jwt.ts`).
 * K6 kind okuma: `edge-api-auth.ts` (`export const auth` = session | admin | public | webhook).
 * CSP: istek başına *script* nonce; üretimde script `unsafe-eval` yok.
 * `style-src` nonce taşımaz — CSP2+ nonce varken `'unsafe-inline'` yok sayılır
 * ve React/Next `styleTagTransform` / font-styles / react-dom CSSOM enjeksiyonu
 * giriş formunu kilitler. XSS kilidi `script-src` nonce + `strict-dynamic`'tedir.
 */

export const CITIZEN_LOGIN_PATH = "/login";

export const PROTECTED_KERNEL_PATHS = [
  "/dashboard",
  "/cuzdan",
  "/profil",
  "/pasaport",
  "/admin",
] as const;

/**
 * Dikey yazma kabukları — SEO vitrin (akademi katalog, açık ilan, Yetkinİlan detay) açık kalır.
 * Kenar JWT doğrular; sayfa `requirePageSession` gerçek getUser yapar.
 */
export const PROTECTED_WRITE_PATHS = [
  "/freelancer/new",
  "/freelancer/contracts",
  "/studio",
  "/junior/ebeveyn",
  "/pazaryeri/tezgah",
  "/yetkinilan/tezgah",
  "/pazaryeri/siparisler",
  "/yetkinilan/siparisler",
  "/arena/yeni",
  "/kurumsal/ilan/yeni",
  "/devlabs/projeler",
] as const;

export const EDGE_CSP_PAYTR_FRAME_SRC = "https://www.paytr.com https://*.paytr.com";
export const EDGE_CSP_SUPABASE_CONNECT_SRC = "https://*.supabase.co wss://*.supabase.co";
export const EDGE_CSP_FRAME_SRC_DIRECTIVE =
  "frame-src https://www.paytr.com https://*.paytr.com";
export const EDGE_CSP_CONNECT_SRC_DIRECTIVE =
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co";
/**
 * React/Next istemci stil enjeksiyonu (styleTagTransform, font-styles, CSSOM).
 * Nonce buraya yazılmaz: nonce + `'unsafe-inline'` birlikte gelince tarayıcı
 * `'unsafe-inline'`ı düşürür ve giriş tıklaması CSP ihlaline takılır.
 */
export const EDGE_CSP_STYLE_SRC_DIRECTIVE = "style-src 'self' 'unsafe-inline'";
export const EDGE_CSP_STYLE_SRC_ATTR_DIRECTIVE = "style-src-attr 'unsafe-inline'";
export const EDGE_NONCE_HEADER = "x-nonce";

export const EDGE_HSTS_VALUE = "max-age=63072000; includeSubDomains; preload";

export const EDGE_SECURITY_HEADER_ENTRIES: ReadonlyArray<readonly [string, string]> = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()"],
];

/** Supabase SSR: `sb-<ref>-auth-token` ve parçalı `sb-<ref>-auth-token.N`. */
export const SUPABASE_AUTH_COOKIE_NAME = /^sb-.+-auth-token(?:\.\d+)?$/;

export type EdgeDecision =
  | { kind: "museum-404" }
  | { kind: "kayit-308" }
  | { kind: "auth-307"; to: typeof CITIZEN_LOGIN_PATH }
  | { kind: "next" };

export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isMuseumPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === "/yetkin.ai" || path.startsWith("/yetkin.ai/");
}

export function isKayitPath(pathname: string): boolean {
  return normalizePathname(pathname) === "/kayit";
}

function matchesPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedKernelPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return PROTECTED_KERNEL_PATHS.some((prefix) => matchesPathPrefix(path, prefix));
}

export function isProtectedWritePath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return PROTECTED_WRITE_PATHS.some((prefix) => matchesPathPrefix(path, prefix));
}

/** SETTLED sonrası müfredat oynatıcısı — katalog kamu kalır. */
export function isAcademyCurriculumPlayerPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return /^\/academy\/[^/]+\/oyna$/.test(path);
}

export function isProtectedCitizenPath(pathname: string): boolean {
  return (
    isProtectedKernelPath(pathname) ||
    isProtectedWritePath(pathname) ||
    isAcademyCurriculumPlayerPath(pathname)
  );
}

export function hasBearerSessionHint(authorizationHeader: string | null | undefined): boolean {
  return /^Bearer\s+\S+/i.test(authorizationHeader?.trim() ?? "");
}

export function hasSupabaseAuthCookieHint(
  cookies: ReadonlyArray<{ name: string; value: string }>,
): boolean {
  return cookies.some(
    (cookie) => SUPABASE_AUTH_COOKIE_NAME.test(cookie.name) && cookie.value.trim().length > 0,
  );
}

export function hasEdgeSessionHint(input: {
  authorizationHeader?: string | null;
  cookies?: ReadonlyArray<{ name: string; value: string }>;
}): boolean {
  if (hasBearerSessionHint(input.authorizationHeader)) {
    return true;
  }
  return hasSupabaseAuthCookieHint(input.cookies ?? []);
}

export function decideEdgeAction(pathname: string, sessionVerified: boolean): EdgeDecision {
  if (isMuseumPath(pathname)) {
    return { kind: "museum-404" };
  }
  if (isKayitPath(pathname)) {
    return { kind: "kayit-308" };
  }
  if (isProtectedCitizenPath(pathname) && !sessionVerified) {
    return { kind: "auth-307", to: CITIZEN_LOGIN_PATH };
  }
  return { kind: "next" };
}

export function createEdgeNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

export function buildEdgeCsp(
  nonce: string,
  env: { NODE_ENV?: string } = process.env,
): string {
  const isDev = env.NODE_ENV === "development";
  const scriptEval = isDev ? " 'unsafe-eval'" : "";
  const upgrade = env.NODE_ENV === "production" ? "; upgrade-insecure-requests" : "";
  return (
    "default-src 'self'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
    "object-src 'none'; " +
    "img-src 'self' data: blob:; " +
    `${EDGE_CSP_STYLE_SRC_DIRECTIVE}; ` +
    `${EDGE_CSP_STYLE_SRC_ATTR_DIRECTIVE}; ` +
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${scriptEval}; ` +
    `${EDGE_CSP_CONNECT_SRC_DIRECTIVE}; ` +
    EDGE_CSP_FRAME_SRC_DIRECTIVE +
    upgrade
  );
}

export function attachEdgeNonceRequestHeaders(
  headers: Headers,
  nonce: string,
  env: { NODE_ENV?: string } = process.env,
): void {
  const csp = buildEdgeCsp(nonce, env);
  headers.set(EDGE_NONCE_HEADER, nonce);
  headers.set("Content-Security-Policy", csp);
}

export function applyEdgeSecurityHeaders(
  response: { headers: { set(name: string, value: string): void } },
  input: { nonce: string; env?: { NODE_ENV?: string } },
): void {
  const env = input.env ?? process.env;
  response.headers.set("Content-Security-Policy", buildEdgeCsp(input.nonce, env));
  for (const [key, value] of EDGE_SECURITY_HEADER_ENTRIES) {
    response.headers.set(key, value);
  }
  if (env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", EDGE_HSTS_VALUE);
  }
}

export function readCspNonce(csp: string | null | undefined): string | null {
  const match = csp?.match(/'nonce-([^']+)'/);
  return match?.[1] ?? null;
}
