/** Sol ray aktif vurgusu. `/kurumsal` hem satış hem `/kurumsal/ilanlar` kokpitini kapsar. */
export function isSidebarNavActive(pathname: string | null, path: string): boolean {
  if (!pathname) {
    return false;
  }
  if (path === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}
