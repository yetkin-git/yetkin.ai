"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { QuickTopUpModal } from "@/components/kernel/quick-top-up-modal";
import { useActionBridge } from "@/components/ui/action-bridge";
import { SettlementSteps } from "@/components/academy/settlement-steps";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import { WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";

export function PurchaseButton({
  courseId,
  lockMinutes,
  priceMinor,
  currencyCode = SETTLEMENT_CURRENCY,
  playHref,
}: {
  courseId: string;
  lockMinutes: number;
  priceMinor?: number | null;
  currencyCode?: CurrencyCode;
  playHref?: string;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "locking" | "settling">("idle");
  const [topUpOpen, setTopUpOpen] = useState(false);
  const idempotency = useIdempotencyKey();
  const pending = phase !== "idle";
  const requiredMinor = priceMinor && priceMinor > 0 ? priceMinor : WALLET_TOP_UP_MIN_MINOR;

  const onBuy = useCallback(async () => {
    setPhase("locking");
    setError(null);
    const lockResponse = await fetch(`/api/academy/courses/${courseId}/lock`, { method: "POST" });
    const lockBody = (await lockResponse.json()) as {
      ok: boolean;
      error?: string;
      lock?: { id: string };
    };
    if (!lockBody.ok || !lockBody.lock) {
      setPhase("idle");
      setError(lockBody.error ?? ACADEMY_SEN.purchase.lockFail);
      return;
    }
    setPhase("settling");
    const buyResponse = await fetch(`/api/academy/courses/${courseId}/purchase`, {
      method: "POST",
      headers: { "content-type": "application/json", ...idempotency.headers() },
      body: JSON.stringify({ lockId: lockBody.lock.id }),
    });
    const buyBody = (await buyResponse.json()) as {
      ok: boolean;
      error?: string;
      purchase?: { id: string };
    };
    if (!buyBody.ok || !buyBody.purchase) {
      setPhase("idle");
      const message = buyBody.error ?? ACADEMY_SEN.purchase.buyFail;
      setError(message);
      if (isInsufficientBalanceError(message)) {
        setTopUpOpen(true);
      }
      return;
    }
    push({
      title: UX_SEN.bridge.purchaseAcademy.title,
      body: UX_SEN.bridge.purchaseAcademy.body,
      href: playHref,
      cta: playHref ? UX_SEN.bridge.purchaseAcademy.cta : undefined,
      tone: "emerald",
    });
    router.refresh();
  }, [courseId, idempotency, playHref, push, router]);

  const status =
    phase === "locking"
      ? ACADEMY_SEN.purchase.locking(lockMinutes)
      : phase === "settling"
        ? ACADEMY_SEN.purchase.settling
        : null;

  return (
    <div className="space-y-4">
      <SettlementSteps
        lockMinutes={lockMinutes}
        active={phase === "locking" ? "lock" : phase === "settling" ? "settle" : null}
      />
      <Button type="button" onClick={() => void onBuy()} disabled={pending}>
        {pending ? "Mühürleniyor…" : ACADEMY_SEN.purchase.cta}
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
