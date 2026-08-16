"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { yetkinIlanHref } from "@/lib/kernel/yetkinilan";
import { DualCashPathSteps } from "@/components/pazaryeri/dual-cash-path-steps";
import { PAZARYERI_SEN } from "@/lib/copy/sen-voice/pazaryeri";
import { PRICE_LOCK_GRACE_MINUTES } from "@/lib/kernel/pricing/price-lock";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import type { MarketplaceProductKind } from "@/lib/pazaryeri/types";

export function PurchaseButton({
  productId,
  kind,
}: {
  productId: string;
  kind: MarketplaceProductKind;
}) {
  const router = useRouter();
  const copy = PAZARYERI_SEN.purchase;
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "locking" | "settling" | "holding">("idle");
  const pending = phase !== "idle";
  const isDigital = kind === "DIGITAL_GOOD";
  const path = isDigital ? "settlement" : "escrow";
  const active =
    phase === "locking" ? "lock" : phase === "settling" ? "settle" : phase === "holding" ? "hold" : null;

  async function onBuy() {
    setPhase("locking");
    setError(null);
    const lockResponse = await fetch(`/api/pazaryeri/products/${productId}/lock`, { method: "POST" });
    const lockBody = (await lockResponse.json()) as {
      ok: boolean;
      error?: string;
      lock?: { id: string };
    };
    if (!lockBody.ok || !lockBody.lock) {
      setPhase("idle");
      setError(lockBody.error ?? copy.lockFail);
      return;
    }
    setPhase(isDigital ? "settling" : "holding");
    const buyResponse = await fetch(`/api/pazaryeri/products/${productId}/purchase`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lockId: lockBody.lock.id }),
    });
    const buyBody = (await buyResponse.json()) as {
      ok: boolean;
      error?: string;
      order?: { id: string };
    };
    setPhase("idle");
    if (!buyBody.ok || !buyBody.order) {
      setError(buyBody.error ?? copy.buyFail);
      return;
    }
    router.push(yetkinIlanHref("/siparisler"));
    router.refresh();
  }

  const status =
    phase === "locking"
      ? copy.locking(PRICE_LOCK_GRACE_MINUTES)
      : phase === "settling"
        ? copy.settling
        : phase === "holding"
          ? copy.holding
          : null;

  return (
    <div className="space-y-4">
      <DualCashPathSteps
        path={path}
        lockMinutes={PRICE_LOCK_GRACE_MINUTES}
        holdPercent={HOLD_BPS_DEFAULT / 100}
        active={active}
      />
      <Button type="button" onClick={() => void onBuy()} disabled={pending}>
        {pending ? "Mühürleniyor…" : copy.cta}
      </Button>
      {status ? (
        <p aria-live="polite" className="text-xs text-[var(--muted)]">
          {status}
        </p>
      ) : null}
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
