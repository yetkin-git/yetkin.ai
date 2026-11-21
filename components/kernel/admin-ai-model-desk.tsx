"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { INPUT_SURFACE_CLASS, selectValueTypoClass } from "@/components/ui/input";
import { ADMIN_AI_MODELS_PATH } from "@/lib/kernel/admin/types";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

const SLOTS = ["textEasy", "textDeep", "imageEasy", "imageDeep", "voiceEasy", "voiceDeep"] as const;

type SlotKey = (typeof SLOTS)[number];

type CatalogModel = {
  id: string;
  displayName: string;
  kind: "text" | "image" | "voice" | "other";
};

type DeskPayload = {
  defaults: Record<SlotKey, string>;
  stored: Record<SlotKey, string | null>;
  resolved: Record<SlotKey, string>;
  models: CatalogModel[];
  source: "google" | "fallback";
  updatedAt: string | null;
};

const GROUPS: ReadonlyArray<{
  title: string;
  rows: ReadonlyArray<{ slot: SlotKey; label: string; hint: string; kind: CatalogModel["kind"] }>;
}> = [
  {
    title: "Metin & Analiz İşleri",
    rows: [
      {
        slot: "textEasy",
        label: "Kolay & Hızlı İşler",
        hint: "Teklif, Reklam, Form Koçu, Asistan",
        kind: "text",
      },
      {
        slot: "textDeep",
        label: "Kapsamlı & Derin Analiz",
        hint: "Web Site Analizi",
        kind: "text",
      },
    ],
  },
  {
    title: "Görsel Üretim İşleri",
    rows: [
      {
        slot: "imageEasy",
        label: "Kolay & Hızlı Görsel",
        hint: "Nano Banana 2 Lite",
        kind: "image",
      },
      {
        slot: "imageDeep",
        label: "Kapsamlı & Yüksek Kalite Görsel",
        hint: "Nano Banana 2",
        kind: "image",
      },
    ],
  },
  {
    title: "Seslendirme (TTS) İşleri",
    rows: [
      {
        slot: "voiceEasy",
        label: "Kolay & Hızlı Seslendirme",
        hint: "Kısa ürün sesi",
        kind: "voice",
      },
      {
        slot: "voiceDeep",
        label: "Kapsamlı & Yüksek Kalite Seslendirme",
        hint: "Uzun ürün sesi",
        kind: "voice",
      },
    ],
  },
];

function isSlotKey(value: string): value is SlotKey {
  return (SLOTS as readonly string[]).includes(value);
}

function readDesk(data: Record<string, unknown>): DeskPayload | null {
  if (!data.defaults || !data.stored || !data.resolved || !Array.isArray(data.models)) {
    return null;
  }
  const defaults = {} as Record<SlotKey, string>;
  const stored = {} as Record<SlotKey, string | null>;
  const resolved = {} as Record<SlotKey, string>;
  const defaultsRaw = data.defaults as Record<string, unknown>;
  const storedRaw = data.stored as Record<string, unknown>;
  const resolvedRaw = data.resolved as Record<string, unknown>;
  for (const slot of SLOTS) {
    if (typeof defaultsRaw[slot] !== "string" || typeof resolvedRaw[slot] !== "string") {
      return null;
    }
    const storedValue = storedRaw[slot];
    if (storedValue != null && typeof storedValue !== "string") {
      return null;
    }
    defaults[slot] = defaultsRaw[slot];
    resolved[slot] = resolvedRaw[slot];
    stored[slot] = typeof storedValue === "string" ? storedValue : null;
  }
  const models: CatalogModel[] = [];
  for (const row of data.models) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const model = row as Record<string, unknown>;
    if (typeof model.id !== "string" || typeof model.displayName !== "string") {
      continue;
    }
    const kind = model.kind;
    if (kind !== "text" && kind !== "image" && kind !== "voice" && kind !== "other") {
      continue;
    }
    models.push({ id: model.id, displayName: model.displayName, kind });
  }
  return {
    defaults,
    stored,
    resolved,
    models,
    source: data.source === "google" ? "google" : "fallback",
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
  };
}

function optionsFor(models: CatalogModel[], kind: CatalogModel["kind"], selected: string, fallbackId: string) {
  const rows = models.filter((model) => model.kind === kind);
  const ids = new Set(rows.map((model) => model.id));
  if (selected && !ids.has(selected)) {
    rows.unshift({ id: selected, displayName: selected, kind });
  }
  if (!ids.has(fallbackId) && fallbackId !== selected) {
    rows.push({ id: fallbackId, displayName: fallbackId, kind });
  }
  return rows;
}

