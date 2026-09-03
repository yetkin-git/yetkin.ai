import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { canonicalApiPathname, railEdgeFailResponse } from "@/lib/kernel/http/api-v1";
import { buildBrandMarkSvg } from "@/lib/ui/brand-mark-geometry";

/**
 * Canlı yayın dondurma — Vercel / `.env` `SITE_MAINTENANCE_FREEZE=true|1`
 * iken kenar ürünü 503 basar. Health, `/legal`, `/iletisim`, robots ve sitemap geçer.
 * Müze `MAINTENANCE_MODE` env yoktur. `NODE_ENV=development` ve localhost yok sayılır.
 * Canlı / PayTR: bayrak boş.
 */
export type SiteMaintenanceEnv = {
  SITE_MAINTENANCE_FREEZE?: string;
  SITE_MAINTENANCE_BYPASS_TOKEN?: string;
  MAINTENANCE_BYPASS_SECRET?: string;
  SUPER_ADMIN_USER_ID?: string;
  NODE_ENV?: string;
  VITEST?: string;
};

export const MAINTENANCE_BYPASS_HEADER = "x-yetkin-maintenance-bypass";
export const MAINTENANCE_BYPASS_COOKIE = "yetkin_maintenance_bypass";

export const SITE_MAINTENANCE_API_ERROR =
  "Sistem güncelleniyor. Bakım nedeniyle geçici olarak kapalıyız.";

export const SITE_MAINTENANCE_RETRY_AFTER_SECONDS = 3600;

export const SITE_MAINTENANCE_TITLE = "Sistem Güncelleniyor";
export const SITE_MAINTENANCE_SUBTITLE = "Bakım Modundayız";
export const SITE_MAINTENANCE_ENGLISH = "Under Construction";

/** Kenar demeti Next'in statik `process.env.*` okumasını ister. */
export function readProcessSiteMaintenanceEnv(): SiteMaintenanceEnv {
  return {
    SITE_MAINTENANCE_FREEZE: process.env.SITE_MAINTENANCE_FREEZE,
    SITE_MAINTENANCE_BYPASS_TOKEN: process.env.SITE_MAINTENANCE_BYPASS_TOKEN,
    MAINTENANCE_BYPASS_SECRET: process.env.MAINTENANCE_BYPASS_SECRET,
    SUPER_ADMIN_USER_ID: process.env.SUPER_ADMIN_USER_ID,
    NODE_ENV: process.env.NODE_ENV,
    VITEST: process.env.VITEST,
  };
}

export function isSiteMaintenanceFlagOn(
  env: Pick<SiteMaintenanceEnv, "SITE_MAINTENANCE_FREEZE">,
): boolean {
  const value = env.SITE_MAINTENANCE_FREEZE?.trim().toLowerCase() ?? "";
  return value === "1" || value === "true";
}

export function isLoopbackHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.+$/u, "");
  const bare = host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;
  return (
    bare === "localhost" ||
    bare === "127.0.0.1" ||
    bare === "0.0.0.0" ||
    bare === "::1" ||
    bare.endsWith(".localhost")
  );
}

export function resolveRequestHostname(request: NextRequest): string {
  const fromUrl = request.nextUrl.hostname?.trim() ?? "";
  if (fromUrl) {
    return fromUrl;
  }
  const hostHeader = request.headers.get("host")?.trim() ?? "";
  if (!hostHeader) {
    return "";
  }
  if (hostHeader.startsWith("[")) {
    const end = hostHeader.indexOf("]");
    return end === -1 ? hostHeader : hostHeader.slice(1, end);
  }
  const colon = hostHeader.lastIndexOf(":");
  if (colon !== -1 && hostHeader.indexOf(":") === colon) {
    return hostHeader.slice(0, colon);
  }
  return hostHeader;
}

export function isSiteMaintenanceActive(
  env: SiteMaintenanceEnv = readProcessSiteMaintenanceEnv(),
  hostname?: string,
): boolean {
  if (env.VITEST === "true") {
    return false;
  }
  if (env.NODE_ENV === "development") {
    return false;
  }
  if (hostname !== undefined && isLoopbackHostname(hostname)) {
    return false;
  }
  return isSiteMaintenanceFlagOn(env);
}

export function isHealthProbePath(pathname: string): boolean {
  const canonical = canonicalApiPathname(pathname);
  return canonical === "/api/health" || canonical === "/api/health/live";
}

export function hasSiteMaintenanceBypass(
  request: Pick<NextRequest, "headers" | "cookies">,
  env: SiteMaintenanceEnv = readProcessSiteMaintenanceEnv(),
): boolean {
  const secret =
    env.SITE_MAINTENANCE_BYPASS_TOKEN?.trim() ||
    env.MAINTENANCE_BYPASS_SECRET?.trim() ||
    env.SUPER_ADMIN_USER_ID?.trim();

  const headerVal = request.headers.get(MAINTENANCE_BYPASS_HEADER)?.trim();
  const cookieVal = request.cookies.get(MAINTENANCE_BYPASS_COOKIE)?.value?.trim();

  if (secret) {
    return (
      (headerVal !== undefined && headerVal === secret) ||
      (cookieVal !== undefined && cookieVal === secret)
    );
  }

  return Boolean(headerVal || cookieVal);
}

