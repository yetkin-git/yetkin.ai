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
import { buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type MatchResult = {
  matchScorePct: number | null;
  openCallCount: number;
  supportBand: string;
  programLabel: string;
  constraintLabel?: string | null;
  constraintLabels?: readonly string[];
  passedConstrained?: number;
  constrainedCount?: number;
};

const EMPTY_FIELDS_MESSAGE = "İş fikrini yaz, sektörü, ili ve ölçeği seç.";

/**
 * Anonim hibe ön uygunluğu. Deterministik tezgâh eşlemesini çağırır.
 * Skor LLM’sizdir; alan koçluğu SmartTextarea ile ayrıdır. E-posta istemez.
 */
export function GrantEligibilityWidget() {
  const [idea, setIdea] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [sectorCode, setSectorCode] = useState("");
  const [audience, setAudience] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [companyAgeYears, setCompanyAgeYears] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) {
      return;
    }
    if (!idea.trim() || !sectorCode || !provinceCode || (audience !== "yeni_girisimci" && audience !== "mevcut_kobi")) {
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
            audience,
            employeeCount: employeeCount.trim(),
            companyAgeYears: companyAgeYears.trim(),
          }),
        }),
      );
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: MatchResult;
      };
      if (!response.ok || body.ok === false || !body.data) {
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
        Hibe uygunluğunu ücretsiz gör
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        İş fikrini, sektörünü, ilini ve ölçeğini yaz. Skor katalogdaki açık çağrılardan hesaplanır. Resmî onay değildir.
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
              placeholder="İş fikrini buraya yaz…"
              maxLength={600}
              softHint="Daha doğru sonuç için ne yapacağını birkaç kelimeyle daha aç."
              readyHint="✓ İş fikrin analiz için hazır."
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
              <option value="">Sektör seç</option>
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
              <option value="">İl seç</option>
              {GRANT_PROVINCES.map((row) => (
                <option key={row.code} value={row.code}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          İşletme ölçeği
          <select
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
          >
            <option value="">Ölçek seç</option>
            <option value="yeni_girisimci">Yeni girişim</option>
            <option value="mevcut_kobi">Mevcut KOBİ</option>
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Çalışan sayısı
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              inputMode="numeric"
              value={employeeCount}
              onChange={(event) => setEmployeeCount(event.target.value.replace(/[^\d]/g, "").slice(0, 6))}
              placeholder="Örn. 12"
              aria-describedby="hibe-employee-hint"
            />
          </label>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Şirket yaşı (yıl)
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              inputMode="numeric"
              value={companyAgeYears}
              onChange={(event) => setCompanyAgeYears(event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
              placeholder="Örn. 4"
              aria-describedby="hibe-employee-hint"
            />
          </label>
        </div>
        <p id="hibe-employee-hint" className="text-xs text-[var(--muted)]">
          Boş bırakırsan ölçek varsayılanı kullanılır; varsayılan senin yerine gerçek yazılmaz.
        </p>
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
          {/*
            Ş4 / B-05 — "%100" yerine «Geçen Kısıt: X / Y». Tek kısıt geçmek uygunluk
            değildir; yüzde yalnız iki ve daha fazla kısıtlı kriterde basılır.
          */}
          {result.constraintLabel ? (
            <p className="text-2xl font-semibold tabular-nums text-[var(--foreground)]" data-grant-constraint-label="">
              {result.constraintLabel}
            </p>
          ) : (
            <p className="text-sm font-semibold text-[var(--foreground)]" data-grant-constraint-none="">
              Bu çağrı özel kısıt yazmıyor. Uygunluk yine kurumun kararıdır.
            </p>
          )}
          {result.constraintLabels && result.constraintLabels.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1.5" data-grant-constraint-tags="">
              {result.constraintLabels.map((label) => (
                <li
                  key={label}
                  className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-[var(--foreground)]"
                >
                  {label}
                </li>
              ))}
            </ul>
          ) : null}
          {typeof result.matchScorePct === "number" && result.matchScorePct < 100 ? (
            <p className="mt-2 text-xs text-[var(--muted)]">Kısıtlı kriter uyumu %{result.matchScorePct}.</p>
          ) : null}
          <p className="mt-1 text-sm text-[var(--foreground)]">Ön uygunluk. Resmî onay değildir.</p>
          <p className="mt-3 text-sm text-[var(--foreground)]">Açık çağrı: {result.openCallCount}</p>
          <p className="mt-1 text-sm text-[var(--foreground)]">{result.supportBand}</p>
          {result.programLabel ? (
            <p className="mt-1 text-sm text-[var(--muted)]">Yakın program: {result.programLabel}</p>
          ) : null}
          <div className="mt-4">
            {/*
              CRO: skoru gören ziyaretçi proje dosyası aşamasında kayıt olur.
              Hedef `next=/hibe` ile korunur; çıplak `/login` duvarı yok.
            */}
            <LinkButton href={buildCitizenRegisterHref("/panel/hibe") as Route} variant="success" size="sm">
              Proje dosyasını aç (ücretsiz kayıt)
            </LinkButton>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Kayıttan sonra proje dosyası ekranına dönersin.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
