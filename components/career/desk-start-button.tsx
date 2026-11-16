"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { CareerDeskStatus } from "@/lib/career/desk-brief";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function DeskStartButton({ taskId, status }: { taskId: string; status: CareerDeskStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  if (status !== "OPEN") {
    return null;
  }
  return (
    <span className="inline-flex flex-col gap-1">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => {
          setPending(true);
          setError("");
          void fetch(
            "/api/career/desk",
            withRailApiVersion({
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ taskId, status: "IN_PROGRESS" }),
            }),
          )
            .then(async (response) => {
              const body = (await response.json()) as { ok?: boolean; error?: string };
              if (!response.ok || body.ok === false) {
                setError(typeof body.error === "string" ? body.error : "Durum yazılamadı.");
                return;
              }
              router.refresh();
            })
            .catch(() => {
              setError("Bağlantı kurulamadı.");
            })
            .finally(() => {
              setPending(false);
            });
        }}
      >
        {pending ? "Yazılıyor" : "Üretime al"}
      </Button>
      {error ? <span className="text-xs text-[var(--rose)]">{error}</span> : null}
    </span>
  );
}
