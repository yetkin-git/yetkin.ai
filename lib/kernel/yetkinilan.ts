import type { Route } from "next";

/** Tescilli vatandaş markası. Jenerik «Pazaryeri» etiketi arayüzde yoktur (S62-A). */
export const YETKINILAN_BRAND = "Yetkinİlan";

export const YETKINILAN_BLURB =
  "Dijital üründe anında teslim. Hizmette emanet kilit.";

/**
 * Vatandaş marka yolu. Disk `app/pazaryeri` kalır (S8-A klasör ikizi yok).
 * `next.config` rewrite: `/yetkinilan` → `/pazaryeri`.
 */
export const YETKINILAN_PATH = "/yetkinilan" as Route;

/** Disk ve tarihsel vatandaş yolu — aynı oda. */
export const PAZARYERI_DISK_PATH = "/pazaryeri";

const YETKINILAN_PREFIXES = ["/yetkinilan", PAZARYERI_DISK_PATH] as const;

export function isYetkinIlanPath(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false;
  }
  return YETKINILAN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function yetkinIlanHref(subpath?: string): Route {
  if (!subpath || subpath === "/") {
    return YETKINILAN_PATH;
  }
  const suffix = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return `/yetkinilan${suffix}` as Route;
}
