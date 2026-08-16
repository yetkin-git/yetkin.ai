"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VERTICAL_ROOMS } from "@/lib/kernel/modules";
import { isYetkinIlanPath } from "@/lib/kernel/yetkinilan";
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
  if (isYetkinIlanPath(path)) {
    return isYetkinIlanPath(pathname);
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full min-h-0 flex-col">
      <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
        Odalar
      </p>
      <ul className="flex flex-col gap-0.5">
        {VERTICAL_ROOMS.map((room) => {
          const Icon = ROOM_ICONS[room.id];
          const active = isActive(pathname, room.path);
          return (
            <li key={room.id}>
              <Link
                href={room.path}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-2.5 py-1 text-sm leading-tight transition",
                  active
                    ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-white/65 hover:bg-white/5 hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    active ? ROOM_NAV_ACCENT[room.id] : "bg-white/5 text-white/70",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium leading-tight">{room.label}</span>
                  <span className="mt-px block text-[11px] leading-tight text-white/35 line-clamp-1">
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
