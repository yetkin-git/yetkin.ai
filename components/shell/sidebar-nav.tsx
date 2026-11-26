"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { DronBayrakları, DRON_KAYIT, type DronKayitId } from "@/lib/dronlar/kayit";
import { ADMIN_SURFACE_PATH } from "@/lib/kernel/admin/types";
import { COMMERCE_NAV, KURUMSAL_NAV } from "@/lib/kernel/modules";
import { isJuniorShellPath } from "@/lib/ui/junior-shell";
import { isSidebarNavActive } from "@/lib/ui/sidebar-nav-active";
import { cn } from "@/components/ui/cn";
import { IconShield, ROOM_ICONS } from "@/components/ui/icons";

const NAV_ACCENT: Partial<Record<DronKayitId | "magazam" | "kurumsal", string>> = {
  dashboard: "bg-[var(--safir)] text-white",
  career: "bg-[#1e3a5f] text-white",
  tezgah: "bg-[#5b4cdb] text-white",
  junior: "bg-[#0369a1] text-white",
  yetkinhibe: "bg-gradient-to-br from-emerald-500 to-amber-500 text-white",
  magazam: "bg-[#0f766e] text-white",
  kurumsal: "bg-[#334155] text-white",
};

const COMMERCE_NAV_ACCENT = NAV_ACCENT.magazam ?? "bg-[#0f766e] text-white";
const KURUMSAL_NAV_ACCENT = NAV_ACCENT.kurumsal ?? "bg-[#334155] text-white";

function NavLink({
  href,
  label,
  blurb,
  accent,
  icon: Icon,
  active,
  collapsed,
  badge = false,
  onNavigate,
}: {
  href: Route;
  label: string;
  blurb: string;
  accent: string;
  icon: (typeof ROOM_ICONS)[keyof typeof ROOM_ICONS];
  active: boolean;
  collapsed: boolean;
  badge?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        "group flex items-center rounded-2xl text-sm leading-snug transition",
        collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
        active
          ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          : "text-white/65 hover:bg-white/5 hover:text-white",
      )}
    >
      <span
        className={cn(
          "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          active ? accent : badge ? "bg-gradient-to-br from-emerald-500 to-amber-500 text-white" : "bg-white/5 text-white/70",
        )}
      >
        <Icon className="h-4 w-4" />
        {badge ? (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-300 ring-2 ring-emerald-700" />
        ) : null}
      </span>
      <span className={cn("min-w-0 flex-1 overflow-hidden", collapsed && "sr-only")}>
        <span className="block truncate font-medium leading-snug">{label}</span>
        <span className="mt-0.5 block truncate text-xs leading-snug text-white/40">{blurb}</span>
      </span>
    </Link>
  );
}

export function SidebarNav({
  collapsed = false,
  showAdmin = false,
  showJunior = false,
  onNavigate,
}: {
  collapsed?: boolean;
  showAdmin?: boolean;
  showJunior?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const juniorShell = isJuniorShellPath(pathname);
  const openRoom = (id: DronKayitId) => {
    const row = DRON_KAYIT.find((room) => room.id === id);
    if (!row || DronBayrakları.isKapali(row.id)) {
      return null;
    }
    if (row.id === "junior" && !showJunior) {
      return null;
    }
    return row;
  };
  const ordered = [
    openRoom("dashboard"),
    openRoom("yetkinhibe"),
    openRoom("tezgah"),
    openRoom("career"),
    openRoom("junior"),
  ].flatMap((room) => (room ? [room] : []));
  const rooms = (juniorShell ? ordered.filter((room) => room.id === "junior") : ordered).map((room) => ({
    ...room,
    accent: NAV_ACCENT[room.id] ?? "bg-white/10 text-white",
    badge: room.id === "yetkinhibe",
  }));

  return (
    <nav className="flex h-full min-h-0 flex-col">
      <p
        className={cn(
          "mb-3 overflow-hidden px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40",
          collapsed && "sr-only",
        )}
      >
        Menü
      </p>
      <ul className="flex flex-col gap-1.5">
        {rooms.flatMap((room) => {
          const row = (
            <li key={room.id}>
              <NavLink
                href={room.path}
                label={room.label}
                blurb={room.blurb}
                accent={room.accent}
                icon={ROOM_ICONS[room.id]}
                active={isSidebarNavActive(pathname, room.path)}
                collapsed={collapsed}
                badge={room.badge}
                onNavigate={onNavigate}
              />
            </li>
          );
          if (juniorShell) {
            return [row];
          }
          if (room.id === "dashboard") {
            const CommerceIcon = ROOM_ICONS.magazam;
            return [
              row,
              <li key={COMMERCE_NAV.id}>
                <NavLink
                  href={COMMERCE_NAV.path}
                  label={COMMERCE_NAV.label}
                  blurb={COMMERCE_NAV.blurb}
                  accent={COMMERCE_NAV_ACCENT}
                  icon={CommerceIcon}
                  active={
                    isSidebarNavActive(pathname, COMMERCE_NAV.path) ||
                    isSidebarNavActive(pathname, "/magazam")
                  }
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              </li>,
            ];
          }
          if (room.id === "career") {
            const KurumsalIcon = ROOM_ICONS.kurumsal;
            return [
              row,
              <li key={KURUMSAL_NAV.id}>
                <NavLink
                  href={KURUMSAL_NAV.path}
                  label={KURUMSAL_NAV.label}
                  blurb={KURUMSAL_NAV.blurb}
                  accent={KURUMSAL_NAV_ACCENT}
                  icon={KurumsalIcon}
                  active={isSidebarNavActive(pathname, KURUMSAL_NAV.path)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              </li>,
            ];
          }
          return [row];
        })}
      </ul>
      {showAdmin ? (
        <div className="mt-3 border-t border-white/10 pt-3">
          <ul className="flex flex-col gap-1.5">
            <li>
              <Link
                href={ADMIN_SURFACE_PATH as Route}
                onClick={onNavigate}
                title={collapsed ? "Yönetici Paneli" : undefined}
                aria-label={collapsed ? "Yönetici Paneli" : undefined}
                className={cn(
                  "group flex items-center rounded-2xl text-sm leading-snug transition",
                  collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                  isSidebarNavActive(pathname, ADMIN_SURFACE_PATH)
                    ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-white/65 hover:bg-white/5 hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    isSidebarNavActive(pathname, ADMIN_SURFACE_PATH)
                      ? "bg-[var(--safir)] text-white"
                      : "bg-white/5 text-white/70",
                  )}
                >
                  <IconShield className="h-4 w-4" />
                </span>
                <span className={cn("min-w-0 flex-1 overflow-hidden", collapsed && "sr-only")}>
                  <span className="block truncate font-medium leading-snug">Yönetici Paneli</span>
                  <span className="mt-0.5 block truncate text-xs leading-snug text-white/40">
                    Admin Dashboard
                  </span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
