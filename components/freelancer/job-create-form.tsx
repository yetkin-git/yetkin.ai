"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { FREELANCER_JOB_MAX_MINOR, FREELANCER_JOB_MIN_MINOR } from "@/lib/freelancer/schemas";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";

export function JobCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [budgetMajor, setBudgetMajor] = useState("100");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const idempotency = useIdempotencyKey();
  const copy = FREELANCER_SEN.create;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const budgetMinor = Math.round(Number.parseFloat(budgetMajor.replace(",", ".")) * 100);
    const response = await fetch("/api/freelancer/jobs", {
      method: "POST",
      headers: { "content-type": "application/json", ...idempotency.headers() },
      body: JSON.stringify({ title, brief, budgetMinor }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string; job?: { id: string } };
    setPending(false);
    if (!body.ok || !body.job) {
      setError(body.error ?? copy.fail);
      return;
    }
    router.push(`/freelancer/jobs/${body.job.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
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
          rows={5}
        />
      </label>
      <label className="block text-sm">
        {copy.budgetLabel}
        <Input
          value={budgetMajor}
          onChange={(event) => setBudgetMajor(event.target.value)}
          required
        />
      </label>
      <p className="text-xs text-[var(--muted)]">
        {copy.band(FREELANCER_JOB_MIN_MINOR / 100, FREELANCER_JOB_MAX_MINOR / 100, HOLD_BPS_DEFAULT / 100)}
      </p>
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
