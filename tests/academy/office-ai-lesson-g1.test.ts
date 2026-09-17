import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { OFFICE_AI_PLANNED_LESSONS, officeAiPlannedLessonByKey } from "@/lib/academy/curricula/office_ai";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_G1_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_G1_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_G1_POCKET_STEPS,
} from "@/lib/academy/lesson-beat-visual";
import { ACADEMY_GMAIL_GEMINI_PROMPT, academyGmailStageKind } from "@/lib/academy/gmail-workspace";
import { hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { hasAcademyLessonVisualStage } from "@/lib/academy/lesson-visual-stage";
import { isAcademySpokenScriptLessonKey } from "@/lib/academy/spoken-scripts";

const ROOT = process.cwd();
const KEY = "01_office_ai-g1";
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "TAŞIMA SU",
  "GEMİNİ AÇ",
  "YERLEŞİK YOL",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;

describe("01_office_ai-g1 — Gmail + Gemini ana akış reji", () => {
  it("haritada main / gmail-gemini durur; canlı sınav 9 derstir", () => {
    const planned = officeAiPlannedLessonByKey(KEY);
    expect(planned?.lane).toBe("main");
    expect(planned?.method).toBe("gmail-gemini");
    expect(planned?.status).toBe("sealed");
    expect(officeAiPlannedLessonByKey(KEY)?.key).toBe(KEY);
    expect(OFFICE_AI_PLANNED_LESSONS.some((lesson) => lesson.key === KEY)).toBe(true);
    const live = curriculumForCourseSlug("01_office_ai");
    expect(live).toHaveLength(9);
    expect(live[6]?.key).toBe(KEY);
    expect(live[6]?.order).toBe(7);
    expect(hasAcademyLessonCues(KEY)).toBe(true);
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    expect(isAcademySpokenScriptLessonKey(KEY)).toBe(true);
  });

  it("Beat 3 split-screen sol taşıma su, sağ yerleşik Gemini; prompt terminali kilitli", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides.every((slide) => slide.layout === "gmail")).toBe(true);
    expect(slides.map((slide) => slide.section)).toEqual([...PUNCHCARDS]);
    expect(slides[0]?.visualMode).toBe("veo");
    expect(slides[3]?.copilot?.hideReply).toBe(true);
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(slides[3]?.visualMode).toBe("live");
    expect(slides[4]?.visualMode).toBe("split");
    expect(slides[5]?.visualMode).toBe("split");
    expect(slides[5]?.compare?.beforeCueIndex).toBe(3);
    expect(slides[5]?.compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_G1_COMPARE_BEFORE_LABEL);
    expect(slides[5]?.compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_G1_COMPARE_AFTER_LABEL);
    expect(JSON.stringify(slides[5]?.table)).toContain("Gönderen");
    expect(JSON.stringify(slides[5]?.table)).toContain("Arşivlik");
    expect(slides[3]?.table?.note).toMatch(/Spoiler/u);
    expect(academyGmailStageKind({ section: "TAŞIMA SU" })).toBe("disconnected");
    expect(academyGmailStageKind({ section: "GEMİNİ AÇ", hideReply: true })).toBe("inbox");
    expect(academyGmailStageKind({ pane: "before", section: "FARK ORTADA" })).toBe("disconnected");
    expect(academyGmailStageKind({ pane: "after", section: "FARK ORTADA" })).toBe("native");
    expect(academyGmailStageKind({ section: "FARK ORTADA" })).toBe("native");
    expect(ACADEMY_OFFICE_AI_G1_POCKET_STEPS).toEqual([
      "Yerleşik paneli aç",
      "Aksiyon tablosu iste",
      "Onaylamadan gönderme",
    ]);
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_G1_COMPARE_BEFORE_LABEL);
    expect(compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_G1_COMPARE_AFTER_LABEL);
    expect(compare?.after.copilot?.prompt).toBe(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(compare?.after.nodes?.map((node) => node.title)).toEqual([
      "ÖDEME / ONAY",
      "ACİL AKSİYON",
      "ARŞİVLİK",
    ]);
  });

  it("konuşma metni SEN dili, atlanmış kapı ve prompt terminalini taşır", () => {
    const spoken = readFileSync(join(ROOT, "lib/academy/spoken-scripts/01_office_ai-g1.md"), "utf8");
    expect(spoken).toContain("Selamlar, ben Gözde");
    expect(spoken).toContain("taşıma su");
    expect(spoken).toContain("atlanmış kapı");
    expect(spoken).not.toMatch(/taşıma su yasak/iu);
    expect(spoken).not.toMatch(/Dördüncü derste Outlook/u);
    expect(spoken).not.toMatch(/Sekiz ders bitmeden/u);
    expect(spoken).toMatch(/6\. derste Outlook/u);
    expect(spoken).toContain(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(spoken).toMatch(/kopyala-yapıştır/iu);
    expect(spoken).not.toMatch(/AI masası/u);
    const cinemaHtml = readFileSync(join(ROOT, "scripts/render-academy-cinema-html.ts"), "utf8");
    expect(cinemaHtml).toContain('case "gmail"');
    expect(cinemaHtml).toContain("GELEN KUTUSUNDAN KOPUK / TAŞIMA SU YÖNTEMİ");
    expect(cinemaHtml).toContain("GELEN KUTUSU İÇİ / YERLEŞİK GEMİNİ ENTEGRASYONU");
    const gmailWs = readFileSync(join(ROOT, "components/academy/lesson-gmail-workspace.tsx"), "utf8");
    expect(gmailWs).toContain("applyAcademyOfficeWinFit");
    expect(gmailWs).toContain("data-academy-office-win-fit");
    expect(gmailWs).toContain("TAŞIMA SU");
    expect(gmailWs).toContain("ACADEMY_GMAIL_MAILS.map");
  });
});
