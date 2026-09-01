"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { FREELANCER_NEED_CATALOG, type FreelancerNeedId } from "@/lib/kernel/catalog-ids";
import { FREELANCER_JOB_MAX_MINOR, FREELANCER_JOB_MIN_MINOR } from "@/lib/freelancer/schemas";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";

export function JobCreateForm() {
  const router = useRouter();
  const report = useCitizenWriteFeedback();
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [budgetMajor, setBudgetMajor] = useState("100");
  const [visaPathwayId, setVisaPathwayId] = useState<FreelancerNeedId | "">("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const idempotency = useIdempotencyKey();
  const copy = FREELANCER_SEN.create;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const budgetMinor = Math.round(Number.parseFloat(budgetMajor.replace(",", ".")) * 100);
      const response = await fetch(
        "/api/freelancer/jobs",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
          body: JSON.stringify({ title, brief, budgetMinor, visaPathwayId }),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      const job = envelope.body.job;
      const jobId =
        job && typeof job === "object" && "id" in job && typeof job.id === "string" ? job.id : null;
      setPending(false);
      if (!envelope.ok || !jobId) {
        setError(report(envelope.status, envelope.error, copy.fail));
        return;
      }
      router.push(`/freelancer/jobs/${jobId}`);
      router.refresh();
    } catch {
      setPending(false);
      setError(UX_SEN.http.network);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm font-medium">
        {copy.titleLabel}
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} />
      </label>
      <label className="block text-sm font-medium">
        {copy.briefLabel}
        <textarea
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-base"
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          required
          minLength={8}
          rows={5}
        />
      </label>
      <label className="block text-sm font-medium">
        {copy.pathwayLabel}
        <select
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-base"
          value={visaPathwayId}
          onChange={(event) => setVisaPathwayId(event.target.value as FreelancerNeedId)}
          required
        >
          <option value="" disabled>
            {copy.pathwayHint}
          </option>
          {FREELANCER_NEED_CATALOG.map((need) => (
            <option key={need.id} value={need.id}>
              {need.title}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        {copy.budgetLabel}
        <Input
          value={budgetMajor}
          onChange={(event) => setBudgetMajor(event.target.value)}
          required
        />
      </label>
      <p className="text-xs text-slate-600">
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
