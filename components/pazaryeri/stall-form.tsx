"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseMajorToMinor } from "@/lib/kernel/money/format";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { MarketplaceProductCategory } from "@/lib/pazaryeri/types";
import { settlementKindForCategory } from "@/lib/pazaryeri/category";
import { yetkinIlanHref } from "@/lib/kernel/yetkinilan";
import { PAZARYERI_SEN } from "@/lib/copy/sen-voice/pazaryeri";

export function StallForm() {
  const router = useRouter();
  const copy = PAZARYERI_SEN.stall;
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<MarketplaceProductCategory>("DIGITAL_GOOD");
  const [amountMajor, setAmountMajor] = useState("100");
  const [isOfferAllowed, setIsOfferAllowed] = useState(false);
  const [tkgmBlockParcel, setTkgmBlockParcel] = useState("");
  const [insuranceQuoteHook, setInsuranceQuoteHook] = useState("quick");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const cashPath = settlementKindForCategory(category);
  const modelNotice = cashPath === "DIGITAL_GOOD" ? copy.modelSettlement : copy.modelEscrow;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    let amountMinor: number;
    try {
      amountMinor = parseMajorToMinor(amountMajor, SETTLEMENT_CURRENCY);
    } catch (caught) {
      setPending(false);
      setError(caught instanceof Error ? caught.message : "Tutar okunamadı.");
      return;
    }
    const response = await fetch("/api/pazaryeri/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        summary,
        category,
        amountMinor,
        isOfferAllowed: category === "REAL_ESTATE" || category === "VEHICLE" ? true : isOfferAllowed,
        tkgmBlockParcel: category === "REAL_ESTATE" ? tkgmBlockParcel : null,
        insuranceQuoteHook: category === "VEHICLE" ? insuranceQuoteHook : null,
      }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string; product?: { slug: string } };
    setPending(false);
    if (!body.ok || !body.product) {
      setError(body.error ?? copy.fail);
      return;
    }
    router.push(yetkinIlanHref(`/${body.product.slug}`));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        {copy.titleLabel}
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} />
      </label>
      <label className="block text-sm">
        {copy.summaryLabel}
        <textarea
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          required
          minLength={8}
          rows={4}
        />
      </label>
      <label className="block text-sm">
        {copy.categoryLabel}
        <select
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          value={category}
          onChange={(event) => {
            const next = event.target.value as MarketplaceProductCategory;
            setCategory(next);
            if (next === "REAL_ESTATE" || next === "VEHICLE") {
              setIsOfferAllowed(true);
            }
          }}
        >
          <option value="DIGITAL_GOOD">{copy.digitalOption}</option>
          <option value="SERVICE">{copy.serviceOption}</option>
          <option value="REAL_ESTATE">{copy.realEstateOption}</option>
          <option value="VEHICLE">{copy.vehicleOption}</option>
        </select>
      </label>
      <p className="rounded-2xl border border-[var(--safir-soft)] bg-[var(--safir-soft)] px-4 py-3 text-sm text-[var(--foreground)]">
        {modelNotice}
      </p>
      {category === "REAL_ESTATE" ? (
        <label className="block text-sm">
          {copy.tkgmLabel}
          <Input
            value={tkgmBlockParcel}
            onChange={(event) => setTkgmBlockParcel(event.target.value)}
            placeholder="Ada 12 / Parsel 34"
            required
          />
        </label>
      ) : null}
      {category === "VEHICLE" ? (
        <label className="block text-sm">
          {copy.insuranceLabel}
          <select
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={insuranceQuoteHook}
            onChange={(event) => setInsuranceQuoteHook(event.target.value)}
          >
            <option value="quick">Quick</option>
            <option value="hepiyi">Hepiyi</option>
          </select>
        </label>
      ) : (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isOfferAllowed}
            onChange={(event) => setIsOfferAllowed(event.target.checked)}
          />
          {copy.offerAllowed}
        </label>
      )}
      <label className="block text-sm">
        {copy.priceLabel}
        <Input value={amountMajor} onChange={(event) => setAmountMajor(event.target.value)} required />
      </label>
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? copy.pending : copy.submit}
      </Button>
    </form>
  );
}
