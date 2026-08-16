"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RefundTenderButton({ tenderId }: { tenderId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onRefund() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/arena/tenders/${tenderId}/refund`, { method: "POST" });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "İade başarısız.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="ghost" onClick={() => void onRefund()} disabled={pending}>
        {pending ? "İade…" : "Ödül havuzunu iade et"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
