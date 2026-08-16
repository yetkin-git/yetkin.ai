"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PostingActions({
  postingId,
  canRelease,
  canRefund,
}: {
  postingId: string;
  canRelease: boolean;
  canRefund: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"release" | "refund" | null>(null);

  async function run(kind: "release" | "refund") {
    setPending(kind);
    setError(null);
    const response = await fetch(`/api/kurumsal/jobs/${postingId}/${kind}`, { method: "POST" });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(null);
    if (!body.ok) {
      setError(body.error ?? "İşlem başarısız.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canRelease ? (
        <Button type="button" onClick={() => void run("release")} disabled={pending !== null}>
          {pending === "release" ? "Serbest…" : "Emaneti serbest bırak"}
        </Button>
      ) : null}
      {canRefund ? (
        <Button type="button" variant="ghost" onClick={() => void run("refund")} disabled={pending !== null}>
          {pending === "refund" ? "İade…" : "İade et"}
        </Button>
      ) : null}
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
