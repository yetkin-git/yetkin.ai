"use client";

import { usePathname } from "next/navigation";
import { UserHub } from "@/components/shell/user-hub";
import { IconMenu } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { roomIdFromPath, roomLabelFromId } from "@/lib/ui/room-theme";

export function HeaderBar({
  onMenu,
  showAdmin,
  userEmail,
}: {
  onMenu: () => void;
  showAdmin: boolean;
  userEmail: string | null;
}) {
  const pathname = usePathname();
  const room = roomIdFromPath(pathname);
  const roomLabel = roomLabelFromId(room);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_78%,transparent)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="rounded-xl p-2 text-[var(--foreground)] hover:bg-[var(--surface-muted)] lg:hidden"
            onClick={onMenu}
            aria-label="Odaları aç"
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <div className="hidden min-w-0 sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {roomLabel} yüzeyi
            </p>
            <p className="truncate text-sm font-semibold tracking-tight">Yetkin Rail cockpit</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Badge tone="safir" className="hidden md:inline-flex">
            Mühürlü ray
          </Badge>
          <UserHub showAdmin={showAdmin} userEmail={userEmail} />
        </div>
      </div>
    </header>
  );
}
