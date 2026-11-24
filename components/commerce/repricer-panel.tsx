"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { commerceMutate } from "@/components/commerce/api";
import { minorToLiraInput } from "@/components/commerce/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BELOW_FLOOR_ALERT,
  PRICE_CHANNELS,
  PRICE_CHANNEL_LABELS,
  type PriceChannel,
  type RepriceStrategy,
} from "@/lib/commerce/repricer";
import { formatTryMinor } from "@/lib/commerce/storefront";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type RuleRow = {
  id: string;
  variantId: string;
  channel: PriceChannel;
  basePriceMinor: number;
  minMarginBps: number;
  manualFloorMinor: number | null;
  strategy: RepriceStrategy;
  stepMinor: number;
  autoApply: boolean;
  activePriceLabel: string;
  computedFloorMinor: number | null;
  computedFloorLabel: string | null;
};

type QuoteRow = {
  id: string;
  variantId: string;
  channel: PriceChannel;
  competitorName: string;
  competitorPriceLabel: string;
  observedAt: string;
};

type LogRow = {
  id: string;
  variantId: string;
  channel: PriceChannel;
  decision: string;
  previousPriceLabel: string;
  newPriceLabel: string;
  floorPriceLabel: string;
  competitorPriceLabel: string | null;
  createdAt: string;
};

type Desk = {
  rules: RuleRow[];
  quotes: QuoteRow[];
  logs: LogRow[];
};

const DECISION_LABEL: Record<string, string> = {
  UNDERCUT: "Rakibin altına indin",
  MATCHED: "En düşük fiyata eşitledin",
  HOLD_AT_FLOOR: "Tabanda kaldın, kâr korundu",
  COMPETITOR_BELOW_FLOOR_ALERT: BELOW_FLOOR_ALERT,
  REVERT_TO_BASE: "Baz fiyata döndün",
};

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

