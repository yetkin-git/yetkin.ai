import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { OFFICE_AI_PLANNED_LESSONS, officeAiPlannedLessonByKey } from "@/lib/academy/curricula/office_ai";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_W1_POCKET_STEPS,
} from "@/lib/academy/lesson-beat-visual";
import { ACADEMY_WORD_UPLOAD_PROMPT, academyWordStageKind } from "@/lib/academy/word-workspace";
import { hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { hasAcademyLessonVisualStage } from "@/lib/academy/lesson-visual-stage";
import { isAcademySpokenScriptLessonKey } from "@/lib/academy/spoken-scripts";

const ROOT = process.cwd();
const KEY = "01_office_ai-w1";
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "PARÇA PARÇA",
  "ATAŞ YÜKLE",
  "YERİNDE ANALİZ",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;

describe("01_office_ai-w1 — Word doğrudan dosya yükleme reji", () => {
  it("haritada main / doc-upload-gemini durur; canlı sınav 9 derstir", () => {
    const planned = officeAiPlannedLessonByKey(KEY);
    expect(planned?.lane).toBe("main");
    expect(planned?.method).toBe("doc-upload-gemini");
    expect(planned?.status).toBe("sealed");
    expect(officeAiPlannedLessonByKey(KEY)?.key).toBe(KEY);
    expect(OFFICE_AI_PLANNED_LESSONS.some((lesson) => lesson.key === KEY)).toBe(true);
    const live = curriculumForCourseSlug("01_office_ai");
    expect(live).toHaveLength(9);
    expect(live[7]?.key).toBe(KEY);
    expect(live[7]?.order).toBe(8);
    expect(hasAcademyLessonCues(KEY)).toBe(true);
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    expect(isAcademySpokenScriptLessonKey(KEY)).toBe(true);
  });

  it("Beat 3 split-screen sol parça parça kopya, sağ doğrudan yükleme; prompt terminali kilitli", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides.every((slide) => slide.layout === "word")).toBe(true);
    expect(slides.map((slide) => slide.section)).toEqual([...PUNCHCARDS]);
    expect(slides[0]?.visualMode).toBe("veo");
    expect(slides[3]?.copilot?.hideReply).toBe(true);
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_WORD_UPLOAD_PROMPT);
    expect(slides[3]?.fileName).toBe("Sozlesme_Kaya_Gida.docx");
    expect(slides[4]?.visualMode).toBe("split");
    expect(slides[5]?.visualMode).toBe("split");
    expect(slides[5]?.compare?.beforeCueIndex).toBe(3);
    expect(slides[5]?.compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL);
    expect(slides[5]?.compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL);
    expect(JSON.stringify(slides[5]?.table)).toContain("CEZAİ ŞART");
    expect(JSON.stringify(slides[5]?.table)).toContain("DİLEKÇE HİTAP");
    expect(JSON.stringify(slides[5]?.table)).toContain("RAPOR MADDESİ");
    expect(slides[3]?.table?.note).toMatch(/Spoiler/u);
    expect(academyWordStageKind({ section: "PARÇA PARÇA" })).toBe("copy");
    expect(academyWordStageKind({ section: "ATAŞ YÜKLE", hideReply: true })).toBe("attach");
    expect(academyWordStageKind({ pane: "before", section: "FARK ORTADA" })).toBe("copy");
    expect(academyWordStageKind({ pane: "after", section: "FARK ORTADA" })).toBe("analysis");
    expect(academyWordStageKind({ section: "FARK ORTADA" })).toBe("analysis");
    expect(ACADEMY_OFFICE_AI_W1_POCKET_STEPS).toEqual([
      "Dosyayı ataşla",
      "Üç işi ayrı iste",
      "İmzayı kendin at",
    ]);
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL);
    expect(compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL);
    expect(compare?.after.copilot?.prompt).toBe(ACADEMY_WORD_UPLOAD_PROMPT);
    expect(compare?.after.nodes?.map((node) => node.title)).toEqual([
      "CEZAİ ŞART",
      "DİLEKÇE HİTAP",
      "RAPOR MADDESİ",
    ]);
  });

  it("konuşma metni SEN dili, ataş yükleme ve prompt terminalini taşır", () => {
    const spoken = readFileSync(join(ROOT, "lib/academy/spoken-scripts/01_office_ai-w1.md"), "utf8");
    expect(spoken).toContain("Selamlar, ben Gözde");
    expect(spoken).toContain("ataş");
    expect(spoken).toMatch(/Yüklediğim sözleşme dosyasını \(docx\)/u);
    expect(spoken).toMatch(/parça parça/iu);
    expect(spoken).toContain("dosyayı ataşla yüklersin");
    expect(spoken).toContain("spesifik bir paragraf");
    expect(spoken).not.toMatch(/taşıma sudur/iu);
    expect(spoken).not.toMatch(/öğretilmez/u);
    expect(spoken).not.toMatch(/AI masası/u);
    expect(spoken).not.toMatch(/Sekiz ders bitti/u);
    expect(spoken).toMatch(/9\. ders bitince sınav kapısı açılır/u);
    const cinemaHtml = readFileSync(join(ROOT, "scripts/render-academy-cinema-html.ts"), "utf8");
    expect(cinemaHtml).toContain('case "word"');
    expect(cinemaHtml).toContain("ZAHMETLİ YOL / PARÇA PARÇA METİN KOPYALAMA");
    expect(cinemaHtml).toContain("DOĞRUDAN DOSYA YÜKLEME / YERİNDE DOKÜMAN ANALİZİ");
  });

  it("Word sinema kartları çerçeve içinde padding ile durur; sol kenar taşmaz", () => {
    const wordWs = readFileSync(join(ROOT, "components/academy/lesson-word-workspace.tsx"), "utf8");
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(wordWs).toContain("academy-outlook-canvas--compact");
    expect(wordWs).toContain("academy-outlook-body--word");
    expect(wordWs).toContain("academy-word-clause-stack");
    expect(wordWs).toContain("applyAcademyOfficeWinFit");
    expect(wordWs).toContain("data-academy-office-win-fit");
    expect(wordWs).toContain("48% 42%");
    expect(css).toContain(".academy-word-desk .academy-outlook-body--copilot");
    expect(css).toContain("grid-template-columns: minmax(0, 1fr)");
    expect(css).toContain(".academy-word-clause-stack");
    expect(css).toContain("padding: 0.75rem 1.5rem");
    expect(css).toContain("padding: 0.28rem 0.5rem");
    expect(css).not.toMatch(/\.academy-word-desk[^{]*\{[^}]*text-overflow:\s*ellipsis/u);
  });
});
