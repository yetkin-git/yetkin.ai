"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  DesktopSidebar,
  ShellMain,
  SidebarLayoutProvider,
} from "@/components/shell/desktop-sidebar";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { HeaderBar } from "@/components/shell/header-bar";
import { BreadcrumbOverrideProvider } from "@/components/shell/header-breadcrumb";
import { RoomScope } from "@/components/theme/room-scope";
import { ActionBridgeProvider } from "@/components/ui/action-bridge";
import { IconClose } from "@/components/ui/icons";
import { BrandIcon } from "@/components/ui/brand-icon";
import { cn } from "@/components/ui/cn";
import { YETKIN_BRAND, YETKIN_SHELL_TAGLINE } from "@/lib/copy/brand";

function BrandMark() {
  return (
    <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 px-1 py-0.5">
      <BrandIcon className="h-8 w-8 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold leading-snug tracking-tight text-white">
          {YETKIN_BRAND}
        </span>
        <span className="mt-0.5 block truncate text-[11px] leading-snug text-white/40">
          {YETKIN_SHELL_TAGLINE}
        </span>
      </span>
    </Link>
  );
}

export function ShellChrome({
  children,
  userCluster,
}: {
  children: ReactNode;
  userCluster: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarLayoutProvider>
      <DesktopSidebar />

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 lg:hidden",
          open ? "block" : "hidden",
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden bg-[var(--surface-ink)] transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex min-w-0 items-center justify-between gap-2 px-4 py-4">
          <BrandMark />
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg p-2 text-white/70 hover:bg-white/10"
            onClick={() => setOpen(false)}
            aria-label="Menüyü kapat"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </aside>

      <RoomScope>
        <ActionBridgeProvider>
          <BreadcrumbOverrideProvider>
            <ShellMain>
              <HeaderBar onMenu={() => setOpen(true)} userCluster={userCluster} />
              {children}
            </ShellMain>
          </BreadcrumbOverrideProvider>
        </ActionBridgeProvider>
      </RoomScope>
    </SidebarLayoutProvider>
  );
}
