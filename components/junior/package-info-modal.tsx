"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { IconClose, IconLock } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";

export function PackageInfoModal({
  open,
  onClose,
  checkoutHref,
  priceLabel,
}: {
  open: boolean;
  onClose: () => void;
  checkoutHref: string;
  priceLabel: string | null;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    panelRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="grid w-full max-w-md gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)]">
              <IconLock className="h-4 w-4" />
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                Yıllık Junior Paketi
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Kilitli konular tek bir yıllık paketle açılır. Her hafta ayrı satılmaz; vitrindeki tek
                «Paketi Al» kapısı tüm çekirdek dersleri kapsar.
              </p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" aria-label="Kapat" onClick={onClose}>
            <IconClose className="h-4 w-4" />
          </Button>
        </div>
        <ul className="grid gap-2 text-sm leading-6 text-[var(--foreground)]">
          <li>İlk konu her derste ücretsiz kalır.</li>
          <li>Paket açılınca kilitli konular sırayla hazır olur.</li>
          {priceLabel ? <li>Yıllık paket: {priceLabel}.</li> : null}
        </ul>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Kapat
          </Button>
          <LinkButton href={checkoutHref} size="sm" variant="primary">
            {priceLabel ? `Paketi Al (${priceLabel})` : "Paketi Al"}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
