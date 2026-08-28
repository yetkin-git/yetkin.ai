"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { yetkinIlanHref } from "@/lib/kernel/yetkinilan";
import { DualCashPathSteps } from "@/components/pazaryeri/dual-cash-path-steps";
import { QuickTopUpModal } from "@/components/kernel/quick-top-up-modal";
import { useActionBridge } from "@/components/ui/action-bridge";
import { PAZARYERI_SEN } from "@/lib/copy/sen-voice/pazaryeri";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { PRICE_LOCK_GRACE_MINUTES } from "@/lib/kernel/pricing/price-lock";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import { WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import type { MarketplaceProductKind } from "@/lib/pazaryeri/types";

export function PurchaseButton({
  productId,
  kind,
  amountMinor,
  currencyCode = SETTLEMENT_CURRENCY,
}: {
  productId: string;
  kind: MarketplaceProductKind;
  amountMinor?: number;
  currencyCode?: CurrencyCode;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const copy = PAZARYERI_SEN.purchase;
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "locking" | "settling" | "holding">("idle");
  const [topUpOpen, setTopUpOpen] = useState(false);
  const pending = phase !== "idle";
  const isDigital = kind === "DIGITAL_GOOD";
  const path = isDigital ? "settlement" : "escrow";
  const active =
    phase === "locking" ? "lock" : phase === "settling" ? "settle" : phase === "holding" ? "hold" : null;
  const requiredMinor = amountMinor && amountMinor > 0 ? amountMinor : WALLET_TOP_UP_MIN_MINOR;
  const ordersHref = yetkinIlanHref("/siparisler");

  const onBuy = useCallback(async () => {
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
      const message = buyBody.error ?? copy.buyFail;
      setError(message);
      if (isInsufficientBalanceError(message)) {
        setTopUpOpen(true);
      }
      return;
    }
    push({
      title: copy.purchase.bridgeTitle,
      body: copy.purchase.bridgeBody,
      href: ordersHref,
      cta: copy.purchase.bridgeCta,
      tone: "emerald",
    });
    router.push(ordersHref);
    router.refresh();
  }, [copy.buyFail, copy.lockFail, isDigital, ordersHref, productId, push, router]);

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
      {isInsufficientBalanceError(error) ? (
        <Button type="button" variant="outline" size="sm" onClick={() => setTopUpOpen(true)}>
          {UX_SEN.topUp.trigger}
        </Button>
      ) : null}
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
      <QuickTopUpModal
        open={topUpOpen}
        requiredMinor={requiredMinor}
        currencyCode={currencyCode}
        onClose={() => setTopUpOpen(false)}
        onFunded={() => {
          setTopUpOpen(false);
          push({ title: UX_SEN.topUp.funded, tone: "emerald" });
          void onBuy();
        }}
      />
    </div>
  );
}
