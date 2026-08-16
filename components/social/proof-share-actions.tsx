"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ProofShareActions({ itemId }: { itemId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function acknowledge() {
    setPending(true);
    setMessage(null);
    const response = await fetch(`/api/social/posts/${itemId}/acknowledge`, { method: "POST" });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    setMessage(body.ok ? "Onay mühürlendi." : (body.error ?? "Onay yazılamadı."));
  }

  async function share() {
    setPending(true);
    setMessage(null);
    const response = await fetch(`/api/social/posts/${itemId}/share`, { method: "POST" });
    const body = (await response.json()) as { ok: boolean; error?: string; sharePath?: string };
    setPending(false);
    if (!body.ok) {
      setMessage(body.error ?? "Paylaşım yazılamadı.");
      return;
    }
    setMessage(`İç paylaşım: ${body.sharePath ?? `/social/${itemId}`}`);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void acknowledge()} disabled={pending}>
          Onayla
        </Button>
        <Button type="button" variant="ghost" onClick={() => void share()} disabled={pending}>
          İç paylaş
        </Button>
      </div>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