export function RepricerPanel({
  storeId,
  variantId,
}: {
  storeId: string;
  variantId: string;
}) {
  const router = useRouter();
  const [desk, setDesk] = useState<Desk | null>(null);
  const [channel, setChannel] = useState<PriceChannel>("TRENDYOL");
  const [baseTry, setBaseTry] = useState("");
  const [marginPercent, setMarginPercent] = useState("8");
  const [manualTry, setManualTry] = useState("");
  const [strategy, setStrategy] = useState<RepriceStrategy>("UNDERCUT_STEP");
  const [stepTry, setStepTry] = useState("1,00");
  const [autoApply, setAutoApply] = useState(true);
  const [competitorName, setCompetitorName] = useState("");
  const [competitorTry, setCompetitorTry] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!storeId) {
      return;
    }
    try {
      const response = await fetch(`/api/commerce/stores/${storeId}/repricer`, withRailApiVersion({ method: "GET" }));
      const result = parseRailClientJson<Desk>(await response.json().catch(() => null));
      if (result.ok) {
        setDesk(result.data);
      }
    } catch {
      setError("Rekabet masası okunamadı.");
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const rule = desk?.rules.find((row) => row.variantId === variantId && row.channel === channel) ?? null;

  useEffect(() => {
    if (!rule) {
      return;
    }
    setBaseTry(minorToLiraInput(rule.basePriceMinor));
    setMarginPercent(String(rule.minMarginBps / 100));
    setManualTry(rule.manualFloorMinor == null ? "" : minorToLiraInput(rule.manualFloorMinor));
    setStrategy(rule.strategy);
    setStepTry(minorToLiraInput(rule.stepMinor));
    setAutoApply(rule.autoApply);
  }, [rule]);

  async function saveRule() {
    if (!storeId || !variantId) {
      setError("Önce mağaza ve varyant seç.");
      return;
    }
    const basePriceMinor = parseTryMinor(baseTry);
    const minMarginBps = parsePercentBps(marginPercent);
    const stepMinor = parseTryMinor(stepTry);
    const manualFloorMinor = manualTry.trim() ? parseTryMinor(manualTry) : null;
    if (basePriceMinor == null || minMarginBps == null || stepMinor == null || (manualTry.trim() && manualFloorMinor == null)) {
      setError("Baz fiyat, marj ve adımı TL veya yüzde olarak doldur.");
      return;
    }
    setPending(true);
    setError("");
    const result = await commerceMutate<{ message?: string }>(
      `/api/commerce/stores/${storeId}/repricer/rules`,
      "POST",
      {
        variantId,
        channel,
        basePriceMinor,
        minMarginBps,
        manualFloorMinor,
        strategy,
        stepMinor,
        autoApply,
      },
      true,
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(typeof result.data.message === "string" ? result.data.message : "Kural yazıldı.");
    await load();
    router.refresh();
  }

  async function ingest() {
    if (!storeId || !variantId) {
      setError("Önce mağaza ve varyant seç.");
      return;
    }
    const competitorPriceMinor = parseTryMinor(competitorTry);
    const name = competitorName.trim();
    if (!name || competitorPriceMinor == null) {
      setError("Rakip adını ve fiyatını yaz.");
      return;
    }
    setPending(true);
    setError("");
    const result = await commerceMutate<{ message?: string; decisions?: Array<{ alert?: string | null }> }>(
      `/api/commerce/stores/${storeId}/competitors/ingest`,
      "POST",
      { variantId, channel, competitorName: name, competitorPriceMinor },
      true,
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const alert = result.data.decisions?.find((row) => row.alert)?.alert;
    setMessage(alert || (typeof result.data.message === "string" ? result.data.message : "Rakip fiyatı yazıldı."));
    await load();
    router.refresh();
  }

  async function downloadCsv() {
    if (!storeId) {
      return;
    }
    setError("");
    const response = await fetch(
      `/api/commerce/stores/${storeId}/economics/export-csv`,
      withRailApiVersion({ method: "GET" }),
    );
    if (!response.ok) {
      setError("CSV indirilemedi.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "maliyet-kanal.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function uploadCsv(file: File) {
    const csv = await file.text();
    setPending(true);
    setError("");
    const result = await commerceMutate<{ message?: string }>(
      `/api/commerce/stores/${storeId}/economics/import-csv`,
      "POST",
      { csv },
      true,
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(typeof result.data.message === "string" ? result.data.message : "CSV yazıldı.");
    await load();
    router.refresh();
  }

  const quotes = (desk?.quotes ?? []).filter((row) => row.variantId === variantId).slice(0, 6);
  const logs = (desk?.logs ?? []).filter((row) => row.variantId === variantId).slice(0, 8);

  return (
    <section className="rounded-2xl border border-[var(--border)] p-4" data-repricer-desk="">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Kanal bazlı fiyat ve akıllı rekabet</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Her kanalın tabanı komisyon, kargo, iade, KDV ve senin minimum kâr hedefinle hesaplanır. Rakip fiyatını sen
            veya entegrasyonun besler; fiyat tabanın altına inmez.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" disabled={pending || !storeId} onClick={() => void downloadCsv()}>
            CSV dışa aktar
          </Button>
          <label className="inline-flex cursor-pointer items-center rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-semibold">
            Toplu yükle
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) {
                  void uploadCsv(file);
                }
              }}
            />
          </label>
        </div>
      </div>
      {(message || error) && (
        <p className={`mt-3 text-sm ${error ? "text-[var(--rose)]" : "text-[var(--foreground)]"}`} role={error ? "alert" : "status"}>
          {error || message}
        </p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="rp-channel">Kanal</Label>
          <select
            id="rp-channel"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={channel}
            onChange={(event) => setChannel(event.target.value as PriceChannel)}
          >
            {PRICE_CHANNELS.map((item) => (
              <option key={item} value={item}>
                {PRICE_CHANNEL_LABELS[item]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="rp-base">Baz fiyat (TL)</Label>
          <Input id="rp-base" className="mt-1" inputMode="decimal" value={baseTry} onChange={(event) => setBaseTry(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="rp-margin">Minimum kâr (%)</Label>
          <Input
            id="rp-margin"
            className="mt-1"
            inputMode="decimal"
            value={marginPercent}
            onChange={(event) => setMarginPercent(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="rp-floor">Kâr korumalı taban (TL)</Label>
          <p id="rp-floor" className="mt-2 text-sm font-semibold tabular-nums">
            {rule?.computedFloorLabel ?? "Kuralı kaydedince hesaplanır"}
          </p>
        </div>
        <div>
          <Label htmlFor="rp-manual">Manuel taban (TL)</Label>
          <Input
            id="rp-manual"
            className="mt-1"
            inputMode="decimal"
            value={manualTry}
            onChange={(event) => setManualTry(event.target.value)}
            placeholder="Boş bırakabilirsin"
          />
        </div>
        <div>
          <Label htmlFor="rp-strategy">Strateji</Label>
          <select
            id="rp-strategy"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={strategy}
            onChange={(event) => setStrategy(event.target.value as RepriceStrategy)}
          >
            <option value="UNDERCUT_STEP">Rakibin altında adım</option>
            <option value="MATCH_LOWEST">En düşüğe eşitle</option>
            <option value="FIXED">Sabit baz fiyat</option>
          </select>
        </div>
        <div>
          <Label htmlFor="rp-step">Adım (TL)</Label>
          <Input id="rp-step" className="mt-1" inputMode="decimal" value={stepTry} onChange={(event) => setStepTry(event.target.value)} />
        </div>
        <label className="mt-6 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={autoApply} onChange={(event) => setAutoApply(event.target.checked)} />
          Otomatik uygula
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={() => void saveRule()}>
          Kuralı kaydet
        </Button>
        {rule ? (
          <p className="text-xs text-[var(--muted)]">
            Aktif fiyat {rule.activePriceLabel}
            {rule.computedFloorMinor != null ? ` · taban ${formatTryMinor(rule.computedFloorMinor)}` : ""}
          </p>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="rp-rival">Rakip adı</Label>
          <Input
            id="rp-rival"
            className="mt-1"
            value={competitorName}
            onChange={(event) => setCompetitorName(event.target.value)}
            placeholder="Akakçe satıcısı"
          />
        </div>
        <div>
          <Label htmlFor="rp-rival-price">Rakip fiyatı (TL)</Label>
          <Input
            id="rp-rival-price"
            className="mt-1"
            inputMode="decimal"
            value={competitorTry}
            onChange={(event) => setCompetitorTry(event.target.value)}
          />
        </div>
      </div>
      <Button type="button" size="sm" className="mt-3" variant="outline" disabled={pending} onClick={() => void ingest()}>
        Rakip fiyatını kaydet
      </Button>
      {quotes.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {quotes.map((row) => (
            <li key={row.id} className="text-xs text-[var(--muted)]">
              {PRICE_CHANNEL_LABELS[row.channel]} · {row.competitorName} · {row.competitorPriceLabel}
            </li>
          ))}
        </ul>
      ) : null}
      {logs.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {logs.map((row) => (
            <li key={row.id} className="rounded-xl border border-[var(--border)] p-3 text-sm">
              <p className="font-semibold">
                {PRICE_CHANNEL_LABELS[row.channel]} · {DECISION_LABEL[row.decision] ?? row.decision}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {row.previousPriceLabel} → {row.newPriceLabel} · taban {row.floorPriceLabel}
                {row.competitorPriceLabel ? ` · rakip ${row.competitorPriceLabel}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-[var(--muted)]">Rekabet kararı burada listelenir.</p>
      )}
    </section>
  );
}
