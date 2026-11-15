"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { DronBayrakları, INDEPENDENT_ROOMS, type IndependentRoomId } from "@/lib/dronlar/kayit";
import { ADMIN_SURFACE_PATH } from "@/lib/kernel/admin/types";
import { COMMERCE_NAV, VERTICAL_ROOMS } from "@/lib/kernel/modules";
import { isPhase1ShellNavRoom } from "@/lib/kernel/compliance/circuit-breakers";
import { isJuniorShellPath } from "@/lib/ui/junior-shell";
import { ROOM_NAV_ACCENT } from "@/lib/ui/room-theme";
import { cn } from "@/components/ui/cn";
import { IconShield, ROOM_ICONS } from "@/components/ui/icons";

const INDEPENDENT_NAV_ACCENT: Record<IndependentRoomId, string> = {
  tezgah: "bg-[#5b4cdb] text-white",
  junior: "bg-[#0369a1] text-white",
  young: "bg-[#4338ca] text-white",
  yetkinhibe: "bg-[#854d0e] text-white",
};

const COMMERCE_NAV_ACCENT = "bg-[#0f766e] text-white";

function NavLink({
  href,
  label,
  blurb,
  accent,
  icon: Icon,
  active,
  collapsed,
  onNavigate,
}: {
  href: Route;
  label: string;
  blurb: string;
  accent: string;
  icon: (typeof ROOM_ICONS)[keyof typeof ROOM_ICONS];
  active: boolean;
  collapsed: boolean;
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
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          active ? accent : "bg-white/5 text-white/70",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn("min-w-0 flex-1 overflow-hidden", collapsed && "sr-only")}>
        <span className="block truncate font-medium leading-snug">{label}</span>
        <span className="mt-0.5 block truncate text-xs leading-snug text-white/40">{blurb}</span>
      </span>
    </Link>
  );
}

function isActive(pathname: string | null, path: string): boolean {
  if (!pathname) {
    return false;
  }
  if (path === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
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
  const openIndependent = INDEPENDENT_ROOMS.filter((room) => !DronBayrakları.isKapali(room.id)).filter(
    (room) => room.id !== "junior" || showJunior,
  );
  const tezgahFirst = openIndependent.filter((room) => room.id === "tezgah");
  const otherIndependent = openIndependent.filter((room) => room.id !== "tezgah");
  const adultRooms = [
    ...tezgahFirst.map((room) => ({
      ...room,
      accent: INDEPENDENT_NAV_ACCENT[room.id],
    })),
    ...VERTICAL_ROOMS.filter((room) => isPhase1ShellNavRoom(room.id)).map((room) => ({
      ...room,
      accent: ROOM_NAV_ACCENT[room.id],
    })),
    ...otherIndependent.map((room) => ({
      ...room,
      accent: INDEPENDENT_NAV_ACCENT[room.id],
    })),
  ];
  const juniorShell = isJuniorShellPath(pathname);
  const rooms = juniorShell ? adultRooms.filter((room) => room.id === "junior") : adultRooms;

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
                active={isActive(pathname, room.path)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            </li>
          );
          if (juniorShell || room.id !== "tezgah") {
            return [row];
          }
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
                active={isActive(pathname, COMMERCE_NAV.path)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            </li>,
          ];
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
                  isActive(pathname, ADMIN_SURFACE_PATH)
                    ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-white/65 hover:bg-white/5 hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    isActive(pathname, ADMIN_SURFACE_PATH)
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
