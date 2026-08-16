"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseMajorToMinor } from "@/lib/kernel/money/format";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { PAZARYERI_SEN } from "@/lib/copy/sen-voice/pazaryeri";

export function OfferForm({ productId }: { productId: string }) {
  const router = useRouter();
  const copy = PAZARYERI_SEN.offer;
  const [amountMajor, setAmountMajor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    let amountMinor: number;
    try {
      amountMinor = parseMajorToMinor(amountMajor, SETTLEMENT_CURRENCY);
    } catch (caught) {
      setPending(false);
      setError(caught instanceof Error ? caught.message : "Tutar okunamadı.");
      return;
    }
    const response = await fetch("/api/pazaryeri/offers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, amountMinor }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? copy.fail);
      return;
    }
    setNotice(copy.received);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <label className="block text-sm">
        {copy.amountLabel}
        <Input value={amountMajor} onChange={(event) => setAmountMajor(event.target.value)} required />
      </label>
      {notice ? (
        <p aria-live="polite" className="text-sm text-[var(--emerald)]">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? copy.pending : copy.submit}
      </Button>
    </form>
  );
}
