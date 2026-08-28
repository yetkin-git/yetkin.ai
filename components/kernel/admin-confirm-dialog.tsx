"use client";

import { useId, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { IconClose } from "@/components/ui/icons";

/** Quiet Luxury onay katmanı — admin yazma eylemleri için tek dialog kabuğu. */
export function AdminConfirmDialog({
  open,
  eyebrow,
  title,
  body,
  confirmLabel,
  cancelLabel,
  closeLabel,
  pendingLabel = "…",
  pending = false,
  onConfirm,
  onClose,
  children,
}: {
  open: boolean;
  eyebrow: string;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  /** SEN_VOICE pending etiketi — hardcoded "…" kaçınılır. */
  pendingLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
}) {
  const titleId = useId();
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[color-mix(in_srgb,var(--surface-ink)_45%,transparent)] p-4 sm:items-center"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md space-y-4 rounded-2xl border border-[var(--safir-soft)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">
              {eyebrow}
            </p>
            <h2 id={titleId} className="mt-1 text-base font-semibold text-[var(--foreground)]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)]"
            aria-label={closeLabel}
            disabled={pending}
          >
            <IconClose />
          </button>
        </div>

        <p className="text-sm leading-6 text-[var(--foreground)]">{body}</p>
        {children}

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={onConfirm} disabled={pending}>
            {pending ? pendingLabel : confirmLabel}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={pending}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
