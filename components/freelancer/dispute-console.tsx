"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FreelancerContractStatus, FreelancerDisputeRecord } from "@/lib/freelancer/types";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { freelancerDisputeRoundStatusLabel } from "@/lib/copy/status-labels";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

/** Six bilateral sub-steps across two arbitration rounds. */
type TrackStep =
  | "r1_claim"
  | "r1_answer"
  | "r1_ai"
  | "r2_claim"
  | "r2_answer"
  | "r2_ai";

const TRACK_ORDER: TrackStep[] = [
  "r1_claim",
  "r1_answer",
  "r1_ai",
  "r2_claim",
  "r2_answer",
  "r2_ai",
];

function activeTrackStep(dispute: FreelancerDisputeRecord | null): TrackStep {
  if (!dispute) return "r1_claim";
  switch (dispute.roundStatus) {
    case "ROUND_ONE_OPEN":
      return "r1_claim";
    case "ROUND_ONE_SUBMITTED":
      return "r1_answer";
    case "ROUND_TWO_SUBMITTED":
      return "r1_ai";
    case "AI_REPORT_READY":
      return "r1_ai";
    case "HUMAN_REVIEW":
      return "r2_ai";
    case "SETTLED":
      return "r2_ai";
    default:
      return "r1_claim";
  }
}

function DisputeRoundTrack({
  active,
  settled,
}: {
  active: TrackStep;
  settled: boolean;
}) {
  const labels = FREELANCER_SEN.dispute.roundLabels;
  const activeIndex = TRACK_ORDER.indexOf(active);
  const rounds = [
    {
      title: labels.roundOne,
      steps: [
        { key: "r1_claim" as const, label: labels.claim },
        { key: "r1_answer" as const, label: labels.answer },
        { key: "r1_ai" as const, label: labels.aiRoundOne },
      ],
    },
    {
      title: labels.roundTwo,
      steps: [
        { key: "r2_claim" as const, label: labels.appealClaim },
        { key: "r2_answer" as const, label: labels.appealAnswer },
        { key: "r2_ai" as const, label: labels.aiFinal },
      ],
    },
  ] as const;

  return (
    <div className="mb-4 grid gap-3">
      {rounds.map((round) => (
        <div key={round.title}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {round.title}
          </p>
          <ol className="grid gap-2 sm:grid-cols-3">
            {round.steps.map((step, index) => {
              const stepIndex = TRACK_ORDER.indexOf(step.key);
              const done = settled || activeIndex > stepIndex;
              const current = !settled && active === step.key;
              return (
                <li
                  key={step.key}
                  className={`rounded-2xl border px-3 py-2 ${
                    current
                      ? "border-[var(--violet)] bg-[var(--violet-soft)]"
                      : done
                        ? "border-[var(--emerald)]/40 bg-[var(--emerald-soft)]"
                        : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    {index + 1}
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground)]">{step.label}</p>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

function PartyStatement({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[var(--foreground)]">{body}</p>
    </div>
  );
}

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
  const track = activeTrackStep(dispute);
  const settled = dispute?.roundStatus === "SETTLED";

  async function post(action: string, extra: Record<string, unknown> = {}) {
    setPending(action);
    setError(null);
    const response = await fetch(
      "/api/freelancer/dispute",
      withRailApiVersion({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, contractId, disputeId: dispute?.id, ...extra }),
      }),
    );
    const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
    setPending(null);
    if (!parsed.ok) {
      setError(parsed.error ?? copy.fail);
      return;
    }
    router.refresh();
  }

  if (!isParty) {
    return null;
  }

  const showRoundOneExchange =
    dispute &&
    (dispute.roundStatus === "ROUND_ONE_SUBMITTED" ||
      dispute.roundStatus === "ROUND_TWO_SUBMITTED" ||
      dispute.roundStatus === "AI_REPORT_READY" ||
      dispute.roundStatus === "HUMAN_REVIEW" ||
      dispute.roundStatus === "SETTLED");

  return (
    <Card title={copy.title} eyebrow={copy.eyebrow} variant="featured">
      <p className="mb-3 text-sm text-[var(--foreground)]">{copy.lead}</p>
      <DisputeRoundTrack active={track} settled={settled} />

      {dispute ? (
        <Badge tone="violet" className="mb-3">
          {freelancerDisputeRoundStatusLabel(dispute.roundStatus)}
        </Badge>
      ) : null}

      {!dispute && contractStatus === "FUNDED" ? (
        <div className="grid gap-2">
          <textarea
            className="min-h-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-base"
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

      {!dispute && contractStatus !== "FUNDED" && contractStatus !== "DISPUTED" ? (
        <p className="text-sm">{copy.closed}</p>
      ) : null}

      {showRoundOneExchange ? (
        <div className="mb-3 grid gap-2">
          <PartyStatement label={copy.roundOneClaim} body={dispute.partyAClaim} />
          {dispute.partyBRebuttal ? (
            <PartyStatement label={copy.roundOneAnswer} body={dispute.partyBRebuttal} />
          ) : null}
        </div>
      ) : null}

      {dispute?.roundStatus === "ROUND_ONE_SUBMITTED" ? (
        <div className="grid gap-2">
          <textarea
            className="min-h-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-base"
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
        <p className="text-sm text-[var(--foreground)]">{copy.reportPending}</p>
      ) : null}

      {dispute?.roundStatus === "AI_REPORT_READY" ? (
        <div className="grid gap-3">
          <div className="rounded-2xl border border-[var(--violet)]/30 bg-[var(--violet-soft)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--violet)]">
              {copy.reportTitle}
            </p>
            <p className="mt-2 text-sm text-[var(--foreground)]">{dispute.rationale}</p>
            <p className="mt-2 text-xs text-slate-600">{copy.reportHint}</p>
            <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
              {copy.employerRefund}:{" "}
              {dispute.employerRefundBps != null
                ? `%${(dispute.employerRefundBps / 100).toFixed(1)}`
                : "—"}
            </p>
          </div>
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

      {dispute?.roundStatus === "HUMAN_REVIEW" ? (
        <div className="grid gap-2">
          {dispute.rationale ? (
            <div className="rounded-2xl border border-[var(--violet)]/30 bg-[var(--violet-soft)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--violet)]">
                {copy.finalReportTitle}
              </p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{dispute.rationale}</p>
            </div>
          ) : null}
          <p className="text-sm text-[var(--foreground)]">{copy.humanReview}</p>
        </div>
      ) : null}

      {dispute?.roundStatus === "SETTLED" ? (
        <p className="text-sm text-[var(--foreground)]">
          {copy.settled}:{" "}
          {dispute.employerRefundBps != null
            ? `%${(dispute.employerRefundBps / 100).toFixed(1)}`
            : "—"}
          .
        </p>
      ) : null}

      {error ? (
        <p aria-live="assertive" className="mt-2 text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}

      <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs leading-5 text-[var(--muted)]">
        {copy.legalNote}
      </p>
    </Card>
  );
}
