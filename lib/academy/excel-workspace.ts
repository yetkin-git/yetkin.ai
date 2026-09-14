/**
 * Ofis amiral göz katmanı — Garsonu Göster.
 * Sahnede soyut kart yok; %80 canlı Excel ızgarası, %20 sinema (Nano Banana kare).
 */

import {
  academyCinemaSlideForCue,
  loadAcademyCinemaCueSlides,
  type AcademyCinemaCueSlide,
} from "@/lib/academy/cinema-cue-catalog";
import type { AcademyGoldenBeatId } from "@/lib/academy/lesson-beat-visual";

/** Nano Banana mühürlü Excel çalışma alanı — cinematic %20 plaka. */
export const ACADEMY_OFFICE_AI_01_FRAME_PUBLIC_PATH = "/media/01_office_ai_01_frame_01.png" as const;

/** cue-05 AI Masası — Excel’den yapay zekâya 3 aktarım yolu (en fazla 3 kelime). */
export const ACADEMY_OFFICE_AI_1_TRANSFER_LABELS = [
  "Kopyala-yapıştır",
  "Ataş yükle",
  "Copilot okur",
] as const;

export type AcademyVisualWaiterKind = "excel" | "cinema";
export type AcademyVisualExcelPane = "live" | "before" | "after";

export type AcademyVisualCompareStage = {
  before: AcademyCinemaCueSlide;
  after: AcademyCinemaCueSlide;
  beforeLabel: string;
  afterLabel: string;
  beat: AcademyGoldenBeatId;
};

export type AcademyExcelCellAddress = {
  col: number;
  row: number;
  label: string;
};

/** A1:F1 gibi birleşik blok — Excel’de tıklanınca tüm aralık seçilir. */
export type AcademyExcelMergeRange = {
  startCol: number;
  endCol: number;
  startRow: number;
  endRow: number;
  origin: string;
  ref: string;
};

export type AcademyExcelSelection = {
  address: AcademyExcelCellAddress;
  nameBox: string;
  merge: AcademyExcelMergeRange | null;
  coversMerge: boolean;
};

const DEFAULT_CELL: AcademyExcelCellAddress = { col: 0, row: 1, label: "A1" };

export function academyExcelColLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

export function academyExcelParseCell(cell: string | undefined): AcademyExcelCellAddress {
  if (!cell) {
    return DEFAULT_CELL;
  }
  const match = /^([A-Z]+)(\d+)$/u.exec(cell.trim().toUpperCase());
  if (!match) {
    return DEFAULT_CELL;
  }
  const colIndex = match[1]!.charCodeAt(0) - 65;
  const rowIndex = Number(match[2]);
  if (!Number.isFinite(colIndex) || colIndex < 0 || !Number.isFinite(rowIndex) || rowIndex < 1) {
    return DEFAULT_CELL;
  }
  return {
    col: colIndex,
    row: rowIndex,
    label: `${academyExcelColLetter(colIndex)}${rowIndex}`,
  };
}

export function academyExcelIsHighlightCell(
  cell: string | undefined,
  col: number,
  row: number,
): boolean {
  const address = academyExcelParseCell(cell);
  return col === address.col && row === address.row;
}

/** `mergedTop` afişi — satır 1, A sütunundan son sütuna (varsayılan A1:F1). */
export function academyExcelMergedTopRange(colCount: number): AcademyExcelMergeRange {
  const endCol = Math.max(0, Math.floor(colCount) - 1);
  const origin = "A1";
  const end = `${academyExcelColLetter(endCol)}1`;
  return {
    startCol: 0,
    endCol,
    startRow: 1,
    endRow: 1,
    origin,
    ref: `${origin}:${end}`,
  };
}

export function academyExcelAddressInMerge(
  address: AcademyExcelCellAddress,
  merge: AcademyExcelMergeRange,
): boolean {
  return (
    address.col >= merge.startCol &&
    address.col <= merge.endCol &&
    address.row >= merge.startRow &&
    address.row <= merge.endRow
  );
}

/**
 * Birleşik hücre seçimi: B1/C1 tıklansa bile Excel gibi A1 kökenine çözülür
 * ve yeşil çerçeve A1:F1 bloğunun tamamını sarar.
 */
export function academyExcelSelection(options: {
  cell: string | undefined;
  mergedTop: boolean;
  colCount: number;
}): AcademyExcelSelection {
  const address = academyExcelParseCell(options.cell);
  const merge = options.mergedTop === true ? academyExcelMergedTopRange(options.colCount) : null;
  const coversMerge = merge != null && academyExcelAddressInMerge(address, merge);
  return {
    address,
    nameBox: coversMerge && merge ? merge.origin : address.label,
    merge,
    coversMerge,
  };
}

