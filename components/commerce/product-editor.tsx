"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { commerceMutate } from "@/components/commerce/api";
import { cockpitHref } from "@/components/commerce/href";
import { barcodeOk, liraInputToMinor, minorToLiraInput } from "@/components/commerce/money";
import { AttributeFields } from "@/components/commerce/product-create-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkButton } from "@/components/ui/link-button";
import { Textarea } from "@/components/ui/textarea";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import type { CockpitAttribute, CockpitProduct, CockpitVariant } from "@/lib/commerce/cockpit-types";

export function ProductEditor({
  storeId,
  storeActive,
  product,
}: {
  storeId: string;
  storeActive: boolean;
  product: CockpitProduct;
}) {
  const copy = SEN_VOICE.magazam;
  const router = useRouter();
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [category, setCategory] = useState(product.category);
  const [other, setOther] = useState(product.other);
  const [status, setStatus] = useState(product.status);
  const [attributes, setAttributes] = useState<CockpitAttribute[]>(product.attributes);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function saveProduct() {
    if (pending) {
      return;
    }
    const rows = attributes
      .map((row) => ({ column: row.column.trim(), value: row.value.trim() }))
      .filter((row) => row.column || row.value);
    if (rows.some((row) => !row.column || !row.value)) {
      setError(copy.attributes);
      return;
    }
    setPending(true);
    setError("");
    const result = await commerceMutate(`/api/commerce/stores/${storeId}/products/${product.id}`, "PATCH", {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      other: other.trim(),
      attributes: rows,
      status,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <p className="text-sm text-[var(--muted)]">{copy.shelfHint}</p>
      <Card title={product.title}>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="edit-title">{copy.productTitle}</Label>
            <Input id="edit-title" value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="edit-description">{copy.productDescription}</Label>
            <Textarea
              id="edit-description"
              className="mt-1"
              rows={5}
              maxLength={4000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="edit-category">{copy.category}</Label>
              <Input
                id="edit-category"
                value={category}
                maxLength={80}
                onChange={(event) => setCategory(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">{copy.productStatus}</Label>
              <select
                id="edit-status"
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base"
                value={status}
                onChange={(event) => setStatus(event.target.value as CockpitProduct["status"])}
              >
                <option value="DRAFT">{copy.status.product.DRAFT}</option>
                <option value="ACTIVE">{copy.status.product.ACTIVE}</option>
                <option value="ARCHIVED">{copy.status.product.ARCHIVED}</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="edit-other">{copy.other}</Label>
            <Input id="edit-other" value={other} maxLength={500} onChange={(event) => setOther(event.target.value)} />
          </div>
          <AttributeFields rows={attributes} onChange={setAttributes} />
          {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
          <Button type="button" onClick={() => void saveProduct()} disabled={pending}>
            {pending ? copy.saving : copy.saveProduct}
          </Button>
        </div>
      </Card>
      {product.variants.map((variant) => (
        <VariantCard key={variant.id} storeId={storeId} storeActive={storeActive} variant={variant} />
      ))}
      <NewVariantCard storeId={storeId} productId={product.id} storeActive={storeActive} />
    </div>
  );
}

function VariantCard({
  storeId,
  storeActive,
  variant,
}: {
  storeId: string;
  storeActive: boolean;
  variant: CockpitVariant;
}) {
  const copy = SEN_VOICE.magazam;
  const router = useRouter();
  const [sku, setSku] = useState(variant.sku);
  const [barcode, setBarcode] = useState(variant.barcode ?? "");
  const [price, setPrice] = useState(minorToLiraInput(variant.amountMinor));
  const [buffer, setBuffer] = useState(String(variant.safetyBuffer));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const amountMinor = liraInputToMinor(price);
  const safetyBuffer = Number(buffer);
  const bufferOk = Number.isInteger(safetyBuffer) && safetyBuffer >= 0;
  const sellable = bufferOk ? variant.onHandQty - safetyBuffer : variant.sellableQty;
  const canActivate =
    variant.status !== "ACTIVE" &&
    storeActive &&
    barcodeOk(barcode) &&
    typeof amountMinor === "number" &&
    bufferOk &&
    sellable >= 1;

  function blockReason(): string | null {
    if (variant.status === "ACTIVE") {
      return null;
    }
    if (!storeActive) {
      return copy.activateNeedStore;
    }
    if (!barcodeOk(barcode) || typeof amountMinor !== "number") {
      return copy.activateNeedPrice;
    }
    if (!bufferOk || sellable < 1) {
      return copy.activateNeedStock;
    }
    return null;
  }

  async function save(activate: boolean) {
    if (pending || (activate && !canActivate)) {
      return;
    }
    if (!sku.trim() || !bufferOk || amountMinor === "invalid") {
      setError(copy.activateNeedPrice);
      return;
    }
    setPending(true);
    setError("");
    const body: Record<string, unknown> = {
      sku: sku.trim().toUpperCase(),
      barcode: barcode.trim() ? barcode.trim() : null,
      amountMinor,
      safetyBuffer,
    };
    if (activate) {
      body.status = "ACTIVE";
    }
    const result = await commerceMutate(
      `/api/commerce/stores/${storeId}/variants/${variant.id}`,
      "PATCH",
      body,
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const reason = blockReason();

  return (
    <Card title={`${copy.variantTitle} · ${variant.sku}`}>
      <div className="grid gap-4">
        <p className="text-sm text-[var(--muted)]">
          {copy.onHand}: {variant.onHandQty} · {copy.sellable}: {variant.sellableQty} · {copy.status.variant[variant.status]}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`sku-${variant.id}`}>{copy.sku}</Label>
            <Input id={`sku-${variant.id}`} value={sku} maxLength={64} onChange={(event) => setSku(event.target.value)} />
          </div>
          <div>
            <Label htmlFor={`barcode-${variant.id}`}>{copy.barcode}</Label>
            <Input
              id={`barcode-${variant.id}`}
              value={barcode}
              inputMode="numeric"
              onChange={(event) => setBarcode(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`price-${variant.id}`}>{copy.price}</Label>
            <Input
              id={`price-${variant.id}`}
              value={price}
              inputMode="decimal"
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`buffer-${variant.id}`}>{copy.buffer}</Label>
            <Input
              id={`buffer-${variant.id}`}
              value={buffer}
              inputMode="numeric"
              onChange={(event) => setBuffer(event.target.value)}
            />
          </div>
        </div>
        {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
        {reason ? <p className="text-sm text-[var(--muted)]">{reason}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void save(false)} disabled={pending}>
            {pending ? copy.saving : copy.saveVariant}
          </Button>
          {variant.status === "ACTIVE" ? (
            <p className="self-center text-sm text-[var(--emerald)]">{copy.variantOpen}</p>
          ) : (
            <Button type="button" onClick={() => void save(true)} disabled={pending || !canActivate}>
              {copy.activateVariant}
            </Button>
          )}
          <LinkButton href={cockpitHref(`/magazam/${storeId}/stok?variantId=${variant.id}`)} variant="ghost">
            {copy.stockLink}
          </LinkButton>
        </div>
      </div>
    </Card>
  );
}

function NewVariantCard({
  storeId,
  productId,
  storeActive,
}: {
  storeId: string;
  productId: string;
  storeActive: boolean;
}) {
  const copy = SEN_VOICE.magazam;
  const router = useRouter();
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [onHand, setOnHand] = useState("1");
  const [buffer, setBuffer] = useState("0");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(mode: "draft" | "active") {
    if (pending) {
      return;
    }
    const body: Record<string, unknown> = { mode, sku: sku.trim() ? sku.trim().toUpperCase() : null };
    if (mode === "draft") {
      body.onHandQty = 0;
      body.safetyBuffer = 0;
    } else {
      const amountMinor = liraInputToMinor(price);
      const onHandQty = Number(onHand);
      const safetyBuffer = Number(buffer);
      if (!storeActive) {
        setError(copy.modeActiveBlocked);
        return;
      }
      if (amountMinor === "invalid" || amountMinor == null || !barcodeOk(barcode)) {
        setError(copy.activateNeedPrice);
        return;
      }
      if (!Number.isInteger(onHandQty) || !Number.isInteger(safetyBuffer) || onHandQty - safetyBuffer < 1) {
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
    const result = await commerceMutate(
      `/api/commerce/stores/${storeId}/products/${productId}/variants`,
      "POST",
      body,
      true,
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Card title={copy.newVariant}>
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="new-variant-sku">{copy.sku}</Label>
            <Input id="new-variant-sku" value={sku} maxLength={64} onChange={(event) => setSku(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="new-variant-barcode">{copy.barcode}</Label>
            <Input
              id="new-variant-barcode"
              value={barcode}
              inputMode="numeric"
              onChange={(event) => setBarcode(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-variant-price">{copy.price}</Label>
            <Input
              id="new-variant-price"
              value={price}
              inputMode="decimal"
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-variant-on-hand">{copy.onHand}</Label>
            <Input
              id="new-variant-on-hand"
              value={onHand}
              inputMode="numeric"
              onChange={(event) => setOnHand(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-variant-buffer">{copy.buffer}</Label>
            <Input
              id="new-variant-buffer"
              value={buffer}
              inputMode="numeric"
              onChange={(event) => setBuffer(event.target.value)}
            />
          </div>
        </div>
        {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void submit("draft")} disabled={pending}>
            {copy.modeDraft}
          </Button>
          <Button type="button" onClick={() => void submit("active")} disabled={pending || !storeActive}>
            {copy.modeActive}
          </Button>
        </div>
      </div>
    </Card>
  );
}
