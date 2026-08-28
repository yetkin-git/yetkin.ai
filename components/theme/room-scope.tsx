"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { roomIdFromPath } from "@/lib/ui/room-theme";
import { cn } from "@/components/ui/cn";

export function RoomScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const room = roomIdFromPath(pathname);

  return (
    <div data-room={room} className={cn("room-scope relative min-h-screen")}>
      <div className="room-atmosphere pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="room-atmosphere-wash" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
