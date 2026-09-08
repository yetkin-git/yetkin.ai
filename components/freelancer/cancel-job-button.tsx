"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function CancelJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const report = useCitizenWriteFeedback();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const copy = FREELANCER_SEN.cancel;

  const onCancel = useCallback(async () => {
    if (!window.confirm(copy.confirm)) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/freelancer/jobs/${jobId}`,
        withRailApiVersion({
          method: "DELETE",
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      setPending(false);
      if (!envelope.ok) {
        setError(report(envelope.status, envelope.error, copy.fail));
        return;
      }
      router.push("/freelancer");
      router.refresh();
    } catch {
      setPending(false);
      setError(UX_SEN.http.network);
    }
  }, [copy.confirm, copy.fail, jobId, report, router]);

  return (
    <div className="space-y-2">
      <Button type="button" variant="danger" size="sm" onClick={() => void onCancel()} disabled={pending}>
        {pending ? copy.pending : copy.cta}
      </Button>
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
