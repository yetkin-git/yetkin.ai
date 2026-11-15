"use client";

import { useState } from "react";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { renderTetkikReportMarkdown } from "@/lib/tezgah/tetkik/prompts";
import { buildTetkikRevisionPack } from "@/lib/tezgah/tetkik/revision";
import type { TetkikReport } from "@/lib/tezgah/tetkik/types";

function formatMeasuredAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export function TetkikReportView({
  report,
  onRebuild,
}: {
  report: TetkikReport;
  onRebuild: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const markdown = renderTetkikReportMarkdown(report);
  const revision = buildTetkikRevisionPack(report);
  const accent =
    report.action.stage === "ads"
      ? "border-[var(--emerald)]"
      : report.action.stage === "ready"
        ? "border-[var(--border-strong)]"
        : "border-[var(--safir)]";

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function copyRevision(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(id);
    } catch {
      setCopiedField(null);
    }
  }

  return (
    <div className="space-y-5">
    <article
      data-tetkik-report=""
      data-tetkik-score={report.score}
      className="rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--safir)_18%,transparent)] bg-[var(--surface)] p-6 print:border-0 print:bg-white print:p-0 print:shadow-none"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
        {YETKIN_BRAND} · Web Sitesi Tetkik
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">{report.disclaimer}</p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">{report.businessName}</h2>
      <p className="mt-1 break-all text-sm text-[var(--safir-deep)]">{report.url}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {formatMeasuredAt(report.measuredAt)} · {report.freelancerName}
        {report.agencyName ? ` · ${report.agencyName}` : ""}
      </p>
      {report.pageTitle ? (
        <p className="mt-2 text-sm text-[var(--muted)]">Sayfa başlığı: {report.pageTitle}</p>
      ) : null}

      <p
        className="mt-6 text-5xl font-semibold tracking-tight text-[var(--foreground)]"
        aria-label={`Dijital sağlık skoru ${report.score} / ${report.maxScore}`}
      >
        {report.score}
        <span className="text-2xl font-medium text-[var(--muted)]">/{report.maxScore}</span>
      </p>
      <p className="text-sm font-medium text-[var(--muted)]">Dijital sağlık skoru</p>

      <ul className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {report.checks.map((check) => (
          <li key={check.id} className="flex items-start justify-between gap-3 py-2 text-sm break-inside-avoid">
            <span>
              <span className="font-medium text-[var(--foreground)]">{check.label}</span>
              {check.detail ? <span className="ml-2 text-[var(--muted)]">{check.detail}</span> : null}
            </span>
            <span className={check.passed ? "text-[var(--emerald)]" : "text-[var(--rose)]"}>
              {check.passed ? "Geçti" : "Kaldı"} {check.earned}/{check.weight}
            </span>
          </li>
        ))}
      </ul>

      {report.opportunities.length > 0 ? (
        <section className="mt-6">
          <h3 className="text-base font-semibold">Fırsatlar</h3>
          <ul className="mt-2 space-y-2">
            {report.opportunities.map((line) => (
              <li key={line} className="text-sm leading-6 text-[var(--foreground)]">
                {line}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.narrative ? (
        <section className="mt-6 space-y-1.5 text-sm leading-6 text-[var(--foreground)]">
          {report.narrative.split("\n").map((line, index) => {
            if (line.startsWith("## ")) {
              return (
                <h3 key={`${index}-${line}`} className="pt-3 text-base font-semibold first:pt-0">
                  {line.slice(3)}
                </h3>
              );
            }
            if (!line.trim()) {
              return <div key={`gap-${index}`} className="h-2" />;
            }
            return <p key={`${index}-${line}`}>{line.replace(/^[-*]\s/, "")}</p>;
          })}
        </section>
      ) : null}

      <section className={`mt-6 border-l-4 ${accent} pl-4`}>
        <h3 className="text-base font-semibold">{report.action.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{report.action.body}</p>
      </section>

      <div className="mt-5 flex flex-wrap gap-2 print:hidden">
        <Button type="button" variant="secondary" onClick={() => window.print()}>
          Yazdır / PDF olarak kaydet
        </Button>
        <Button type="button" variant="outline" onClick={() => void copyReport()}>
          {copied ? "Kopyalandı" : "Raporu kopyala"}
        </Button>
      </div>
    </article>

    <div className="grid gap-4 print:hidden lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]" data-tetkik-next="">
      <Card
        variant="featured"
        eyebrow="Seçenek A"
        title="Mevcut Siteyi Düzenle (Revizyon Paketi)"
        className="print:hidden"
        bodyClassName="text-[var(--foreground)]"
      >
        <div data-tetkik-revision="">
          <p className="text-sm leading-6 text-[var(--muted)]">
            Kalan maddelere göre yapıştırmaya hazır metin. Çağrı bloğundaki numarayı kendi hattınızla değiştirin.
          </p>
          {revision.leftovers.length > 0 ? (
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Metinle kapanmayan maddeler: {revision.leftovers.join(", ")}. Yeniden inşa bunları hazır şablonda toplar.
            </p>
          ) : null}
          <div className="mt-4 flex justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={() => void copyRevision("all", revision.markdown)}>
              {copiedField === "all" ? "Kopyalandı" : "Revizyon paketini kopyala"}
            </Button>
          </div>
          <ul className="mt-4 space-y-4">
            {revision.fields.map((field) => (
              <li key={field.id} className="rounded-xl border border-[var(--border)] p-3" data-tetkik-revision-field={field.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">{field.label}</h3>
                  <span className={field.gap ? "text-xs font-semibold text-[var(--rose)]" : "text-xs font-semibold text-[var(--emerald)]"}>
                    {field.gap ? "Kaldı" : "Geçti"}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{field.note}</p>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-[var(--surface-muted)] p-3 text-sm leading-6 text-[var(--foreground)]">
                  {field.text}
                </pre>
                <div className="mt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => void copyRevision(field.id, field.text)}>
                    {copiedField === field.id ? "Kopyalandı" : "Kopyala"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card eyebrow="Seçenek B" title="Sıfırdan Yeniden İnşa Et" className="h-fit print:hidden">
        <div data-tetkik-rebuild="">
          <p className="text-sm leading-6 text-[var(--muted)]">
            İşletme adı ve ölçülen sayfa bilgisi Sektörel Dijital Dükkan formuna taşınır. Sektör, yer, WhatsApp ve
            hizmetleri tamamlayıp yeni vitrini üretin.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              className="w-full whitespace-normal px-4 py-2 text-center"
              style={{ height: "auto", minHeight: "2.5rem" }}
              onClick={onRebuild}
            >
              Sıfırdan Yeniden İnşa Et (Dijital Dükkan)
            </Button>
          </div>
        </div>
      </Card>
    </div>
    </div>
  );
}
