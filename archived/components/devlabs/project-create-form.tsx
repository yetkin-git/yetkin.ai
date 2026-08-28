"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEVLABS_SEN } from "@/lib/copy/sen-voice/devlabs";

export function ProjectCreateForm() {
  const router = useRouter();
  const copy = DEVLABS_SEN.create;
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/devlabs/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, summary }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string; project?: { id: string } };
    setPending(false);
    if (!body.ok || !body.project) {
      setError(body.error ?? copy.fail);
      return;
    }
    router.push(`/devlabs/projeler/${body.project.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        {copy.name}
        <Input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
      </label>
      <label className="block text-sm">
        {copy.summary}
        <Textarea
          className="mt-1"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          required
          minLength={4}
          rows={3}
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? copy.pending : copy.cta}
      </Button>
    </form>
  );
}
