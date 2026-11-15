import { GRANT_EMPTY_ELIGIBLE_LINE } from "@/lib/yetkinhibe/grant-project-notes";
import type { GrantProjectReport } from "@/lib/tezgah/grant/types";

function block(title: string, body: string): string {
  return `${title}\n${body}`;
}

/** Panoya giden düz metin. Katalog tutarı yalnız uygun satırın etiketinde durur. */
export function renderGrantProjectText(report: GrantProjectReport): string {
  const programs =
    report.eligible.length === 0
      ? GRANT_EMPTY_ELIGIBLE_LINE
      : report.eligible
          .map((program) =>
            [
              `${program.sourceLabel} — ${program.title}`,
              program.poolLabel,
              program.ceilingLabel,
              program.ratioLabel,
              ...program.criteria.map((row) => `${row.passed ? "Geçti" : "Kaldı"}: ${row.label}`),
            ].join("\n"),
          )
          .join("\n\n");
  const closed =
    report.closed.length === 0
      ? ""
      : report.closed.map((row) => `${row.sourceLabel} — ${row.title}. ${row.note}`).join("\n");
  const unverified =
    report.unverified.length === 0
      ? ""
      : report.unverified.map((row) => `${row.sourceLabel} — ${row.title}. ${row.note}`).join("\n");
  const schedule = report.schedule
    .map((row) => `${row.name}: ${row.windowLabel ?? "süre boş"}${row.draft ? " (taslak)" : ""}`)
    .join("\n");
  const investments = report.investments
    .map((row) => `${row.label}: ${row.amountLabel ?? "—"}`)
    .join("\n");
  const dossier = report.dossier;
  const dossierParts = dossier
    ? [
        "Tam Proje Başvuru Dosyası",
        dossier.disclaimer,
        block(
          "Hedeflenen program",
          [
            `${dossier.targetSourceLabel} — ${dossier.targetTitle}`,
            dossier.targetInfoUrl,
            ...dossier.criterionLabels,
          ].join("\n"),
        ),
        block("Proje Özeti", dossier.summary),
        block(
          "İş Paketleri Takvimi",
          [
            dossier.durationNote,
            `${dossier.durationMonths} ay`,
            ...dossier.workPackages.map((row) => `${row.name}: ${row.windowLabel}`),
          ].join("\n"),
        ),
        block(
          "Bütçe Gerekçelendirme Tablosu",
          [
            dossier.budgetNote,
            ...dossier.budgetRows.map((row) => `${row.label}: ${row.amountLabel}`),
            `Toplam: ${dossier.budgetTotalLabel}`,
            dossier.budgetRationale,
          ].join("\n"),
        ),
        block(
          "Ekip Yetkinlik Matrisi",
          [
            ...dossier.teamRows.map(
              (row) => `${row.area}: ${row.headcountLabel ?? "—"} — ${row.note}`,
            ),
            dossier.competencyNote,
          ].join("\n"),
        ),
        block("Ticarileşme Planı", `${dossier.outputGoal}\n${dossier.commercialization}`),
      ]
    : [];

  return [
    report.disclaimer,
    report.businessName,
    report.freelancerName,
    report.provinceLabel,
    `${report.audienceLabel} · ${report.naceLabel} · ${report.investmentFocusLabel}`,
    block("Uygun programlar", programs),
    closed ? block("Kapalı katalog", closed) : "",
    unverified ? block("Doğrulanmamış katalog", unverified) : "",
    block("Projenin amacı ve gerekçesi", report.purpose),
    block("Pazar ve ihtiyaç analizi", report.market),
    block("İş planı", schedule),
    block("Yatırım kalemleri", investments),
    block("Risk ve sürdürülebilirlik", report.risk),
    ...dossierParts,
  ]
    .filter((part) => part.length > 0)
    .join("\n\n");
}
