import type { DocumentBlock } from "@/lib/yetkinhibe/document-block";
import { buildPlainPdf } from "@/lib/yetkinhibe/plain-pdf";
import { renderTetkikReportMarkdown } from "@/lib/tezgah/tetkik/prompts";
import type { TetkikReport } from "@/lib/tezgah/tetkik/types";

function clip(value: string, max: number): string {
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max);
}

/** Tetkik raporunu düz PDF bloklarına çevirir. */
export function tetkikReportToBlocks(report: TetkikReport): DocumentBlock[] {
  const brand = report.analysis?.detectedBrand || report.businessName;
  const blocks: DocumentBlock[] = [
    { kind: "h1", text: clip(brand, 120) || "Web Site Analizi" },
    { kind: "p", text: clip(report.url, 300) },
    { kind: "p", text: `Dijital sağlık skoru: ${report.score}/${report.maxScore}` },
    { kind: "p", text: clip(report.disclaimer, 400) },
  ];

  if ((report.techSeo?.length ?? 0) > 0) {
    blocks.push({ kind: "h2", text: "Teknik SEO" });
    blocks.push({
      kind: "table",
      headers: ["Sinyal", "Durum", "Detay"],
      rows: (report.techSeo ?? []).map((row) => [row.label, row.status, clip(row.detail, 120)]),
    });
  }

  if (report.analysis) {
    blocks.push({ kind: "h2", text: "Özet" });
    blocks.push({ kind: "p", text: clip(report.analysis.summary, 600) });
    blocks.push({ kind: "h2", text: "Kategoriler" });
    blocks.push({
      kind: "table",
      headers: ["Kategori", "Puan", "Yorum"],
      rows: Object.entries(report.analysis.categories).map(([key, value]) => [
        key,
        String(value.score),
        clip(value.comment, 160),
      ]),
    });
    blocks.push({ kind: "h2", text: "Bulgular" });
    for (const finding of report.analysis.findings) {
      blocks.push({
        kind: "p",
        text: `[${finding.severity}] ${clip(finding.title, 120)} — ${clip(finding.detail, 240)} → ${clip(finding.actionFix, 240)}`,
      });
    }
    blocks.push({ kind: "h2", text: "Metin önerileri" });
    for (const row of report.analysis.copyRewrites) {
      blocks.push({
        kind: "p",
        text: `Mevcut: ${clip(row.current, 200)} | Öneri: ${clip(row.suggested, 200)}`,
      });
    }
  } else {
    blocks.push({ kind: "h2", text: "Maddeler" });
    blocks.push({
      kind: "table",
      headers: ["Madde", "Sonuç", "Puan"],
      rows: report.checks.map((check) => [
        check.label,
        check.passed ? "Geçti" : "Kaldı",
        `${check.earned}/${check.weight}`,
      ]),
    });
    if (report.narrative) {
      blocks.push({ kind: "h2", text: "Anlatım" });
      for (const line of report.narrative.split("\n").map((part) => part.trim()).filter(Boolean)) {
        blocks.push({ kind: "p", text: clip(line.replace(/^[-*#]+\s*/, ""), 400) });
      }
    }
  }

  blocks.push({ kind: "h2", text: clip(report.action.title, 120) });
  blocks.push({ kind: "p", text: clip(report.action.body, 500) });
  return blocks;
}

export function buildTetkikPdf(report: TetkikReport): Uint8Array {
  return buildPlainPdf(tetkikReportToBlocks(report));
}

export function tetkikPdfFileName(report: TetkikReport): string {
  const stem = (report.analysis?.detectedBrand || report.businessName || "tetkik")
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9ğüşıöç]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${stem || "tetkik"}-raporu.pdf`;
}

/** Test ve kopya yolu için markdown gövdesi. */
export function tetkikReportPlainText(report: TetkikReport): string {
  return renderTetkikReportMarkdown(report);
}
