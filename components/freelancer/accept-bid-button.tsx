"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { formatMinor } from "@/lib/kernel/money/format";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

export function AcceptBidButton({
  jobId,
  bidId,
  amountMinor,
  currencyCode,
  holdPercent,
}: {
  jobId: string;
  bidId: string;
  amountMinor: number;
  currencyCode: CurrencyCode;
  holdPercent: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const idempotency = useIdempotencyKey();
  const copy = FREELANCER_SEN;
  const amount = formatMinor(amountMinor, currencyCode);

  async function onAccept() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/freelancer/jobs/${jobId}/accept`, {
      method: "POST",
      headers: { "content-type": "application/json", ...idempotency.headers() },
      body: JSON.stringify({ bidId }),
    });
    const body = (await response.json()) as {
      ok: boolean;
      error?: string;
      contract?: { id: string };
    };
    setPending(false);
    if (!body.ok || !body.contract) {
      setError(body.error ?? copy.accept.fail);
      return;
    }
    router.push(`/freelancer/contracts/${body.contract.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--muted)]">{copy.escrow.holdNotice(amount, holdPercent)}</p>
      <Button type="button" onClick={onAccept} disabled={pending}>
        {pending ? copy.accept.pending : copy.accept.cta}
      </Button>
      {pending ? (
        <p aria-live="polite" className="text-xs text-[var(--muted)]">
          {copy.escrow.pendingLive}
        </p>
      ) : null}
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
