"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TenderCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [prizeMajor, setPrizeMajor] = useState("100");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const prizePoolMinor = Math.round(Number.parseFloat(prizeMajor.replace(",", ".")) * 100);
    const response = await fetch("/api/arena/tenders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, brief, prizePoolMinor }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string; tender?: { id: string } };
    setPending(false);
    if (!body.ok || !body.tender) {
      setError(body.error ?? "İhale açılamadı.");
      return;
    }
    router.push(`/arena/${body.tender.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        Başlık
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} />
      </label>
      <label className="block text-sm">
        Çağrı
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
        Ödül havuzu (₺) — açılışta emanete kilitlenir
        <Input value={prizeMajor} onChange={(event) => setPrizeMajor(event.target.value)} required />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Kilitleniyor…" : "İhaleyi aç"}
      </Button>
    </form>
  );
}
