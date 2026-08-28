"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { useActionBridge } from "@/components/ui/action-bridge";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import {
  getStandaloneSquadsClientSnapshot,
  getStandaloneSquadsServerSnapshot,
  subscribeStandaloneSquads,
  type StandaloneSquadDraft,
  type StandaloneSquadMemberDraft,
} from "@/lib/freelancer/standalone-squad-store";

type PartnerRow = StandaloneSquadMemberDraft;

function buildTeamCoverNote(
  coverNote: string,
  teamName: string | null,
  partners: PartnerRow[],
  leadPercent: number,
): string {
  const roster = partners
    .filter((row) => row.invite.trim())
    .map((row) => {
      const role = row.role.trim() ? ` (${row.role.trim()})` : "";
      return `${row.invite.trim()}${role} %${row.sharePercent}`;
    })
    .join("; ");
  return [
    coverNote.trim(),
    "",
    "[Takım niyeti — kesin paylar sözleşme sonrası]",
    teamName ? `Takım: ${teamName}` : null,
    `Lider %${leadPercent}`,
    roster ? `Üyeler: ${roster}` : "Üye listesi teklif sonrası tamamlanır",
    "Ödeme: PayTR Split → IBAN; yetkin.ai’de ikinci cüzdan yok.",
  ]
    .filter((line): line is string => line != null)
    .join("\n");
}

function applyReadySquad(
  squad: StandaloneSquadDraft,
): { leadPercent: number; partners: PartnerRow[]; teamName: string } {
  return {
    leadPercent: squad.leadSharePercent,
    partners: squad.members.map((row) => ({ ...row })),
    teamName: squad.name,
  };
}

