"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { WALLET_TOP_UP_MAX_MINOR, WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";

export function WalletTopUpForm() {
  const [amountMajor, setAmountMajor] = useState("100");
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const idempotency = useIdempotencyKey();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setIframeUrl(null);
    const amountMinor = Math.round(Number.parseFloat(amountMajor.replace(",", ".")) * 100);
    const response = await fetch("/api/wallet/top-up", {
      method: "POST",
      headers: { "content-type": "application/json", ...idempotency.headers() },
      body: JSON.stringify({ amountMinor }),
    });
    const body = (await response.json()) as {
      ok: boolean;
      error?: string;
      iframeUrl?: string;
      alreadySettled?: boolean;
    };
    setPending(false);
    if (body.ok && body.alreadySettled) {
      idempotency.rotate();
      setError(null);
      return;
    }
    if (!body.ok || !body.iframeUrl) {
      setError(body.error ?? "Yükleme başlatılamadı.");
      return;
    }
    idempotency.rotate();
    setIframeUrl(body.iframeUrl);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        Yükleme tutarı (₺)
        <Input value={amountMajor} onChange={(event) => setAmountMajor(event.target.value)} required />
      </label>
      <p className="text-xs text-[var(--muted)]">
        Aralık: ₺{WALLET_TOP_UP_MIN_MINOR / 100} – ₺{WALLET_TOP_UP_MAX_MINOR / 100}. Kart ödemesi güvenli ödeme altyapısıyla alınır.
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Hazırlanıyor…" : "Kart ile yükle"}
      </Button>
      {iframeUrl ? (
        <iframe title="Güvenli ödeme" src={iframeUrl} className="mt-3 h-96 w-full rounded-md border border-[var(--border)]" />
      ) : null}
    </form>
  );
}
