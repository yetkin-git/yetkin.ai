"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { SettlementSteps } from "@/components/academy/settlement-steps";

export function PurchaseButton({
  courseId,
  lockMinutes,
}: {
  courseId: string;
  lockMinutes: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "locking" | "settling">("idle");
  const idempotency = useIdempotencyKey();
  const pending = phase !== "idle";

  async function onBuy() {
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
      setError(buyBody.error ?? ACADEMY_SEN.purchase.buyFail);
      return;
    }
    router.refresh();
  }

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
