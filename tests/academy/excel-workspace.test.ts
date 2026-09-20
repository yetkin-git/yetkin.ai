import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import {
  academyCompareDockPrompt,
  academyExcelAlignBox,
  academyExcelColumnMinCh,
  academyExcelIsActiveColumn,
  academyExcelIsDenseDumpTable,
  academyExcelIsHighlightCell,
  academyExcelIsSelectionOrigin,
  academyExcelMergedTopRange,
  academyExcelOfficeAi2SeedTutarSum,
  academyExcelParseCell,
  academyExcelSelection,
  academyExcelSnapBoxToColumns,
  academyVisualCinematicFrameSrc,
  academyVisualCompareStage,
  academyVisualStageBackdropTheme,
  ACADEMY_EXCEL_DENSE_DUMP_MIN_COLS,
  ACADEMY_EXCEL_DENSE_DUMP_MIN_ROWS,
  ACADEMY_OFFICE_AI_01_FRAME_PUBLIC_PATH,
  ACADEMY_OFFICE_AI_2_CLEAN_TABLE,
  ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE,
} from "@/lib/academy/excel-workspace";
import { ACADEMY_GMAIL_GEMINI_PROMPT } from "@/lib/academy/gmail-workspace";

const ROOT = process.cwd();
const KEY = "01_office_ai-1";

