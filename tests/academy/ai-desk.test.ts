import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_AI_DESK_ATTACH,
  ACADEMY_AI_DESK_CTRL_C,
  ACADEMY_AI_DESK_INSTRUCTOR_LINE,
  ACADEMY_AI_DESK_MAIL_CLIP,
  ACADEMY_AI_DESK_PASTE_GUIDE,
  ACADEMY_AI_DESK_TAB_HALF_SEC,
  ACADEMY_AI_DESK_TABS,
  ACADEMY_AI_DESK_UPLOAD_GUIDE,
  ACADEMY_AI_DESK_WRITE_GUIDE,
  ACADEMY_INFRA_EXCEL_WORD_LINE,
  ACADEMY_INFRA_GMAIL_LINE,
  ACADEMY_INFRA_OUTLOOK_HONESTY_BADGE,
  ACADEMY_INFRA_OUTLOOK_LINE,
  ACADEMY_INFRA_TOOL_MATCH,
  academyAiDeskActiveTab,
  academyAiDeskClipForHost,
  academyAiDeskClipVerb,
  academyAiDeskGuideHint,
  academyAiDeskGuideTitle,
  academyAiDeskGuideVisible,
  academyAiDeskHostFromLayout,
  academyAiDeskNativeTool,
  academyAiDeskPastePhase,
  academyAiDeskPinnedForLesson,
  academyAiDeskTabsForHost,
  academyInfraAllowsDirectUpload,
  academyInfraUsesNativePlugin,
} from "@/lib/academy/ai-desk";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Nereye yazılacak — Copilot vs ChatGPT masası", () => {
  it("sekmeler, rehber ok ve kopyala-yapıştır fazları SSOT’ta durur", () => {
    expect(ACADEMY_AI_DESK_PASTE_GUIDE).toBe("Nereye Yapıştıracaksın?");
    expect(ACADEMY_AI_DESK_UPLOAD_GUIDE).toBe("Nereye Yükleyeceksin?");
    expect(ACADEMY_AI_DESK_WRITE_GUIDE).toBe("Nereye Yazacaksın?");
    expect(ACADEMY_AI_DESK_TABS.map((tab) => tab.label)).toEqual(["Copilot (Dahili)", "ChatGPT / Claude"]);
    expect(ACADEMY_AI_DESK_CTRL_C).toBe("Ctrl+C");
    expect(ACADEMY_AI_DESK_ATTACH).toBe("Ataş");
    expect(ACADEMY_AI_DESK_INSTRUCTOR_LINE).toMatch(/Gemini panelini aç/u);
    expect(ACADEMY_AI_DESK_INSTRUCTOR_LINE).toMatch(/3\. kapı/u);
    expect(ACADEMY_INFRA_EXCEL_WORD_LINE).toMatch(/ataş ile yükleyebilirsin/u);
    expect(ACADEMY_INFRA_OUTLOOK_LINE).toMatch(/son çare/u);
    expect(ACADEMY_INFRA_OUTLOOK_HONESTY_BADGE).toMatch(/canlı kutu okunmaz/u);
    expect(ACADEMY_INFRA_GMAIL_LINE).toMatch(/Gemini yerleşik/u);
    expect(ACADEMY_INFRA_GMAIL_LINE).toMatch(/1\. kapı/u);
    expect(ACADEMY_INFRA_TOOL_MATCH).toEqual({
      outlook: "Copilot",
      gmail: "Gemini",
      word: "Doğrudan Dosya Yükleme",
      excel: "Doğrudan Dosya Yükleme",
      pptx: "Copilot",
    });
    expect(academyAiDeskNativeTool("outlook")).toBe("Copilot");
    expect(academyAiDeskNativeTool("gmail")).toBe("Gemini");
    expect(academyAiDeskNativeTool("word")).toBe("Doğrudan Dosya Yükleme");
    expect(academyAiDeskNativeTool("excel")).toBe("Doğrudan Dosya Yükleme");
    expect(academyAiDeskTabsForHost("gmail").map((tab) => tab.label)).toEqual(["Gemini (Yerleşik)"]);
    expect(academyAiDeskPinnedForLesson("01_office_ai-g1")).toBe("copilot");
    expect(academyAiDeskPinnedForLesson("01_office_ai-w1")).toBe("chatgpt");
    expect(academyAiDeskPinnedForLesson("01_office_ai-4")).toBe("copilot");
    expect(academyAiDeskPinnedForLesson("01_office_ai-3")).toBe("copilot");
    expect(academyInfraAllowsDirectUpload("excel")).toBe(true);
    expect(academyInfraAllowsDirectUpload("word")).toBe(true);
    expect(academyInfraAllowsDirectUpload("pptx")).toBe(true);
    expect(academyInfraAllowsDirectUpload("outlook")).toBe(false);
    expect(academyInfraAllowsDirectUpload("gmail")).toBe(false);
    expect(academyInfraUsesNativePlugin("gmail")).toBe(true);
    expect(academyInfraUsesNativePlugin("outlook")).toBe(false);
    expect(academyAiDeskHostFromLayout("outlook")).toBe("outlook");
    expect(academyAiDeskHostFromLayout("gmail")).toBe("gmail");
    expect(academyAiDeskGuideTitle("excel")).toBe("Nereye Yükleyeceksin?");
    expect(academyAiDeskGuideTitle("outlook")).toBe("Nereye Yazacaksın?");
    expect(academyAiDeskGuideTitle("gmail")).toBe("Nereye Yükleyeceksin?");
    expect(academyAiDeskGuideVisible("outlook")).toBe(false);
    expect(academyAiDeskGuideVisible("gmail")).toBe(true);
    expect(academyAiDeskGuideVisible("excel")).toBe(true);
    expect(academyAiDeskGuideHint("copilot")).toBe("Sağ üst Copilot");
    expect(academyAiDeskGuideHint("chatgpt")).toBe("ChatGPT yapıştır");
    expect(academyAiDeskGuideHint("chatgpt", "excel")).toBe("Ataş ile yükle");
    expect(academyAiDeskGuideHint("copilot", "gmail")).toBe("Gmail Gemini");
    expect(academyAiDeskClipVerb("outlook")).toBe("Mailler seçildi");
    expect(academyAiDeskClipVerb("gmail")).toBe("Gelen kutusu Gemini’ye açıldı");
    expect(academyAiDeskClipVerb("excel")).toBe("Excel dosyası yüklendi");
    expect(academyAiDeskClipForHost("outlook")).toEqual([...ACADEMY_AI_DESK_MAIL_CLIP]);
    expect(academyAiDeskActiveTab({ currentTime: 201.2, cueStart: 201.2 })).toBe("copilot");
    expect(
      academyAiDeskActiveTab({
        currentTime: 201.2 + ACADEMY_AI_DESK_TAB_HALF_SEC + 0.2,
        cueStart: 201.2,
      }),
    ).toBe("chatgpt");
    expect(academyAiDeskActiveTab({ currentTime: 210, cueStart: 201.2, reducedMotion: true })).toBe(
      "copilot",
    );
    expect(academyAiDeskActiveTab({ currentTime: 220, cueStart: 201.2, pinned: "chatgpt" })).toBe(
      "chatgpt",
    );
    expect(
      academyAiDeskPastePhase({
        tab: "chatgpt",
        currentTime: 201.2 + ACADEMY_AI_DESK_TAB_HALF_SEC + 0.4,
        cueStart: 201.2,
      }),
    ).toBe("select");
    expect(
      academyAiDeskPastePhase({
        tab: "chatgpt",
        currentTime: 201.2 + ACADEMY_AI_DESK_TAB_HALF_SEC + 2,
        cueStart: 201.2,
      }),
    ).toBe("copy");
    expect(
      academyAiDeskPastePhase({
        tab: "chatgpt",
        currentTime: 201.2 + ACADEMY_AI_DESK_TAB_HALF_SEC + 4,
        cueStart: 201.2,
      }),
    ).toBe("paste");
    expect(
      academyAiDeskPastePhase({
        tab: "chatgpt",
        currentTime: 201.2 + ACADEMY_AI_DESK_TAB_HALF_SEC + 6,
        cueStart: 201.2,
      }),
    ).toBe("typed");
    expect(academyAiDeskPastePhase({ tab: "copilot", currentTime: 210, cueStart: 201.2 })).toBe("idle");
  });

  it("Outlook Excel PowerPoint şeridi Copilot butonunu ve iki sekmeli paneli taşır", () => {
    const ssot = readSrc("lib/academy/ai-desk.ts");
    const desk = readSrc("components/academy/lesson-ai-desk.tsx");
    const outlook = readSrc("components/academy/lesson-outlook-workspace.tsx");
    const excel = readSrc("components/academy/lesson-excel-workspace.tsx");
    const pptx = readSrc("components/academy/lesson-pptx-workspace.tsx");
    const eye = readSrc("components/academy/lesson-visual-stage.tsx");
    const spoken = readSrc("lib/academy/spoken-scripts/01_office_ai-4.md");
    const css = readSrc("app/globals.css");
    expect(desk).not.toContain(">AI masası<");
    expect(outlook).not.toContain(">AI masası<");
    expect(excel).not.toContain(">AI masası<");
    expect(pptx).not.toContain(">AI masası<");
    expect(outlook).toContain("LessonOfficeCopilotRibbon");
    expect(excel).toContain("LessonOfficeCopilotRibbon");
    expect(pptx).toContain("LessonOfficeCopilotRibbon");
    expect(desk).toContain("data-academy-ribbon-copilot");
    expect(desk).toContain("data-academy-chatgpt-mini");
    expect(desk).toContain("data-academy-chatgpt-window");
    expect(ssot).toContain("Nereye Yapıştıracaksın?");
    expect(ssot).toContain("Copilot (Dahili)");
    expect(ssot).toContain("ChatGPT / Claude");
    expect(eye).toContain("academyAiDeskGuideTitle");
    expect(eye).toContain("data-academy-paste-guide");
    expect(eye).toContain('data-academy-paste-anchor={pasteHost === "pptx" ? "copilot" : undefined}');
    expect(desk).toContain("data-academy-copilot-dock");
    expect(spoken).toMatch(/Microsoft Copilot lisansın varsa/u);
    expect(spoken).toMatch(/Gemini eklentisini aç/u);
    expect(spoken).toMatch(/yerleşik panele yazılır/u);
    expect(spoken).not.toMatch(/ücretsiz ChatGPT ekranına yapıştır/u);
    expect(spoken).not.toContain(ACADEMY_AI_DESK_INSTRUCTOR_LINE);
    expect(eye).toContain("academyAiDeskPinnedForLesson");
    expect(eye).toContain("academyAiDeskGuideVisible");
    expect(css).toContain(".academy-office-copilot-arrow");
    expect(css).toContain("@keyframes academy-copy-flight");
    expect(css).toContain(".academy-ai-desk-honesty");
    expect(desk).toContain("data-academy-infra-upload");
    expect(desk).toContain("data-academy-infra-honesty");
    expect(desk).toContain("data-academy-attach");
  });
});
