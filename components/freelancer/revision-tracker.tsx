"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { useActionBridge } from "@/components/ui/action-bridge";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { isPaymentsUnconfiguredError } from "@/lib/kernel/payments/payments-unconfigured";
import {
  DEFAULT_REVISION_ALLOWANCE,
  countRevisionRequests,
  remainingRevisions,
  shouldHighlightReleaseCta,
} from "@/lib/freelancer/revision-tracker";
import type { FreelancerContractMessageRecord } from "@/lib/freelancer/types";

export function RevisionTracker({
  contractId,
  isClient,
  status,
  messages,
  hasDelivery,
  allowance = DEFAULT_REVISION_ALLOWANCE,
}: {
  contractId: string;
  isClient: boolean;
  status: string;
  messages: FreelancerContractMessageRecord[];
  hasDelivery: boolean;
  allowance?: number;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const report = useCitizenWriteFeedback();
  const idempotency = useIdempotencyKey();
  const copy = FREELANCER_SEN.revision;
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [paymentsClosed, setPaymentsClosed] = useState(false);
  const [pending, setPending] = useState<"revision" | "release" | null>(null);

  const used = countRevisionRequests(messages);
  const remaining = remainingRevisions(used, allowance);
  const funded = status === "FUNDED";
  const highlightRelease = shouldHighlightReleaseCta({
    contractStatus: status,
    remaining,
    hasDelivery,
  });
  const canRequestRevision = isClient && funded && remaining > 0 && hasDelivery;

  async function onRevision() {
    const body = note.trim() || copy.defaultNote;
    setPending("revision");
    setError(null);
    try {
      const response = await fetch(
        `/api/freelancer/contracts/${contractId}/messages`,
        withRailApiVersion({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "REVISION", body }),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      setPending(null);
      if (!envelope.ok) {
        setError(report(envelope.status, envelope.error, copy.fail));
        return;
      }
      setNote("");
      push({
        title: UX_SEN.bridge.revisionSent.title,
        body: UX_SEN.bridge.revisionSent.body,
        tone: "amber",
      });
      router.refresh();
    } catch {
      setPending(null);
      setError(UX_SEN.http.network);
    }
  }

  async function onRelease() {
    setPending("release");
    setError(null);
    setPaymentsClosed(false);
    try {
      const response = await fetch(
        `/api/freelancer/contracts/${contractId}/release`,
        withRailApiVersion({
          method: "POST",
          headers: idempotency.headers(),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      setPending(null);
      if (!envelope.ok) {
        const closed =
          envelope.status === 503 && isPaymentsUnconfiguredError(envelope.error);
        setPaymentsClosed(closed);
        setError(
          closed
            ? FREELANCER_SEN.accept.paymentsClosed
            : report(envelope.status, envelope.error, copy.fail),
        );
        return;
      }
      push({
        title: UX_SEN.bridge.released.title,
        body: UX_SEN.bridge.released.body,
        href: `/freelancer/contracts/${contractId}`,
        cta: UX_SEN.bridge.released.cta,
        tone: "emerald",
      });
      router.refresh();
    } catch {
      setPending(null);
      setPaymentsClosed(false);
      setError(UX_SEN.http.network);
    }
  }

  return (
    <Card
      title={copy.title}
      eyebrow={copy.eyebrow}
      action={
        <Badge tone={remaining === 0 ? "amber" : "safir"}>
          {copy.remainingBadge(remaining, allowance)}
        </Badge>
      }
    >
      <p className="mb-3 text-sm text-[var(--foreground)]">{copy.lead(allowance)}</p>
      <dl className="mb-4 grid gap-2 text-sm text-[var(--foreground)]">
        <div className="flex justify-between gap-3">
          <dt>{copy.usedLabel}</dt>
          <dd className="tabular-nums font-semibold">
            {used} / {allowance}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>{copy.remainingLabel}</dt>
          <dd className="tabular-nums font-semibold">{remaining}</dd>
        </div>
      </dl>

      {remaining === 0 && funded ? (
        <p className="mb-3 text-sm text-[var(--amber)]">{copy.exhaustedHint}</p>
      ) : null}

      {isClient && funded ? (
        <div className="space-y-3">
          {canRequestRevision ? (
            <>
              <textarea
                className="min-h-20 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-base"
                placeholder={copy.notePlaceholder}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={pending !== null}
                onClick={() => void onRevision()}
              >
                {pending === "revision" ? copy.requesting : copy.requestCta}
              </Button>
            </>
          ) : null}

          {highlightRelease ? (
            <div
              className={
                remaining === 0 || !canRequestRevision
                  ? "rounded-xl border border-[var(--emerald)]/30 bg-[var(--emerald-soft)] p-3"
                  : undefined
              }
            >
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={pending !== null}
                onClick={() => void onRelease()}
              >
                {pending === "release" ? copy.releasing : copy.releaseCta}
              </Button>
              <p className="mt-2 text-xs text-[var(--muted)]">{copy.releaseHint}</p>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          {funded ? copy.freelancerWait : copy.closed}
        </p>
      )}

      {paymentsClosed ? (
        <div className="mb-3 rounded-2xl border border-[var(--amber)]/40 bg-[color-mix(in_srgb,var(--amber)_8%,var(--surface))] p-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {FREELANCER_SEN.accept.paymentsClosed}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{FREELANCER_SEN.accept.paymentsClosedBody}</p>
        </div>
      ) : null}

      {error && !paymentsClosed ? (
        <p aria-live="assertive" className="mt-3 text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
