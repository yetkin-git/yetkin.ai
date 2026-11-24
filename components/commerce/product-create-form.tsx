"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { commerceMutate } from "@/components/commerce/api";
import { cockpitHref } from "@/components/commerce/href";
import { barcodeOk, liraInputToMinor } from "@/components/commerce/money";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Input, selectValueTypoClass } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import type { CockpitAttribute } from "@/lib/commerce/cockpit-types";

export function ProductCreateForm({ storeId, storeActive }: { storeId: string; storeActive: boolean }) {
  const copy = SEN_VOICE.magazam;
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [other, setOther] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [onHand, setOnHand] = useState("1");
  const [buffer, setBuffer] = useState("0");
  const [market, setMarket] = useState("");
  const [attributes, setAttributes] = useState<CockpitAttribute[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function attributesBody(): CockpitAttribute[] | null {
    const rows = attributes
      .map((row) => ({ column: row.column.trim(), value: row.value.trim() }))
      .filter((row) => row.column || row.value);
    if (rows.some((row) => !row.column || !row.value)) {
      return null;
    }
    return rows;
  }

  async function submit(mode: "draft" | "active") {
    if (pending) {
      return;
    }
    const attrs = attributesBody();
    if (!attrs) {
      setError(copy.attributes);
      return;
    }
    const body: Record<string, unknown> = {
      mode,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      other: other.trim(),
      attributes: attrs,
      sku: sku.trim() ? sku.trim().toUpperCase() : null,
    };
    if (market) {
      body.listingMarket = market;
    }
    if (mode === "draft") {
      body.onHandQty = 0;
      body.safetyBuffer = 0;
    } else {
      const amountMinor = liraInputToMinor(price);
      const onHandQty = Number(onHand);
      const safetyBuffer = Number(buffer);
      if (amountMinor === "invalid" || amountMinor == null || !barcodeOk(barcode)) {
        setError(copy.activateNeedPrice);
        return;
      }
      if (!Number.isInteger(onHandQty) || !Number.isInteger(safetyBuffer) || onHandQty < 1 || onHandQty - safetyBuffer < 1) {
        setError(copy.activateNeedStock);
        return;
      }
      body.barcode = barcode.trim();
      body.amountMinor = amountMinor;
      body.onHandQty = onHandQty;
      body.safetyBuffer = safetyBuffer;
    }
    setPending(true);
    setError("");
    const result = await commerceMutate<{ product?: { id?: string } }>(
      `/api/commerce/stores/${storeId}/products`,
      "POST",
      body,
      true,
    );
    if (!result.ok || typeof result.data.product?.id !== "string") {
      setError(result.ok ? copy.network : result.error);
      setPending(false);
      return;
    }
    router.push(cockpitHref(`/magazam/${storeId}/urunler/${result.data.product.id}`));
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="new-title">{copy.productTitle}</Label>
        <Input id="new-title" value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div>
        <Label htmlFor="new-description">{copy.productDescription}</Label>
        <div className="mt-1">
          <SmartTextarea
            id="new-description"
            context="ecommerce"
            value={description}
            maxLength={4000}
            rows={4}
            placeholder="Ürün açıklamasını buraya yaz…"
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="new-category">{copy.category}</Label>
          <Input id="new-category" value={category} maxLength={80} onChange={(event) => setCategory(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="new-sku">{copy.sku}</Label>
          <Input id="new-sku" value={sku} maxLength={64} onChange={(event) => setSku(event.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="new-other">{copy.other}</Label>
        <Input id="new-other" value={other} maxLength={500} onChange={(event) => setOther(event.target.value)} />
      </div>
      <div>
        <Label htmlFor="new-market">{copy.market}</Label>
        <select
          id="new-market"
          className={cn(
            "mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base",
            selectValueTypoClass(market),
          )}
          value={market}
          onChange={(event) => setMarket(event.target.value)}
        >
          <option value="">{copy.marketNone}</option>
          <option value="trendyol">Trendyol</option>
          <option value="hepsiburada">Hepsiburada</option>
          <option value="amazon">Amazon</option>
        </select>
      </div>
      <AttributeFields rows={attributes} onChange={setAttributes} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="new-barcode">{copy.barcode}</Label>
          <Input id="new-barcode" value={barcode} inputMode="numeric" onChange={(event) => setBarcode(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="new-price">{copy.price}</Label>
          <Input id="new-price" value={price} inputMode="decimal" onChange={(event) => setPrice(event.target.value)} />
          <p className="mt-1 text-xs text-[var(--muted)]">{copy.priceHint}</p>
        </div>
        <div>
          <Label htmlFor="new-on-hand">{copy.onHand}</Label>
          <Input id="new-on-hand" value={onHand} inputMode="numeric" onChange={(event) => setOnHand(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="new-buffer">{copy.buffer}</Label>
          <Input id="new-buffer" value={buffer} inputMode="numeric" onChange={(event) => setBuffer(event.target.value)} />
        </div>
      </div>
      <p className="text-xs text-[var(--muted)]">{copy.draftStockHint}</p>
      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => void submit("draft")} disabled={pending}>
          {pending ? copy.saving : copy.modeDraft}
        </Button>
        <Button type="button" onClick={() => void submit("active")} disabled={pending || !storeActive}>
          {copy.modeActive}
        </Button>
      </div>
      {storeActive ? null : <p className="text-sm text-[var(--muted)]">{copy.modeActiveBlocked}</p>}
    </div>
  );
}

export function AttributeFields({
  rows,
  onChange,
}: {
  rows: CockpitAttribute[];
  onChange: (rows: CockpitAttribute[]) => void;
}) {
  const copy = SEN_VOICE.magazam;
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">{copy.attributes}</p>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input
            aria-label={copy.attributeColumn}
            value={row.column}
            maxLength={40}
            placeholder={copy.attributeColumn}
            onChange={(event) => {
              const next = rows.slice();
              next[index] = { ...row, column: event.target.value };
              onChange(next);
            }}
          />
          <Input
            aria-label={copy.attributeValue}
            value={row.value}
            maxLength={400}
            placeholder={copy.attributeValue}
            onChange={(event) => {
              const next = rows.slice();
              next[index] = { ...row, value: event.target.value };
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}
          >
            {copy.removeAttribute}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        onClick={() => onChange([...rows, { column: "", value: "" }])}
        disabled={rows.length >= 32}
      >
        {copy.addAttribute}
      </Button>
    </div>
  );
}
