"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { commerceMutate } from "@/components/commerce/api";
import { RepricerPanel } from "@/components/commerce/repricer-panel";
import { cockpitHref } from "@/components/commerce/href";
import { minorToLiraInput } from "@/components/commerce/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { campaignPreviewInput } from "@/lib/commerce/campaign-preview";
import { pickPoolStore } from "@/lib/commerce/os-rules";
import type { OsCockpitView, OsProductView, OsVariantView } from "@/lib/commerce/os-types";
import {
  DEFAULT_VAT_BPS,
  calculateUnitNet,
  simulateCampaign,
  type CampaignVerdict,
  type ShippingBand,
} from "@/lib/commerce/profit";
import { RADAR_SOURCE_BADGE, type RadarSource } from "@/lib/commerce/radar-signals";
import { formatTryMinor } from "@/lib/commerce/storefront";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type SimResult = {
  discountBps: number;
  soldPriceMinor: number;
  netMinor: number;
  marginBps: number;
  breakEvenBps: number;
  verdict: CampaignVerdict;
};

type BundleRow = {
  id: string;
  type: string;
  singlePriceMinor: number;
  suggestedPriceMinor: number;
  netMinor: number;
  cargoSavedMinor: number;
  rationale: string;
  status: string;
  memberVariantIds?: string[];
  salesCopy?: string;
};

type ActionRow = {
  id: string;
  kind: string;
  expectedGainMinor: number;
  expectedGainLabel?: string;
  status: string;
  rationale: string;
};

type SuggestionRow = {
  id: string;
  title: string;
  category: string;
  targetPriceMinor: number;
  targetPriceLabel?: string;
  rationale: string;
  sources?: RadarSource[];
  seedHref: string;
};

function radarBadge(source: string): string | null {
  if (
    source === "OWN_CATALOG" ||
    source === "MARKETPLACE_TREND" ||
    source === "TETKIK" ||
    source === "GRANT_CALL"
  ) {
    return RADAR_SOURCE_BADGE[source];
  }
  return null;
}

type CampaignRow = {
  id: string;
  title: string;
  body: string;
  discountBps: number;
  verdict: string;
  netMinor: number;
  createdAt: string;
};

type VariantOption = { product: OsProductView; variant: OsVariantView };

function verdictLabel(verdict: CampaignVerdict): string {
  if (verdict === "LOSS") {
    return "Zarar";
  }
  if (verdict === "THIN") {
    return "İnce marj";
  }
  return "Güvenli";
}

/** "85,00" veya "85.00" → 8500 kuruş. Boş/bozuk → null. */
function parseTryMinor(raw: string): number | null {
  const text = raw.trim().replace(/\s|₺|tl/gi, "");
  if (!text) {
    return null;
  }
  const normalized = text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text;
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.round(value * 100);
}

/** "%21" veya "21" → 2100 bps. */
function parsePercentBps(raw: string): number | null {
  const text = raw.trim().replace("%", "").replace(",", ".");
  if (!text) {
    return null;
  }
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return null;
  }
  return Math.round(value * 100);
}

function parseGrams(raw: string): number | null {
  const text = raw.trim().replace(/\s|g|gram/gi, "").replace(",", ".");
  if (!text) {
    return null;
  }
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.round(value);
}

