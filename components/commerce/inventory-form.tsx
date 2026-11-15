"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { commerceMutate } from "@/components/commerce/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export type StockChoice = {
  id: string;
  label: string;
};

export function InventoryForm({
  storeId,
  variants,
  initialVariantId,
}: {
  storeId: string;
  variants: StockChoice[];
  initialVariantId: string;
}) {
  const copy = SEN_VOICE.magazam;
  const router = useRouter();
  const [variantId, setVariantId] = useState(
    variants.some((row) => row.id === initialVariantId) ? initialVariantId : (variants[0]?.id ?? ""),
  );
  const [type, setType] = useState<"INBOUND" | "ADJUSTMENT" | "RETURN">("INBOUND");
  const [direction, setDirection] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (pending || !variantId) {
      return;
    }
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount < 1) {
      setError(copy.quantity);
      return;
    }
    if (type === "ADJUSTMENT" && note.trim().length < 2) {
      setError(copy.noteHint);
      return;
    }
    setPending(true);
    setError("");
    const result = await commerceMutate(
      `/api/commerce/stores/${storeId}/inventory`,
      "POST",
      {
        variantId,
        type,
        direction: type === "ADJUSTMENT" ? direction : "IN",
        quantity: amount,
        note: note.trim(),
      },
      true,
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNote("");
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="stock-variant">{copy.variantPick}</Label>
        <select
          id="stock-variant"
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base"
          value={variantId}
          onChange={(event) => setVariantId(event.target.value)}
        >
          {variants.map((row) => (
            <option key={row.id} value={row.id}>
              {row.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["INBOUND", "ADJUSTMENT", "RETURN"] as const).map((item) => (
          <Button
            key={item}
            type="button"
            variant={type === item ? "primary" : "outline"}
            onClick={() => setType(item)}
          >
            {copy.status.movement[item]}
          </Button>
        ))}
      </div>
      {type === "ADJUSTMENT" ? (
        <div className="flex flex-wrap gap-2">
          {(["IN", "OUT"] as const).map((item) => (
            <Button
              key={item}
              type="button"
              variant={direction === item ? "secondary" : "outline"}
              onClick={() => setDirection(item)}
            >
              {copy.status.direction[item]}
            </Button>
          ))}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="stock-qty">{copy.quantity}</Label>
          <Input id="stock-qty" value={quantity} inputMode="numeric" onChange={(event) => setQuantity(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="stock-note">{copy.note}</Label>
          <Input id="stock-note" value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} />
          {type === "ADJUSTMENT" ? <p className="mt-1 text-xs text-[var(--muted)]">{copy.noteHint}</p> : null}
        </div>
      </div>
      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      <Button type="button" onClick={() => void submit()} disabled={pending || variants.length === 0}>
        {pending ? copy.saving : copy.postMovement}
      </Button>
    </div>
  );
}
