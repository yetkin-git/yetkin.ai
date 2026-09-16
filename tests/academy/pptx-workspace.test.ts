import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_PPTX_ACTION_BAND,
  ACADEMY_PPTX_KPI_CARDS,
  ACADEMY_PPTX_SLIDE_TITLE,
  academyPptxAlignBox,
  academyPptxElementForCell,
  academyPptxHasDeck,
} from "@/lib/academy/pptx-workspace";

const ROOT = process.cwd();

describe("Sunum Fabrikası slayt seçim kutusu — getBoundingClientRect", () => {
  it("A1 toplam, B1 lider, C1 risk kartına çözülür", () => {
    expect(academyPptxElementForCell("A1")).toBe("kpi-total");
    expect(academyPptxElementForCell("B1")).toBe("kpi-leader");
    expect(academyPptxElementForCell("C1")).toBe("kpi-risk");
    expect(academyPptxElementForCell(undefined)).toBe("kpi-total");
  });

  it("seçim kutusu wrap ölçeğini ayırır; kesilme yok", () => {
    const wrap = { left: 0, top: 0, width: 480, height: 360 };
    const layout = { offsetWidth: 400, offsetHeight: 300, scrollLeft: 0, scrollTop: 0 };
    const title = { left: 48, top: 36, width: 240, height: 48 };
    const box = academyPptxAlignBox(title, wrap, layout);
    expect(box.left).toBeCloseTo(40, 5);
    expect(box.width).toBeCloseTo(200, 5);
    const pptx = readFileSync(join(ROOT, "components/academy/lesson-pptx-workspace.tsx"), "utf8");
    const slide = readFileSync(join(ROOT, "components/academy/lesson-slide-workspace.tsx"), "utf8");
    const ssot = readFileSync(join(ROOT, "lib/academy/pptx-workspace.ts"), "utf8");
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(pptx).toContain("applyAcademyOfficeWinFit");
    expect(pptx).toContain("data-academy-office-win-fit");
    expect(pptx).toContain("data-academy-pptx-origin");
    expect(pptx).toContain("data-academy-checklist-overlay");
    expect(slide).toContain("ACADEMY_PPTX_SLIDE_TITLE");
    expect(slide).toContain("ACADEMY_PPTX_KPI_CARDS");
    expect(slide).toContain("ACADEMY_PPTX_ACTION_BAND");
    expect(ssot).toContain(ACADEMY_PPTX_SLIDE_TITLE);
    expect(ssot).toContain("54.650 TL");
    expect(ssot).toContain("Kaya Gıda A.Ş.");
    expect(ssot).toContain("%15 Riskli Vade");
    expect(ssot).toContain(ACADEMY_PPTX_ACTION_BAND);
    expect(css).toContain("text-overflow: clip");
    expect(css).toContain(".academy-pptx-slide-title");
    expect(css).toMatch(/\.academy-pptx-slide-title\s*\{[^}]*text-align:\s*center/s);
    expect(css).toMatch(/\.academy-pptx-kpi\s*\{[^}]*text-align:\s*center/s);
    expect(css).toMatch(/\.academy-pptx-action-band\s*\{[^}]*text-align:\s*center/s);
    expect(slide).toContain("text-center");
    expect(css).toContain("scale(1.05)");
    expect(css).not.toMatch(/\.academy-pptx-[^{]*\{[^}]*text-overflow:\s*ellipsis/u);
  });

  it("pptx yüzeyinde tablo, düğüm veya madde varken deck açılır", () => {
    expect(
      academyPptxHasDeck({
        layout: "pptx",
        bullets: ["Tek fikir"],
      }),
    ).toBe(true);
    expect(academyPptxHasDeck({ layout: "excel", table: { headers: ["A"], rows: [["1"]] } })).toBe(false);
    expect(ACADEMY_PPTX_KPI_CARDS.map((card) => card.value)).toEqual([
      "54.650 TL",
      "Kaya Gıda A.Ş.",
      "%15 Riskli Vade",
    ]);
  });
});