export function BidForm({
  jobId,
  maxMinor,
  visaBlocked = false,
}: {
  jobId: string;
  maxMinor: number;
  visaBlocked?: boolean;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const report = useCitizenWriteFeedback();
  const readySquads = useSyncExternalStore(
    subscribeStandaloneSquads,
    getStandaloneSquadsClientSnapshot,
    getStandaloneSquadsServerSnapshot,
  );
  const [amountMajor, setAmountMajor] = useState(String(maxMinor / 100));
  const [coverNote, setCoverNote] = useState("");
  const [asTeam, setAsTeam] = useState(false);
  const [selectedSquadId, setSelectedSquadId] = useState("");
  const [teamName, setTeamName] = useState<string | null>(null);
  const [leadPercent, setLeadPercent] = useState(70);
  const [partners, setPartners] = useState<PartnerRow[]>([
    { invite: "", role: "", sharePercent: 30 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const idempotency = useIdempotencyKey();
  const copy = FREELANCER_SEN.bid;
  const squadCopy = FREELANCER_SEN.squad;

  if (visaBlocked) {
    return <p>{copy.visaDenied}</p>;
  }

  function onReadyPick(squadId: string) {
    setSelectedSquadId(squadId);
    if (!squadId) {
      setTeamName(null);
      return;
    }
    const squad = readySquads.find((row) => row.id === squadId);
    if (!squad) {
      return;
    }
    const applied = applyReadySquad(squad);
    setLeadPercent(applied.leadPercent);
    setPartners(applied.partners);
    setTeamName(applied.teamName);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const amountMinor = Math.round(Number.parseFloat(amountMajor.replace(",", ".")) * 100);
      const finalCover = asTeam
        ? buildTeamCoverNote(coverNote, teamName, partners, leadPercent)
        : coverNote;
      const response = await fetch(
        `/api/freelancer/jobs/${jobId}/bids`,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
          body: JSON.stringify({ amountMinor, coverNote: finalCover }),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      setPending(false);
      if (!envelope.ok) {
        setError(report(envelope.status, envelope.error, copy.fail));
        return;
      }
      setNotice(copy.received);
      push({ title: UX_SEN.bridge.bidSent.title, body: UX_SEN.bridge.bidSent.body, tone: "safir" });
      router.refresh();
    } catch {
      setPending(false);
      setError(UX_SEN.http.network);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-xs leading-5 text-[var(--muted)]">{copy.freeBidNote}</p>
      <label className="block text-sm">
        {copy.amountLabel}
        <Input value={amountMajor} onChange={(event) => setAmountMajor(event.target.value)} required />
      </label>
      <label className="block text-sm">
        {copy.coverLabel}
        <textarea
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          value={coverNote}
          onChange={(event) => setCoverNote(event.target.value)}
          required
          minLength={4}
          rows={3}
        />
      </label>
      <details className="rounded-xl border border-[var(--border)] p-3">
        <summary className="cursor-pointer text-sm text-[var(--muted)]">
          {squadCopy.bidAsTeamToggle} · {FREELANCER_SEN.accept.paymentsClosed}
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={asTeam ? "outline" : "primary"}
            onClick={() => setAsTeam(false)}
          >
            {squadCopy.bidAsTeamSolo}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={asTeam ? "primary" : "outline"}
            onClick={() => setAsTeam(true)}
          >
            {squadCopy.bidAsTeamToggle}
          </Button>
        </div>
      {asTeam ? (
        <Card title={squadCopy.bidAsTeamTitle} eyebrow={squadCopy.eyebrow} className="!p-4">
          <p className="mb-3 text-sm text-[var(--foreground)]">{squadCopy.bidAsTeamBody}</p>
          <p className="mb-3 text-xs leading-5 text-[var(--muted)]">{squadCopy.honestyNote}</p>

          <label className="mb-3 block text-sm">
            {squadCopy.readyPickLabel}
            <select
              className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
              value={selectedSquadId}
              onChange={(event) => onReadyPick(event.target.value)}
            >
              <option value="">{squadCopy.readyPickManual}</option>
              {readySquads.map((squad) => (
                <option key={squad.id} value={squad.id}>
                  {squad.name} · lider %{squad.leadSharePercent} · {squad.members.length} üye
                </option>
              ))}
            </select>
          </label>
          {readySquads.length === 0 ? (
            <p className="mb-3 text-xs text-[var(--muted)]">{squadCopy.readyPickEmpty}</p>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-sm">
              {squadCopy.leadShare}
              <Input
                type="number"
                min={1}
                max={99}
                value={leadPercent}
                onChange={(event) => {
                  setSelectedSquadId("");
                  setTeamName(null);
                  setLeadPercent(Number(event.target.value));
                }}
              />
            </label>
          </div>

          {partners.map((row, index) => (
            <div
              key={index}
              className="mt-2 grid gap-2 rounded-2xl border border-[var(--border)] p-3 sm:grid-cols-[1fr_1fr_5.5rem]"
            >
              <Input
                placeholder={squadCopy.partnerInvitePlaceholder}
                value={row.invite}
                onChange={(event) => {
                  setSelectedSquadId("");
                  setTeamName(null);
                  const next = [...partners];
                  next[index] = { ...row, invite: event.target.value };
                  setPartners(next);
                }}
              />
              <Input
                placeholder={squadCopy.partnerRolePlaceholder}
                value={row.role}
                onChange={(event) => {
                  setSelectedSquadId("");
                  setTeamName(null);
                  const next = [...partners];
                  next[index] = { ...row, role: event.target.value };
                  setPartners(next);
                }}
              />
              <Input
                type="number"
                min={1}
                max={99}
                aria-label={squadCopy.partnerShare}
                value={row.sharePercent}
                onChange={(event) => {
                  setSelectedSquadId("");
                  setTeamName(null);
                  const next = [...partners];
                  next[index] = { ...row, sharePercent: Number(event.target.value) };
                  setPartners(next);
                }}
              />
            </div>
          ))}

          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={partners.length >= 11}
              onClick={() => {
                setSelectedSquadId("");
                setTeamName(null);
                setPartners([...partners, { invite: "", role: "", sharePercent: 10 }]);
              }}
            >
              {squadCopy.addPartner}
            </Button>
            {partners.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSquadId("");
                  setTeamName(null);
                  setPartners(partners.slice(0, -1));
                }}
              >
                {squadCopy.removePartner}
              </Button>
            ) : null}
          </div>

          <p className="mt-2 text-xs text-[var(--muted)]">{squadCopy.paytrNote}</p>
        </Card>
      ) : null}
      </details>
      {notice ? (
        <p aria-live="polite" className="text-sm text-[var(--emerald)]">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? copy.pending : asTeam ? squadCopy.bidAsTeamTitle : copy.submit}
      </Button>
    </form>
  );
}
