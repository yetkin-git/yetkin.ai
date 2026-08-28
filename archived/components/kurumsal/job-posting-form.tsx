"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JobPostingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [budgetMajor, setBudgetMajor] = useState("100");
  const [workbenchKind, setWorkbenchKind] = useState<"FREELANCER" | "DEVLABS">("FREELANCER");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const budgetMinor = Math.round(Number.parseFloat(budgetMajor.replace(",", ".")) * 100);
    const response = await fetch("/api/kurumsal/jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, brief, budgetMinor, workbenchKind }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string; posting?: { id: string } };
    setPending(false);
    if (!body.ok || !body.posting) {
      setError(body.error ?? "İlan mühürlenemedi.");
      return;
    }
    router.push(`/kurumsal/ilan/${body.posting.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        Başlık
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} />
      </label>
      <label className="block text-sm">
        İş tanımı
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
        Bütçe (₺) — ilan anında emanete kilitlenir
        <Input value={budgetMajor} onChange={(event) => setBudgetMajor(event.target.value)} required />
      </label>
      <label className="block text-sm">
        Tezgâh
        <select
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          value={workbenchKind}
          onChange={(event) => setWorkbenchKind(event.target.value as "FREELANCER" | "DEVLABS")}
        >
          <option value="FREELANCER">Freelancer</option>
          <option value="DEVLABS">DevLabs</option>
        </select>
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Kilitleniyor…" : "Mühürlü ilan aç"}
      </Button>
    </form>
  );
}
