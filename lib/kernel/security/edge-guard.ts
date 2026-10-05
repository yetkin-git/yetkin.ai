/**
 * İnce kenar mühürleri (K3). Müze 400 satır kopyalanmaz.
 * Korumalı sayfa ve session API: JWT imzası kenarda fail-closed doğrulanır (`edge-jwt.ts`).
 * K6 kind okuma: `edge-api-auth.ts` (`export const auth` = session | admin | public | webhook).
 * CSP: istek başına *script* nonce; üretimde script `unsafe-eval` yok.
 * `style-src` nonce taşımaz — CSP2+ nonce varken `'unsafe-inline'` yok sayılır
 * ve React/Next `styleTagTransform` / font-styles / react-dom CSSOM enjeksiyonu
 * giriş formunu kilitler. XSS kilidi `script-src` nonce + `strict-dynamic`'tedir.
 */

import { academyCourseOffersFreePreview } from "@/lib/kernel/catalog-ids/free-preview";
import { isFrozenShellPagePath } from "../compliance/circuit-breakers";
import {
  EDGE_HSTS_VALUE,
  edgeSecurityHeaderEntriesForPath,
} from "./edge-security-headers";

export {
  EDGE_HSTS_VALUE,
  EDGE_JUNIOR_PERMISSIONS_POLICY_VALUE,
  EDGE_PERMISSIONS_POLICY_VALUE,
  EDGE_SECURITY_HEADER_ENTRIES,
  edgePermissionsPolicyForPath,
  isJuniorMicrophonePath,
} from "./edge-security-headers";

export const CITIZEN_LOGIN_PATH = "/login";

/** Kenarın yazdığı istek yolu — istemci başlığı güvenilmez, proxy üzerine yazar. */
export const RAIL_PATHNAME_HEADER = "x-rail-pathname";
export const RAIL_REQUEST_METHOD_HEADER = "x-rail-request-method";

export const PROTECTED_KERNEL_PATHS = [
  "/dashboard",
  "/cuzdan",
  "/profil",
  "/pasaport",
  "/career",
  "/admin",
] as const;

/**
 * Super Admin sayfa sığınağı. Kenar bu yolları müze 404 yapmaz.
 * `/admin` öneki alt yolları da oturum ister; katalog sayfası ayrıca yazılıdır.
 */
export const ADMIN_SHELTER_PATHS = ["/admin", "/admin/catalog"] as const;

export function isAdminShelterPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return ADMIN_SHELTER_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/**
 * Dikey yazma kabukları — SEO vitrin (akademi katalog, açık ilan) açık kalır.
 * Donmuş oda yolları burada yoktur: kenar `frozen-410` auth-307'den önce basar.
 * Kenar JWT doğrular; sayfa `requirePageSession` gerçek getUser yapar.
 */
export const PROTECTED_WRITE_PATHS = [
  "/freelancer/new",
  "/freelancer/contracts",
] as const;

/**
 * PayTR iFrame + 3D Secure ACS.
 * SMS sonrası iFrame src bankanın sanal POS kökenine (ör. sanalpos.kuveytturk.com.tr)
 * döner; karttan karta host değişir. Tek tek banka listesi yerine `https:` şeması.
 */
export const EDGE_CSP_PAYTR_FRAME_SRC =
  "https://www.paytr.com https://*.paytr.com https://*.bkm.com.tr https:";
/** iframeResizer.min.js?v2 — CSP2 allowlist; CSP3 `strict-dynamic` child script. */
export const EDGE_CSP_PAYTR_SCRIPT_SRC = "https://www.paytr.com";
export const EDGE_CSP_SUPABASE_CONNECT_SRC = "https://*.supabase.co wss://*.supabase.co";
export const EDGE_CSP_FRAME_SRC_DIRECTIVE =
  "frame-src https://www.paytr.com https://*.paytr.com https://*.bkm.com.tr https:";
export const EDGE_CSP_CONNECT_SRC_DIRECTIVE =
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.paytr.com https://*.paytr.com";
/** Ders WAV blob URL, aynı köken dinleme ve Supabase CDN. */
export const EDGE_CSP_MEDIA_SRC_DIRECTIVE = "media-src 'self' blob: https://*.supabase.co";
/**
 * React/Next istemci stil enjeksiyonu (styleTagTransform, font-styles, CSSOM).
 * Nonce buraya yazılmaz: nonce + `'unsafe-inline'` birlikte gelince tarayıcı
 * `'unsafe-inline'`ı düşürür ve giriş tıklaması CSP ihlaline takılır.
 */
export const EDGE_CSP_STYLE_SRC_DIRECTIVE = "style-src 'self' 'unsafe-inline'";
export const EDGE_CSP_STYLE_SRC_ATTR_DIRECTIVE = "style-src-attr 'unsafe-inline'";
export const EDGE_NONCE_HEADER = "x-nonce";

/** Supabase SSR: `sb-<ref>-auth-token` ve parçalı `sb-<ref>-auth-token.N`. */
export const SUPABASE_AUTH_COOKIE_NAME = /^sb-.+-auth-token(?:\.\d+)?$/;

/**
 * Eski alias → oturum odası.
 * next.config bu yolları ara adrese 308 ile bırakırsa ikinci hop kenar 307 olur.
 * `/kariyer` tek hop `/career` sayfasına iner. Kenar tek hop basar.
 */