export function AdminAiModelDesk() {
  const [desk, setDesk] = useState<DeskPayload | null>(null);
  const [draft, setDraft] = useState<Record<SlotKey, string> | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh: boolean) => {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(
        refresh ? `${ADMIN_AI_MODELS_PATH}?refresh=1` : ADMIN_AI_MODELS_PATH,
        withRailApiVersion({ method: "GET", cache: "no-store" }),
      );
      const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      const next = readDesk(parsed.data);
      if (!next) {
        setError("Model masası okunamadı.");
        return;
      }
      setDesk(next);
      const selected = {} as Record<SlotKey, string>;
      for (const slot of SLOTS) {
        selected[slot] = next.stored[slot] ?? "";
      }
      setDraft(selected);
      if (refresh) {
        setNotice(next.source === "google" ? "Google model listesi güncellendi." : "Google listesi alınamadı. Yedek liste açık.");
      }
    } catch {
      setError("Model masası okunamadı.");
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  async function onSave() {
    if (!draft) {
      return;
    }
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const body: Record<string, string | null> = {};
      for (const slot of SLOTS) {
        if (!isSlotKey(slot)) {
          continue;
        }
        body[`${slot}ModelId`] = draft[slot] ? draft[slot] : null;
      }
      const response = await fetch(
        ADMIN_AI_MODELS_PATH,
        withRailApiVersion({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      setNotice("Değişiklikler kaydedildi.");
      await load(false);
    } catch {
      setError("Kayıt tamamlanamadı.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card
      eyebrow="Super Admin"
      title="Yapay Zeka Model Yönetimi (Super Admin)"
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => void load(true)}
        >
          Google&apos;dan Güncel Modelleri Getir
        </Button>
      }
    >
      <p className="text-sm text-[var(--muted)]">
        Metin yuvaları teklif, reklam, form koçu, asistan ve web site analizini çağrı anında bağlar.
        Görsel ve ses yuvaları bu satıra yazılır. Akademi fırın mühürleri (görsel ve ses fabrikası) bu
        masadan okunmaz.
      </p>
      {!desk || !draft ? (
        <p className="mt-4 text-sm text-[var(--muted)]">{error ?? "Model masası yükleniyor."}</p>
      ) : (
        <div className="mt-5 space-y-6">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h3 className="text-sm font-semibold tracking-tight">{group.title}</h3>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {group.rows.map((row) => {
                  const selected = draft[row.slot];
                  const options = optionsFor(desk.models, row.kind, selected, desk.defaults[row.slot]);
                  return (
                    <label key={row.slot} className="block rounded-xl border border-slate-200 p-3">
                      <span className="text-sm font-medium">{row.label}</span>
                      <span className="mt-0.5 block text-xs text-[var(--muted)]">{row.hint}</span>
                      <select
                        className={cn("mt-2", INPUT_SURFACE_CLASS, selectValueTypoClass(selected))}
                        value={selected}
                        disabled={pending}
                        onChange={(event) =>
                          setDraft((current) =>
                            current ? { ...current, [row.slot]: event.target.value } : current,
                          )
                        }
                      >
                        <option value="">Kod varsayılanı ({desk.defaults[row.slot]})</option>
                        {options.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.displayName} ({model.id})
                          </option>
                        ))}
                      </select>
                      <span className="mt-2 inline-flex rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium">
                        Aktif: {desk.resolved[row.slot]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted)]">
              {desk.source === "google" ? "Liste Google'dan geldi." : "Liste yedek kimliklerden kuruldu."}
              {desk.updatedAt ? ` Son kayıt: ${desk.updatedAt}` : " Kayıtlı satır yok; kod varsayılanı yürür."}
            </p>
            <Button type="button" size="sm" disabled={pending} onClick={() => void onSave()}>
              Değişiklikleri Kaydet
            </Button>
          </div>
        </div>
      )}
      {notice ? <p className="mt-3 text-sm text-[var(--emerald)]">{notice}</p> : null}
      {error && desk ? <p className="mt-3 text-sm text-[var(--rose)]">{error}</p> : null}
    </Card>
  );
}
