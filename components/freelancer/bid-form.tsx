"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { useActionBridge } from "@/components/ui/action-bridge";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

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
  const [amountMajor, setAmountMajor] = useState(String(maxMinor / 100));
  const [coverNote, setCoverNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const idempotency = useIdempotencyKey();
  const copy = FREELANCER_SEN.bid;

  if (visaBlocked) {
    return <p>{copy.visaDenied}</p>;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const amountMinor = Math.round(Number.parseFloat(amountMajor.replace(",", ".")) * 100);
      const response = await fetch(
        `/api/freelancer/jobs/${jobId}/bids`,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
          body: JSON.stringify({ amountMinor, coverNote }),
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
      <p className="text-xs leading-5 text-slate-600">{copy.freeBidNote}</p>
      <label className="block text-sm font-medium">
        {copy.amountLabel}
        <Input value={amountMajor} onChange={(event) => setAmountMajor(event.target.value)} required />
      </label>
      <label className="block text-sm font-medium">
        {copy.coverLabel}
        <textarea
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-base"
          value={coverNote}
          onChange={(event) => setCoverNote(event.target.value)}
          required
          minLength={4}
          rows={3}
        />
      </label>
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
        {pending ? copy.pending : copy.submit}
      </Button>
    </form>
  );
}
