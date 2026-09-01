"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminConfirmDialog } from "@/components/kernel/admin-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input, INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { CATALOG_WRITE_PATH } from "@/lib/kernel/admin/types";
import { HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";
import type { PriceCatalogUnitType } from "@/lib/kernel/pricing/catalog";
import { PRICE_DECISION_REASON_CODES } from "@/lib/kernel/pricing/price-decision-codes";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { cn } from "@/components/ui/cn";

export function AdminCatalogAmountForm({
  entryId,
  unitKey,
  unitType,
  initialAmountMinor,
}: {
  entryId: string;
  unitKey: string;
  unitType: PriceCatalogUnitType;
  initialAmountMinor: number;
}) {
  const router = useRouter();
  const copy = ADMIN_SEN;
  const [amount, setAmount] = useState(String(initialAmountMinor));
  const [reasonCode, setReasonCode] = useState<(typeof PRICE_DECISION_REASON_CODES)[number]>(
    "ADMIN_MANUAL",
  );
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const amountMinor = Number.parseInt(amount, 10);
    if (!Number.isInteger(amountMinor)) {
      setError(copy.amountFail);
      return;
    }
    if (amountMinor === initialAmountMinor) {
      return;
    }
    if (reason.trim().length < 8) {
      setError(copy.reasonFail);
      return;
    }
    setConfirmOpen(true);
  }

  async function onConfirm() {
    setPending(true);
    setError(null);
    const amountMinor = Number.parseInt(amount, 10);
    const response = await fetch(
      CATALOG_WRITE_PATH,
      withRailApiVersion({
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: entryId,
          amountMinor,
          reasonCode,
          reason: reason.trim(),
        }),
      }),
    );
    const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
    setPending(false);
    if (!parsed.ok) {
      setError(parsed.error ?? copy.amountFail);
      setConfirmOpen(false);
      return;
    }
    setConfirmOpen(false);
    setReason("");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex min-w-[16rem] flex-col items-end gap-1.5">
        <label className="w-full text-right">
          <span className="sr-only">{copy.reasonCodeLabel}</span>
          <select
            value={reasonCode}
            onChange={(event) =>
              setReasonCode(event.target.value as (typeof PRICE_DECISION_REASON_CODES)[number])
            }
            aria-label={copy.reasonCodeLabel}
            className={cn(INPUT_SURFACE_CLASS, "mt-0 h-9 py-1")}
            required
          >
            {PRICE_DECISION_REASON_CODES.map((code) => (
              <option key={code} value={code}>
                {copy.reasonCodes[code]}
              </option>
            ))}
          </select>
        </label>
        <Input
          type="text"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          aria-label={copy.reasonNoteLabel}
          placeholder={copy.reasonNotePlaceholder}
          className="mt-0 h-9 w-full py-1"
          minLength={8}
          maxLength={500}
          required
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            step={1}
            min={unitType === "BPS" ? HOLD_BPS_MIN : 0}
            max={unitType === "BPS" ? HOLD_BPS_MAX : undefined}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-label={copy.amountLabel}
            className="mt-0 h-9 w-28 py-1 text-right tabular-nums"
            required
          />
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? copy.amountSaving : copy.amountSave}
          </Button>
        </div>
        {error ? <p className="text-xs text-[var(--rose)]">{error}</p> : null}
      </form>
      <AdminConfirmDialog
        open={confirmOpen}
        eyebrow={copy.confirm.eyebrow}
        title={copy.confirm.amountTitle}
        body={copy.confirm.amountBody(unitKey, String(initialAmountMinor), amount, reasonCode)}
        confirmLabel={copy.confirm.amountConfirm}
        cancelLabel={copy.confirm.amountCancel}
        closeLabel={copy.confirm.closeLabel}
        pendingLabel={copy.confirm.pending}
        pending={pending}
        onConfirm={() => void onConfirm()}
        onClose={() => {
          if (!pending) {
            setConfirmOpen(false);
          }
        }}
      />
    </>
  );
}
