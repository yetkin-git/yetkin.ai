"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { KURUMSAL_SEN } from "@/lib/copy/sen-voice/kurumsal";

export function CorporateOfferForm({ postingId }: { postingId: string }) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const copy = KURUMSAL_SEN.offer;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    const response = await fetch(`/api/kurumsal/jobs/${postingId}/offers`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ coverNote }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? copy.fail);
      return;
    }
    setNotice(copy.received);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
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
