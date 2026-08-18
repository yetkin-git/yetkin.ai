"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { QuickTopUpModal } from "@/components/kernel/quick-top-up-modal";
import { useActionBridge } from "@/components/ui/action-bridge";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { formatMinor } from "@/lib/kernel/money/format";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
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
  const { push } = useActionBridge();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const idempotency = useIdempotencyKey();
  const copy = FREELANCER_SEN;
  const amount = formatMinor(amountMinor, currencyCode);

  const onAccept = useCallback(async () => {
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
      const message = body.error ?? copy.accept.fail;
      setError(message);
      if (isInsufficientBalanceError(message)) {
        setTopUpOpen(true);
      }
      return;
    }
    push({
      title: UX_SEN.bridge.bidAccepted.title,
      body: UX_SEN.bridge.bidAccepted.body,
      href: `/freelancer/contracts/${body.contract.id}`,
      cta: UX_SEN.bridge.bidAccepted.cta,
      tone: "emerald",
    });
    router.push(`/freelancer/contracts/${body.contract.id}`);
    router.refresh();
  }, [bidId, copy.accept.fail, idempotency, jobId, push, router]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--muted)]">{copy.escrow.holdNotice(amount, holdPercent)}</p>
      <Button type="button" onClick={() => void onAccept()} disabled={pending}>
        {pending ? copy.accept.pending : copy.accept.cta}
      </Button>
      {isInsufficientBalanceError(error) ? (
        <Button type="button" variant="outline" size="sm" onClick={() => setTopUpOpen(true)}>
          {UX_SEN.topUp.trigger}
        </Button>
      ) : null}
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
      <QuickTopUpModal
        open={topUpOpen}
        requiredMinor={amountMinor}
        currencyCode={currencyCode}
        onClose={() => setTopUpOpen(false)}
        onFunded={() => {
          setTopUpOpen(false);
          push({ title: UX_SEN.topUp.funded, tone: "emerald" });
          void onAccept();
        }}
      />
    </div>
  );
}
