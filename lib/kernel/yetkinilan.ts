import type { Route } from "next";

/**
 * Donmuş Yetkinİlan / tarihsel `/pazaryeri` — yalnız kenar 410 yardımcıları.
 * Canlı oda, nav veya vitrin değildir. Marka kopyası ürün vaadi taşımaz.
 */
export const YETKINILAN_BRAND = "Yetkinİlan";

export const YETKINILAN_PATH = "/yetkinilan" as Route;

/** Disk ve tarihsel vatandaş yolu — aynı donmuş oda. */
export const PAZARYERI_DISK_PATH = "/pazaryeri";

const YETKINILAN_PREFIXES = [YETKINILAN_PATH, PAZARYERI_DISK_PATH] as const;

export function isYetkinIlanPath(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false;
  }
  return YETKINILAN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** 410 yol üretimi — canlı vitrin açmaz. */
export function yetkinIlanHref(subpath?: string): Route {
  if (!subpath || subpath === "/") {
    return YETKINILAN_PATH;
  }
  const suffix = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return `/yetkinilan${suffix}` as Route;
}
