/**
 * PayTR iFrame gömme sabitleri — istemci güvenli (node:crypto yok).
 * Token HMAC `checkout.ts`'tedir; bu yaprak yalnız src / allow / resizer.
 */

export const PAYTR_IFRAME_ORIGIN = "https://www.paytr.com";
export const PAYTR_IFRAME_BASE_URL = `${PAYTR_IFRAME_ORIGIN}/odeme/guvenli`;
export const PAYTR_IFRAME_TOKEN_PREFIX = "/odeme/guvenli/";
/** iFrame V2 — resmi resizer (`?v2` zorunlu). */
export const PAYTR_IFRAME_RESIZER_SRC = `${PAYTR_IFRAME_ORIGIN}/js/iframeResizer.min.js?v2`;
/**
 * Çapraz köken Payment Request + 3DS WebAuthn.
 * Üst belge `Permissions-Policy: payment=()` ise bu öznitelik yetmez.
 */
export const PAYTR_IFRAME_ALLOW = "payment *; publickey-credentials-get *";

export const PAYTR_RETURN_MESSAGE_TYPE = "yetkin:paytr-return" as const;
export const PAYTR_RETURN_PATHS = ["/cuzdan", "/kasa/donus"] as const;

export type PaytrReturnMessagePayload = {
  type: typeof PAYTR_RETURN_MESSAGE_TYPE;
  pathname: string;
  search?: string;
  ok?: boolean;
};

export function isPaytrMerchantReturnPathname(pathname: string): boolean {
  const normalized = pathname.trim().replace(/\/+$/, "") || "/";
  return (PAYTR_RETURN_PATHS as readonly string[]).some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function isPaytrReturnMessage(data: unknown): data is PaytrReturnMessagePayload {
  if (!data || typeof data !== "object") {
    return false;
  }
  const candidate = data as Record<string, unknown>;
  if (candidate.type !== PAYTR_RETURN_MESSAGE_TYPE) {
    return false;
  }
  return typeof candidate.pathname === "string" && isPaytrMerchantReturnPathname(candidate.pathname);
}

/**
 * `/cuzdan` veya `/kasa/donus` sayfası PayTR iFrame içinde açıldığında
 * üst pencereye (`window.parent`) otomatik kapanma/lisans tetikleme sinyali gönderir.
 */
export function emitPaytrIframeReturnIfEmbedded(ok = true): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    if (!window.parent || window.parent === window) {
      return false;
    }
    const payload: PaytrReturnMessagePayload = {
      type: PAYTR_RETURN_MESSAGE_TYPE,
      pathname: window.location.pathname,
      search: window.location.search,
      ok,
    };
    window.parent.postMessage(payload, window.location.origin);
    return true;
  } catch {
    return false;
  }
}

function isPaytrIframeHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "www.paytr.com" || host.endsWith(".paytr.com");
}

function readPaytrIframePathToken(pathname: string): string | null {
  if (!pathname.startsWith(PAYTR_IFRAME_TOKEN_PREFIX)) {
    return null;
  }
  const token = pathname.slice(PAYTR_IFRAME_TOKEN_PREFIX.length).replace(/\/+$/, "");
  if (!token || token.includes("/")) {
    return null;
  }
  return token;
}

export function isPaytrIframeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      return false;
    }
    return isPaytrIframeHost(url.hostname) && readPaytrIframePathToken(url.pathname) !== null;
  } catch {
    return false;
  }
}

/**
 * Resmi iFrame src: `https://www.paytr.com/odeme/guvenli/{token}`.
 * Hash/query düşer; token encodeURIComponent ile kırılmaz (PayTR ham path ister).
 */
export function getPaytrIframeUrl(tokenOrUrl: string): string {
  const trimmed = tokenOrUrl.trim();
  if (!trimmed) {
    return `${PAYTR_IFRAME_BASE_URL}/`;
  }
  if (/^https:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (isPaytrIframeHost(url.hostname)) {
        const token = readPaytrIframePathToken(url.pathname);
        if (token) {
          return `${PAYTR_IFRAME_BASE_URL}/${token}`;
        }
      }
    } catch {
      /* token olarak düş */
    }
  }
  const token = trimmed.split(/[/?#]/)[0]?.replace(/\/+$/, "") ?? "";
  return `${PAYTR_IFRAME_BASE_URL}/${token}`;
}

export function tryGetPaytrIframeUrl(tokenOrUrl: string): string | null {
  const url = getPaytrIframeUrl(tokenOrUrl);
  return isPaytrIframeUrl(url) ? url : null;
}

/** API `iframeUrl` veya ham `token` → iFrame src. */
export function readPaytrIframeSrcFromCheckout(body: Record<string, unknown>): string | null {
  const iframeUrl = typeof body.iframeUrl === "string" ? body.iframeUrl : "";
  const fromUrl = iframeUrl ? tryGetPaytrIframeUrl(iframeUrl) : null;
  if (fromUrl) {
    return fromUrl;
  }
  const token = typeof body.token === "string" ? body.token : "";
  return token ? tryGetPaytrIframeUrl(token) : null;
}
