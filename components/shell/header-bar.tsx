"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { HeaderBreadcrumb } from "@/components/shell/header-breadcrumb";
import { NavHistoryControls } from "@/components/shell/nav-history-controls";
import { IconMenu } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";
import { isAcademyPlayPath } from "@/lib/ui/sidebar-layout";

export function HeaderBar({
  onMenu,
  userCluster,
}: {
  onMenu: () => void;
  userCluster: ReactNode;
}) {
  const pathname = usePathname();
  const playPath = isAcademyPlayPath(pathname);

  return (
    <header className="sticky top-0 z-20 mt-0 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_78%,transparent)] pt-0 backdrop-blur-xl">
      <div
        className={cn(
          "flex items-center",
          playPath
            ? "h-12 w-full justify-between gap-2 px-3 pt-0 sm:px-4 lg:justify-end"
            : "h-16 justify-between gap-4 px-4 sm:px-6",
        )}
        data-academy-play-chrome={playPath ? "true" : undefined}
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-2 sm:gap-3",
            playPath ? "mt-0 pt-0 lg:hidden" : "flex-1",
          )}
        >
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl p-2 text-[var(--foreground)] hover:bg-[var(--surface-muted)] lg:hidden"
            onClick={onMenu}
            aria-label="Odaları aç"
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <HeaderBreadcrumb />
        </div>
        <div className="ml-0 flex shrink-0 items-center gap-1 sm:gap-1.5 lg:ml-0" data-shell-header-actions="">
          <NavHistoryControls />
          {userCluster}
        </div>
      </div>
    </header>
  );
}
