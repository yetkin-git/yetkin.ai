"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DopingButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onBoost() {
    setPending(true);
    setError(null);
    const response = await fetch("/api/pazaryeri/doping", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "Doping alınamadı.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="secondary" onClick={() => void onBoost()} disabled={pending}>
        {pending ? "Kesiliyor…" : "Doping satın al (öne çıkar)"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
