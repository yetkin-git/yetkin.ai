"use client";

import { useState, type FormEvent } from "react";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { LinkButton } from "@/components/ui/link-button";
import { selectValueTypoClass } from "@/components/ui/input";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import {
  GRANT_NACE_GROUPS,
  GRANT_PROVINCES,
} from "@/lib/yetkinhibe/grant-brief-axes";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type MatchResult = {
  matchScorePct: number;
  openCallCount: number;
  supportBand: string;
  programLabel: string;
};

const EMPTY_FIELDS_MESSAGE = "Lütfen iş fikrinizi yazın, sektör ve il seçin.";

/**
 * Anonim hibe ön uygunluğu. Deterministik tezgâh eşlemesini çağırır.
 * Skor LLM’sizdir; alan koçluğu SmartTextarea ile ayrıdır. E-posta istemez.
 */
export function GrantEligibilityWidget() {
  const [idea, setIdea] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [sectorCode, setSectorCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) {
      return;
    }
    if (!idea.trim() || !sectorCode || !provinceCode) {
      setError(EMPTY_FIELDS_MESSAGE);
      setResult(null);
      return;
    }
    setPending(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(
        "/api/tezgah/grant/match",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            idea: idea.trim(),
            provinceCode,
            sectorCode,
          }),
        }),
      );
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: MatchResult;
      };
      if (!response.ok || body.ok === false || !body.data || typeof body.data.matchScorePct !== "number") {
        setError(typeof body.error === "string" ? body.error : "Uygunluk hesaplanamadı.");
        return;
      }
      setResult(body.data);
    } catch {
      setError("Uygunluk hesaplanamadı.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="relative mt-8" aria-labelledby="home-grant-heading" data-home-grant="">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        KOBİ ve girişimci
      </p>
      <h2
        id="home-grant-heading"
        className="mt-1.5 text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl"
      >
        Hibe uygunluğunu ücretsiz görün
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        İş fikrinizi, sektörünüzü ve ilinizi yazın. Skor katalogdaki açık çağrılardan hesaplanır. Resmî onay değildir.
      </p>
      <form
        className="mt-4 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
        onSubmit={(event) => void onSubmit(event)}
        noValidate
      >
        <label className="block text-sm font-medium text-[var(--foreground)]">
          İş fikri
          <div className="mt-1">
            <SmartTextarea
              context="hibe"
              value={idea}
              onChange={(event) => {
                setIdea(event.target.value);
                if (error === EMPTY_FIELDS_MESSAGE) {
                  setError("");
                }
              }}
              placeholder="İş fikrinizi buraya yazınız..."
              maxLength={600}
              softHint="Daha doğru sonuç için ne yapacağınızı birkaç kelimeyle daha açın."
              readyHint="✓ İş fikriniz analiz için hazır."
            />
          </div>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Sektör
            <select
              className={cn(
                "mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm",
                selectValueTypoClass(sectorCode),
              )}
              value={sectorCode}
              onChange={(event) => {
                setSectorCode(event.target.value);
                if (error === EMPTY_FIELDS_MESSAGE) {
                  setError("");
                }
              }}
            >
              <option value="">Sektör seçiniz...</option>
              {GRANT_NACE_GROUPS.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            İl
            <select
              className={cn(
                "mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm",
                selectValueTypoClass(provinceCode),
              )}
              value={provinceCode}
              onChange={(event) => {
                setProvinceCode(event.target.value);
                if (error === EMPTY_FIELDS_MESSAGE) {
                  setError("");
                }
              }}
            >
              <option value="">İl seçiniz...</option>
              {GRANT_PROVINCES.map((row) => (
                <option key={row.code} value={row.code}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="!bg-[var(--safir)] !text-white shadow-md hover:!bg-[var(--safir-deep)] disabled:opacity-70"
        >
          {pending ? "Hesaplanıyor…" : "Hibe Uygunluğumu Hesapla (Ücretsiz)"}
        </Button>
        {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      </form>
      {result ? (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--safir-soft)] p-4" data-grant-match-result="">
          <p className="text-3xl font-semibold tabular-nums text-[var(--foreground)]">%{result.matchScorePct}</p>
          <p className="mt-1 text-sm text-[var(--foreground)]">Ön uygunluk. Resmî onay değildir.</p>
          <p className="mt-3 text-sm text-[var(--foreground)]">Açık çağrı: {result.openCallCount}</p>
          <p className="mt-1 text-sm text-[var(--foreground)]">Tahmini destek bandı: {result.supportBand}</p>
          {result.programLabel ? (
            <p className="mt-1 text-sm text-[var(--muted)]">Yakın program: {result.programLabel}</p>
          ) : null}
          <div className="mt-4">
            <LinkButton href={"/hibe" as Route} variant="success" size="sm">
              YetkinHibe işletim sisteminde proje dosyasını aç
            </LinkButton>
          </div>
        </div>
      ) : null}
    </section>
  );
}
