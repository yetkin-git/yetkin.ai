"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VERTICAL_ROOMS } from "@/lib/kernel/modules";
import { isPhase1ShellNavRoom } from "@/lib/kernel/compliance/circuit-breakers";
import { ROOM_NAV_ACCENT } from "@/lib/ui/room-theme";
import { cn } from "@/components/ui/cn";
import { ROOM_ICONS } from "@/components/ui/icons";

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
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const rooms = VERTICAL_ROOMS.filter((room) => isPhase1ShellNavRoom(room.id));

  return (
    <nav className="flex h-full min-h-0 flex-col">
      <p
        className={cn(
          "mb-3 overflow-hidden px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40",
          collapsed && "sr-only",
        )}
      >
        Odalar
      </p>
      <ul className="flex flex-col gap-1.5">
        {rooms.map((room) => {
          const Icon = ROOM_ICONS[room.id];
          const active = isActive(pathname, room.path);
          return (
            <li key={room.id}>
              <Link
                href={room.path}
                onClick={onNavigate}
                title={collapsed ? room.label : undefined}
                aria-label={collapsed ? room.label : undefined}
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
                    active ? ROOM_NAV_ACCENT[room.id] : "bg-white/5 text-white/70",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 overflow-hidden",
                    collapsed && "sr-only",
                  )}
                >
                  <span className="block truncate font-medium leading-snug">{room.label}</span>
                  <span className="mt-0.5 block truncate text-xs leading-snug text-white/40">
                    {room.blurb}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
