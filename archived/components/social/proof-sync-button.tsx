"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ProofSyncButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function sync() {
    setPending(true);
    setError(null);
    const response = await fetch("/api/social/feed", { method: "POST" });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "Akış senkronu yazılamadı.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button type="button" onClick={() => void sync()} disabled={pending}>
        {pending ? "Mühürleniyor…" : "Kanıtları akışa al"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
