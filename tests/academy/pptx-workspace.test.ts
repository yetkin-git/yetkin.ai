import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { ACADEMY_OFFICE_AI_3_COPILOT_PROMPT } from "@/lib/academy/lesson-beat-visual";
import {
  ACADEMY_PPTX_ACTION_BAND,
  ACADEMY_PPTX_EXAMPLE_NOTE,
  ACADEMY_PPTX_KPI_CARDS,
  ACADEMY_PPTX_SLIDE_TITLE,
  academyPptxAlignBox,
  academyPptxDumpLines,
  academyPptxDumpMode,
  academyPptxElementForCell,
  academyPptxFullBleedCanvas,
  academyPptxHasDeck,
} from "@/lib/academy/pptx-workspace";
import { renderAcademyCinemaCueHtml } from "../../scripts/render-academy-cinema-html";

const ROOT = process.cwd();

describe("Metinden Slayta slayt seçim kutusu — getBoundingClientRect", () => {
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
    expect(pptx).toContain("academyExcelFocusZoomTarget");
    expect(pptx).toContain("academyOfficeFocusOriginCss");
    expect(pptx).not.toContain("50% 48%");
    expect(pptx).not.toContain("38% 32%");
    expect(pptx).toContain('data-academy-pptx-chrome={compact ? "bare" : "full"}');
    expect(pptx).toContain("data-academy-office-win-fit");
    expect(pptx).toContain("data-academy-pptx-origin");
    expect(pptx).toContain("data-academy-pptx-card-arrow");
    expect(pptx).toContain("data-academy-checklist-overlay");
    expect(pptx).toContain("academyCitizenOfficeFileLabel");
    expect(pptx).toContain("ACADEMY_PPTX_FILE_LABEL");
    expect(slide).toContain("min-h-[4.35rem]");
    expect(slide).toContain("items-center");
    expect(slide).toContain("ACADEMY_PPTX_SLIDE_TITLE");
    expect(slide).toContain("ACADEMY_PPTX_KPI_CARDS");
    expect(slide).toContain("ACADEMY_PPTX_ACTION_BAND");
    expect(ssot).toContain(ACADEMY_PPTX_SLIDE_TITLE);
    expect(ssot).toContain("54.650 TL");
    expect(ssot).toContain("Kaya Gıda A.Ş.");
    expect(ssot).toContain("%15 Riskli Vade");
    expect(ssot).toContain(ACADEMY_PPTX_ACTION_BAND);
    expect(ssot).toContain(ACADEMY_PPTX_EXAMPLE_NOTE);
    expect(ACADEMY_PPTX_ACTION_BAND).toMatch(/Karar: Yıldız Tekstil'i bugün ara/u);
    expect(ACADEMY_PPTX_ACTION_BAND).not.toMatch(/Stratejik Eylem|KPI/u);
    expect(slide).toContain("ACADEMY_PPTX_EXAMPLE_NOTE");
    expect(css).toContain("text-overflow: clip");
    expect(css).toContain(".academy-pptx-slide-title");
    expect(css).toMatch(/\.academy-pptx-slide-title\s*\{[^}]*text-align:\s*center/s);
    expect(css).toMatch(/\.academy-pptx-canvas\s*\{[^}]*aspect-ratio:\s*16 \/ 9/s);
    expect(css).toMatch(/\.academy-pptx-canvas\s*\{[^}]*object-fit:\s*contain/s);
    expect(css).toMatch(/\.academy-pptx-canvas\s*\{[^}]*height:\s*auto/s);
    expect(css).toMatch(/\.academy-pptx-canvas-wrap\s*\{[^}]*overflow:\s*hidden/s);
    expect(css).toMatch(/\.academy-pptx-canvas\s*\{[^}]*max-height:\s*100%/s);
    expect(css).toMatch(
      /\.academy-pptx-body--copilot\s*\{[^}]*grid-template-columns:\s*minmax\(6\.8rem,\s*7\.4rem\)\s*minmax\(0,\s*1fr\)\s*minmax\(0,\s*0\.62fr\)/s,
    );
    expect(css).toMatch(/\.academy-pptx-thumbs\s*\{[^}]*min-width:\s*6\.8rem/s);
    expect(css).toMatch(/\.academy-pptx-thumbs\s*\{[^}]*flex-shrink:\s*0/s);
    expect(css).toMatch(/\.academy-pptx-thumb\s*\{[^}]*flex-direction:\s*column/s);
    expect(css).toMatch(/\.academy-pptx-thumb\s*\{[^}]*margin:\s*0 0 0\.12rem/s);
    expect(css).toMatch(/\.academy-pptx-thumb-preview\s*\{[^}]*aspect-ratio:\s*16 \/ 9/s);
    expect(css).toMatch(/\.academy-pptx-thumb-preview\s*\{[^}]*width:\s*100%/s);
    expect(css).toMatch(/\.academy-pptx-titlebar\s*\{[^}]*height:\s*1\.42rem/s);
    expect(css).toMatch(/\.academy-pptx-slide-stage\s*\{[^}]*padding:\s*0\.42rem 0\.65rem 0\.38rem/s);
    expect(css).toMatch(/\.academy-pptx-active-border::after\s*\{[^}]*transform:\s*translate\(-50%,\s*-100%\)/s);
    expect(css).toMatch(/\.academy-pptx-active-border::after\s*\{[^}]*border-bottom-color:\s*#c43e1c/s);
    expect(css).toMatch(
      /\.academy-pptx-desk--dump \.academy-pptx-body--copilot\s*\{[^}]*minmax\(0,\s*1\.55fr\)/s,
    );
    expect(css).toMatch(/\.academy-pptx-desk--dump \.academy-pptx-thumbs\s*\{[^}]*display:\s*none/s);
    expect(css).toMatch(
      /\.academy-pptx-desk--dump\.academy-pptx-desk--live \.academy-pptx-body:not\(\.academy-pptx-body--copilot\)\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
    );
    expect(css).toMatch(/\.academy-pptx-body \.academy-ai-desk\s*\{[^}]*min-width:\s*0/s);
    expect(css).toMatch(/\.academy-pptx-body \.academy-ai-desk\s*\{[^}]*max-width:\s*100%/s);
    expect(css).toMatch(/\.academy-pptx-dump\s*\{[^}]*max-width:\s*100%/s);
    expect(css).toMatch(/\.academy-pptx-dump p\s*\{[^}]*max-width:\s*100%/s);
    expect(css).not.toContain("--academy-pptx-focus-origin: 38% 32%");
    expect(css).not.toContain("transform-origin: var(--academy-pptx-focus-origin, 38% 32%)");
    expect(css).toMatch(/\.academy-pptx-kpi\s*\{[^}]*text-align:\s*center/s);
    expect(css).toMatch(/\.academy-pptx-kpi\s*\{[^}]*flex-direction:\s*column/s);
    expect(css).toMatch(/\.academy-pptx-kpi\s*\{[^}]*align-items:\s*center/s);
    expect(css).toMatch(/\.academy-pptx-kpi\s*\{[^}]*min-height:\s*4\.35rem/s);
    expect(css).toMatch(/\.academy-pptx-kpi\s*\{[^}]*overflow:\s*hidden/s);
    expect(css).toMatch(/\.academy-pptx-kpi\s*\{[^}]*padding:\s*clamp\(/s);
    expect(css).toMatch(/\.academy-pptx-kpi-grid\s*\{[^}]*gap:/s);
    expect(css).toMatch(
      /\.academy-player-compare-pane \.academy-pptx-kpi-grid\s*\{[^}]*align-items:\s*center/s,
    );
    expect(css).toMatch(
      /\.academy-player-compare-pane \.academy-pptx-kpi\s*\{[^}]*min-height:\s*3\.7rem/s,
    );
    expect(css).toMatch(/\.academy-pptx-kpi-badge\s*\{[^}]*position:\s*static/s);
    expect(css).not.toMatch(/\.academy-pptx-kpi-badge\s*\{[^}]*position:\s*absolute/s);
    expect(css).toMatch(
      /\.academy-player-compare-pane \.academy-pptx-kpi\[data-academy-pptx-on="true"\]\s*\{[^}]*transform:\s*none/s,
    );
    expect(css).toMatch(/\.academy-pptx-action-band\s*\{[^}]*text-align:\s*center/s);
    expect(slide).toContain("text-center");
    expect(slide).toContain("data-academy-pptx-kpi-badge");
    expect(css).toContain("scale(1.05)");
    expect(css).not.toMatch(/\.academy-pptx-[^{]*\{[^}]*text-overflow:\s*ellipsis/u);
  });

  it("öğrenci istemi reji notu taşımaz", () => {
    const slide = loadAcademyCinemaCueSlides("01_office_ai-3").find((row) => row.cueIndex === 4);
    expect(slide?.copilot?.prompt).toBe(ACADEMY_OFFICE_AI_3_COPILOT_PROMPT);
    expect(slide?.copilot?.prompt).not.toMatch(/henüz açma|Beat 3|spoiler|Copilot varsa şeride yaz/iu);
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

  it("dump tuvali boş kalmaz; thumbs gizlenince tek sütun dolar", () => {
    expect(academyPptxDumpMode({ pane: "live", section: "GİRİŞ KÖPRÜSÜ" })).toBe(true);
    expect(academyPptxDumpMode({ pane: "live", section: "HOŞ GELDİN" })).toBe(true);
    expect(academyPptxDumpMode({ pane: "live", section: "ŞABLON KAOSU" })).toBe(true);
    expect(academyPptxDumpMode({ pane: "live", section: "SLAYT İSTE", hideReply: true })).toBe(true);
    expect(academyPptxDumpMode({ pane: "live", section: "CEBİNE KOY" })).toBe(false);
    expect(academyPptxDumpMode({ pane: "after", section: "FARK ORTADA" })).toBe(false);
    expect(
      academyPptxFullBleedCanvas({ pane: "live", dumpMode: true, hasCopilot: false }),
    ).toBe(true);
    expect(
      academyPptxFullBleedCanvas({ pane: "live", dumpMode: true, hasCopilot: true }),
    ).toBe(false);
    expect(
      academyPptxFullBleedCanvas({ pane: "live", dumpMode: false, hasCopilot: false }),
    ).toBe(false);
    expect(
      academyPptxFullBleedCanvas({ pane: "before", dumpMode: true, hasCopilot: false }),
    ).toBe(false);
    const dump = academyPptxDumpLines({
      rows: [
        ["1", "Mart tahsilat toplamı 54.650 TL; Kaya önde, Demir bekler..."],
        ["2", "Yıldız açık vade, risk cümleleri paragrafa gömülü durur..."],
      ],
    });
    expect(dump.length).toBeGreaterThan(0);
    expect(dump[0]).toMatch(/54\.650 TL/u);
    expect(academyPptxDumpLines(undefined)).toEqual(["Mart tahsilat notları dağınık durur..."]);
    const pptx = readFileSync(join(ROOT, "components/academy/lesson-pptx-workspace.tsx"), "utf8");
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(pptx).toContain("academyPptxDumpMode");
    expect(pptx).toContain("academyPptxDumpLines");
    expect(pptx).toContain("academyPptxFullBleedCanvas");
    expect(pptx).toContain("academy-pptx-desk--full");
    expect(pptx).toContain('data-academy-pptx-bleed={fullBleed ? "full" : undefined}');
    expect(pptx).toContain("showThumbs");
    expect(pptx).toContain("academy-pptx-thumb-preview");
    expect(pptx).toContain("data-academy-pptx-card-arrow");
    expect(css).toMatch(
      /\.academy-pptx-desk--dump\.academy-pptx-desk--live \.academy-pptx-body:not\(\.academy-pptx-body--copilot\)[\s\S]*?\.academy-pptx-canvas-wrap\s*\{[^}]*grid-column:\s*1 \/ -1/s,
    );
    expect(css).toMatch(
      /\.academy-pptx-desk--dump\.academy-pptx-desk--live \.academy-pptx-body:not\(\.academy-pptx-body--copilot\)[\s\S]*?\.academy-pptx-canvas-wrap\s*\{[^}]*width:\s*100%/s,
    );
    expect(css).toMatch(
      /\.academy-pptx-desk--dump\.academy-pptx-desk--live \.academy-pptx-body:not\(\.academy-pptx-body--copilot\)[\s\S]*?\.academy-pptx-canvas-wrap\s*\{[^}]*height:\s*100%/s,
    );
    expect(css).toMatch(
      /\.academy-pptx-desk--dump \.academy-pptx-canvas[\s\S]*?margin:\s*auto/s,
    );
    expect(css).toMatch(
      /\.academy-pptx-desk--dump \.academy-pptx-canvas-wrap\s*\{[^}]*justify-content:\s*center/s,
    );
    expect(css).toMatch(
      /\.academy-pptx-desk--dump \.academy-pptx-canvas-wrap\s*\{[^}]*align-items:\s*center/s,
    );
    expect(css).toMatch(
      /\.academy-pptx-desk--dump\.academy-pptx-desk--live \.academy-pptx-win[\s\S]*?height:\s*100%/s,
    );
    expect(css).toMatch(
      /\.academy-pptx-desk--dump\.academy-pptx-desk--live > \.academy-office-win-fit[\s\S]*?height:\s*100%/s,
    );
  });

  it("Ders 4 SONRA sinema kartı hiyerarşili slaytı bindirmeden basar", () => {
    const slide = loadAcademyCinemaCueSlides("01_office_ai-3").find((row) => row.cueIndex === 6);
    expect(slide).toBeTruthy();
    const html = renderAcademyCinemaCueHtml(slide!);
    expect(html).toContain('class="pptx-good"');
    expect(html).toContain("pptx-good-head");
    expect(html).toContain(ACADEMY_PPTX_SLIDE_TITLE);
    expect(html).toContain("Kaya Gıda A.Ş.");
    expect(html).toContain("%15 Riskli Vade");
    expect(html).toContain("pptx-kpi-row");
    expect(html).toMatch(/\.pptx-good\s*\{[^}]*aspect-ratio:\s*16 \/ 9/s);
    expect(html).toMatch(/\.pptx-kpi-row\s*\{[^}]*grid-template-columns:\s*repeat\(3/s);
    expect(html).toMatch(/\.pptx-kpi-row\s*\{[^}]*align-items:\s*center/s);
    expect(html).toMatch(/\.pptx-kpi\s*\{[^}]*min-height:\s*160px/s);
    expect(html).toMatch(/\.pptx-kpi em\s*\{[^}]*display:\s*inline-flex/s);
    expect(html).not.toMatch(/\.pptx-kpi em\s*\{[^}]*position:\s*absolute/s);
    expect(html).toContain(ACADEMY_PPTX_ACTION_BAND);
    expect(html).toContain(ACADEMY_PPTX_EXAMPLE_NOTE);
    expect(html).not.toMatch(/>KPI</u);
    expect(html).not.toMatch(/Stratejik Eylem/u);
  });
});
