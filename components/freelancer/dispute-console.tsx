"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FreelancerContractStatus, FreelancerDisputeRecord } from "@/lib/freelancer/types";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { freelancerDisputeRoundStatusLabel } from "@/lib/copy/status-labels";

export function DisputeConsole({
  contractId,
  dispute,
  isParty,
  contractStatus,
}: {
  contractId: string;
  dispute: FreelancerDisputeRecord | null;
  isParty: boolean;
  contractStatus: FreelancerContractStatus;
}) {
  const router = useRouter();
  const [claim, setClaim] = useState("");
  const [rebuttal, setRebuttal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const copy = FREELANCER_SEN.dispute;

  async function post(action: string, extra: Record<string, unknown> = {}) {
    setPending(action);
    setError(null);
    const response = await fetch("/api/freelancer/dispute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, contractId, disputeId: dispute?.id, ...extra }),
    });
    const payload = (await response.json()) as { ok: boolean; error?: string };
    setPending(null);
    if (!payload.ok) {
      setError(payload.error ?? copy.fail);
      return;
    }
    router.refresh();
  }

  if (!isParty) {
    return null;
  }

  return (
    <Card title={copy.title} eyebrow={copy.eyebrow}>
      {dispute ? (
        <Badge tone="violet" className="mb-3">
          {freelancerDisputeRoundStatusLabel(dispute.roundStatus)}
        </Badge>
      ) : null}

      {!dispute && contractStatus === "FUNDED" ? (
        <div className="grid gap-2">
          <textarea
            className="min-h-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm"
            placeholder={copy.claimPlaceholder}
            value={claim}
            onChange={(event) => setClaim(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={pending !== null || claim.trim().length < 8}
            onClick={() => void post("open", { partyAClaim: claim })}
          >
            {pending === "open" ? copy.opening : copy.openCta}
          </Button>
        </div>
      ) : null}

      {!dispute && contractStatus !== "FUNDED" ? <p className="text-sm">{copy.closed}</p> : null}

      {dispute?.roundStatus === "ROUND_ONE_SUBMITTED" ? (
        <div className="grid gap-2">
          <p className="text-sm text-[var(--foreground)]">
            {copy.roundOneClaim}: {dispute.partyAClaim}
          </p>
          <textarea
            className="min-h-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm"
            placeholder={copy.rebutPlaceholder}
            value={rebuttal}
            onChange={(event) => setRebuttal(event.target.value)}
          />
          <Button
            type="button"
            disabled={pending !== null || rebuttal.trim().length < 8}
            onClick={() => void post("rebut", { partyBRebuttal: rebuttal })}
          >
            {pending === "rebut" ? copy.rebutting : copy.rebutCta}
          </Button>
        </div>
      ) : null}

      {dispute?.roundStatus === "ROUND_TWO_SUBMITTED" ? (
        <p className="text-sm">{copy.reportPending}</p>
      ) : null}

      {dispute?.roundStatus === "AI_REPORT_READY" ? (
        <div className="grid gap-2">
          <p className="text-sm text-[var(--foreground)]">{dispute.rationale}</p>
          <p className="text-sm">
            {copy.employerRefund}: {dispute.employerRefundBps} bps
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={pending !== null} onClick={() => void post("approve")}>
              {pending === "approve" ? copy.approving : copy.approve}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={pending !== null}
              onClick={() => void post("reject")}
            >
              {pending === "reject" ? copy.rejecting : copy.reject}
            </Button>
          </div>
        </div>
      ) : null}

      {dispute?.roundStatus === "HUMAN_REVIEW" ? <p className="text-sm">{copy.humanReview}</p> : null}

      {dispute?.roundStatus === "SETTLED" ? (
        <p className="text-sm">
          {copy.settled}: {dispute.employerRefundBps} bps.
        </p>
      ) : null}

      {error ? (
        <p aria-live="assertive" className="mt-2 text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
