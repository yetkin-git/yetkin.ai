"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DISPLAY_NAME_MAX_LENGTH, PROFILE_WRITE_PATH } from "@/lib/kernel/identity/types";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function DisplayNameForm({ initialDisplayName }: { initialDisplayName: string }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch(
      PROFILE_WRITE_PATH,
      withRailApiVersion({
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName }),
      }),
    );
    const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
    setPending(false);
    if (!parsed.ok) {
      setError(parsed.error ?? "Görünen ad güncellenemedi.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Label>
        Görünen ad
        <Input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          autoComplete="nickname"
          required
        />
      </Label>
      <p className="text-xs text-slate-600">
        En fazla {DISPLAY_NAME_MAX_LENGTH} karakter. E-posta Auth katmanında kalır; buradan
        değişmez.
      </p>
      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Adı kaydet"}
      </Button>
    </form>
  );
}
