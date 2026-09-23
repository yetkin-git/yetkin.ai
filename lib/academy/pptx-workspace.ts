/**
 * 01_office_ai-3 Metinden Slayta — canlı slayt tuvali SSOT.
 * Yeşil kutu `getBoundingClientRect` ile KPI kartına kilitlenir.
 * Metin üç noktaya düşmez; font clamp + içerik genişliği.
 */

import { academyExcelAlignBox, type AcademyExcelAlignBox } from "@/lib/academy/excel-align";
import type { AcademyExcelMouseCell } from "@/lib/academy/excel-mouse-pointer";

export const ACADEMY_PPTX_SLIDE_TITLE = "Mart 2026 Yönetim Özeti" as const;
/** Teknik sonek — chrome / data-attr; vatandaş yüzüne basılmaz (PEDAGOJI §E.2). */
export const ACADEMY_PPTX_FILE_NAME = "Yonetim_Sunumu.pptx" as const;
/** Vatandaş Lisanı etiket — titlebar. */
export const ACADEMY_PPTX_FILE_LABEL = "Yönetim Sunumu (PowerPoint)" as const;

export const ACADEMY_PPTX_ACTION_BAND =
  "Karar: Yıldız Tekstil'i bugün ara" as const;

/** After paneli kilit notu — gözdeki örnek, kulaktaki kuralın cümlesidir. */
export const ACADEMY_PPTX_EXAMPLE_NOTE =
  "Örnek sayılar; kendi tablondaki sayıyı koy." as const;

export const ACADEMY_PPTX_KPI_CARDS = [
  {
    id: "kpi-total",
    cell: "A1",
    tone: "green",
    value: "54.650 TL",
    label: "Toplam Tahsilat",
  },
  {
    id: "kpi-leader",
    cell: "B1",
    tone: "blue",
    value: "Kaya Gıda A.Ş.",
    label: "Lider Müşteri",
  },
  {
    id: "kpi-risk",
    cell: "C1",
    tone: "warn",
    value: "%15 Riskli Vade",
    label: "Uyarı",
  },
] as const;

export type AcademyPptxKpiId = (typeof ACADEMY_PPTX_KPI_CARDS)[number]["id"];
export type AcademyPptxKpiTone = (typeof ACADEMY_PPTX_KPI_CARDS)[number]["tone"];

export const ACADEMY_PPTX_ELEMENT_IDS = ["kpi-total", "kpi-leader", "kpi-risk"] as const;
export type AcademyPptxElementId = (typeof ACADEMY_PPTX_ELEMENT_IDS)[number];

export const ACADEMY_PPTX_CELL_TO_ELEMENT: Record<
  Extract<AcademyExcelMouseCell, "A1" | "B1" | "C1">,
  AcademyPptxElementId
> = {
  A1: "kpi-total",
  B1: "kpi-leader",
  C1: "kpi-risk",
};

export function academyPptxElementForCell(cell: string | undefined): AcademyPptxElementId {
  const key = (cell ?? "A1").trim().toUpperCase();
  if (key === "B1") {
    return "kpi-leader";
  }
  if (key === "C1" || key === "D1") {
    return "kpi-risk";
  }
  return "kpi-total";
}

export function academyPptxKpiCardForElement(element: AcademyPptxElementId) {
  return ACADEMY_PPTX_KPI_CARDS.find((card) => card.id === element) ?? ACADEMY_PPTX_KPI_CARDS[0];
}

export function academyPptxAlignBox(
  cell: Pick<DOMRect, "left" | "top" | "width" | "height">,
  wrap: Pick<DOMRect, "left" | "top" | "width" | "height">,
  layout: { offsetWidth: number; offsetHeight: number; scrollLeft: number; scrollTop: number },
): AcademyExcelAlignBox {
  return academyExcelAlignBox(cell, wrap, layout);
}

export function academyPptxHasDeck(
  slide: {
    layout?: string;
    table?: { headers: readonly string[]; rows: readonly (readonly string[])[] } | undefined;
    nodes?: readonly unknown[];
    bullets?: readonly string[];
  } | null,
): boolean {
  if (!slide || slide.layout !== "pptx") {
    return false;
  }
  if (slide.table && (slide.table.headers.length > 0 || slide.table.rows.length > 0)) {
    return true;
  }
  if ((slide.nodes?.length ?? 0) > 0) {
    return true;
  }
  return (slide.bullets?.length ?? 0) > 0;
}

/** Warm-up dump — şablon kaosu / metin yığını. Thumbs gizlenir; tuval tek sütun dolar. */
export const ACADEMY_PPTX_DUMP_SECTIONS = ["GİRİŞ KÖPRÜSÜ", "HOŞ GELDİN", "ŞABLON KAOSU"] as const;

export function academyPptxDumpMode(input: {
  pane?: string;
  section?: string;
  hideReply?: boolean;
}): boolean {
  if (input.pane === "before") {
    return true;
  }
  if (input.hideReply === true) {
    return true;
  }
  const section = (input.section ?? "").trim();
  return (ACADEMY_PPTX_DUMP_SECTIONS as readonly string[]).includes(section);
}

/**
 * Dump / Hatırlatma / slayt istemi olmayan tekli gösterim.
 * Copilot sütunu yoksa ızgara kapanır; tuval 16:9 sahneyi kaplar.
 */
export function academyPptxFullBleedCanvas(input: {
  pane?: string;
  dumpMode: boolean;
  hasCopilot: boolean;
}): boolean {
  if (input.pane !== "live") {
    return false;
  }
  if (input.hasCopilot) {
    return false;
  }
  return input.dumpMode;
}

export function academyPptxDumpLines(
  table: { rows: readonly (readonly string[])[] } | null | undefined,
): readonly string[] {
  const rows = table?.rows ?? [];
  const lines = rows.map((row) => row.filter(Boolean).join(" — ")).filter((line) => line.length > 0);
  return lines.length > 0 ? lines : ["Mart tahsilat notları dağınık durur..."];
}
