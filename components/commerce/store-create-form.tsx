"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { commerceMutate } from "@/components/commerce/api";
import { cockpitHref } from "@/components/commerce/href";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function StoreCreateForm() {
  const copy = SEN_VOICE.magazam;
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (pending) {
      return;
    }
    setPending(true);
    setError("");
    const body: Record<string, unknown> = { name: name.trim() };
    if (slug.trim()) {
      body.slug = slug.trim();
    }
    const result = await commerceMutate<{ store?: { id?: string } }>("/api/commerce/stores", "POST", body, true);
    if (!result.ok || typeof result.data.store?.id !== "string") {
      setError(result.ok ? copy.network : result.error);
      setPending(false);
      return;
    }
    router.push(cockpitHref(`/magazam/${result.data.store.id}`));
    router.refresh();
  }

  const slugError = error.includes("adres");

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="store-name">{copy.name}</Label>
        <Input id="store-name" value={name} maxLength={80} onChange={(event) => setName(event.target.value)} />
      </div>
      <div>
        <Label htmlFor="store-slug">{copy.slug}</Label>
        <Input
          id="store-slug"
          value={slug}
          maxLength={48}
          placeholder="ornek-dukkan"
          onChange={(event) => setSlug(event.target.value)}
        />
        <p className="mt-1 text-xs text-[var(--muted)]">{copy.slugHint}</p>
        {slugError ? <p className="mt-2 text-sm text-[var(--rose)]">{error}</p> : null}
      </div>
      {error && !slugError ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      <Button type="button" onClick={() => void submit()} disabled={pending || name.trim().length < 1}>
        {pending ? copy.saving : copy.create}
      </Button>
    </div>
  );
}
