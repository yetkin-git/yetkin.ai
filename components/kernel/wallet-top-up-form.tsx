"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { fetchWalletStripClient } from "@/components/kernel/fetch-wallet-strip";
import { useActionBridge } from "@/components/ui/action-bridge";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { WALLET_TOP_UP_MAX_MINOR, WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";

const POLL_MS = 2_500;
const POLL_MAX_MS = 90_000;

export function WalletTopUpForm() {
  const router = useRouter();
  const { push } = useActionBridge();
  const [amountMajor, setAmountMajor] = useState("100");
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [waitingClearing, setWaitingClearing] = useState(false);
  const baselineRef = useRef<number | null>(null);
  const idempotency = useIdempotencyKey();

  useEffect(() => {
    if (!iframeUrl) {
      return;
    }
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (Date.now() - started >= POLL_MAX_MS) {
        window.clearInterval(timer);
        return;
      }
      void fetchWalletStripClient().then((strip) => {
        const baseline = baselineRef.current;
        if (strip.live && baseline != null && strip.amountMinor > baseline) {
          window.clearInterval(timer);
          setWaitingClearing(false);
          setIframeUrl(null);
          push({
            title: UX_SEN.bridge.topUpSettled.title,
            body: UX_SEN.bridge.topUpSettled.body,
            href: UX_SEN.bridge.topUpHref,
            cta: UX_SEN.bridge.topUpSettled.cta,
            tone: "emerald",
          });
          router.refresh();
        }
      });
    }, POLL_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [iframeUrl, push, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setIframeUrl(null);
    setWaitingClearing(false);
    const strip = await fetchWalletStripClient();
    baselineRef.current = strip.amountMinor;
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
      push({
        title: UX_SEN.bridge.topUpSettled.title,
        body: UX_SEN.bridge.topUpSettled.body,
        href: UX_SEN.bridge.topUpHref,
        cta: UX_SEN.bridge.topUpSettled.cta,
        tone: "emerald",
      });
      router.refresh();
      return;
    }
    if (!body.ok || !body.iframeUrl) {
      idempotency.rotate();
      setError(body.error ?? "Yükleme başlatılamadı.");
      return;
    }
    idempotency.rotate();
    setIframeUrl(body.iframeUrl);
    setWaitingClearing(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        Yükleme tutarı (₺)
        <Input value={amountMajor} onChange={(event) => setAmountMajor(event.target.value)} required />
      </label>
      <p className="text-xs text-[var(--muted)]">
        Aralık: ₺{WALLET_TOP_UP_MIN_MINOR / 100} – ₺{WALLET_TOP_UP_MAX_MINOR / 100}. Kart ödemesi güvenli ödeme
        altyapısıyla alınır.
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Hazırlanıyor…" : "Kart ile yükle"}
      </Button>
      {iframeUrl ? (
        <iframe
          title="Güvenli ödeme"
          src={iframeUrl}
          className="mt-3 h-[min(24rem,55vh)] w-full rounded-md border border-[var(--border)]"
        />
      ) : null}
      {waitingClearing ? (
        <p aria-live="polite" className="text-xs text-[var(--muted)]">
          {UX_SEN.topUp.waitingClearing}
        </p>
      ) : null}
    </form>
  );
}
