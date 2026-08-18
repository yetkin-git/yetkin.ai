"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { useActionBridge } from "@/components/ui/action-bridge";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { WALLET_SURFACE_PATH } from "@/lib/kernel/identity/types";

export function ContractActions({
  contractId,
  isClient,
  status,
  showRelease = true,
}: {
  contractId: string;
  isClient: boolean;
  status: string;
  showRelease?: boolean;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const idempotency = useIdempotencyKey();
  const copy = FREELANCER_SEN.actions;

  async function post(path: string, action: string) {
    setPending(action);
    setError(null);
    const response = await fetch(path, {
      method: "POST",
      headers: idempotency.headers(),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(null);
    if (!body.ok) {
      setError(body.error ?? copy.fail);
      return;
    }
    if (action === "release") {
      push({
        title: UX_SEN.bridge.released.title,
        body: UX_SEN.bridge.released.body,
        href: WALLET_SURFACE_PATH,
        cta: UX_SEN.bridge.released.cta,
        tone: "emerald",
      });
    }
    router.refresh();
  }

  const actionable = status === "FUNDED";

  return (
    <div className="flex flex-wrap gap-2">
      {actionable ? (
        <p className="w-full text-sm text-[var(--muted)]">{copy.fundedHint}</p>
      ) : null}
      {isClient && actionable && showRelease ? (
        <Button
          type="button"
          disabled={pending !== null}
          onClick={() => post(`/api/freelancer/contracts/${contractId}/release`, "release")}
        >
          {pending === "release" ? copy.releasing : copy.release}
        </Button>
      ) : null}
      {actionable ? (
        <Button
          type="button"
          variant="ghost"
          disabled={pending !== null}
          onClick={() => post(`/api/freelancer/contracts/${contractId}/refund`, "refund")}
        >
          {pending === "refund" ? copy.refunding : copy.refund}
        </Button>
      ) : null}
      {error ? (
        <p aria-live="assertive" className="w-full text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
