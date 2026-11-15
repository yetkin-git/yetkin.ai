"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { commerceMutate } from "@/components/commerce/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import type { CockpitStore } from "@/lib/commerce/cockpit-types";

export function StoreIdentityForm({ store }: { store: CockpitStore }) {
  const copy = SEN_VOICE.magazam;
  const router = useRouter();
  const [name, setName] = useState(store.name);
  const [slug, setSlug] = useState(store.slug);
  const [whatsapp, setWhatsapp] = useState(store.whatsappE164 ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function save(activate: boolean) {
    if (pending) {
      return;
    }
    setPending(true);
    setError("");
    const body: Record<string, unknown> = {
      name: name.trim(),
      slug: slug.trim(),
      whatsappE164: whatsapp.trim(),
    };
    if (activate) {
      body.status = "ACTIVE";
    }
    const result = await commerceMutate(`/api/commerce/stores/${store.id}`, "PATCH", body);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="identity-name">{copy.name}</Label>
        <Input id="identity-name" value={name} maxLength={80} onChange={(event) => setName(event.target.value)} />
      </div>
      <div>
        <Label htmlFor="identity-slug">{copy.slug}</Label>
        <Input id="identity-slug" value={slug} maxLength={48} onChange={(event) => setSlug(event.target.value)} />
      </div>
      <div>
        <Label htmlFor="identity-whatsapp">{copy.whatsapp}</Label>
        <Input
          id="identity-whatsapp"
          value={whatsapp}
          inputMode="tel"
          placeholder="905xxxxxxxxx"
          onChange={(event) => setWhatsapp(event.target.value)}
        />
        <p className="mt-1 text-xs text-[var(--muted)]">{copy.whatsappHint}</p>
      </div>
      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => void save(false)} disabled={pending}>
          {pending ? copy.saving : copy.save}
        </Button>
        {store.status === "DRAFT" ? (
          <Button type="button" onClick={() => void save(true)} disabled={pending}>
            {copy.activate}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