export function academyExcelIsSelectionOrigin(
  selection: AcademyExcelSelection,
  col: number,
  row: number,
): boolean {
  if (selection.coversMerge && selection.merge) {
    return col === selection.merge.startCol && row === selection.merge.startRow;
  }
  return col === selection.address.col && row === selection.address.row;
}

export function academyExcelIsActiveColumn(selection: AcademyExcelSelection, colIndex: number): boolean {
  if (selection.coversMerge && selection.merge) {
    return colIndex >= selection.merge.startCol && colIndex <= selection.merge.endCol;
  }
  return colIndex === selection.address.col;
}

/** Sütun min genişliği (ch) — boş sütun sıkı, dolu sütun içerik kadar. */
export function academyExcelColumnMinCh(
  table: { headers: readonly string[]; rows: readonly (readonly string[])[] },
  colCount: number,
): number[] {
  const count = Math.max(0, Math.floor(colCount));
  return Array.from({ length: count }, (_, index) => {
    let max = (table.headers[index] ?? "").length;
    for (const row of table.rows) {
      max = Math.max(max, (row[index] ?? "").length);
    }
    return max === 0 ? 3 : max + 1;
  });
}

export type AcademyExcelAlignBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Seçim kutusunu wrap yerel pikseline çevirir — CSS scale zoom’u ayırır.
 * Overlay `academy-excel-grid-wrap` içinde `left` / `width` olarak basılır.
 */
export function academyExcelAlignBox(
  cell: Pick<DOMRect, "left" | "top" | "width" | "height">,
  wrap: Pick<DOMRect, "left" | "top" | "width" | "height">,
  layout: { offsetWidth: number; offsetHeight: number; scrollLeft: number; scrollTop: number },
): AcademyExcelAlignBox {
  const scaleX = layout.offsetWidth > 0 ? wrap.width / layout.offsetWidth : 1;
  const scaleY = layout.offsetHeight > 0 ? wrap.height / layout.offsetHeight : 1;
  const sx = Number.isFinite(scaleX) && scaleX !== 0 ? scaleX : 1;
  const sy = Number.isFinite(scaleY) && scaleY !== 0 ? scaleY : 1;
  return {
    left: (cell.left - wrap.left) / sx + layout.scrollLeft,
    top: (cell.top - wrap.top) / sy + layout.scrollTop,
    width: cell.width / sx,
    height: cell.height / sy,
  };
}

/** Yatay kenarı sütun `th` kutusuna kilitler; satır yüksekliği hücreden gelir. */
export function academyExcelSnapBoxToColumns(
  cellBox: AcademyExcelAlignBox,
  firstCol: AcademyExcelAlignBox | null,
  lastCol: AcademyExcelAlignBox | null,
): AcademyExcelAlignBox {
  if (!firstCol) {
    return cellBox;
  }
  const right = lastCol ? lastCol.left + lastCol.width : firstCol.left + firstCol.width;
  return {
    left: firstCol.left,
    top: cellBox.top,
    width: Math.max(0, right - firstCol.left),
    height: cellBox.height,
  };
}

export function academyVisualWaiterSlide(
  lessonKey: string,
  cueId: string,
  options?: { includeVeoTable?: boolean },
): AcademyCinemaCueSlide | null {
  const slide = academyCinemaSlideForCue(lessonKey, cueId);
  if (!slide || slide.layout !== "excel" || !slide.table) {
    return null;
  }
  if (slide.visualMode === "veo" && options?.includeVeoTable !== true) {
    return null;
  }
  return slide;
}

export function academyVisualWaiterKind(
  lessonKey: string,
  cueId: string,
): AcademyVisualWaiterKind {
  return academyVisualWaiterSlide(lessonKey, cueId) ? "excel" : "cinema";
}

/** Beat 3 Altın Şablon — FARK ORTADA cue'unda (01_office_ai-1: cue-06) Önce/Sonra split-screen. */
export function academyVisualCompareStage(
  lessonKey: string,
  cueId: string,
): AcademyVisualCompareStage | null {
  const after = academyCinemaSlideForCue(lessonKey, cueId);
  if (!after || after.visualMode !== "split" || !after.compare || !after.table) {
    return null;
  }
  const before =
    loadAcademyCinemaCueSlides(lessonKey).find((slide) => slide.cueIndex === after.compare!.beforeCueIndex) ?? null;
  if (!before?.table) {
    return null;
  }
  return {
    before,
    after,
    beforeLabel: after.compare.beforeLabel,
    afterLabel: after.compare.afterLabel,
    beat: after.beat ?? "comparison",
  };
}

export function academyVisualCinematicFrameSrc(lessonKey: string): string | null {
  const key = lessonKey.trim();
  return key === "01_office_ai-1" || key === "01_office_ai-2" ? ACADEMY_OFFICE_AI_01_FRAME_PUBLIC_PATH : null;
}
