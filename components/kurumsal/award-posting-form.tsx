"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AwardPostingForm({
  postingId,
  workbenchKind,
}: {
  postingId: string;
  workbenchKind: "FREELANCER" | "DEVLABS";
}) {
  const router = useRouter();
  const [awardedUserId, setAwardedUserId] = useState("");
  const [awardedDevLabsProjectId, setAwardedDevLabsProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch(`/api/kurumsal/jobs/${postingId}/award`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        awardedUserId,
        awardedDevLabsProjectId:
          workbenchKind === "DEVLABS" && awardedDevLabsProjectId.trim()
            ? awardedDevLabsProjectId.trim()
            : null,
      }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "Ödüllendirme başarısız.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        Çalışan kullanıcı kimliği
        <Input value={awardedUserId} onChange={(event) => setAwardedUserId(event.target.value)} required />
      </label>
      {workbenchKind === "DEVLABS" ? (
        <label className="block text-sm">
          DevLabs proje kimliği
          <Input
            value={awardedDevLabsProjectId}
            onChange={(event) => setAwardedDevLabsProjectId(event.target.value)}
            required
          />
        </label>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Ödüllendiriliyor…" : "İşi ver"}
      </Button>
    </form>
  );
}
