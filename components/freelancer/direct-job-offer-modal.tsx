"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IconClose } from "@/components/ui/icons";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { ACADEMY_LEVEL_PATHWAYS, type AcademyPathwayId } from "@/lib/academy/level-pathway";
import { FREELANCER_JOB_MAX_MINOR, FREELANCER_JOB_MIN_MINOR } from "@/lib/freelancer/schemas";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";

export type DirectJobOfferInvitee = {
  /** Biliniyorsa kilitlenir; yoksa modalda girilir. */
  id?: string;
  displayName: string;
  visaPathwayIds: readonly AcademyPathwayId[];
};

export function DirectJobOfferModal({
  open,
  onClose,
  invitee,
  defaultPathwayId,
}: {
  open: boolean;
  onClose: () => void;
  invitee: DirectJobOfferInvitee;
  defaultPathwayId?: AcademyPathwayId;
}) {
  const copy = FREELANCER_SEN.directOffer;
  const titleId = useId();
  const router = useRouter();
  const report = useCitizenWriteFeedback();
  const idempotency = useIdempotencyKey();

  const lockedId = invitee.id?.trim() ?? "";
  const pathwayChoices =
    invitee.visaPathwayIds.length > 0
      ? ACADEMY_LEVEL_PATHWAYS.filter((pathway) => invitee.visaPathwayIds.includes(pathway.id))
      : [...ACADEMY_LEVEL_PATHWAYS];

  const initialPathway =
    defaultPathwayId && pathwayChoices.some((pathway) => pathway.id === defaultPathwayId)
      ? defaultPathwayId
      : (pathwayChoices[0]?.id ?? "");

  const [inviteeId, setInviteeId] = useState(lockedId);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [budgetMajor, setBudgetMajor] = useState("100");
  const [dueDays, setDueDays] = useState("7");
  const [visaPathwayId, setVisaPathwayId] = useState<AcademyPathwayId | "">(initialPathway);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!open) {
    return null;
  }

  function resetForm() {
    setInviteeId(lockedId);
    setTitle("");
    setBrief("");
    setBudgetMajor("100");
    setDueDays("7");
    setVisaPathwayId(initialPathway);
    setError(null);
    setNotice(null);
    setPending(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const targetId = (lockedId || inviteeId).trim();
      const budgetMinor = Math.round(Number.parseFloat(budgetMajor.replace(",", ".")) * 100);
      const due = Number.parseInt(dueDays, 10);
      if (!targetId || !visaPathwayId) {
        setPending(false);
        setError(copy.fail);
        return;
      }
      if (
        !Number.isFinite(budgetMinor) ||
        budgetMinor < FREELANCER_JOB_MIN_MINOR ||
        budgetMinor > FREELANCER_JOB_MAX_MINOR ||
        !Number.isFinite(due) ||
        due < 1 ||
        due > 90
      ) {
        setPending(false);
        setError(copy.fail);
        return;
      }

      const response = await fetch(
        "/api/freelancer/direct-offers",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
          body: JSON.stringify({
            title,
            brief,
            budgetMinor,
            visaPathwayId,
            inviteeId: targetId,
            dueDays: due,
          }),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      setPending(false);
      if (!envelope.ok) {
        setError(report(envelope.status, envelope.error, copy.fail));
        return;
      }
      setNotice(copy.sent);
      router.refresh();
      window.setTimeout(() => {
        handleClose();
      }, 700);
    } catch {
      setPending(false);
      setError(UX_SEN.http.network);
    }
  }

  const badgeIds =
    invitee.visaPathwayIds.length > 0
      ? invitee.visaPathwayIds
      : pathwayChoices.map((pathway) => pathway.id);

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
              {copy.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{copy.modalLead}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface-muted)]"
            aria-label={copy.close}
          >
            <IconClose />
          </button>
        </div>

        <p className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs leading-5 text-[var(--foreground)]">
          {copy.honestyNote}
        </p>

        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-[var(--foreground)]">
            {copy.inviteeLabel}: {invitee.displayName}
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {copy.visaBadgesLabel}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {badgeIds.map((id) => {
              const pathway = ACADEMY_LEVEL_PATHWAYS.find((row) => row.id === id);
              return (
                <li key={id}>
                  <Badge tone="safir" className="normal-case tracking-tight">
                    {pathway?.title ?? id}
                  </Badge>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-[var(--muted)]">{copy.visaOk}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {!lockedId ? (
            <label className="block text-sm">
              {copy.inviteeIdLabel}
              <Input
                value={inviteeId}
                onChange={(event) => setInviteeId(event.target.value)}
                placeholder={copy.inviteeIdPlaceholder}
                required
                minLength={1}
              />
              <span className="mt-1 block text-xs text-[var(--muted)]">{copy.inviteeIdHint}</span>
            </label>
          ) : null}
          <label className="block text-sm">
            {copy.titleLabel}
            <Input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} />
          </label>
          <label className="block text-sm">
            {copy.briefLabel}
            <textarea
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              required
              minLength={8}
              rows={4}
            />
          </label>
          <label className="block text-sm">
            {copy.pathwayLabel}
            <select
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              value={visaPathwayId}
              onChange={(event) => setVisaPathwayId(event.target.value as AcademyPathwayId)}
              required
            >
              <option value="" disabled>
                {copy.pathwayHint}
              </option>
              {pathwayChoices.map((pathway) => (
                <option key={pathway.id} value={pathway.id}>
                  {pathway.title}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              {copy.budgetLabel}
              <Input value={budgetMajor} onChange={(event) => setBudgetMajor(event.target.value)} required />
            </label>
            <label className="block text-sm">
              {copy.dueDaysLabel}
              <Input
                type="number"
                min={1}
                max={90}
                value={dueDays}
                onChange={(event) => setDueDays(event.target.value)}
                required
              />
            </label>
          </div>
          {error ? (
            <p aria-live="assertive" className="text-sm text-[var(--rose)]">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p aria-live="polite" className="text-sm text-[var(--emerald)]">
              {notice}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose}>
              {copy.close}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? copy.pending : copy.submit}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
