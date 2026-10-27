"use client";

import { useId, useState } from "react";
import { LinkButton } from "@/components/ui/link-button";

export function JuniorPackageDoor({
  checkoutOpen,
  closedMessage,
}: {
  checkoutOpen: boolean;
  closedMessage: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  if (checkoutOpen) {
    return (
      <LinkButton href="/junior/checkout" size="sm">
        Paketi gör
      </LinkButton>
    );
  }
  return (
    <div className="relative inline-flex flex-wrap items-center gap-2">
      <span className="inline-flex h-8 items-center rounded-full border border-[var(--amber)]/50 bg-[color-mix(in_srgb,var(--amber)_12%,var(--surface))] px-2.5 text-xs font-semibold text-[var(--foreground)]">
        Kasa kapalı
      </span>
      <button
        type="button"
        className="inline-flex h-8 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--foreground)]"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        Paketi gör
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          className="absolute left-0 top-10 z-20 w-72 rounded-2xl border border-[var(--border)] bg-white p-3 text-sm leading-6 shadow-[var(--shadow-card)]"
        >
          {closedMessage}
        </div>
      ) : null}
    </div>
  );
}
