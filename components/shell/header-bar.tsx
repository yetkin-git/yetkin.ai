"use client";

import type { ReactNode } from "react";
import { HeaderBreadcrumb } from "@/components/shell/header-breadcrumb";
import { NavHistoryControls } from "@/components/shell/nav-history-controls";
import { IconMenu } from "@/components/ui/icons";

export function HeaderBar({
  onMenu,
  userCluster,
}: {
  onMenu: () => void;
  userCluster: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_78%,transparent)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl p-2 text-[var(--foreground)] hover:bg-[var(--surface-muted)] lg:hidden"
            onClick={onMenu}
            aria-label="Odaları aç"
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <NavHistoryControls />
          <HeaderBreadcrumb />
        </div>
        <div className="flex shrink-0 items-center">{userCluster}</div>
      </div>
    </header>
  );
}
