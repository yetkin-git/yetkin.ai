"use client";

import { useState } from "react";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { TEZGAH_DELIVERY_SIGNATURE } from "@/lib/tezgah/delivery-signature";
import { Button } from "@/components/ui/button";
import { renderGrantProjectText } from "@/lib/tezgah/grant/render";
import type { GrantProjectReport } from "@/lib/tezgah/grant/types";
import {
  GRANT_EMPTY_ELIGIBLE_LINE,
  GRANT_PROJECT_DISCLAIMER,
  isGrantWithheldNote,
} from "@/lib/yetkinhibe/grant-project-notes";

function formatPreparedAt(iso: string): string {
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

export function GrantProjectReportView({ report }: { report: GrantProjectReport }) {
  const [copied, setCopied] = useState(false);
  const closed = report.closed.filter((row) => isGrantWithheldNote(row.note));
  const unverified = report.unverified.filter((row) => isGrantWithheldNote(row.note));

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(renderGrantProjectText(report));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article
      data-grant-report=""
      data-grant-eligible={report.eligible.length}
      className="rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--safir)_18%,transparent)] bg-[var(--surface)] p-6 print:border-0 print:bg-white print:p-0 print:shadow-none"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
        {YETKIN_BRAND} · Hibe Proje Dosyası
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">{GRANT_PROJECT_DISCLAIMER}</p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">{report.businessName}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {formatPreparedAt(report.preparedAt)} · {report.freelancerName}
      </p>
      <p className="mt-2 text-sm text-[var(--foreground)]">
        {report.provinceLabel} · {report.audienceLabel} · {report.naceLabel} · {report.investmentFocusLabel}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {report.employeeCount} çalışan · {report.companyAgeYears} yıl · {report.rdLabel} · {report.exportLabel} ·{" "}
        {report.patentLabel}
      </p>

      <section className="mt-6">
        <h3 className="text-base font-semibold">Uygun programlar</h3>
        {report.eligible.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{GRANT_EMPTY_ELIGIBLE_LINE}</p>
        ) : (
          <div className="mt-3 space-y-4">
            {report.eligible.map((program) => (
              <section key={program.grantId} className="break-inside-avoid">
                <h4 className="text-sm font-semibold text-[var(--foreground)]">
                  {program.sourceLabel} — {program.title}
                </h4>
                <p className="mt-1 break-all text-sm text-[var(--safir-deep)]">
                  {program.officialInfoUrl.startsWith("https://") ? program.officialInfoUrl : ""}
                </p>
                <p className="mt-2 text-sm text-[var(--foreground)]">{program.poolLabel}</p>
                <p className="text-sm text-[var(--foreground)]">{program.ceilingLabel}</p>
                <p className="text-sm text-[var(--foreground)]">{program.ratioLabel}</p>
                <ul className="mt-2 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  {program.criteria.map((row) => (
                    <li key={row.key} className="flex items-start justify-between gap-3 py-2 text-sm">
                      <span>{row.label}</span>
                      <span className="text-[var(--emerald)]">Geçti</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </section>

      {closed.length > 0 ? (
        <section className="mt-6">
          <h3 className="text-base font-semibold">Kapalı katalog</h3>
          <ul className="mt-2 space-y-2">
            {closed.map((row) => (
              <li key={row.grantId} className="text-sm leading-6 text-[var(--foreground)]">
                {row.sourceLabel} — {row.title}. {row.note}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {unverified.length > 0 ? (
        <section className="mt-6">
          <h3 className="text-base font-semibold">Doğrulanmamış katalog</h3>
          <ul className="mt-2 space-y-2">
            {unverified.map((row) => (
              <li key={row.grantId} className="text-sm leading-6 text-[var(--foreground)]">
                {row.sourceLabel} — {row.title}. {row.note}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        <h3 className="text-base font-semibold">Projenin amacı ve gerekçesi</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{report.purpose}</p>
      </section>
      <section className="mt-6">
        <h3 className="text-base font-semibold">Pazar ve ihtiyaç analizi</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{report.market}</p>
      </section>

      <section className="mt-6">
        <h3 className="text-base font-semibold">İş planı</h3>
        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="py-2 font-medium">Adım</th>
              <th className="py-2 font-medium">Ay aralığı</th>
            </tr>
          </thead>
          <tbody>
            {report.schedule.map((row) => (
              <tr key={row.id} className="border-b border-[var(--border)] break-inside-avoid">
                <td className="py-2">
                  {row.name}
                  {row.draft ? <span className="ml-2 text-[var(--muted)]">Taslak</span> : null}
                </td>
                <td className="py-2">{row.windowLabel ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6">
        <h3 className="text-base font-semibold">Yatırım kalemleri</h3>
        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="py-2 font-medium">Kalem</th>
              <th className="py-2 font-medium">Girilen tutar</th>
            </tr>
          </thead>
          <tbody>
            {report.investments.map((row) => (
              <tr key={row.category} className="border-b border-[var(--border)] break-inside-avoid">
                <td className="py-2">{row.label}</td>
                <td className="py-2">{row.amountLabel ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6">
        <h3 className="text-base font-semibold">Risk ve sürdürülebilirlik</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{report.risk}</p>
      </section>

      {report.dossier ? (
        <section className="mt-8 border-t border-[var(--border)] pt-6" data-grant-dossier="">
          <h3 className="text-lg font-semibold">Tam Proje Başvuru Dosyası</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{report.dossier.disclaimer}</p>
          <section className="mt-6">
            <h3 className="text-base font-semibold">Hedeflenen program</h3>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
              {report.dossier.targetSourceLabel} — {report.dossier.targetTitle}
            </p>
            <p className="mt-1 break-all text-sm text-[var(--safir-deep)]">
              {report.dossier.targetInfoUrl.startsWith("https://") ? report.dossier.targetInfoUrl : ""}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--foreground)]">
              {report.dossier.criterionLabels.map((label, index) => (
                <li key={`${index}-${label}`}>{label}</li>
              ))}
            </ul>
          </section>
          <section className="mt-6">
            <h3 className="text-base font-semibold">Proje Özeti</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{report.dossier.summary}</p>
          </section>
          <section className="mt-6">
            <h3 className="text-base font-semibold">İş Paketleri Takvimi</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{report.dossier.durationNote}</p>
            <p className="mt-1 text-sm text-[var(--foreground)]">{report.dossier.durationMonths} ay</p>
            <table className="mt-2 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="py-2 font-medium">İş paketi</th>
                  <th className="py-2 font-medium">Ay aralığı</th>
                </tr>
              </thead>
              <tbody>
                {report.dossier.workPackages.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] break-inside-avoid">
                    <td className="py-2">{row.name}</td>
                    <td className="py-2">{row.windowLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="mt-6">
            <h3 className="text-base font-semibold">Bütçe Gerekçelendirme Tablosu</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{report.dossier.budgetNote}</p>
            <table className="mt-2 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="py-2 font-medium">Kalem</th>
                  <th className="py-2 font-medium">Tahmini tutar</th>
                </tr>
              </thead>
              <tbody>
                {report.dossier.budgetRows.map((row) => (
                  <tr key={row.category} className="border-b border-[var(--border)] break-inside-avoid">
                    <td className="py-2">{row.label}</td>
                    <td className="py-2">{row.amountLabel}</td>
                  </tr>
                ))}
                <tr className="break-inside-avoid">
                  <td className="py-2 font-medium">Toplam</td>
                  <td className="py-2 font-medium">{report.dossier.budgetTotalLabel}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{report.dossier.budgetRationale}</p>
          </section>
          <section className="mt-6">
            <h3 className="text-base font-semibold">Ekip Yetkinlik Matrisi</h3>
            <table className="mt-2 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="py-2 font-medium">Yetkinlik alanı</th>
                  <th className="py-2 font-medium">Kişi</th>
                  <th className="py-2 font-medium">Not</th>
                </tr>
              </thead>
              <tbody>
                {report.dossier.teamRows.map((row, index) => (
                  <tr key={`${index}-${row.area}`} className="border-b border-[var(--border)] break-inside-avoid">
                    <td className="py-2">{row.area}</td>
                    <td className="py-2">{row.headcountLabel ?? "—"}</td>
                    <td className="py-2">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{report.dossier.competencyNote}</p>
          </section>
          <section className="mt-6">
            <h3 className="text-base font-semibold">Ticarileşme Planı</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{report.dossier.outputGoal}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{report.dossier.commercialization}</p>
          </section>
        </section>
      ) : null}

      <p className="mt-6 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--muted)]">
        <a href="https://yetkin.ai/tezgah" className="underline underline-offset-4">
          {TEZGAH_DELIVERY_SIGNATURE}
        </a>
      </p>
      <div className="mt-5 flex flex-wrap gap-2 print:hidden">
        <Button type="button" variant="secondary" onClick={() => window.print()}>
          Yazdır / PDF olarak kaydet
        </Button>
        <Button type="button" variant="outline" onClick={() => void copyReport()}>
          {copied ? "Kopyalandı" : "Dosyayı kopyala"}
        </Button>
      </div>
    </article>
  );
}