/** PayTR / 6502 denetim yüzeyi — freeze açıkken bile 503 basılmaz. */
export function isPublicCompliancePath(pathname: string): boolean {
  const canonical = canonicalApiPathname(pathname);
  if (canonical === "/api/payments/webhooks/paytr") {
    return true;
  }
  const raw = pathname.trim();
  const path = raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw;
  if (path === "/legal" || path.startsWith("/legal/")) {
    return true;
  }
  if (path === "/iletisim") {
    return true;
  }
  if (path === "/robots.txt" || path === "/sitemap.xml") {
    return true;
  }
  return false;
}

export function isSiteMaintenanceApiPath(pathname: string): boolean {
  const canonical = canonicalApiPathname(pathname);
  return canonical === "/api" || canonical.startsWith("/api/");
}

export function shouldInterceptForSiteMaintenance(
  pathname: string,
  active: boolean = isSiteMaintenanceActive(),
  request?: Pick<NextRequest, "headers" | "cookies">,
  env?: SiteMaintenanceEnv,
): boolean {
  if (!active) {
    return false;
  }
  if (isHealthProbePath(pathname) || isPublicCompliancePath(pathname)) {
    return false;
  }
  if (request && hasSiteMaintenanceBypass(request, env)) {
    return false;
  }
  return true;
}

function maintenanceBrandMarkMarkup(): string {
  return buildBrandMarkSvg()
    .replace(/^<\?xml[^>]*>\s*/u, "")
    .replace("<svg ", '<svg class="mark" width="52" height="52" ');
}

export function renderSiteMaintenanceHtml(): string {
  const mark = maintenanceBrandMarkMarkup();
  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="theme-color" content="#eef2f7" />
    <title>${SITE_MAINTENANCE_TITLE} · ${YETKIN_BRAND}</title>
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      html, body { margin: 0; min-height: 100%; }
      body {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 1.5rem;
        font-family: "Segoe UI", ui-sans-serif, system-ui, -apple-system, sans-serif;
        letter-spacing: -0.011em;
        color: #0f172a;
        background:
          radial-gradient(900px 420px at 50% -10%, rgba(26, 140, 255, 0.16), transparent 55%),
          radial-gradient(640px 320px at 110% 110%, rgba(109, 92, 255, 0.1), transparent 50%),
          #eef2f7;
      }
      main {
        width: min(100%, 28.5rem);
        padding: 2.25rem 2rem 2rem;
        border-radius: 1.15rem;
        background: color-mix(in srgb, #ffffff 88%, transparent);
        backdrop-filter: blur(18px) saturate(1.2);
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.06);
        border: 1px solid rgba(15, 23, 42, 0.08);
        text-align: center;
      }
      .mark { display: block; margin: 0 auto 1.15rem; border-radius: 0.7rem; }
      .brand {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #5b677a;
      }
      h1 {
        margin: 0.85rem 0 0.35rem;
        font-size: 1.55rem;
        font-weight: 650;
        letter-spacing: -0.03em;
        line-height: 1.2;
      }
      .sub {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 600;
        color: #0b63c7;
      }
      .en {
        margin: 0.55rem 0 0;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #5b677a;
      }
      .copy {
        margin: 1.15rem 0 0;
        font-size: 0.95rem;
        line-height: 1.55;
        color: #5b677a;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        margin-top: 1.35rem;
        padding: 0.4rem 0.75rem;
        border-radius: 999px;
        background: rgba(217, 119, 6, 0.12);
        color: #92400e;
        font-size: 0.75rem;
        font-weight: 650;
      }
      .dot {
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 999px;
        background: #d97706;
        box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.55);
        animation: pulse 1.8s ease-out infinite;
      }
      @keyframes pulse {
        70% { box-shadow: 0 0 0 0.55rem rgba(217, 119, 6, 0); }
        100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .dot { animation: none; }
      }
    </style>
  </head>
  <body>
    <main>
      ${mark}
      <p class="brand">${YETKIN_BRAND}</p>
      <h1>${SITE_MAINTENANCE_TITLE}</h1>
      <p class="sub">${SITE_MAINTENANCE_SUBTITLE}</p>
      <p class="en">${SITE_MAINTENANCE_ENGLISH}</p>
      <p class="copy">Sayfalar ve API geçici olarak kapalı. Kısa bir bakım çalışmasındayız; birazdan tekrar buradayız.</p>
      <p class="pill"><span class="dot" aria-hidden="true"></span>Canlı yayın duraklatıldı</p>
    </main>
  </body>
</html>`;
}

export function siteMaintenanceNextResponse(request: NextRequest, pathname: string): NextResponse {
  const retryAfter = String(SITE_MAINTENANCE_RETRY_AFTER_SECONDS);
  if (isSiteMaintenanceApiPath(pathname)) {
    const response = railEdgeFailResponse(request, SITE_MAINTENANCE_API_ERROR, 503);
    response.headers.set("retry-after", retryAfter);
    response.headers.set("cache-control", "no-store");
    return response;
  }
  return new NextResponse(renderSiteMaintenanceHtml(), {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "retry-after": retryAfter,
      "cache-control": "no-store",
    },
  });
}
