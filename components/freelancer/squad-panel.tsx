"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FreelancerSquadMemberRecord, FreelancerSquadRecord } from "@/lib/freelancer/types";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { freelancerSquadStatusLabel } from "@/lib/copy/status-labels";

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
  const [partnerId, setPartnerId] = useState("");
  const [leadBps, setLeadBps] = useState(7000);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const copy = FREELANCER_SEN.squad;

  async function createTwoPersonSquad() {
    setPending(true);
    setError(null);
    const partner = partnerId.trim();
    const response = await fetch("/api/freelancer/squad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractId,
        members: [
          { userId: freelancerId, shareBps: leadBps },
          { userId: partner, shareBps: 10_000 - leadBps },
        ],
      }),
    });
    const payload = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!payload.ok) {
      setError(payload.error ?? copy.fail);
      return;
    }
    router.refresh();
  }

  return (
    <Card title={copy.title} eyebrow={copy.eyebrow}>
      {squad ? (
        <ul className="space-y-1 text-sm text-[var(--foreground)]">
          <li>
            {copy.status}: {freelancerSquadStatusLabel(squad.status)}
          </li>
          {members.map((member) => (
            <li key={member.id}>
              {member.userId} · {member.shareBps} bps
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm">{copy.empty}</p>
      )}
      {isFreelancer && (!squad || squad.status === "FORMING") ? (
        <div className="mt-3 grid gap-2">
          <input
            className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
            placeholder={copy.partnerPlaceholder}
            value={partnerId}
            onChange={(event) => setPartnerId(event.target.value)}
          />
          <input
            className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
            type="number"
            min={1}
            max={9999}
            value={leadBps}
            onChange={(event) => setLeadBps(Number(event.target.value))}
          />
          <Button
            type="button"
            variant="outline"
            disabled={pending || !partnerId.trim()}
            onClick={() => void createTwoPersonSquad()}
          >
            {pending ? copy.creating : copy.create}
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
