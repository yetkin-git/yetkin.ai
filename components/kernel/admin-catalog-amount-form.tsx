"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATALOG_WRITE_PATH } from "@/lib/kernel/admin/types";
import { HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";
import type { PriceCatalogUnitType } from "@/lib/kernel/pricing/catalog";

export function AdminCatalogAmountForm({
  entryId,
  unitType,
  initialAmountMinor,
}: {
  entryId: string;
  unitType: PriceCatalogUnitType;
  initialAmountMinor: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(initialAmountMinor));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const amountMinor = Number.parseInt(amount, 10);
    const response = await fetch(CATALOG_WRITE_PATH, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: entryId, amountMinor }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "Fiyat güncellenemedi.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex min-w-[11rem] flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          step={1}
          min={unitType === "BPS" ? HOLD_BPS_MIN : 0}
          max={unitType === "BPS" ? HOLD_BPS_MAX : undefined}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          aria-label="amountMinor"
          className="mt-0 h-9 w-28 py-1 text-right tabular-nums"
          required
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "…" : "Kaydet"}
        </Button>
      </div>
      {error ? <p className="text-xs text-[var(--rose)]">{error}</p> : null}
    </form>
  );
}
