"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderWalletChip } from "@/components/shell/header-wallet-chip";
import { IconChevronDown, IconUser, ROOM_ICONS } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";
import { KERNEL_SURFACES } from "@/lib/kernel/modules";

const HUB_MENU_SURFACES = KERNEL_SURFACES.filter((surface) => surface.id !== "cuzdan");

export function UserHub({
  showAdmin,
  userEmail,
}: {
  showAdmin: boolean;
  userEmail: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const menuSurfaces = HUB_MENU_SURFACES.filter(
    (surface) => surface.id !== "admin" || showAdmin,
  );
  const menuActive = menuSurfaces.some(
    (surface) => pathname === surface.path || pathname?.startsWith(`${surface.path}/`),
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <div className="inline-flex h-10 items-stretch overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <HeaderWalletChip embedded />
        <span className="my-2 w-px shrink-0 bg-[var(--border)]" aria-hidden />
        <button
          type="button"
          className={cn(
            "inline-flex h-10 items-center gap-1.5 px-2.5 text-sm font-medium transition sm:px-3",
            open || menuActive
              ? "bg-[var(--safir-soft)] text-[var(--safir-deep)]"
              : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
          )}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          aria-label="Hesap menüsü"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-ink)] text-white">
            <IconUser className="h-3.5 w-3.5" />
          </span>
          <IconChevronDown
            className={cn("h-3.5 w-3.5 text-[var(--muted)] transition duration-150", open && "rotate-180")}
          />
        </button>
      </div>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Hesap"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-lift)]"
        >
          <div className="px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Hesabım
            </p>
            {userEmail ? (
              <p className="mt-0.5 truncate text-sm font-medium text-[var(--foreground)]">{userEmail}</p>
            ) : (
              <p className="mt-0.5 text-sm text-[var(--muted)]">Oturum yüzeyi</p>
            )}
          </div>
          <div className="my-1 h-px bg-[var(--border)]" aria-hidden />
          <ul className="space-y-0.5">
            {menuSurfaces.map((surface) => {
              const Icon = ROOM_ICONS[surface.id];
              const active = pathname === surface.path || pathname?.startsWith(`${surface.path}/`);
              return (
                <li key={surface.id}>
                  <Link
                    href={surface.path}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                      active
                        ? "bg-[var(--safir-soft)] font-semibold text-[var(--safir-deep)]"
                        : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-lg",
                        active ? "bg-[var(--safir)] text-white" : "bg-[var(--surface-muted)] text-[var(--muted)]",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium">{surface.label}</span>
                      <span className="block text-[11px] text-[var(--muted)]">{surface.blurb}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
