"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { HeaderBar } from "@/components/shell/header-bar";
import { RoomScope } from "@/components/theme/room-scope";
import { IconClose } from "@/components/ui/icons";
import { RailMark } from "@/components/ui/rail-mark";
import { cn } from "@/components/ui/cn";

function BrandMark() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-1 py-0.5">
      <RailMark tone="onInk" withSleepers className="h-8 w-8 shrink-0" />
      <span>
        <span className="block text-sm font-semibold leading-tight tracking-tight text-white">
          Yetkin Rail
        </span>
        <span className="block text-[11px] leading-tight text-white/40">Mühürlü emek OS</span>
      </span>
    </Link>
  );
}

export function ShellChrome({
  children,
  showAdmin,
  userEmail,
}: {
  children: ReactNode;
  showAdmin: boolean;
  userEmail: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/5 bg-[var(--surface-ink)] lg:flex">
        <div className="px-3 py-3">
          <BrandMark />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-2">
          <SidebarNav />
        </div>
        <div className="border-t border-white/5 p-2.5">
          <p className="rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] leading-tight text-white/45 line-clamp-1">
            12 asil oda · tek nakit defter · tek LLM gümrüğü
          </p>
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 lg:hidden",
          open ? "block" : "hidden",
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[var(--surface-ink)] transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-3 py-3">
          <BrandMark />
          <button
            type="button"
            className="rounded-lg p-2 text-white/70 hover:bg-white/10"
            onClick={() => setOpen(false)}
            aria-label="Menüyü kapat"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-2">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </aside>

      <RoomScope>
        <div className="relative lg:pl-72">
          <HeaderBar onMenu={() => setOpen(true)} showAdmin={showAdmin} userEmail={userEmail} />
          {children}
        </div>
      </RoomScope>
    </>
  );
}
