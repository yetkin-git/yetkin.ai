"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FreelancerSquadMemberRecord, FreelancerSquadRecord } from "@/lib/freelancer/types";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { freelancerSquadStatusLabel } from "@/lib/copy/status-labels";
import { SHARE_BPS_TOTAL } from "@/lib/kernel/escrow/share-bps";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

const BPS_PER_PERCENT = 100;

function percentToBps(percent: number): number {
  return Math.round(percent * BPS_PER_PERCENT);
}

function bpsToPercent(bps: number): number {
  return Math.round((bps / BPS_PER_PERCENT) * 10) / 10;
}

type DraftMember = { userId: string; sharePercent: number };

export function SquadPanel({
  contractId,
  freelancerId,
  isFreelancer,
  squad,
  members,
}: {
  contractId: string;
  freelancerId: string;
  isFreelancer: boolean;
  squad: FreelancerSquadRecord | null;
  members: FreelancerSquadMemberRecord[];
}) {
  const router = useRouter();
  const copy = FREELANCER_SEN.squad;
  const [partners, setPartners] = useState<DraftMember[]>([{ userId: "", sharePercent: 30 }]);
  const [leadPercent, setLeadPercent] = useState(70);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const partnerTotal = partners.reduce((sum, row) => sum + (Number.isFinite(row.sharePercent) ? row.sharePercent : 0), 0);
  const totalPercent = leadPercent + partnerTotal;
  const canEdit = isFreelancer && (!squad || squad.status === "FORMING" || squad.status === "ACTIVE");

  async function saveSquad() {
    setPending(true);
    setError(null);
    const cleaned = partners
      .map((row) => ({ userId: row.userId.trim(), sharePercent: row.sharePercent }))
      .filter((row) => row.userId.length > 0);
    if (cleaned.length === 0) {
      setPending(false);
      setError(copy.fail);
      return;
    }
    if (Math.round(totalPercent * 10) !== 1000) {
      setPending(false);
      setError(copy.shareFail);
      return;
    }
    const payload = [
      { userId: freelancerId, shareBps: percentToBps(leadPercent) },
      ...cleaned.map((row) => ({ userId: row.userId, shareBps: percentToBps(row.sharePercent) })),
    ];
    const sumBps = payload.reduce((sum, row) => sum + row.shareBps, 0);
    if (sumBps !== SHARE_BPS_TOTAL) {
      payload[0]!.shareBps += SHARE_BPS_TOTAL - sumBps;
    }
    const response = await fetch(
      "/api/freelancer/squad",
      withRailApiVersion({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, members: payload }),
      }),
    );
    const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
    setPending(false);
    if (!parsed.ok) {
      setError(parsed.error ?? copy.fail);
      return;
    }
    router.refresh();
  }

  return (
    <Card title={copy.title} eyebrow={copy.eyebrow} variant="featured">
      <p className="mb-3 text-sm text-[var(--foreground)]">{copy.paytrNote}</p>

      {squad ? (
        <div className="mb-3 space-y-2">
          <Badge tone="safir">
            {copy.status}: {freelancerSquadStatusLabel(squad.status)}
          </Badge>
          <ul className="space-y-1 text-sm text-[var(--foreground)]">
            {members.map((member) => (
              <li key={member.id} className="flex justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-2">
                <span className="truncate font-mono text-xs">{member.userId}</span>
                <span className="shrink-0 font-medium">%{bpsToPercent(member.shareBps)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mb-3 text-sm">{copy.empty}</p>
      )}

      {canEdit ? (
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm text-[var(--foreground)]">
            {copy.leadShare}
            <input
              className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
              type="number"
              min={1}
              max={99}
              step={0.1}
              value={leadPercent}
              onChange={(event) => setLeadPercent(Number(event.target.value))}
            />
          </label>
          {partners.map((row, index) => (
            <div key={index} className="grid gap-2 rounded-2xl border border-[var(--border)] p-3 sm:grid-cols-[1fr_7rem_auto]">
              <input
                className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                placeholder={copy.partnerPlaceholder}
                value={row.userId}
                onChange={(event) => {
                  const next = [...partners];
                  next[index] = { ...row, userId: event.target.value };
                  setPartners(next);
                }}
              />
              <input
                className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                type="number"
                min={1}
                max={99}
                step={0.1}
                aria-label={copy.partnerShare}
                value={row.sharePercent}
                onChange={(event) => {
                  const next = [...partners];
                  next[index] = { ...row, sharePercent: Number(event.target.value) };
                  setPartners(next);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                disabled={partners.length <= 1}
                onClick={() => setPartners(partners.filter((_, i) => i !== index))}
              >
                {copy.removePartner}
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={partners.length >= 11}
              onClick={() => setPartners([...partners, { userId: "", sharePercent: 10 }])}
            >
              {copy.addPartner}
            </Button>
            <p className={`text-sm ${Math.round(totalPercent * 10) === 1000 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>
              {copy.shareTotal}: %{Math.round(totalPercent * 10) / 10}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={pending || partners.every((row) => !row.userId.trim())}
            onClick={() => void saveSquad()}
          >
            {pending ? copy.creating : squad ? copy.update : copy.create}
          </Button>
        </div>
      ) : null}

      {error ? (
        <p aria-live="assertive" className="mt-2 text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
