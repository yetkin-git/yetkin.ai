import type { DocumentBlock } from "@/lib/yetkinhibe/document-block";
import { catalogFigureLines, formatLegislationNote } from "@/lib/yetkinhibe/legislation-trace";
import { templateById, templateOutline } from "@/lib/yetkinhibe/templates";
import type { GrantDossier, GrantProjectReport } from "@/lib/tezgah/grant/types";

function windowEnds(label: string): readonly [string, string] {
  const match = /^(\d{1,2})-(\d{1,2})$/.exec(label);
  if (!match?.[1] || !match[2]) {
    return ["—", label || "süre boş"];
  }
  return [match[1], match[2]];
}

/** İş paketinin kapsadığı ay sayısı. Aralık okunamazsa 1 ay sayılır. */
export function workPackageMonths(label: string): number {
  const match = /^(\d{1,2})-(\d{1,2})$/.exec(label);
  if (!match?.[1] || !match[2]) {
    return 1;
  }
  const start = Number(match[1]);
  const end = Number(match[2]);
  if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) {
    return 1;
  }
  return end - start + 1;
}

/**
 * Adam-ay dağılımı (Ş8 / B-06).
 *
 * Girdi: ekip toplamı (`teamHeadcount`) ve iş paketi süreleri. Her paket kendi ay
 * sayısıyla ağırlıklandırılır; böylece 18 aylık projede "1-3" paketi 3, "4-12" paketi
 * 9 pay alır. Toplam adam-ay = ekip × proje süresi.
 *
 * Tam sayı bölünemeyen kalan en uzun pakete eklenir; kimse ekip toplamını aşmaz.
 * `totalPersonMonths` sıfır veya negatifse dağıtım üretilmez.
 */
export function personMonthAllocation(input: {
  teamHeadcount: number;
  months: readonly number[];
}): { totalPersonMonths: number; perPackage: number[] } | null {
  const headcount = input.teamHeadcount;
  if (!Number.isInteger(headcount) || headcount < 1 || headcount > 5_000) {
    return null;
  }
  if (input.months.length === 0) {
    return null;
  }
  const weights = input.months.map((value) =>
    Number.isInteger(value) && value > 0 ? value : 1,
  );
  const totalMonths = weights.reduce((sum, value) => sum + value, 0);
  if (totalMonths <= 0) {
    return null;
  }
  const totalPersonMonths = headcount * totalMonths;
  const raw = weights.map((value) => (totalPersonMonths * value) / totalMonths);
  const perPackage = raw.map((value) => Math.floor(value));
  const remainder = totalPersonMonths - perPackage.reduce((sum, value) => sum + value, 0);
  if (remainder > 0) {
    let longest = 0;
    for (let index = 1; index < weights.length; index += 1) {
      if (weights[index]! > weights[longest]!) {
        longest = index;
      }
    }
    perPackage[longest] = (perPackage[longest] ?? 0) + remainder;
  }
  return { totalPersonMonths, perPackage };
}

/**
 * Paket için adam-ay metni. Sayı her zaman yazılır; şartname atfı varsa yanında durur.
 * Boş hücre basılmaz: sayı her zaman yazılır, atıf varsa yanında durur.
 */
export function personMonthCell(personMonths: number | null, article: string | null): string {
  const base = personMonths == null ? "hesaplanamadı" : `${personMonths} adam-ay`;
  return article ? `${base} (Madde ${article})` : base;
}

function sectionArticleFor(
  dossier: GrantDossier,
  articleMap: ReadonlyMap<string, string>,
  ...needles: readonly string[]
): string | null {
  for (const [title, article] of articleMap) {
    const folded = title.toLocaleLowerCase("tr");
    if (needles.some((needle) => folded.includes(needle))) {
      return article;
    }
  }
  return null;
}

function personMonthRows(
  dossier: GrantDossier,
  articleMap: ReadonlyMap<string, string>,
): { rows: string[][]; totalLabel: string } {
  const template = templateById(dossier.templateId);
  if (!template) {
    return { rows: [], totalLabel: "" };
  }
  const months = template.workPackages.map(
    (_, index) => workPackageMonths(dossier.workPackages[index]?.windowLabel ?? ""),
  );
  const allocation = personMonthAllocation({ teamHeadcount: dossier.teamHeadcount, months });
  const matrixArticle =
    sectionArticleFor(dossier, articleMap, "adam-ay", "adam ay", "matris") ??
    sectionArticleFor(dossier, articleMap, "i̇ş paketi", "iş paketi");
  const rows = template.workPackages.map((row, index) => {
    const windowLabel = dossier.workPackages[index]?.windowLabel ?? "süre boş";
    const [start, end] = windowEnds(windowLabel);
    const personMonths = allocation?.perPackage[index] ?? null;
    return [row.name, start, end, personMonthCell(personMonths, matrixArticle), row.successMeasure];
  });
  const totalLabel =
    allocation == null
      ? ""
      : `Toplam adam-ay: ${allocation.totalPersonMonths} · Ekip ${dossier.teamHeadcount} kişi · ${dossier.durationMonths} ay`;
  return { rows, totalLabel };
}

