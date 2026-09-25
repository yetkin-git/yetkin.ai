"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { IconClose } from "@/components/ui/icons";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function WalletRefundConfirmDialog({
  open,
  amountLabel,
  pending,
  error,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  amountLabel: string;
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const copy = SEN_VOICE.cuzdan;
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[color-mix(in_srgb,var(--surface-ink)_45%,transparent)] p-4 sm:items-center"
      onClick={onCancel}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onCancel();
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
              {copy.refundConfirmEyebrow}
            </p>
            <h2 id={titleId} className="mt-1 text-base font-semibold text-[var(--foreground)]">
              {copy.refundConfirmTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-[var(--muted)]"
            aria-label={copy.refundConfirmClose}
            disabled={pending}
          >
            <IconClose />
          </button>
        </div>
        <p className="text-sm leading-6 text-[var(--foreground)]">{copy.refundConfirmBody(amountLabel)}</p>
        {error ? (
          <p role="alert" className="text-sm text-[var(--rose)]">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={onConfirm} disabled={pending}>
            {pending ? copy.refundPending : copy.refundConfirmAccept}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={pending}>
            {copy.refundConfirmCancel}
          </Button>
        </div>
      </div>
    </div>
  );
}
