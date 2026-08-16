"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PAZARYERI_SEN } from "@/lib/copy/sen-voice/pazaryeri";

export function OfferActions({ offerId }: { offerId: string }) {
  const router = useRouter();
  const copy = PAZARYERI_SEN.offer;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function decide(decision: "accept" | "reject") {
    setPending(true);
    setError(null);
    const response = await fetch("/api/pazaryeri/offers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ offerId, decision }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? copy.decideFail);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void decide("accept")} disabled={pending} size="sm">
          {pending ? copy.deciding : copy.accept}
        </Button>
        <Button type="button" variant="ghost" onClick={() => void decide("reject")} disabled={pending} size="sm">
          {copy.reject}
        </Button>
      </div>
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
