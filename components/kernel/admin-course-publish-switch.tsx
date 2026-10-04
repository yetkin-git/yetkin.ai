"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminConfirmDialog } from "@/components/kernel/admin-confirm-dialog";
import { Input } from "@/components/ui/input";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { COURSE_PUBLISH_PATH } from "@/lib/kernel/admin/types";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { cn } from "@/components/ui/cn";

export function AdminCoursePublishSwitch({
  slug,
  unitKey,
  published,
}: {
  slug: string;
  unitKey: string;
  published: boolean;
}) {
  const router = useRouter();
  const copy = ADMIN_SEN;
  const nextPublished = !published;
  const nextLabel = nextPublished ? copy.publishOn : copy.publishOff;
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function onToggle() {
    setError(null);
    setConfirmOpen(true);
  }

  async function onConfirm() {
    if (reason.trim().length < 8) {
      setError(copy.reasonFail);
      return;
    }
    setPending(true);
    setError(null);
    const response = await fetch(
      COURSE_PUBLISH_PATH,
      withRailApiVersion({
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          published: nextPublished,
          reason: reason.trim(),
        }),
      }),
    );
    const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
    setPending(false);
    if (!parsed.ok) {
      setError(parsed.error ?? copy.publishFail);
      return;
    }
    setConfirmOpen(false);
    setReason("");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={published}
        aria-label={`${unitKey} ${published ? copy.publishOn : copy.publishOff}`}
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)]"
      >
        <span>{published ? copy.publishOn : copy.publishOff}</span>
        <span
          aria-hidden
          data-on={published ? "true" : "false"}
          className={cn(
            "relative h-4 w-7 rounded-full",
            published ? "bg-[var(--emerald)]" : "bg-[var(--border)]",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-3 w-3 rounded-full bg-white",
              published ? "right-0.5" : "left-0.5",
            )}
          />
        </span>
      </button>
      <AdminConfirmDialog
        open={confirmOpen}
        eyebrow={copy.confirm.eyebrow}
        title={copy.confirm.publishTitle}
        body={copy.confirm.publishBody(unitKey, nextLabel)}
        confirmLabel={copy.confirm.publishConfirm}
        cancelLabel={copy.confirm.amountCancel}
        closeLabel={copy.confirm.closeLabel}
        pendingLabel={copy.confirm.pending}
        pending={pending}
        onConfirm={() => void onConfirm()}
        onClose={() => {
          if (!pending) {
            setConfirmOpen(false);
          }
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted)]">{copy.reasonNoteLabel}</span>
          <Input
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            aria-label={copy.reasonNoteLabel}
            placeholder={copy.publishReasonPlaceholder}
            minLength={8}
            maxLength={500}
          />
        </label>
        {error ? <p className="text-xs text-[var(--rose)]">{error}</p> : null}
      </AdminConfirmDialog>
    </>
  );
}
