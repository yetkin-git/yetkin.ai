import { INDEPENDENT_ROOMS } from "@/lib/dronlar/kayit";
import { YETKIN_SHELL_TAGLINE } from "@/lib/copy/brand";

const JUNIOR_SHELL_PREFIX = "/junior";

function normalizeShellPath(pathname: string | null | undefined): string {
  if (!pathname) {
    return "";
  }
  const path = pathname.split("?")[0]?.split("#")[0] ?? pathname;
  if (path.length > 1) {
    return path.replace(/\/+$/, "");
  }
  return path;
}

/** Çocuk kabuğu: `/junior` ve alt yollar. Yetişkin oda linki bu kabukta basılmaz. */
export function isJuniorShellPath(pathname: string | null | undefined): boolean {
  const path = normalizeShellPath(pathname);
  return path === JUNIOR_SHELL_PREFIX || path.startsWith(`${JUNIOR_SHELL_PREFIX}/`);
}

/** Marka dönüşü. Junior'da kariyer anasayfasına çıkılmaz. */
export function shellBrandHome(pathname: string | null | undefined): {
  href: "/junior" | "/dashboard";
  tagline: string;
} {
  if (isJuniorShellPath(pathname)) {
    const junior = INDEPENDENT_ROOMS.find((room) => room.id === "junior");
    return { href: "/junior", tagline: junior?.blurb ?? "Junior" };
  }
  return { href: "/dashboard", tagline: YETKIN_SHELL_TAGLINE };
}
