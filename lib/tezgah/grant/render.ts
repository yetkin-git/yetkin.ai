import { withTezgahDeliverySignature } from "@/lib/tezgah/delivery-signature";
import { catalogFigureLines, formatLegislationNote } from "@/lib/yetkinhibe/legislation-trace";
import { GRANT_EMPTY_ELIGIBLE_LINE } from "@/lib/yetkinhibe/grant-project-notes";
import { templateById, templateOutline } from "@/lib/yetkinhibe/templates";
import type { GrantDossier, GrantEligibleProgram, GrantProjectReport } from "@/lib/tezgah/grant/types";
import { personMonthAllocation, personMonthCell, workPackageMonths } from "@/lib/tezgah/grant/document";

function programText(program: GrantEligibleProgram): string {
  return [
    `${program.sourceLabel} — ${program.title}`,
    program.officialInfoUrl.startsWith("https://") ? program.officialInfoUrl : "",
    ...catalogFigureLines(program),
    ...program.criteria.map((row) => `${row.passed ? "Geçti" : "Kaldı"}: ${row.label}`),
  ]
    .filter((line) => line.length > 0)
    .join("\n");
}

function block(title: string, body: string): string {
  return `${title}\n${body}`;
}

/**
 * Adam-ay satırları (Ş8). Word tablosundaki kolonla aynı dağılımı düz metne taşır.
 * Atıf varsa madde numarası satıra yazılır; "Sayı yazılmadı" hiçbir yerde kalmaz.
 */
function personMonthLines(dossier: GrantDossier): string[] {
  const template = templateById(dossier.templateId);
  if (!template) {
    return [];
  }
  const months = template.workPackages.map(
    (_, index) => workPackageMonths(dossier.workPackages[index]?.windowLabel ?? ""),
  );
  const allocation = personMonthAllocation({ teamHeadcount: dossier.teamHeadcount, months });
  if (!allocation) {
    return [];
  }
  const articleMap = new Map<string, string>(
    (dossier.sectionArticles ?? []).map((row) => [row.title, row.article]),
  );
  const entry = [...articleMap.entries()].find(([title]) => {
    const folded = title.toLocaleLowerCase("tr");
    return folded.includes("adam-ay") || folded.includes("adam ay") || folded.includes("matris");
  });
  const article = entry?.[1] ?? null;
  const rows = template.workPackages.map((row, index) => {
    const value = allocation.perPackage[index] ?? 0;
    return `${row.name}: ${personMonthCell(value, article)}`;
  });
  return [`Toplam adam-ay: ${allocation.totalPersonMonths} · Ekip ${dossier.teamHeadcount} kişi`, ...rows];
}

/** Panoya giden düz metin. Katalog tutarı yalnız uygun satırın etiketinde durur. */
export function renderGrantProjectText(report: GrantProjectReport): string {
  const programs =
    report.eligible.length === 0 ? GRANT_EMPTY_ELIGIBLE_LINE : report.eligible.map((program) => programText(program)).join("\n\n");
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
            // Ş8 — adam-ay dağılımı düz metinde de dolu çıkar.
            ...personMonthLines(dossier),
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
        templateOutline(dossier.templateId).length > 0
          ? block("Kurum şablonu", [dossier.templateTitle ?? "", ...templateOutline(dossier.templateId)].filter((line) => line.length > 0).join("\n"))
          : "",
        dossier.templateSections && dossier.templateSections.length > 0
          ? block(
              "Şartname atıfları",
              dossier.templateSections.map((section) => `${section.title}\n${section.body}`).join("\n\n"),
            )
          : "",
      ]
    : [];

  const text = [
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
    formatLegislationNote(report.eligible),
  ]
    .filter((part) => part.length > 0)
    .join("\n\n");
  return withTezgahDeliverySignature(text);
}
