"use client";

import { useState } from "react";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  scoreTone,
  TETKIK_CATEGORY_LABELS,
  TETKIK_SEVERITY_LABELS,
  type TetkikAnalysisCard,
  type TetkikCategoryKey,
} from "@/lib/tezgah/tetkik/analysis";
import { buildTetkikPdf, tetkikPdfFileName } from "@/lib/tezgah/tetkik/document";
import { renderTetkikReportMarkdown } from "@/lib/tezgah/tetkik/prompts";
import { buildTetkikRevisionPack } from "@/lib/tezgah/tetkik/revision";
import type { TetkikReport, TetkikTechSeoSignal } from "@/lib/tezgah/tetkik/types";

const TECH_SEO_STATUS_LABEL: Record<TetkikTechSeoSignal["status"], string> = {
  found: "Var",
  missing: "Yok",
  unchecked: "Ölçülemedi",
};

function downloadPdf(filename: string, bytes: Uint8Array) {
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy.buffer], { type: "application/pdf" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

function TechSeoPanel({ signals }: { signals: readonly TetkikTechSeoSignal[] }) {
  if (signals.length === 0) {
    return null;
  }
  return (
    <section className="mt-8" data-tetkik-tech-seo="">
      <h3 className="mb-3 text-base font-semibold">Teknik SEO sinyalleri</h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {signals.map((row) => (
          <li
            key={row.id}
            className="rounded-2xl border border-[var(--border)] bg-white/90 p-4"
            data-tetkik-tech-seo-signal={row.id}
            data-status={row.status}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="text-sm font-semibold text-[var(--foreground)]">{row.label}</h4>
              <span
                className={
                  row.status === "found"
                    ? "text-xs font-semibold text-[var(--emerald)]"
                    : row.status === "missing"
                      ? "text-xs font-semibold text-[var(--rose)]"
                      : "text-xs font-semibold text-[var(--muted)]"
                }
              >
                {TECH_SEO_STATUS_LABEL[row.status]}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{row.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

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

const SCORE_RING: Record<"good" | "warn" | "bad", string> = {
  good: "stroke-[var(--emerald)] text-[var(--emerald)]",
  warn: "stroke-amber-500 text-amber-600",
  bad: "stroke-[var(--rose)] text-[var(--rose)]",
};

const SCORE_SURFACE: Record<"good" | "warn" | "bad", string> = {
  good: "border-emerald-200/80 bg-emerald-50/60",
  warn: "border-amber-200/80 bg-amber-50/60",
  bad: "border-rose-200/80 bg-rose-50/60",
};

const SEVERITY_BADGE: Record<keyof typeof TETKIK_SEVERITY_LABELS, string> = {
  critical: "bg-rose-100 text-rose-800 ring-rose-200",
  warning: "bg-amber-100 text-amber-900 ring-amber-200",
  good: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

const CATEGORY_ORDER: TetkikCategoryKey[] = ["seo", "copywriting", "conversion", "trust"];

function CircularScore({ score, maxScore }: { score: number; maxScore: number }) {
  const tone = scoreTone(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, score / maxScore));
  const offset = circumference * (1 - progress);
  return (
    <div className={`relative mx-auto flex h-40 w-40 items-center justify-center ${SCORE_RING[tone]}`}>
      <svg className="-rotate-90" width="160" height="160" viewBox="0 0 160 160" aria-hidden>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="10" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          className={SCORE_RING[tone]}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <p className="absolute inset-0 flex flex-col items-center justify-center" aria-label={`Genel skor ${score} / ${maxScore}`}>
        <span className="text-4xl font-semibold tracking-tight">{score}</span>
        <span className="text-sm font-medium text-[var(--muted)]">/{maxScore}</span>
      </p>
    </div>
  );
}

function CategoryBars({ categories }: { categories: TetkikAnalysisCard["categories"] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2" data-tetkik-categories="">
      {CATEGORY_ORDER.map((key) => {
        const row = categories[key];
        const tone = scoreTone(row.score);
        return (
          <div
            key={key}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
            data-tetkik-category={key}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">{TETKIK_CATEGORY_LABELS[key]}</h3>
              <span className={`text-sm font-semibold ${SCORE_RING[tone]}`}>{row.score}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${
                  tone === "good" ? "bg-[var(--emerald)]" : tone === "warn" ? "bg-amber-500" : "bg-[var(--rose)]"
                }`}
                style={{ width: `${row.score}%` }}
              />
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{row.comment}</p>
          </div>
        );
      })}
    </div>
  );
}

function AnalysisCardView({ report, analysis }: { report: TetkikReport; analysis: TetkikAnalysisCard }) {
  const tone = scoreTone(analysis.overallScore);
  return (
    <article
      data-tetkik-report=""
      data-tetkik-score={report.score}
      data-tetkik-analysis-card=""
      className={`rounded-[var(--radius-card)] border p-6 print:border-0 print:bg-white print:p-0 ${SCORE_SURFACE[tone]}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
        {YETKIN_BRAND} · Web Site Analizi
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{analysis.detectedBrand}</h2>
          <p className="mt-1 break-all text-sm text-[var(--safir-deep)]">{report.url}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{formatMeasuredAt(report.measuredAt)}</p>
          <p className="mt-4 text-sm leading-6 text-[var(--foreground)]">{analysis.summary}</p>
        </div>
        <div className={`rounded-3xl border bg-white/80 p-4 shadow-sm ${SCORE_SURFACE[tone]}`}>
          <CircularScore score={analysis.overallScore} maxScore={report.maxScore} />
          <p className="mt-1 text-center text-sm font-medium text-[var(--muted)]">Genel sağlık puanı</p>
        </div>
      </div>

      <section className="mt-8">
        <h3 className="mb-3 text-base font-semibold">Kategori karnesi</h3>
        <CategoryBars categories={analysis.categories} />
      </section>

      <TechSeoPanel signals={report.techSeo ?? []} />

      <section className="mt-8" data-tetkik-findings="">
        <h3 className="mb-3 text-base font-semibold">Bulgular ve çözümler</h3>
        <ul className="space-y-3">
          {analysis.findings.map((finding, index) => (
            <li
              key={`${finding.severity}-${finding.title}-${index}`}
              className="rounded-2xl border border-[var(--border)] bg-white/90 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${SEVERITY_BADGE[finding.severity]}`}
                >
                  {TETKIK_SEVERITY_LABELS[finding.severity]}
                </span>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">{finding.title}</h4>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{finding.detail}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                <span className="font-semibold">Çözüm: </span>
                {finding.actionFix}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8" data-tetkik-rewrites="">
        <h3 className="mb-3 text-base font-semibold">Hemen uygulanabilir metin önerileri</h3>
        <ul className="grid gap-3">
          {analysis.copyRewrites.map((row, index) => (
            <li
              key={`${row.current}-${index}`}
              className="grid gap-3 rounded-2xl border border-[var(--border)] bg-white/90 p-4 sm:grid-cols-2"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Mevcut durum</p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">{row.current}</p>
              </div>
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Önerilen yeni metin</p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">{row.suggested}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function LegacyNarrativeView({ report }: { report: TetkikReport }) {
  const accent =
    report.action.stage === "ads"
      ? "border-[var(--emerald)]"
      : report.action.stage === "ready"
        ? "border-[var(--border-strong)]"
        : "border-[var(--safir)]";
  const byline = [formatMeasuredAt(report.measuredAt), report.freelancerName.trim(), report.agencyName?.trim() ?? ""]
    .filter((part) => part.length > 0)
    .join(" · ");

  return (
    <article
      data-tetkik-report=""
      data-tetkik-score={report.score}
      data-tetkik-legacy=""
      className="rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--safir)_18%,transparent)] bg-[var(--surface)] p-6 print:border-0 print:bg-white print:p-0 print:shadow-none"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
        {YETKIN_BRAND} · Web Site Analizi
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">{report.disclaimer}</p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">{report.businessName}</h2>
      <p className="mt-1 break-all text-sm text-[var(--safir-deep)]">{report.url}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{byline}</p>
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

      <TechSeoPanel signals={report.techSeo ?? []} />

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
    </article>
  );
}

export function TetkikReportView({
  report,
  onRebuild,
  onCodePack,
  onAdsPack,
}: {
  report: TetkikReport;
  onRebuild: () => void;
  onCodePack: () => void;
  onAdsPack: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const markdown = renderTetkikReportMarkdown(report);
  const revision = buildTetkikRevisionPack(report);
  const analysis = report.analysis ?? null;

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
      {analysis ? <AnalysisCardView report={report} analysis={analysis} /> : <LegacyNarrativeView report={report} />}

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button
          type="button"
          variant="secondary"
          data-tetkik-pdf=""
          onClick={() => downloadPdf(tetkikPdfFileName(report), buildTetkikPdf(report))}
        >
          PDF İndir
        </Button>
        <Button type="button" variant="outline" onClick={() => window.print()}>
          Yazdır
        </Button>
        <Button type="button" variant="outline" onClick={() => void copyReport()}>
          {copied ? "Kopyalandı" : "Raporu kopyala"}
        </Button>
      </div>

      <section className="space-y-4 print:hidden" data-tetkik-next="">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          Raporu Eyleme Dönüştürün (Kendi Başınıza Hemen Uygulayın)
        </h2>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
          <Card
            variant="featured"
            eyebrow="Seçenek 1"
            title="Hazır Düzeltme & SEO Uygulama Paketi"
            className="print:hidden"
            bodyClassName="text-[var(--foreground)]"
          >
            <div data-tetkik-revision="">
              <p className="text-sm leading-6 text-[var(--muted)]">
                Bu rapordaki tüm eksikleri gideren hazır yeni başlıkları, SEO meta etiketlerini ve sitenize/yazılımcınıza
                doğrudan uygulatabileceğiniz adım adım düzeltme reçetesini tek tıkla üretin.
              </p>
              {revision.leftovers.length > 0 ? (
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Metinle kapanmayan maddeler: {revision.leftovers.join(", ")}. Yeni vitrin bunları hazır şablonda toplar.
                </p>
              ) : null}
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={() => void copyRevision("all", revision.markdown)}>
                  {copiedField === "all" ? "Kopyalandı" : "Hazır Düzeltme Paketini Üret"}
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

          <Card eyebrow="Seçenek 2" title="Sıfırdan Satış Odaklı Yeni Vitrin Kur" className="h-fit print:hidden">
            <div data-tetkik-rebuild="">
              <p className="text-sm leading-6 text-[var(--muted)]">
                Mevcut sitenizi düzeltmekle uğraşmak istemiyorsanız, tüm eksikleri giderilmiş ve müşteriyi doğrudan satışa
                yönlendiren yeni tek sayfalık vitrininizi 1 dakikada otomatik oluşturun.
              </p>
              <div className="mt-4">
                <Button
                  type="button"
                  className="w-full whitespace-normal px-4 py-2 text-center"
                  style={{ height: "auto", minHeight: "2.5rem" }}
                  onClick={onRebuild}
                >
                  Yeni Vitrinimi Otomatik Kur
                </Button>
              </div>
            </div>
          </Card>
        </div>
        <Card eyebrow="Seçenek 3" title="Sitenize Özel Hesaplayıcı veya Form Ekle" className="print:hidden">
          <div data-tetkik-codepack="">
            <p className="text-sm leading-6 text-[var(--muted)]">
              Ziyaretçilerinizi müşteriye dönüştürmek için sitenize gömebileceğiniz akıllı teklif veya hesaplama aracını
              hazırlayın.
            </p>
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full whitespace-normal px-4 py-2 text-center"
                style={{ height: "auto", minHeight: "2.5rem" }}
                onClick={onCodePack}
              >
                Özel Aracı Oluştur
              </Button>
            </div>
          </div>
        </Card>
        <Card eyebrow="Seçenek 4" title="Otonom Reklam Paketi Oluştur" className="print:hidden">
          <div data-tetkik-ads="">
            <p className="text-sm leading-6 text-[var(--muted)]">
              Site özeti ve hedefiniz reklam masasına aktarılır. Üç kanca, Meta ve Google arama metni kod mührüyle
              üretilir; erişim veya satış vaadi yoktur.
            </p>
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full whitespace-normal px-4 py-2 text-center"
                style={{ height: "auto", minHeight: "2.5rem" }}
                data-tetkik-ads-handoff=""
                onClick={onAdsPack}
              >
                Otonom Reklam Paketi Oluştur
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