export const AUTH_PATH_ALIASES = {
  "/kariyer": "/career",
  "/profile": "/profil",
  "/passport": "/pasaport",
} as const;

export type EdgeDecision =
  | { kind: "museum-404" }
  | { kind: "kayit-308" }
  | { kind: "root-308" }
  | { kind: "frozen-410" }
  | { kind: "auth-307"; to: typeof CITIZEN_LOGIN_PATH; next?: string }
  | { kind: "alias-307"; to: string }
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

/**
 * Junior oda yolu. `/juniorism` bu kapıya girmez.
 * Ders listesi, ders sayfası ve kasa adresi ziyaretçiye açıktır.
 * Eski `/junior/ebeveyn` arşivdedir; donmuş oda 410 kalır.
 * Tahsilat, anlatış kaydı ve konu testi sayfa içinde kilitlidir. Kenar ders adresini 410 yapmaz.
 */
export function isJuniorClosedPilotPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  if (path === "/junior/ebeveyn" || path.startsWith("/junior/ebeveyn/")) {
    return false;
  }
  return path === "/junior" || path.startsWith("/junior/");
}

export function authPathAliasTarget(pathname: string): string | null {
  const path = normalizePathname(pathname);
  if (path in AUTH_PATH_ALIASES) {
    return AUTH_PATH_ALIASES[path as keyof typeof AUTH_PATH_ALIASES];
  }
  return null;
}

function matchesPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedKernelPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  if (isAdminShelterPath(path)) {
    return true;
  }
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

/**
 * Ücretsiz vitrin oynatıcısı. Oturum istemez.
 * Sınav yolu olan her kursun ilk dersi açıktır; ders 2+ kilitlidir.
 */
export function isAcademyFreePreviewPlayerPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  const match = /^\/academy\/([^/]+)\/oyna$/.exec(path);
  const slug = match?.[1];
  if (!slug) {
    return false;
  }
  return academyCourseOffersFreePreview(decodeURIComponent(slug));
}

/** Sertifikalarım sığınağı — katalog ve kamu `/academy/dogrula` açık kalır. */
export function isAcademyCertificatesPath(pathname: string): boolean {
  return normalizePathname(pathname) === "/academy/certificates";
}

/**
 * Anasayfa ve Kariyer herkese açıktır. Alt yollar sığınak kalır.
 * Kenar bu iki adresi kataloğa veya girişe düşürmez.
 */
export function isPublicKernelVitrinePath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === "/dashboard" || path === "/career";
}

export function isProtectedCitizenPath(pathname: string): boolean {
  if (isAcademyFreePreviewPlayerPath(pathname) || isPublicKernelVitrinePath(pathname)) {
    return false;
  }
  return (
    isProtectedKernelPath(pathname) ||
    isProtectedWritePath(pathname) ||
    isAcademyCurriculumPlayerPath(pathname) ||
    isAcademyCertificatesPath(pathname)
  );
}

export function hasBearerSessionHint(authorizationHeader: string | null | undefined): boolean {
  return /^Bearer\s+\S+/i.test(authorizationHeader?.trim() ?? "");
}

export function hasSupabaseAuthCookieHint(
  cookies: ReadonlyArray<{ name: string; value?: string | null }>,
): boolean {
  return cookies.some(
    (cookie) =>
      SUPABASE_AUTH_COOKIE_NAME.test(cookie.name) &&
      typeof cookie?.value === "string" &&
      cookie.value.trim().length > 0,
  );
}

export function hasEdgeSessionHint(input: {
  authorizationHeader?: string | null;
  cookies?: ReadonlyArray<{ name: string; value?: string | null }>;
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
  // CEO: soğuk iniş kalkar. Kök adres oturumdan bağımsız Akademi kataloğuna iner.
  if (normalizePathname(pathname) === "/") {
    return { kind: "root-308" };
  }
  // Anayasa B6: liste ve ilk konu ziyaretçiye açık. 410 bütün adresi yutmaz.
  if (isJuniorClosedPilotPath(pathname)) {
    return { kind: "next" };
  }
  if (isFrozenShellPagePath(pathname)) {
    return { kind: "frozen-410" };
  }
  const aliasTarget = authPathAliasTarget(pathname);
  if (aliasTarget) {
    if (!sessionVerified && isProtectedCitizenPath(aliasTarget)) {
      return { kind: "auth-307", to: CITIZEN_LOGIN_PATH, next: aliasTarget };
    }
    return { kind: "alias-307", to: aliasTarget };
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
    // Cloudflare Email Obfuscation `/cdn-cgi/scripts/.../email-decode.min.js` basar.
    // Nonce + strict-dynamic host allowlist'i yok sayar; script allowlist'e eklenmez.
    // Ham `user@host` HTML'de durmaz (JSON-LD \\u0040, mailto %40, etiket parçalı).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${scriptEval} ${EDGE_CSP_PAYTR_SCRIPT_SRC}; ` +
    `${EDGE_CSP_CONNECT_SRC_DIRECTIVE}; ` +
    `${EDGE_CSP_MEDIA_SRC_DIRECTIVE}; ` +
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
  input: { nonce: string; env?: { NODE_ENV?: string }; pathname?: string | null },
): void {
  const env = input.env ?? process.env;
  response.headers.set("Content-Security-Policy", buildEdgeCsp(input.nonce, env));
  for (const [key, value] of edgeSecurityHeaderEntriesForPath(input.pathname)) {
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