/** Raporun Word ve PDF blokları. Katalog tutarı yalnız doğrulanmış izle basılır. */
export function grantReportBlocks(report: GrantProjectReport): DocumentBlock[] {
  const blocks: DocumentBlock[] = [
    { kind: "h1", text: report.businessName || "Hibe Proje Dosyası" },
    { kind: "p", text: "Kapak özeti" },
    { kind: "p", text: report.disclaimer },
    {
      kind: "p",
      text: `${report.freelancerName} · ${report.provinceLabel} · ${report.audienceLabel} · ${report.naceLabel} · ${report.investmentFocusLabel}`,
    },
    {
      kind: "p",
      text: `${report.employeeCount} çalışan · ${report.companyAgeYears} yıl · ${report.rdLabel} · ${report.exportLabel} · ${report.patentLabel}`,
    },
    { kind: "p", text: report.purpose },
    { kind: "h2", text: "Uygun programlar" },
  ];
  if (report.eligible.length === 0) {
    blocks.push({ kind: "p", text: "Açık ve doğrulanmış çağrı yok. Uygun liste boş." });
  }
  for (const program of report.eligible) {
    blocks.push({ kind: "h2", text: `${program.sourceLabel} — ${program.title}` });
    if (program.officialInfoUrl.startsWith("https://")) {
      blocks.push({ kind: "p", text: program.officialInfoUrl });
    }
    for (const line of catalogFigureLines(program)) {
      blocks.push({ kind: "p", text: line });
    }
    blocks.push({
      kind: "table",
      headers: ["Kriter", "Sonuç"],
      rows: program.criteria.map((row) => [row.label, row.passed ? "Geçti" : "Kaldı"]),
    });
  }
  if (report.closed.length > 0) {
    blocks.push({ kind: "h2", text: "Kapalı katalog" });
    for (const row of report.closed) {
      blocks.push({ kind: "p", text: `${row.sourceLabel} — ${row.title}. ${row.note}` });
    }
  }
  if (report.unverified.length > 0) {
    blocks.push({ kind: "h2", text: "Doğrulanmamış katalog" });
    for (const row of report.unverified) {
      blocks.push({ kind: "p", text: `${row.sourceLabel} — ${row.title}. ${row.note}` });
    }
  }
  blocks.push(
    { kind: "h2", text: "Projenin amacı ve gerekçesi" },
    { kind: "p", text: report.purpose },
    { kind: "h2", text: "Pazar ve ihtiyaç analizi" },
    { kind: "p", text: report.market },
    { kind: "h2", text: "İş-Zaman Çizelgesi" },
    {
      kind: "table",
      headers: ["Adım", "Başlangıç ayı", "Bitiş ayı", "Not"],
      rows: report.schedule.map((row) => {
        const [start, end] = windowEnds(row.windowLabel ?? "");
        return [row.name, start, end, row.draft ? "Taslak" : "Girilen aralık"];
      }),
    },
    { kind: "h2", text: "Bütçe Kalemleri" },
    {
      kind: "table",
      headers: ["Kalem", "Girilen tutar"],
      rows: report.investments.map((row) => [row.label, row.amountLabel ?? "—"]),
    },
    { kind: "h2", text: "Risk ve sürdürülebilirlik" },
    { kind: "p", text: report.risk },
  );
  const dossier = report.dossier;
  if (dossier) {
    blocks.push({ kind: "h1", text: "Tam Proje Başvuru Dosyası" }, { kind: "p", text: dossier.disclaimer });
    const outline = templateOutline(dossier.templateId);
    if (outline.length > 0) {
      blocks.push({ kind: "h2", text: "Kurum şablonu" });
      for (const line of outline) {
        blocks.push({ kind: "p", text: line });
      }
    }
    if (dossier.templateSections && dossier.templateSections.length > 0) {
      blocks.push({ kind: "h2", text: "Şartname atıfları" });
      for (const section of dossier.templateSections) {
        blocks.push({ kind: "h2", text: section.title }, { kind: "p", text: section.body });
      }
    }
    blocks.push(
      { kind: "h2", text: "İş Paketleri Takvimi" },
      { kind: "p", text: dossier.durationNote },
      {
        kind: "table",
        headers: ["İş paketi", "Başlangıç ayı", "Bitiş ayı"],
        rows: dossier.workPackages.map((row) => {
          const [start, end] = windowEnds(row.windowLabel);
          return [row.name, start, end];
        }),
      },
    );
    const articleMap = new Map<string, string>(
      (dossier.sectionArticles ?? []).map((row) => [row.title, row.article]),
    );
    const matrix = personMonthRows(dossier, articleMap);
    if (matrix.rows.length > 0) {
      blocks.push({
        kind: "table",
        headers: ["İş paketi", "Başlangıç ayı", "Bitiş ayı", "Adam-ay", "Başarı ölçütü"],
        rows: matrix.rows,
      });
      if (matrix.totalLabel) {
        blocks.push({ kind: "p", text: matrix.totalLabel });
      }
    }
    blocks.push(
      { kind: "h2", text: "Bütçe Kalemleri" },
      { kind: "p", text: dossier.budgetNote },
      {
        kind: "table",
        headers: ["Kalem", "Tahmini tutar"],
        rows: [
          ...dossier.budgetRows.map((row) => [row.label, row.amountLabel]),
          ["Toplam", dossier.budgetTotalLabel],
        ],
      },
      { kind: "p", text: dossier.budgetRationale },
      { kind: "h2", text: "Ekip Matrisi" },
      {
        kind: "table",
        headers: ["Yetkinlik alanı", "Kişi", "Not"],
        rows: dossier.teamRows.map((row) => [row.area, row.headcountLabel ?? "—", row.note]),
      },
      { kind: "p", text: dossier.competencyNote },
      { kind: "h2", text: "Ticarileşme Planı" },
      { kind: "p", text: dossier.outputGoal },
      { kind: "p", text: dossier.commercialization },
    );
  }
  blocks.push({ kind: "h2", text: "Mevzuat ve Doğrulama İzi" }, { kind: "p", text: formatLegislationNote(report.eligible) });
  return blocks;
}
