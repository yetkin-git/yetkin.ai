"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { useActionBridge } from "@/components/ui/action-bridge";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { formatMinor } from "@/lib/kernel/money/format";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import { isPaymentsUnconfiguredError } from "@/lib/kernel/payments/payments-unconfigured";

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
  const report = useCitizenWriteFeedback();
  const [error, setError] = useState<string | null>(null);
  const [paymentsClosed, setPaymentsClosed] = useState(false);
  const [pending, setPending] = useState(false);
  const idempotency = useIdempotencyKey();
  const copy = FREELANCER_SEN;
  const amount = formatMinor(amountMinor, currencyCode);

  const onAccept = useCallback(async () => {
    setPending(true);
    setError(null);
    setPaymentsClosed(false);
    try {
      const response = await fetch(
        `/api/freelancer/jobs/${jobId}/accept`,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
          body: JSON.stringify({ bidId }),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      const contract = envelope.body.contract;
      const contractId =
        contract && typeof contract === "object" && "id" in contract && typeof contract.id === "string"
          ? contract.id
          : null;
      setPending(false);
      if (!envelope.ok || !contractId) {
        const message = report(envelope.status, envelope.error, copy.accept.fail);
        const closed =
          envelope.status === 503 &&
          (isPaymentsUnconfiguredError(envelope.error) || isPaymentsUnconfiguredError(message));
        setPaymentsClosed(closed);
        setError(closed ? copy.accept.paymentsClosed : message);
        if (closed) {
          push({
            title: copy.accept.paymentsClosed,
            body: copy.accept.paymentsClosedBody,
            tone: "amber",
          });
        }
        return;
      }
      push({
        title: UX_SEN.bridge.bidAccepted.title,
        body: UX_SEN.bridge.bidAccepted.body,
        href: `/freelancer/contracts/${contractId}`,
        cta: UX_SEN.bridge.bidAccepted.cta,
        tone: "emerald",
      });
      router.push(`/freelancer/contracts/${contractId}`);
      router.refresh();
    } catch {
      setPending(false);
      setPaymentsClosed(false);
      setError(UX_SEN.http.network);
    }
  }, [bidId, copy.accept, idempotency, jobId, push, report, router]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-600">{copy.escrow.holdNotice(amount, holdPercent)}</p>
      {paymentsClosed ? (
        <div className="rounded-2xl border border-[var(--amber)]/40 bg-[color-mix(in_srgb,var(--amber)_8%,var(--surface))] p-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">{copy.accept.paymentsClosed}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{copy.accept.paymentsClosedBody}</p>
        </div>
      ) : null}
      <Button type="button" onClick={() => void onAccept()} disabled={pending}>
        {pending ? copy.accept.pending : copy.accept.cta}
      </Button>
      {pending ? (
        <p aria-live="polite" className="text-xs text-[var(--muted)]">
          {copy.escrow.pendingLive}
        </p>
      ) : null}
      {error && !paymentsClosed ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
