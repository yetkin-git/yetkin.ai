"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminConfirmDialog } from "@/components/kernel/admin-confirm-dialog";
import { Button } from "@/components/ui/button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { ACADEMY_CURRICULUM_REVISIONS_API } from "@/lib/academy/curriculum-revision-paths";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function CurriculumRevisionApproveButton({ revisionId }: { revisionId: string }) {
  const router = useRouter();
  const copy = ACADEMY_SEN.revisions;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function onApprove() {
    setPending(true);
    setError(null);
    const response = await fetch(
      ACADEMY_CURRICULUM_REVISIONS_API,
      withRailApiVersion({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ revisionId }),
      }),
    );
    const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
    setPending(false);
    if (!parsed.ok) {
      setError(parsed.error ?? copy.fail);
      setConfirmOpen(false);
      return;
    }
    setConfirmOpen(false);
    router.refresh();
  }

  return (
    <div className="flex min-w-[11rem] flex-col items-end gap-1">
      <Button type="button" size="sm" onClick={() => setConfirmOpen(true)} disabled={pending}>
        {pending ? copy.pending : copy.approve}
      </Button>
      {error ? (
        <p className="text-xs text-[var(--rose)]" aria-live="assertive">
          {error}
        </p>
      ) : null}
      <AdminConfirmDialog
        open={confirmOpen}
        eyebrow={copy.confirmEyebrow}
        title={copy.confirmTitle}
        body={copy.confirmBody}
        confirmLabel={copy.confirmCta}
        cancelLabel={copy.confirmCancel}
        closeLabel={copy.confirmClose}
        pendingLabel={copy.confirmPending}
        pending={pending}
        onConfirm={() => void onApprove()}
        onClose={() => {
          if (!pending) {
            setConfirmOpen(false);
          }
        }}
      />
    </div>
  );
}
