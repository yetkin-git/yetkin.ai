"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";

export function ContractActions({
  contractId,
  isClient,
  status,
}: {
  contractId: string;
  isClient: boolean;
  status: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const copy = FREELANCER_SEN.actions;

  async function post(path: string, action: string) {
    setPending(action);
    setError(null);
    const response = await fetch(path, { method: "POST" });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(null);
    if (!body.ok) {
      setError(body.error ?? copy.fail);
      return;
    }
    router.refresh();
  }

  const actionable = status === "FUNDED";

  return (
    <div className="flex flex-wrap gap-2">
      {actionable ? (
        <p className="w-full text-sm text-[var(--muted)]">{copy.fundedHint}</p>
      ) : null}
      {isClient && actionable ? (
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
