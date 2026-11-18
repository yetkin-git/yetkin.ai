"use client";

import { useState } from "react";
import type { Route } from "next";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { TEZGAH_SEAL_LABEL, tezgahSealPath, tezgahToolById, type TezgahToolId } from "@/lib/tezgah/catalog";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export type TezgahHistoryItem = {
  id: string;
  toolKey: string;
  title: string;
  createdAt: string;
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function PortfolioAddButton({ outputId }: { outputId: string }) {
  const idempotency = useIdempotencyKey();
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState("");

  async function add() {
    if (pending) {
      return;
    }
    setPending(true);
    setNote("");
    try {
      const response = await fetch(
        "/api/career/portfolio",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
          body: JSON.stringify({ tezgahOutputId: outputId }),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      if (!envelope.ok) {
        setNote(envelope.error ?? "Portföye eklenemedi.");
        idempotency.rotate();
        return;
      }
      setNote("Kamu portföyüne eklendi. Mühür kartında görünür.");
    } catch {
      setNote("Portföye eklenemedi.");
      idempotency.rotate();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => void add()}>
        {pending ? "Ekleniyor…" : "Kamu Portföyüme Ekle"}
      </Button>
      {note ? <p className="text-xs text-[var(--muted)]">{note}</p> : null}
    </div>
  );
}

export function TezgahOutputBridge({
  toolId,
  outputId,
  signedIn,
}: {
  toolId: TezgahToolId;
  outputId: string | null;
  signedIn: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden" data-tezgah-output-bridge="">
      {signedIn && outputId ? <PortfolioAddButton outputId={outputId} /> : null}
      <LinkButton href={tezgahSealPath(toolId) as Route} variant="outline" size="sm">
        {TEZGAH_SEAL_LABEL}
      </LinkButton>
    </div>
  );
}

export function TezgahHistoryDrawer({ items }: { items: readonly TezgahHistoryItem[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <details className="print:hidden" data-tezgah-history="">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Son Üretimlerim</summary>
      <ul className="mt-3 space-y-3">
        {items.map((item) => {
          const tool = tezgahToolById(item.toolKey);
          return (
            <li key={item.id} className="rounded-xl border border-[var(--border)] px-3 py-2">
              <p className="text-sm font-medium text-[var(--foreground)]">{item.title}</p>
              <p className="text-xs text-[var(--muted)]">
                {tool?.label ?? item.toolKey} · {formatWhen(item.createdAt)}
              </p>
              <div className="mt-2">
                <PortfolioAddButton outputId={item.id} />
              </div>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
