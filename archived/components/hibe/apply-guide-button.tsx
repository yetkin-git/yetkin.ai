"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ApplyGuideButton({
  programId,
  alreadyOpen,
  alreadyDone,
}: {
  programId: string;
  alreadyOpen: boolean;
  alreadyDone: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(completeChecklist: boolean) {
    setPending(true);
    setError(null);
    const response = await fetch("/api/hibe/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ programId, completeChecklist }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "Rehber kaydı yazılamadı.");
      return;
    }
    router.refresh();
  }

  if (alreadyDone) {
    return <p className="text-sm">İç kontrol listesi tamam. Resmi başvuru devlet kanalındadır.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void submit(false)} disabled={pending || alreadyOpen}>
          {alreadyOpen ? "Rehber açık" : pending ? "Kaydediliyor…" : "Rehberi aç"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => void submit(true)} disabled={pending}>
          Kontrol listesini tamamla
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
