"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AwardSubmissionButton({
  tenderId,
  submissionId,
  netMinor,
}: {
  tenderId: string;
  submissionId: string;
  netMinor: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onAward() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/arena/tenders/${tenderId}/award`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ winners: [{ submissionId, amountMinor: netMinor }] }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "Ödül dağıtılamadı.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button type="button" onClick={() => void onAward()} disabled={pending}>
        {pending ? "Dağıtılıyor…" : "Bu teslimi kazanan yap (net)"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
