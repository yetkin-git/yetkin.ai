/** Sol ray aktif vurgusu. Kurumsal çalışma odası `/kurumsal/ilanlar` (ve altı)dır. */
export function isSidebarNavActive(pathname: string | null, path: string): boolean {
  if (!pathname) {
    return false;
  }
  if (path === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}
