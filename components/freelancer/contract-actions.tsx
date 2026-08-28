"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { useActionBridge } from "@/components/ui/action-bridge";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { isPaymentsUnconfiguredError } from "@/lib/kernel/payments/payments-unconfigured";

export function ContractActions({
  contractId,
  isClient,
  status,
  showRelease = true,
}: {
  contractId: string;
  isClient: boolean;
  status: string;
  showRelease?: boolean;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const report = useCitizenWriteFeedback();
  const [error, setError] = useState<string | null>(null);
  const [paymentsClosed, setPaymentsClosed] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const idempotency = useIdempotencyKey();
  const copy = FREELANCER_SEN.actions;
  const acceptCopy = FREELANCER_SEN.accept;

  async function post(path: string, action: string) {
    setPending(action);
    setError(null);
    setPaymentsClosed(false);
    try {
      const response = await fetch(
        path,
        withRailApiVersion({
          method: "POST",
          headers: idempotency.headers(),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      setPending(null);
      if (!envelope.ok) {
        const closed = envelope.status === 503 && isPaymentsUnconfiguredError(envelope.error);
        setPaymentsClosed(closed);
        setError(
          closed ? acceptCopy.paymentsClosed : report(envelope.status, envelope.error, copy.fail),
        );
        return;
      }
      if (action === "release") {
        push({
          title: UX_SEN.bridge.released.title,
          body: UX_SEN.bridge.released.body,
          href: `/freelancer/contracts/${contractId}`,
          cta: UX_SEN.bridge.released.cta,
          tone: "emerald",
        });
      }
      router.refresh();
    } catch {
      setPending(null);
      setPaymentsClosed(false);
      setError(UX_SEN.http.network);
    }
  }

  const actionable = status === "FUNDED";

  return (
    <div className="flex flex-wrap gap-2">
      {actionable ? (
        <p className="w-full text-sm text-[var(--muted)]">{copy.fundedHint}</p>
      ) : null}
      {actionable ? (
        <p className="w-full text-sm text-[var(--amber)]">{copy.freezeBanner}</p>
      ) : null}
      {paymentsClosed ? (
        <div className="w-full rounded-2xl border border-[var(--amber)]/40 bg-[color-mix(in_srgb,var(--amber)_8%,var(--surface))] p-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">{acceptCopy.paymentsClosed}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{acceptCopy.paymentsClosedBody}</p>
        </div>
      ) : null}
      {isClient && actionable && showRelease ? (
        <Button
          type="button"
          disabled={pending !== null}
          onClick={() => post(`/api/freelancer/contracts/${contractId}/release`, "release")}
        >
          {pending === "release" ? copy.releasing : copy.release}
        </Button>
      ) : null}
      {actionable ? (
        <Button
          type="button"
          variant="ghost"
          disabled={pending !== null}
          onClick={() => post(`/api/freelancer/contracts/${contractId}/refund`, "refund")}
        >
          {pending === "refund" ? copy.refunding : copy.refund}
        </Button>
      ) : null}
      {error && !paymentsClosed ? (
        <p aria-live="assertive" className="w-full text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
