/** YouTube tarzı üst yönlendirme şeridi — tıklama / RSC fetch ayrımı. */

export const NAV_PROGRESS_INDETERMINATE = true;

type ClickLike = {
  defaultPrevented: boolean;
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
};

type AnchorLike = {
  href: string;
  download: string;
  target: string;
};

function readHeaders(input: RequestInfo | URL, init?: RequestInit): Headers {
  if (init?.headers) {
    return new Headers(init.headers);
  }
  if (typeof Request !== "undefined" && input instanceof Request) {
    return new Headers(input.headers);
  }
  return new Headers();
}

export function isAppRouterNavigationFetch(input: RequestInfo | URL, init?: RequestInit): boolean {
  const headers = readHeaders(input, init);
  if (headers.get("next-action")) {
    return false;
  }
  if (headers.get("next-router-prefetch") === "1") {
    return false;
  }
  if (headers.get("next-router-segment-prefetch")) {
    return false;
  }
  return headers.get("rsc") === "1" || Boolean(headers.get("next-router-state-tree"));
}

export function shouldStartProgressFromClick(
  event: ClickLike,
  anchor: AnchorLike | null,
  currentUrl: string,
): boolean {
  if (!anchor || event.defaultPrevented || event.button !== 0) {
    return false;
  }
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  if (anchor.download) {
    return false;
  }
  if (anchor.target && anchor.target !== "_self") {
    return false;
  }

  let current: URL;
  let next: URL;
  try {
    current = new URL(currentUrl);
    next = new URL(anchor.href, current);
  } catch {
    return false;
  }

  if (next.origin !== current.origin) {
    return false;
  }
  if (next.protocol !== "http:" && next.protocol !== "https:") {
    return false;
  }
  return next.pathname !== current.pathname || next.search !== current.search;
}

/** Akademi/doğrulama: odanın sınavı dekoratif ilerlemeyi düşürür. */
export function shouldHideNavigationProgress(pathname: string): boolean {
  return pathname === "/academy" || pathname.startsWith("/academy/");
}

export function resolveClickAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) {
    return null;
  }
  return target.closest("a[href]");
}