describe("Excel birleşik hücre seçimi — A1:F1", () => {
  it("mergedTop A1:F1 bloğunu çözer; B1/C1 tıklansa bile isim kutusu A1 kalır", () => {
    const range = academyExcelMergedTopRange(6);
    expect(range.ref).toBe("A1:F1");
    expect(range.origin).toBe("A1");
    expect(range.startCol).toBe(0);
    expect(range.endCol).toBe(5);
    expect(range.startRow).toBe(1);
    expect(range.endRow).toBe(1);

    const a1 = academyExcelSelection({ cell: "A1", mergedTop: true, colCount: 6 });
    expect(a1.coversMerge).toBe(true);
    expect(a1.nameBox).toBe("A1");
    expect(a1.merge?.ref).toBe("A1:F1");
    expect(academyExcelIsSelectionOrigin(a1, 0, 1)).toBe(true);
    expect(academyExcelIsSelectionOrigin(a1, 1, 1)).toBe(false);
    expect(academyExcelIsActiveColumn(a1, 0)).toBe(true);
    expect(academyExcelIsActiveColumn(a1, 5)).toBe(true);

    for (const cell of ["B1", "C1", "F1"] as const) {
      const selection = academyExcelSelection({ cell, mergedTop: true, colCount: 6 });
      expect(selection.coversMerge).toBe(true);
      expect(selection.nameBox).toBe("A1");
      expect(academyExcelIsSelectionOrigin(selection, 0, 1)).toBe(true);
      expect(academyExcelIsActiveColumn(selection, 2)).toBe(true);
    }

    const header = academyExcelSelection({ cell: "A3", mergedTop: true, colCount: 6 });
    expect(header.coversMerge).toBe(false);
    expect(header.nameBox).toBe("A3");
    expect(academyExcelIsSelectionOrigin(header, 0, 1)).toBe(false);
    expect(academyExcelIsSelectionOrigin(header, 0, 3)).toBe(true);
    expect(academyExcelIsActiveColumn(header, 0)).toBe(true);
    expect(academyExcelIsActiveColumn(header, 1)).toBe(false);
  });

  it("birleşiksiz A1 seçimi tek hücrede kalır; parse varsayılanı A1’dir", () => {
    expect(academyExcelParseCell("B2")).toEqual({ col: 1, row: 2, label: "B2" });
    expect(academyExcelParseCell(undefined).label).toBe("A1");
    expect(academyExcelIsHighlightCell("A1", 0, 1)).toBe(true);
    expect(academyExcelIsHighlightCell("B1", 0, 1)).toBe(false);
    const plain = academyExcelSelection({ cell: "B1", mergedTop: false, colCount: 6 });
    expect(plain.coversMerge).toBe(false);
    expect(plain.merge).toBeNull();
    expect(plain.nameBox).toBe("B1");
    expect(academyExcelIsSelectionOrigin(plain, 1, 1)).toBe(true);
    expect(academyExcelIsActiveColumn(plain, 0)).toBe(false);
    expect(academyExcelIsActiveColumn(plain, 1)).toBe(true);
  });

  it("cue-04 fx ve A1:F1 birleşik başlığı senkron durur", () => {
    const cue04 = loadAcademyCinemaCueSlides(KEY).find((slide) => slide.cueIndex === 4);
    expect(cue04?.section).toBe("A1 HÜCRESİ");
    expect(cue04?.mergedTop).toBe(true);
    expect(cue04?.highlightCell).toBe("A1");
    expect(cue04?.formulaBar).toBe("Mart 2026 Tahsilat Dökümü");
    expect(cue04?.zoomA1).toBe(true);
    const colCount = Math.max(
      cue04!.table!.headers.length,
      ...cue04!.table!.rows.map((row) => row.length),
      6,
    );
    expect(colCount).toBe(6);
    const selection = academyExcelSelection({
      cell: cue04!.highlightCell,
      mergedTop: true,
      colCount,
    });
    expect(selection.merge?.ref).toBe("A1:F1");
    expect(selection.coversMerge).toBe(true);
    expect(selection.nameBox).toBe("A1");
  });

  it("çalışma alanı birleşik seçim kutusunu taşır; tek sütunluk overlay birleşikte kapalıdır", () => {
    const excel = readFileSync(join(ROOT, "components/academy/lesson-excel-workspace.tsx"), "utf8");
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    const workspace = readFileSync(join(ROOT, "lib/academy/excel-workspace.ts"), "utf8");
    expect(workspace).toContain("academyExcelSelection");
    expect(workspace).toContain("coversMerge");
    expect(excel).toContain("academyExcelSelection");
    expect(excel).toContain("academy-excel-selection-box");
    expect(excel).toContain("academy-excel-active-cell-border");
    expect(excel).toContain("data-academy-excel-merge");
    expect(excel).toContain('data-academy-excel-selection={mergeSelected ? "merge" : "cell"}');
    expect(excel).toContain("{mergeSelected ? null : (");
    expect(excel).toContain("colSpan={colCount}");
    expect(css).toContain("academy-excel-selection-box");
    expect(css).toContain("academy-excel-active-cell-border");
    expect(css).toContain('.academy-excel-desk[data-academy-excel-selection="merge"] .academy-excel-mouse-select');
    expect(css).toContain(".academy-excel-cell--merge.academy-excel-cell--a1::after");
    expect(css).toContain("table-layout: auto");
    expect(css).toContain("width: auto");
    expect(css).toMatch(/font-size:\s*clamp\(0\.42rem/u);
    expect(excel).toContain("academy-excel-grid-fit");
    expect(excel).toContain("fitExcelGridFont");
    expect(excel).toContain("const availH = wrap.clientHeight");
    expect(excel).toContain("compact ? 1 : denseDump ? 1 : 6");
    expect(excel).toContain("academyExcelIsDenseDumpTable");
    expect(excel).toContain("academy-excel-desk--dense");
    expect(excel).toContain("academyExcelAlignBox");
    expect(css).toContain(".academy-excel-desk--dense .academy-excel-grid-wrap");
    expect(css).toMatch(/\.academy-excel-desk--dense \.academy-excel-grid-wrap\s*\{[^}]*overflow:\s*auto/s);
    expect(excel).toContain("getBoundingClientRect");
    expect(excel).toContain("data-academy-excel-col");
    expect(excel).toContain("left:");
    expect(excel).toContain("width:");
    expect(excel).toContain("academyExcelColumnMinCh");
    expect(excel).toContain("minWidth");
  });

  it("sütun min genişliği içerik kadar açılır; boş sütun sıkı kalır", () => {
    const mins = academyExcelColumnMinCh(
      {
        headers: ["Sayfa", "Döküm"],
        rows: [
          ["1", "Giriş ve yöntem notları uzar, karar cümlesi yoktur..."],
          ["3", "Demir Lojistik bekleyen bakiye dipnotlarla şişer..."],
        ],
      },
      6,
    );
    expect(mins[0]).toBeGreaterThanOrEqual(5);
    expect(mins[1]).toBeGreaterThan(40);
    expect(mins[5]).toBe(3);
  });

  it("01_office_ai-2 dense dump onlarca sütun/satır taşır; KPI çekirdek toplamı 54.650", () => {
    expect(ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE.headers[0]).toBe("Tarih");
    expect(ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE.headers.length).toBeGreaterThanOrEqual(
      ACADEMY_EXCEL_DENSE_DUMP_MIN_COLS,
    );
    expect(ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE.rows.length).toBeGreaterThanOrEqual(
      ACADEMY_EXCEL_DENSE_DUMP_MIN_ROWS,
    );
    expect(academyExcelIsDenseDumpTable(ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE)).toBe(true);
    expect(academyExcelIsDenseDumpTable(ACADEMY_OFFICE_AI_2_CLEAN_TABLE)).toBe(false);
    expect(academyExcelOfficeAi2SeedTutarSum()).toBe(54650);
    expect(ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE.note).toMatch(/kilitli toplam çekirdek 5 satırdan/u);
    expect(ACADEMY_OFFICE_AI_2_CLEAN_TABLE.note).toMatch(/Özet beş sütundan çıkar/u);
    expect(ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE.headers.slice(5, 11)).toEqual([
      "Bölge",
      "Ürün",
      "Adet",
      "Vade",
      "Plasiyer",
      "Kanal",
    ]);
  });

  it("seçim kutusu wrap ölçeğini ayırır; A1 sola kilitlenir, sağa kaymaz", () => {
    const wrap = { left: 0, top: 0, width: 480, height: 360 };
    const layout = { offsetWidth: 400, offsetHeight: 300, scrollLeft: 0, scrollTop: 0 };
    const gutter = 33.6 * 1.2;
    const colW = 80 * 1.2;
    const a1 = { left: gutter, top: 24 * 1.2, width: colW, height: 24 * 1.2 };
    const box = academyExcelAlignBox(a1, wrap, layout);
    expect(box.left).toBeCloseTo(33.6, 5);
    expect(box.width).toBeCloseTo(80, 5);
    const colB = academyExcelAlignBox(
      { left: gutter + colW, top: 24 * 1.2, width: colW, height: 24 * 1.2 },
      wrap,
      layout,
    );
    const snapped = academyExcelSnapBoxToColumns(box, box, colB);
    expect(snapped.left).toBeCloseTo(33.6, 5);
    expect(snapped.width).toBeCloseTo(160, 5);
  });
});

describe("Beat 3 Prompt Terminali dock", () => {
  it("9 dersin FARK ORTADA sahnesinde kilitli istemi taşır; Gmail split doğrudan after.copilot basar", () => {
    const keys = [
      "01_office_ai-1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-4",
      "01_office_ai-5",
      "01_office_ai-6",
      "01_office_ai-g1",
      "01_office_ai-w1",
      "01_office_ai-k1",
    ] as const;
    for (const lessonKey of keys) {
      const compare = academyVisualCompareStage(lessonKey, "cue-06");
      const dock = academyCompareDockPrompt(compare);
      expect(dock?.prompt.length).toBeGreaterThan(24);
    }
    const gmail = academyVisualCompareStage("01_office_ai-g1", "cue-05");
    expect(academyCompareDockPrompt(gmail)?.prompt).toBe(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(loadAcademyCinemaCueSlides("01_office_ai-g1")[4]?.copilot?.prompt).toBe(ACADEMY_GMAIL_GEMINI_PROMPT);
  });

  it("Excel cinematic kare yalnız Excel derslerinde; sunum ve e-posta kendi temasını taşır", () => {
    expect(academyVisualStageBackdropTheme("01_office_ai-1")).toBe("excel");
    expect(academyVisualStageBackdropTheme("01_office_ai-3")).toBe("pptx");
    expect(academyVisualStageBackdropTheme("01_office_ai-4")).toBe("outlook");
    expect(academyVisualCinematicFrameSrc("01_office_ai-1")).toBe(ACADEMY_OFFICE_AI_01_FRAME_PUBLIC_PATH);
    expect(academyVisualCinematicFrameSrc("01_office_ai-3")).toBeNull();
    expect(academyVisualCinematicFrameSrc("01_office_ai-4")).toBeNull();
  });
});
