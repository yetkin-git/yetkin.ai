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
import { freelancerMessageKindLabel } from "@/lib/copy/status-labels";
import { formatMinor } from "@/lib/kernel/money/format";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { isPaymentsUnconfiguredError } from "@/lib/kernel/payments/payments-unconfigured";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

export type DeliveryHeroPayload = {
  body: string;
  artifactUrl: string | null;
  createdAt: string;
};

export function DeliveryHeroCard({
  contractId,
  isClient,
  delivery,
  grossMinor,
  holdMinor,
  netMinor,
  currencyCode,
  holdPercent,
  revisionRemaining = 3,
}: {
  contractId: string;
  isClient: boolean;
  delivery: DeliveryHeroPayload;
  grossMinor: number;
  holdMinor: number;
  netMinor: number;
  currencyCode: CurrencyCode;
  holdPercent: number;
  revisionRemaining?: number;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const report = useCitizenWriteFeedback();
  const idempotency = useIdempotencyKey();
  const copy = UX_SEN.delivery;
  const [error, setError] = useState<string | null>(null);
  const [paymentsClosed, setPaymentsClosed] = useState(false);
  const [pending, setPending] = useState<"release" | "revision" | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const netLabel = formatMinor(netMinor, currencyCode);

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

  async function onRevision() {
    const note = revisionNote.trim() || copy.revisionDefault;
    setPending("revision");
    setError(null);
    try {
      const response = await fetch(
        `/api/freelancer/contracts/${contractId}/messages`,
        withRailApiVersion({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "REVISION", body: note }),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      setPending(null);
      if (!envelope.ok) {
        setError(report(envelope.status, envelope.error, copy.fail));
        return;
      }
      setRevisionNote("");
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

  const stats = FREELANCER_SEN.stats;

  return (
    <Card
      variant="featured"
      className="delivery-hero-glow"
      eyebrow={copy.eyebrow}
      title={copy.title}
      action={<Badge tone="emerald">{freelancerMessageKindLabel("DELIVERY")}</Badge>}
      bodyClassName="text-[var(--foreground)]"
    >
      <div className="space-y-4">
        <ul className="flex flex-wrap gap-1.5" aria-label={stats.barLabel}>
          <li title={stats.escrowHint}>
            <Badge tone="safir" className="normal-case tracking-tight">
              {stats.escrowInline}
            </Badge>
          </li>
          <li title={stats.pathHint}>
            <Badge tone="emerald" className="normal-case tracking-tight">
              {stats.pathInline}
            </Badge>
          </li>
          <li title={stats.revisionHint}>
            <Badge tone="neutral" className="normal-case tracking-tight">
              {stats.revisionInline}
            </Badge>
          </li>
        </ul>
        <p className="text-xs text-[var(--muted)]">
          {new Date(delivery.createdAt).toLocaleString("tr-TR")}
        </p>
        {delivery.artifactUrl ? (
          <a
            className="inline-flex text-sm font-semibold text-[var(--safir-deep)] hover:underline"
            href={delivery.artifactUrl}
            rel="noreferrer"
            target="_blank"
          >
            {copy.inspect}
          </a>
        ) : (
          <p className="text-sm text-[var(--muted)]">{copy.noArtifact}</p>
        )}
        <p className="whitespace-pre-wrap text-sm leading-6">{delivery.body}</p>
        <p className="text-sm text-[var(--amber)]">{copy.freezeBanner}</p>
        <dl className="grid gap-2 rounded-xl border border-[var(--emerald)]/25 bg-[var(--emerald-soft)] p-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt>{copy.gross}</dt>
            <dd className="tabular-nums font-semibold">{formatMinor(grossMinor, currencyCode)}</dd>
          </div>
          <div className="flex justify-between gap-3 text-[var(--muted)]">
            <dt>{copy.platform(holdPercent)}</dt>
            <dd className="tabular-nums">{formatMinor(holdMinor, currencyCode)}</dd>
          </div>
          <div className="flex justify-between gap-3 text-[var(--emerald)]">
            <dt>{copy.net}</dt>
            <dd className="tabular-nums font-semibold">{netLabel}</dd>
          </div>
        </dl>
        {isClient ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={pending !== null} onClick={() => void onRelease()}>
                {pending === "release" ? copy.releasing : copy.releaseFrozen(netLabel)}
              </Button>
              {revisionRemaining > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending !== null}
                  onClick={() => void onRevision()}
                >
                  {pending === "revision" ? copy.revisionPending : copy.revision}
                </Button>
              ) : (
                <p className="w-full text-sm text-[var(--amber)]">{copy.revisionExhausted}</p>
              )}
            </div>
            {revisionRemaining > 0 ? (
              <textarea
                className="min-h-20 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-base"
                placeholder={copy.revisionPlaceholder}
                value={revisionNote}
                onChange={(event) => setRevisionNote(event.target.value)}
              />
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">{copy.freelancerWait}</p>
        )}
        {paymentsClosed ? (
          <div className="rounded-2xl border border-[var(--amber)]/40 bg-[color-mix(in_srgb,var(--amber)_8%,var(--surface))] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {FREELANCER_SEN.accept.paymentsClosed}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{FREELANCER_SEN.accept.paymentsClosedBody}</p>
          </div>
        ) : null}
        {error && !paymentsClosed ? (
          <p aria-live="assertive" className="text-sm text-[var(--rose)]">
            {error}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