export function ProfitEnginesPanel({ view }: { view: OsCockpitView }) {
  const router = useRouter();
  const storeId = view.selectedStoreId ?? pickPoolStore(view.stores)?.id ?? "";
  // P1.6 — ürünün **tüm varyantları** seçilebilir; tek varyantla yetinilmez.
  const options: VariantOption[] = useMemo(
    () =>
      view.products.flatMap((product) =>
        product.variants
          .filter((variant) => variant.status !== "DRAFT" || variant.barcode != null)
          .map((variant) => ({ product, variant })),
      ),
    [view.products],
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const firstVariant = options[0]?.variant;
  const [variantId, setVariantId] = useState(firstVariant?.id ?? "");
  const [costTry, setCostTry] = useState(
    firstVariant?.costMinor != null ? minorToLiraInput(firstVariant.costMinor) : "50,00",
  );
  const [desiGrams, setDesiGrams] = useState(
    firstVariant?.desiGrams != null ? String(firstVariant.desiGrams) : "1000",
  );
  const [vatPercent, setVatPercent] = useState(
    firstVariant?.vatBps != null ? String(firstVariant.vatBps / 100) : String(DEFAULT_VAT_BPS / 100),
  );
  const [costIncludesVat, setCostIncludesVat] = useState(firstVariant?.costIncludesVat === true);
  const [commissionPercent, setCommissionPercent] = useState(String(view.trendyolEconomics.commissionBps / 100));
  const [cargoTry, setCargoTry] = useState(minorToLiraInput(view.trendyolEconomics.cargoMinorPerOrder));
  const [bandMax, setBandMax] = useState("3000");
  const [bandPriceTry, setBandPriceTry] = useState("39,90");
  const [discountBps, setDiscountBps] = useState(1000);
  const [sim, setSim] = useState<SimResult | null>(null);

  const [bundles, setBundles] = useState<BundleRow[]>([]);
  const [briefSummary, setBriefSummary] = useState("");
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [radarMessage, setRadarMessage] = useState("");
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);

  useEffect(() => {
    if (!variantId && options[0]?.variant.id) {
      setVariantId(options[0].variant.id);
    }
  }, [options, variantId]);

  useEffect(() => {
    const row = options.find((item) => item.variant.id === variantId)?.variant;
    if (!row) {
      return;
    }
    setCostTry(row.costMinor != null ? minorToLiraInput(row.costMinor) : "50,00");
    setDesiGrams(row.desiGrams != null ? String(row.desiGrams) : "1000");
    setVatPercent(row.vatBps != null ? String(row.vatBps / 100) : String(DEFAULT_VAT_BPS / 100));
    setCostIncludesVat(row.costIncludesVat === true);
  }, [options, variantId]);

  const selected = options.find((row) => row.variant.id === variantId) ?? options[0] ?? null;
  const listPriceMinor = selected?.variant.amountMinor ?? 0;

  const parsed = useMemo(() => {
    const costMinor = parseTryMinor(costTry);
    const grams = parseGrams(desiGrams);
    const vatBps = parsePercentBps(vatPercent);
    const commissionBps = parsePercentBps(commissionPercent);
    const cargoMinor = parseTryMinor(cargoTry);
    return { costMinor, grams, vatBps, commissionBps, cargoMinor };
  }, [costTry, desiGrams, vatPercent, commissionPercent, cargoTry]);

  const tariffs: ShippingBand[] = useMemo(() => {
    const max = parseGrams(bandMax);
    const price = parseTryMinor(bandPriceTry);
    if (max == null || price == null) {
      return [];
    }
    return [{ bandMinGrams: 0, bandMaxGrams: max, priceMinor: price }];
  }, [bandMax, bandPriceTry]);

  /**
   * Anlık önizleme — slider hareket ettikçe istemcide hesaplanır, sunucuya yazılmaz.
   * Kargo, desi barem bandına düşüyorsa **baremden** okunur (günlük tarama da öyle yapar);
   * düşmüyorsa düz kargo alanı geçerlidir.
   */
  const live = useMemo(() => {
    const { costMinor, grams, vatBps, commissionBps, cargoMinor } = parsed;
    if (costMinor == null || grams == null || vatBps == null || commissionBps == null || cargoMinor == null) {
      return null;
    }
    if (listPriceMinor < 1) {
      return null;
    }
    const band = tariffs.find((row) => grams >= row.bandMinGrams && grams <= row.bandMaxGrams) ?? null;
    const cargo = band?.priceMinor ?? cargoMinor;
    const unit = calculateUnitNet({
      priceMinor: listPriceMinor,
      quantity: 1,
      costMinor,
      commissionBps,
      cargoMinor: cargo,
      returnRateBps: 800,
      adCostMinorPerOrder: 0,
      vatBps,
      costIncludesVat,
    });
    const campaign = simulateCampaign(
      campaignPreviewInput({
        priceMinor: listPriceMinor,
        discountBps,
        costMinor,
        vatBps,
        channel: view.trendyolEconomics,
        costIncludesVat,
      }),
    );
    return { unit, campaign, cargoMinor: cargo, bandApplied: band != null };
  }, [parsed, listPriceMinor, discountBps, tariffs, view.trendyolEconomics, costIncludesVat]);

  const run = useCallback(
    async <T extends Record<string, unknown>>(url: string, method: "POST" | "GET", body?: Record<string, unknown>) => {
      if (!storeId) {
        setError("Önce mağaza aç.");
        return null;
      }
      setPending(true);
      setError("");
      setMessage("");
      if (method === "GET") {
        try {
          const response = await fetch(url, withRailApiVersion({ method: "GET" }));
          const result = parseRailClientJson<T>(await response.json().catch(() => null));
          setPending(false);
          if (!result.ok) {
            setError(result.error);
            return null;
          }
          return result.data;
        } catch {
          setPending(false);
          setError("Ağ hatası.");
          return null;
        }
      }
      const result = await commerceMutate<T>(url, "POST", body ?? {}, true);
      setPending(false);
      if (!result.ok) {
        setError(result.error);
        return null;
      }
      if (typeof result.data.message === "string") {
        setMessage(result.data.message);
      }
      router.refresh();
      return result.data;
    },
    [router, storeId],
  );

  async function saveEconomics() {
    if (!variantId) {
      setError("Önce varyant seç.");
      return;
    }
    const { costMinor, grams, vatBps, commissionBps, cargoMinor } = parsed;
    if (costMinor == null || grams == null || vatBps == null || commissionBps == null || cargoMinor == null) {
      setError("Maliyet, desi, KDV, komisyon ve kargo alanlarını TL / gram / % olarak doldur.");
      return;
    }
    const bandMaxGrams = parseGrams(bandMax);
    const bandPriceMinor = parseTryMinor(bandPriceTry);
    await run(`/api/commerce/stores/${storeId}/economics`, "POST", {
      unit: { variantId, costMinor, desiGrams: grams, vatBps, costIncludesVat },
      channel: { channel: "TRENDYOL", commissionBps, cargoMinorPerOrder: cargoMinor },
      ...(bandMaxGrams != null && bandPriceMinor != null
        ? { tariff: { carrier: "varsayilan", bandMinGrams: 0, bandMaxGrams, priceMinor: bandPriceMinor } }
        : {}),
    });
  }

  async function runSimulate() {
    if (!variantId) {
      setError("Simülasyon için varyant seç.");
      return;
    }
    const data = await run<SimResult & { message?: string }>(
      `/api/commerce/stores/${storeId}/campaigns/simulate`,
      "POST",
      { variantId, channel: "TRENDYOL", discountBps },
    );
    if (data && typeof data.verdict === "string") {
      setSim({
        discountBps,
        soldPriceMinor: Number(data.soldPriceMinor),
        netMinor: Number(data.netMinor),
        marginBps: Number(data.marginBps),
        breakEvenBps: Number(data.breakEvenBps),
        verdict: data.verdict,
      });
    }
  }

  async function saveCampaign() {
    if (!variantId) {
      setError("Kayıt için varyant seç.");
      return;
    }
    if (live?.campaign.verdict === "LOSS") {
      setError("Bu indirim zarar yazıyor. Kampanya kaydedilmedi.");
      return;
    }
    const data = await run<{ title?: string; body?: string; message?: string }>(
      `/api/commerce/stores/${storeId}/campaigns`,
      "POST",
      { variantId, channel: "TRENDYOL", discountBps },
    );
    // P2 / M3-4 — AI metni üretilip ekranda görünmüyordu. Artık başlık ve gövde basılır.
    if (data) {
      setCampaignTitle(typeof data.title === "string" ? data.title : "");
      setCampaignBody(typeof data.body === "string" ? data.body : "");
    }
    await loadCampaigns();
  }

  async function loadCampaigns() {
    const data = await run<{ campaigns?: CampaignRow[] }>(`/api/commerce/stores/${storeId}/campaigns`, "GET");
    if (data?.campaigns) {
      setCampaigns(data.campaigns);
    }
  }

  async function proposeBundles() {
    const data = await run<{ proposals?: BundleRow[] }>(`/api/commerce/stores/${storeId}/bundles/propose`, "POST", {});
    if (data?.proposals) {
      setBundles(data.proposals);
    }
  }

  async function loadBundles() {
    const data = await run<{ proposals?: BundleRow[] }>(`/api/commerce/stores/${storeId}/bundles`, "GET");
    if (data?.proposals) {
      setBundles(data.proposals);
    }
  }

  async function acceptBundle(id: string) {
    await run(`/api/commerce/stores/${storeId}/bundles/${id}/accept`, "POST", {});
    await loadBundles();
  }

  async function loadBrief() {
    const data = await run<{
      brief?: { summaryText?: string };
      actions?: ActionRow[];
      message?: string;
    }>(`/api/commerce/stores/${storeId}/briefs/today`, "GET");
    if (data?.brief?.summaryText) {
      setBriefSummary(data.brief.summaryText);
    }
    if (data?.actions) {
      setActions(data.actions);
    }
  }

  async function applyAction(id: string) {
    await run(`/api/commerce/stores/${storeId}/actions/${id}/apply`, "POST", {});
    await loadBrief();
  }

  async function scanRadar() {
    const data = await run<{ suggestions?: SuggestionRow[]; message?: string }>(
      `/api/commerce/stores/${storeId}/radar/scan`,
      "POST",
      {},
    );
    if (data?.suggestions) {
      setSuggestions(data.suggestions);
    }
    if (typeof data?.message === "string") {
      setRadarMessage(data.message);
    }
  }

  if (!storeId) {
    return (
      <p className="mt-4 text-sm text-[var(--muted)]">
        Kâr motorları için önce Ürün ve Stok Havuzu&apos;nda mağaza aç.
      </p>
    );
  }

  const campaignVerdict = live?.campaign.verdict ?? null;
  const inProfitZone =
    campaignVerdict === "SAFE" && live != null && live.campaign.breakEvenBps > 0 && discountBps <= live.campaign.breakEvenBps;

  return (
    <div className="mt-6 grid gap-4" data-profit-engines="">
      {(message || error) && (
        <p
          className={`text-sm ${error ? "text-[var(--rose)]" : "text-[var(--foreground)]"}`}
          role={error ? "alert" : "status"}
        >
          {error || message}
        </p>
      )}

      <section className="rounded-2xl border border-[var(--border)] p-4">
        <h2 className="text-sm font-semibold">Maliyet, KDV ve kargo baremi</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Kâr hesabı uydurma yapmaz. Maliyeti TL, desiyi gram, oranı yüzde olarak sen girersin. Satış fiyatı KDV
          dahildir; KDV net kârdan düşer.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Label htmlFor="pe-variant">Ürün / varyant</Label>
            {options.length > 0 ? (
              <select
                id="pe-variant"
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                value={variantId}
                onChange={(event) => setVariantId(event.target.value)}
              >
                {options.map((row) => (
                  <option key={row.variant.id} value={row.variant.id}>
                    {row.product.title} · {row.variant.sku}
                    {row.variant.status === "ACTIVE" ? "" : " (pasif)"}
                    {row.variant.hasEconomics ? "" : " — maliyet yok"}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="pe-variant"
                className="mt-1"
                value={variantId}
                onChange={(event) => setVariantId(event.target.value)}
                placeholder="Varyant kimliği"
              />
            )}
          </div>
          <div>
            <Label htmlFor="pe-cost">Maliyet (TL)</Label>
            <Input
              id="pe-cost"
              className="mt-1"
              inputMode="decimal"
              value={costTry}
              onChange={(event) => setCostTry(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pe-desi">Desi (gram)</Label>
            <Input
              id="pe-desi"
              className="mt-1"
              inputMode="numeric"
              value={desiGrams}
              onChange={(event) => setDesiGrams(event.target.value)}
            />
          </div>
          <label className="mt-6 flex items-center gap-2 text-sm" htmlFor="pe-cost-vat">
            <input
              id="pe-cost-vat"
              type="checkbox"
              checked={costIncludesVat}
              onChange={(event) => setCostIncludesVat(event.target.checked)}
            />
            Maliyet KDV dahil
          </label>
          <div>
            <Label htmlFor="pe-vat">KDV (%)</Label>
            <Input
              id="pe-vat"
              className="mt-1"
              inputMode="decimal"
              value={vatPercent}
              onChange={(event) => setVatPercent(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pe-commission">Komisyon (%)</Label>
            <Input
              id="pe-commission"
              className="mt-1"
              inputMode="decimal"
              value={commissionPercent}
              onChange={(event) => setCommissionPercent(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pe-cargo">Kargo (TL)</Label>
            <Input
              id="pe-cargo"
              className="mt-1"
              inputMode="decimal"
              value={cargoTry}
              onChange={(event) => setCargoTry(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pe-band">Barem üst (gram)</Label>
            <Input
              id="pe-band"
              className="mt-1"
              inputMode="numeric"
              value={bandMax}
              onChange={(event) => setBandMax(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pe-band-price">Barem fiyatı (TL)</Label>
            <Input
              id="pe-band-price"
              className="mt-1"
              inputMode="decimal"
              value={bandPriceTry}
              onChange={(event) => setBandPriceTry(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button type="button" size="sm" disabled={pending} onClick={() => void saveEconomics()}>
            Maliyeti kaydet
          </Button>
          {live ? (
            <p className="text-xs text-[var(--muted)]">
              Liste {formatTryMinor(listPriceMinor)} · KDV {formatTryMinor(live.unit.vatMinor)} · Kargo{" "}
              {formatTryMinor(live.cargoMinor)}
              {live.bandApplied ? " (barem)" : ""} · Net{" "}
              <span className="font-semibold text-[var(--foreground)]">{formatTryMinor(live.unit.netMinor)}</span> · Marj{" "}
              {(live.unit.marginBps / 100).toFixed(1)}%
            </p>
          ) : null}
        </div>
        {listPriceMinor < 1 && selected ? (
          <p className="mt-2 text-xs text-[var(--rose)]">
            Bu varyantın fiyatı yok. Önce ürün kartında fiyat yaz.
          </p>
        ) : null}
        {options.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--muted)]">Önce havuza aktif varyantlı ürün yaz; sonra maliyeti bağla.</p>
        ) : null}
        <p className="mt-2 text-xs text-[var(--muted)]">
          {options.length} varyant listelendi. Maliyet ve desi varyant başına kaydedilir.
        </p>
      </section>

      <RepricerPanel storeId={storeId} variantId={variantId} />

      <section className="rounded-2xl border border-[var(--border)] p-4">
        <h2 className="text-sm font-semibold">Kâr korumalı indirim simülatörü</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Kaydırıcı indirimi anlık hesaplar. Hesap, kayıtlı kanal komisyonu, kargo ve iade oranını kullanır.
          Başabaşın üstüne çıkarsan zarar uyarısı gelir.
        </p>
        <Label htmlFor="pe-discount" className="mt-3">
          İndirim: %{(discountBps / 100).toFixed(0)}
        </Label>
        <input
          id="pe-discount"
          type="range"
          min={0}
          max={5000}
          step={100}
          value={discountBps}
          className="mt-2 w-full"
          onChange={(event) => setDiscountBps(Number(event.target.value))}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => void runSimulate()}>
            Sunucuda doğrula
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={pending || live?.campaign.verdict === "LOSS"}
            onClick={() => void saveCampaign()}
          >
            Kaydet ve metin üret
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => void loadCampaigns()}>
            Kampanyaları getir
          </Button>
        </div>
        {live ? (
          <div
            className={`mt-3 rounded-xl border p-3 text-sm ${
              live.campaign.verdict === "LOSS"
                ? "border-rose-200 bg-rose-50 text-rose-900"
                : live.campaign.verdict === "THIN"
                  ? "border-amber-200 bg-amber-50 text-amber-950"
                  : "border-emerald-200 bg-emerald-50 text-emerald-950"
            }`}
          >
            <p className="font-semibold">{verdictLabel(live.campaign.verdict)}</p>
            <p className="mt-1">
              Satış {formatTryMinor(live.campaign.soldPriceMinor)} · Net{" "}
              {formatTryMinor(live.campaign.netMinor)} · Marj {(live.campaign.marginBps / 100).toFixed(1)}%
            </p>
            <p className="mt-1 text-xs">
              {live.campaign.verdict === "LOSS" ? (
                <>
                  Bu SKU liste fiyatında bile zarar ediyor. İndirim uygulanamaz; önce fiyatı veya maliyeti düzelt.
                  {live.campaign.breakEvenBps === 0 ? " Başabaş payı sıfır." : ""}
                </>
              ) : (
                <>
                  Başabaş indirim: %{(live.campaign.breakEvenBps / 100).toFixed(0)}
                  {inProfitZone ? " — kâr bölgesindesin." : " — kâr bölgesi dışındasın."}
                </>
              )}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-[var(--muted)]">
            Anlık önizleme için maliyet, KDV ve komisyon alanlarını doldur.
          </p>
        )}
        {sim ? (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Sunucu doğrulaması: {verdictLabel(sim.verdict)} · net {formatTryMinor(sim.netMinor)} · başabaş %
            {(sim.breakEvenBps / 100).toFixed(0)}
          </p>
        ) : null}
        {campaignTitle || campaignBody ? (
          <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <p className="text-sm font-semibold">{campaignTitle}</p>
            <p className="mt-1 text-sm leading-6">{campaignBody}</p>
          </div>
        ) : null}
        {campaigns.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {campaigns.slice(0, 6).map((row) => (
              <li key={row.id} className="rounded-xl border border-[var(--border)] p-3 text-sm">
                <p className="font-semibold">{row.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{row.body}</p>
                <p className="mt-1 text-xs">
                  İndirim %{(row.discountBps / 100).toFixed(0)} · net {formatTryMinor(row.netMinor)} · {row.verdict}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[var(--border)] p-4">
        <h2 className="text-sm font-semibold">Barem kırıcı paketler</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Aynı kargo bandında 2&apos;li / 3&apos;lü set önerir. Set kartı maliyeti üyelerden devralır.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" disabled={pending} onClick={() => void proposeBundles()}>
            Paket tara
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => void loadBundles()}>
            Önerileri getir
          </Button>
        </div>
        {bundles.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">Henüz öneri yok.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {bundles.map((row) => (
              <li key={row.id} className="rounded-xl border border-[var(--border)] p-3 text-sm">
                <p className="font-semibold">
                  {row.type === "THREE" ? "3'lü set" : "2'li set"} · {formatTryMinor(row.suggestedPriceMinor)}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">{row.rationale}</p>
                <p className="mt-1 text-xs">
                  Tekil {formatTryMinor(row.singlePriceMinor)} · Paket net {formatTryMinor(row.netMinor)}
                  <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                    Kargo −{formatTryMinor(row.cargoSavedMinor)}
                  </span>
                </p>
                {row.salesCopy ? <p className="mt-1 text-xs">{row.salesCopy}</p> : null}
                {row.status === "PROPOSED" ? (
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2"
                    disabled={pending}
                    onClick={() => void acceptBundle(row.id)}
                  >
                    Tek tıkla set ürün oluştur
                  </Button>
                ) : (
                  <p className="mt-2 text-xs font-semibold text-[var(--safir-deep)]">{row.status}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--border)] p-4">
        <h2 className="text-sm font-semibold">Kâr özeti ve fırsat radarı</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Zarar eden SKU&apos;lar, kritik stok ve katalog boşlukları. Rakam uydurulmaz.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" disabled={pending} onClick={() => void loadBrief()}>
            Bugünün özetini getir
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => void scanRadar()}>
            Fırsat radarı tara
          </Button>
        </div>
        {briefSummary ? <p className="mt-3 text-sm">{briefSummary}</p> : null}
        {actions.length > 0 ? (
          <ul className="mt-2 grid gap-2">
            {actions.map((action) => (
              <li key={action.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="min-w-0">
                  <span className="font-semibold">{action.kind}</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">{action.rationale}</span>
                </span>
                {action.status === "SUGGESTED" ? (
                  <Button type="button" size="sm" disabled={pending} onClick={() => void applyAction(action.id)}>
                    Tek tıkla uygula
                  </Button>
                ) : (
                  <span className="text-xs text-[var(--muted)]">{action.status}</span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
        {radarMessage ? <p className="mt-3 text-sm text-[var(--muted)]">{radarMessage}</p> : null}
        {suggestions.length > 0 ? (
          <ul className="mt-2 grid gap-2">
            {suggestions.map((row) => (
              <li key={row.id} className="rounded-xl border border-[var(--border)] p-3 text-sm">
                <p className="font-semibold">{row.title}</p>
                {row.sources && row.sources.length > 0 ? (
                  <p className="mt-1 flex flex-wrap gap-1">
                    {row.sources.map((source) => {
                      const label = radarBadge(source);
                      return label ? (
                        <span
                          key={source}
                          data-radar-source={source}
                          className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                        >
                          {label}
                        </span>
                      ) : null;
                    })}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-[var(--muted)]">{row.rationale}</p>
                <p className="mt-1 text-xs">Hedef {row.targetPriceLabel ?? formatTryMinor(row.targetPriceMinor)}</p>
                <Link
                  href={cockpitHref(row.seedHref)}
                  className="mt-2 inline-block text-sm font-semibold text-[var(--safir-deep)] hover:underline"
                >
                  Havuza taslak olarak yaz
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
