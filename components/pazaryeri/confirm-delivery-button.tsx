"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PAZARYERI_SEN } from "@/lib/copy/sen-voice/pazaryeri";

export function ConfirmDeliveryButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const copy = PAZARYERI_SEN.delivery;
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "confirming" | "refunding">("idle");
  const pending = phase !== "idle";

  async function onConfirm() {
    setPhase("confirming");
    setError(null);
    const response = await fetch(`/api/pazaryeri/orders/${orderId}/confirm`, { method: "POST" });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPhase("idle");
    if (!body.ok) {
      setError(body.error ?? copy.fail);
      return;
    }
    router.refresh();
  }

  async function onRefund() {
    setPhase("refunding");
    setError(null);
    const response = await fetch(`/api/pazaryeri/orders/${orderId}/refund`, { method: "POST" });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPhase("idle");
    if (!body.ok) {
      setError(body.error ?? copy.refundFail);
      return;
    }
    router.refresh();
  }

  const live =
    phase === "confirming" ? copy.confirming : phase === "refunding" ? copy.refunding : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void onConfirm()} disabled={pending}>
          {phase === "confirming" ? copy.confirming : copy.confirm}
        </Button>
        <Button type="button" variant="ghost" onClick={() => void onRefund()} disabled={pending}>
          {phase === "refunding" ? copy.refunding : copy.refund}
        </Button>
      </div>
      {live ? (
        <p aria-live="polite" className="text-xs text-[var(--muted)]">
          {live}
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
