"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { formatMinor } from "@/lib/kernel/money/format";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { ACADEMY_LEVEL_PATHWAYS } from "@/lib/academy/level-pathway";
import type { FreelancerJobRecord } from "@/lib/freelancer/types";
import { isPaymentsUnconfiguredError } from "@/lib/kernel/payments/payments-unconfigured";

function DirectOfferActions({ jobId }: { jobId: string }) {
  const copy = FREELANCER_SEN.directOffer;
  const router = useRouter();
  const report = useCitizenWriteFeedback();
  const idempotency = useIdempotencyKey();
  const [pending, setPending] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onAccept() {
    setPending("accept");
    setError(null);
    try {
      const response = await fetch(
        `/api/freelancer/direct-offers/${jobId}/accept`,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
          body: JSON.stringify({}),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      setPending(null);
      if (!envelope.ok) {
        if (isPaymentsUnconfiguredError(envelope.error)) {
          setError(FREELANCER_SEN.accept.paymentsClosedBody);
          return;
        }
        setError(report(envelope.status, envelope.error, copy.acceptFail));
        return;
      }
      const contract = envelope.body.contract;
      const contractId =
        contract && typeof contract === "object" && "id" in contract && typeof contract.id === "string"
          ? contract.id
          : null;
      if (contractId) {
        router.push(`/freelancer/contracts/${contractId}`);
      }
      router.refresh();
    } catch {
      setPending(null);
      setError(UX_SEN.http.network);
    }
  }

  async function onDecline() {
    setPending("decline");
    setError(null);
    try {
      const response = await fetch(
        `/api/freelancer/direct-offers/${jobId}/decline`,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
          body: JSON.stringify({}),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      setPending(null);
      if (!envelope.ok) {
        setError(report(envelope.status, envelope.error, copy.declineFail));
        return;
      }
      router.refresh();
    } catch {
      setPending(null);
      setError(UX_SEN.http.network);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void onAccept()} disabled={pending !== null}>
          {pending === "accept" ? copy.accepting : copy.acceptCta}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => void onDecline()}
          disabled={pending !== null}
        >
          {pending === "decline" ? copy.declining : copy.declineCta}
        </Button>
      </div>
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Davetli ustanın tezgâhındaki Özel İş Teklifleri — açık ilanların altında minimal bildirim şeridi. */
export function DirectOfferInbox({ offers }: { offers: FreelancerJobRecord[] }) {
  const copy = FREELANCER_SEN.directOffer;
  const stats = FREELANCER_SEN.stats;

  return (
    <section
      className="space-y-2 rounded-2xl border border-[var(--safir)]/20 bg-[var(--safir-soft)]/40 px-4 py-3"
      aria-label={copy.inboxTitle}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
          {copy.inboxTitle}
        </h2>
        {offers.length > 0 ? (
          <Badge tone="gold" className="normal-case tracking-tight">
            {offers.length}
          </Badge>
        ) : null}
      </div>

      {offers.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{copy.inboxEmpty}</p>
      ) : (
        <ul className="space-y-3">
          {offers.map((offer) => {
            const pathway = ACADEMY_LEVEL_PATHWAYS.find((row) => row.id === offer.visaPathwayId);
            return (
              <li key={offer.id}>
                <Card variant="default" className="space-y-3 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="gold" className="normal-case tracking-tight">
                      {copy.eyebrow}
                    </Badge>
                    {pathway ? (
                      <Badge tone="safir" className="normal-case tracking-tight">
                        {pathway.title}
                      </Badge>
                    ) : null}
                    {offer.dueDays != null ? (
                      <Badge tone="neutral" className="normal-case tracking-tight">
                        {copy.inboxDue(offer.dueDays)}
                      </Badge>
                    ) : null}
                    <span title={stats.escrowHint}>
                      <Badge tone="emerald" className="normal-case tracking-tight">
                        {stats.escrowInline}
                      </Badge>
                    </span>
                    <span title={stats.revisionHint}>
                      <Badge tone="safir" className="normal-case tracking-tight">
                        {stats.revisionInline}
                      </Badge>
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{offer.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{offer.brief}</p>
                    <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                      {formatMinor(offer.budgetMinor, offer.currencyCode)}
                    </p>
                  </div>
                  <p className="rounded-xl border border-[var(--amber)]/25 bg-[var(--amber-soft)] p-3 text-xs leading-5 text-[var(--foreground)]">
                    {copy.holdWarning}
                  </p>
                  <DirectOfferActions jobId={offer.id} />
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
