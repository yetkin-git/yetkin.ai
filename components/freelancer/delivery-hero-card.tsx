"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { useActionBridge } from "@/components/ui/action-bridge";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { freelancerMessageKindLabel } from "@/lib/copy/status-labels";
import { formatMinor } from "@/lib/kernel/money/format";
import { WALLET_SURFACE_PATH } from "@/lib/kernel/identity/types";
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
}: {
  contractId: string;
  isClient: boolean;
  delivery: DeliveryHeroPayload;
  grossMinor: number;
  holdMinor: number;
  netMinor: number;
  currencyCode: CurrencyCode;
  holdPercent: number;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const idempotency = useIdempotencyKey();
  const copy = UX_SEN.delivery;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"release" | "revision" | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const netLabel = formatMinor(netMinor, currencyCode);

  async function onRelease() {
    setPending("release");
    setError(null);
    const response = await fetch(`/api/freelancer/contracts/${contractId}/release`, {
      method: "POST",
      headers: idempotency.headers(),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(null);
    if (!body.ok) {
      setError(body.error ?? copy.fail);
      return;
    }
    push({
      title: UX_SEN.bridge.released.title,
      body: UX_SEN.bridge.released.body,
      href: WALLET_SURFACE_PATH,
      cta: UX_SEN.bridge.released.cta,
      tone: "emerald",
    });
    router.refresh();
  }

  async function onRevision() {
    const note = revisionNote.trim() || copy.revisionDefault;
    setPending("revision");
    setError(null);
    const response = await fetch(`/api/freelancer/contracts/${contractId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "REVISION", body: note }),
    });
    const payload = (await response.json()) as { ok: boolean; error?: string };
    setPending(null);
    if (!payload.ok) {
      setError(payload.error ?? copy.fail);
      return;
    }
    setRevisionNote("");
    push({
      title: UX_SEN.bridge.revisionSent.title,
      body: UX_SEN.bridge.revisionSent.body,
      tone: "amber",
    });
    router.refresh();
  }

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
                {pending === "release" ? copy.releasing : copy.release(netLabel)}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pending !== null}
                onClick={() => void onRevision()}
              >
                {pending === "revision" ? copy.revisionPending : copy.revision}
              </Button>
            </div>
            <textarea
              className="min-h-20 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm"
              placeholder={copy.revisionPlaceholder}
              value={revisionNote}
              onChange={(event) => setRevisionNote(event.target.value)}
            />
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">{copy.freelancerWait}</p>
        )}
        {error ? (
          <p aria-live="assertive" className="text-sm text-[var(--rose)]">
            {error}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
