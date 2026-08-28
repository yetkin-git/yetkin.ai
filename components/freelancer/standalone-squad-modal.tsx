"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconClose } from "@/components/ui/icons";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import {
  mintStandaloneSquadId,
  upsertStandaloneSquad,
  type StandaloneSquadMemberDraft,
} from "@/lib/freelancer/standalone-squad-store";

type DraftMember = StandaloneSquadMemberDraft;

export function StandaloneSquadModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const copy = FREELANCER_SEN.squad;
  const titleId = useId();
  const [name, setName] = useState("");
  const [leadPercent, setLeadPercent] = useState(70);
  const [partners, setPartners] = useState<DraftMember[]>([
    { invite: "", role: "", sharePercent: 30 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!open) {
    return null;
  }

  const partnerTotal = partners.reduce(
    (sum, row) => sum + (Number.isFinite(row.sharePercent) ? row.sharePercent : 0),
    0,
  );
  const totalPercent = leadPercent + partnerTotal;
  const totalsOk = Math.round(totalPercent * 10) === 1000;

  function resetForm() {
    setName("");
    setLeadPercent(70);
    setPartners([{ invite: "", role: "", sharePercent: 30 }]);
    setError(null);
    setNotice(null);
    setPending(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function save() {
    setPending(true);
    setError(null);
    setNotice(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setPending(false);
      setError(copy.nameFail);
      return;
    }
    const cleaned = partners
      .map((row) => ({
        invite: row.invite.trim(),
        role: row.role.trim(),
        sharePercent: row.sharePercent,
      }))
      .filter((row) => row.invite.length > 0);
    if (cleaned.length === 0) {
      setPending(false);
      setError(copy.fail);
      return;
    }
    if (!totalsOk) {
      setPending(false);
      setError(copy.shareFail);
      return;
    }
    upsertStandaloneSquad({
      id: mintStandaloneSquadId(),
      name: trimmedName,
      leadSharePercent: leadPercent,
      members: cleaned,
      createdAt: new Date().toISOString(),
    });
    setPending(false);
    setNotice(copy.modalSaved);
    onSaved?.();
    window.setTimeout(() => {
      handleClose();
    }, 600);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[color-mix(in_srgb,var(--surface-ink)_45%,transparent)] p-4 sm:items-center"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[min(90vh,44rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--safir-soft)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">
              {copy.eyebrow}
            </p>
            <h2 id={titleId} className="mt-1 text-base font-semibold text-[var(--foreground)]">
              {copy.modalTitle}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{copy.modalLead}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface-muted)]"
            aria-label={copy.modalClose}
          >
            <IconClose />
          </button>
        </div>

        <p className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs leading-5 text-[var(--foreground)]">
          {copy.honestyNote}
        </p>

        <div className="grid gap-3">
          <label className="grid gap-1 text-sm text-[var(--foreground)]">
            {copy.teamNameLabel}
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={copy.teamNamePlaceholder}
              maxLength={80}
            />
          </label>

          <label className="grid gap-1 text-sm text-[var(--foreground)]">
            {copy.leadShare}
            <Input
              type="number"
              min={1}
              max={99}
              step={0.1}
              value={leadPercent}
              onChange={(event) => setLeadPercent(Number(event.target.value))}
            />
          </label>

          {partners.map((row, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-2xl border border-[var(--border)] p-3 sm:grid-cols-[1fr_1fr_5.5rem_auto]"
            >
              <Input
                placeholder={copy.partnerInvitePlaceholder}
                value={row.invite}
                onChange={(event) => {
                  const next = [...partners];
                  next[index] = { ...row, invite: event.target.value };
                  setPartners(next);
                }}
              />
              <Input
                placeholder={copy.partnerRolePlaceholder}
                value={row.role}
                onChange={(event) => {
                  const next = [...partners];
                  next[index] = { ...row, role: event.target.value };
                  setPartners(next);
                }}
              />
              <Input
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
              onClick={() =>
                setPartners([...partners, { invite: "", role: "", sharePercent: 10 }])
              }
            >
              {copy.addPartner}
            </Button>
            <p
              className={`text-sm ${totalsOk ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}
            >
              {copy.shareTotal}: %{Math.round(totalPercent * 10) / 10}
            </p>
          </div>

          <p className="text-xs text-[var(--muted)]">{copy.paytrNote}</p>

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

          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={pending} onClick={() => save()}>
              {pending ? copy.modalSaving : copy.modalSave}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              {copy.modalClose}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
